import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { Database } from "@/integrations/supabase/types";

type Service = {
  slug: string;
  name: string;
  audience: string;
  description: string;
  base_price_cents: number;
  duration_minutes: number;
};

async function loadCatalog(): Promise<Service[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data } = await supabase
    .from("services_catalog")
    .select("slug,name,audience,description,base_price_cents,duration_minutes")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  return (data ?? []) as Service[];
}

function buildSystem(catalog: Service[], audience?: string, lang?: string) {
  const catalogText = catalog
    .map(
      (s) =>
        `- ${s.slug} (${s.audience}) "${s.name}" — $${(s.base_price_cents / 100).toFixed(0)} base · ${s.duration_minutes}m — ${s.description}`,
    )
    .join("\n");

  const langHint =
    lang === "pt"
      ? "Reply in Brazilian Portuguese unless the user writes in another language."
      : lang === "es"
        ? "Reply in Spanish unless the user writes in another language."
        : "Reply in English unless the user writes in another language.";

  return `You are Amanda Florida, an AI concierge for a boutique cleaning service in Tampa, Florida (Hillsborough County). Warm, brief, conversational, one question at a time. ${langHint}

${audience ? `The visitor started from the "${audience}" flow.` : ""}

CATALOG (use these slugs and base prices):
${catalogText}

FLOW (adapt, don't robot-march):
1. Confirm audience: home / rental / move.
2. Bedrooms, bathrooms, approx sqft. If the visitor sends photos, use them to estimate size, style, and mess level.
3. Neighborhood / zip in Tampa Bay.
4. Cadence: one-time / weekly / bi-weekly / monthly.
5. Preferred day/time window.

Once you have enough:
- Call the tool "estimate_quote" with your best estimate (adjust from base by size and cadence). This shows a nice quote card.
- Then propose 2–3 concrete open slots in natural language.
- When the visitor picks a slot, call "propose_booking" with the full booking. The UI will render a Confirm button; the user must be signed in to finalize.

Rules:
- Currency USD. Never below $99 for residential.
- Say plainly when something isn't offered (carpet steam extraction, exterior windows) and suggest an alternative.
- Never invent slugs outside the catalog.
- Keep replies short: 1–3 short lines.`;
}

const estimateQuoteTool = tool({
  description:
    "Show a price quote card to the user with an estimated total, duration, and 2-3 open time slots. Call once you have enough info.",
  inputSchema: z.object({
    service_slug: z.string().describe("Matching slug from catalog"),
    audience: z.enum(["home", "rental", "move"]),
    bedrooms: z.number().int().min(0).nullable(),
    bathrooms: z.number().int().min(0).nullable(),
    square_feet: z.number().int().min(0).nullable(),
    cadence: z.enum(["one_time", "weekly", "biweekly", "monthly"]),
    price_low_cents: z.number().int(),
    price_high_cents: z.number().int(),
    duration_minutes: z.number().int(),
    suggested_slots_iso: z
      .array(z.string())
      .max(3)
      .describe("2-3 ISO datetimes in America/New_York"),
    summary: z.string().describe("One-line human summary of what's included"),
  }),
  execute: async (input) => input,
});

const proposeBookingTool = tool({
  description:
    "Emit a proposed booking for the user to confirm. Call after they pick a slot. The UI shows a Confirm button; user must sign in to save.",
  inputSchema: z.object({
    service_slug: z.string(),
    audience: z.enum(["home", "rental", "move"]),
    scheduled_at_iso: z.string().describe("ISO datetime, America/New_York"),
    duration_minutes: z.number().int(),
    price_cents: z.number().int(),
    address_line1: z.string(),
    city: z.string().default("Tampa"),
    state: z.string().default("FL"),
    zip: z.string(),
    bedrooms: z.number().int().min(0).nullable(),
    bathrooms: z.number().int().min(0).nullable(),
    square_feet: z.number().int().min(0).nullable(),
    customer_name: z.string(),
    customer_email: z.string().email(),
    customer_phone: z.string().nullable(),
    notes: z.string().nullable(),
  }),
  execute: async (input) => input,
});

// Simple per-IP sliding window (per worker instance). Not distributed —
// first line of defense against runaway loops / abuse. Real quotas belong
// in the DB, but this stops the obvious burn.
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 20; // 20 chat POSTs / minute / IP
const hits = new Map<string, number[]>();

function rateLimit(ip: string): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - arr[0])) / 1000);
    hits.set(ip, arr);
    return { ok: false, retryAfter };
  }
  arr.push(now);
  hits.set(ip, arr);
  // opportunistic cleanup
  if (hits.size > 500) {
    for (const [k, v] of hits) {
      if (!v.some((t) => now - t < RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return { ok: true, retryAfter: 0 };
}

function clientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

const MAX_MESSAGES = 40;
const MAX_TEXT_CHARS = 4000;

function totalTextChars(messages: UIMessage[]): number {
  let n = 0;
  for (const m of messages) {
    for (const p of m.parts ?? []) {
      if (p && typeof p === "object" && "type" in p && p.type === "text" && "text" in p) {
        n += String((p as { text: string }).text ?? "").length;
      }
    }
  }
  return n;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ip = clientIp(request);
        const rl = rateLimit(ip);
        if (!rl.ok) {
          return new Response("Too many requests", {
            status: 429,
            headers: { "Retry-After": String(rl.retryAfter) },
          });
        }

        const body = (await request.json()) as {
          messages?: unknown;
          audience?: string;
          lang?: string;
        };
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (body.messages.length > MAX_MESSAGES) {
          return new Response("Conversation too long", { status: 413 });
        }
        if (totalTextChars(body.messages as UIMessage[]) > MAX_TEXT_CHARS) {
          return new Response("Message too large", { status: 413 });
        }

        const key = process.env.GOOGLE_AI_API_KEY;
        if (!key) return new Response("Missing GOOGLE_AI_API_KEY", { status: 500 });

        const catalog = await loadCatalog();
        const gemini = createOpenAICompatible({
          name: "gemini",
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
          headers: { Authorization: `Bearer ${key}` },
        });
        const model = gemini("gemini-2.5-flash");

        const result = streamText({
          model,
          system: buildSystem(catalog, body.audience, body.lang),
          messages: await convertToModelMessages(body.messages as UIMessage[]),
          tools: {
            estimate_quote: estimateQuoteTool,
            propose_booking: proposeBookingTool,
          },
          stopWhen: stepCountIs(5),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: body.messages as UIMessage[],
        });
      },
    },
  },
});

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const inputSchema = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional().nullable(),
  locale: z.string().max(8).optional().nullable(),
});

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Backend not configured");

    const supabase = createClient<Database>(url, key, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const email = data.email.trim().toLowerCase();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email,
      source: data.source ?? null,
      locale: data.locale ?? null,
    });

    // Unique-violation = already subscribed, treat as success.
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

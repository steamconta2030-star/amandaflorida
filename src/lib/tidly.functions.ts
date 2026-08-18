import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type Service = {
  slug: string;
  name: string;
  audience: "home" | "rental" | "move";
  description: string;
  base_price_cents: number;
  duration_minutes: number;
};

export const listServices = createServerFn({ method: "GET" }).handler(
  async (): Promise<Service[]> => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];

    const supabase = createClient<Database>(url, key, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("services_catalog")
      .select("slug,name,audience,description,base_price_cents,duration_minutes")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data as Service[];
  },
);

const bookingInputSchema = z.object({
  service_slug: z.string(),
  audience: z.enum(["home", "rental", "move"]),
  scheduled_at_iso: z.string(),
  duration_minutes: z.number().int(),
  price_cents: z.number().int(),
  address_line1: z.string().min(1),
  city: z.string().default("Tampa"),
  state: z.string().default("FL"),
  zip: z.string().min(3),
  bedrooms: z.number().int().nullable(),
  bathrooms: z.number().int().nullable(),
  square_feet: z.number().int().nullable(),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  customer_phone: z.string().nullable(),
  notes: z.string().nullable(),
});

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => bookingInputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("bookings")
      .insert({
        user_id: userId,
        service_slug: data.service_slug,
        audience: data.audience,
        scheduled_at: data.scheduled_at_iso,
        duration_minutes: data.duration_minutes,
        price_cents: data.price_cents,
        address_line1: data.address_line1,
        city: data.city,
        state: data.state,
        zip: data.zip,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        square_feet: data.square_feet,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        notes: data.notes,
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export type Booking = {
  id: string;
  service_slug: string;
  audience: string;
  scheduled_at: string;
  duration_minutes: number;
  price_cents: number;
  status: string;
  address_line1: string;
  city: string;
  zip: string;
  customer_name: string;
};

export const listMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Booking[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id,service_slug,audience,scheduled_at,duration_minutes,price_cents,status,address_line1,city,zip,customer_name",
      )
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: true });
    if (error || !data) return [];
    return data as Booking[];
  });

export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("cancel_booking", {
      _booking_id: data.id,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function icsDate(d: Date) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export const getBookingIcs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: b, error } = await supabase
      .from("bookings")
      .select(
        "id,service_slug,scheduled_at,duration_minutes,address_line1,city,state,zip,customer_name",
      )
      .eq("id", data.id)
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !b) throw new Error("Not found");

    const start = new Date(b.scheduled_at);
    const end = new Date(start.getTime() + b.duration_minutes * 60000);
    const uid = `${b.id}@tidly`;
    const now = icsDate(new Date());
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Amanda Florida//Booking//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:Amanda Florida cleaning — ${b.service_slug}`,
      `LOCATION:${b.address_line1}, ${b.city}, ${b.state} ${b.zip}`,
      `DESCRIPTION:Amanda Florida cleaning booking for ${b.customer_name}.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    return { filename: `tidly-${b.id.slice(0, 8)}.ics`, ics };
  });

// STR/Airbnb iCal parsing — returns upcoming checkouts (candidates for turnovers)
export type StrCheckout = {
  uid: string;
  checkout_iso: string; // date the guest leaves = candidate cleaning day
  summary: string;
};

function parseIcal(text: string): StrCheckout[] {
  // Unfold RFC5545 lines
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events: StrCheckout[] = [];
  let cur: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT" && cur) {
      const dtend = cur["DTEND"] || cur["DTEND;VALUE=DATE"];
      const uid = cur["UID"] || crypto.randomUUID();
      const summary = cur["SUMMARY"] || "Reservation";
      if (dtend) {
        // Airbnb usually gives DATE like 20260715
        const m = dtend.match(/^(\d{4})(\d{2})(\d{2})/);
        if (m) {
          const iso = new Date(
            Date.UTC(+m[1], +m[2] - 1, +m[3], 15, 0, 0), // default 11am ET turnover slot
          ).toISOString();
          if (new Date(iso).getTime() > Date.now()) {
            events.push({ uid, checkout_iso: iso, summary });
          }
        }
      }
      cur = null;
    } else if (cur) {
      const idx = line.indexOf(":");
      if (idx > 0) {
        const key = line.slice(0, idx).split(";")[0];
        cur[key] = line.slice(idx + 1);
        // also keep the full key for DTEND;VALUE=DATE
        cur[line.slice(0, idx)] = line.slice(idx + 1);
      }
    }
  }
  return events.sort((a, b) => a.checkout_iso.localeCompare(b.checkout_iso)).slice(0, 20);
}

export const importStrCalendar = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ url: z.string().url() }).parse(data))
  .handler(async ({ data }): Promise<StrCheckout[]> => {
    const res = await fetch(data.url, {
      headers: { "User-Agent": "Amanda Florida/1.0 (+https://tidly.app)" },
    });
    if (!res.ok) throw new Error(`Calendar fetch failed (${res.status})`);
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Not a valid iCal feed");
    return parseIcal(text);
  });

// Chat session persistence
type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
export type ChatSessionRow = {
  id: string;
  session_token: string;
  audience: string | null;
  lang: string | null;
  messages: JsonValue[];
  updated_at: string;
};

const chatSaveSchema = z.object({
  session_token: z.string().min(6),
  audience: z.enum(["home", "rental", "move"]).nullable(),
  lang: z.string().min(2).max(5),
  messages: z.array(z.any()),
});

export const saveChatSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => chatSaveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("chat_sessions").upsert(
      {
        user_id: userId,
        session_token: data.session_token,
        audience: data.audience,
        lang: data.lang,
        messages: data.messages,
      },
      { onConflict: "session_token" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listChatSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("id,session_token,audience,lang,messages,updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(10);
    if (error || !data) return [];
    return data as ChatSessionRow[];
  });

export const getChatSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ session_token: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("chat_sessions")
      .select("id,session_token,audience,lang,messages,updated_at")
      .eq("user_id", userId)
      .eq("session_token", data.session_token)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as ChatSessionRow | null;
  });

// ---------- Admin ----------
export type AdminBooking = Booking & {
  user_id: string;
  customer_email: string;
  customer_phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  created_at: string;
};

async function assertAdmin(
  supabase: import("@supabase/supabase-js").SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminBooking[]> => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(
        "id,user_id,service_slug,audience,scheduled_at,duration_minutes,price_cents,status,address_line1,city,zip,customer_name,customer_email,customer_phone,bedrooms,bathrooms,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return data as AdminBooking[];
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const amIAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { supabase, userId } = context;
    const { data } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    return !!data;
  });

export type AdminLead = {
  id: string;
  session_token: string;
  audience: string | null;
  lang: string | null;
  messages: JsonValue[];
  updated_at: string;
  user_id: string;
};

export const adminListLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminLead[]> => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("chat_sessions")
      .select("id,session_token,audience,lang,messages,updated_at,user_id")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return data as AdminLead[];
  });

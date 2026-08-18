import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ============================================================
// Bloco A — Cleaner applications
// ============================================================

const applicationSchema = z.object({
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  zips: z.array(z.string().min(3).max(10)).max(30).default([]),
  years_experience: z.number().int().min(0).max(80).nullable().optional(),
  languages: z.array(z.string().min(2).max(8)).max(10).default([]),
  audiences: z
    .array(z.enum(["home", "rental", "move"]))
    .max(3)
    .default([]),
  bio: z.string().max(2000).optional().nullable(),
  has_transport: z.boolean().default(false),
  has_supplies: z.boolean().default(false),
});

export const submitCleanerApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => applicationSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Server not configured");
    const sb = createClient<Database>(url, key, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { error } = await sb.from("cleaner_applications").insert({
      full_name: data.full_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone ?? null,
      city: data.city ?? null,
      zips: data.zips,
      years_experience: data.years_experience ?? null,
      languages: data.languages,
      audiences: data.audiences,
      bio: data.bio ?? null,
      has_transport: data.has_transport,
      has_supplies: data.has_supplies,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type CleanerApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  zips: string[];
  years_experience: number | null;
  languages: string[];
  audiences: string[];
  bio: string | null;
  has_transport: boolean | null;
  has_supplies: boolean | null;
  status: string;
  review_notes: string | null;
  reviewed_at: string | null;
  approved_user_id: string | null;
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

export const adminListApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CleanerApplication[]> => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("cleaner_applications")
      .select(
        "id,full_name,email,phone,city,zips,years_experience,languages,audiences,bio,has_transport,has_supplies,status,review_notes,reviewed_at,approved_user_id,created_at",
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as CleanerApplication[];
  });

export const adminApproveApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ id: z.string().uuid(), email: z.string().email() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Find user by email
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw new Error(listErr.message);
    const match = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!match) {
      throw new Error(
        "No user account for this email yet. Ask the applicant to sign up at /auth first, then approve.",
      );
    }
    const { error } = await supabase.rpc("approve_cleaner_application", {
      _app_id: data.id,
      _user_id: match.id,
    });
    if (error) throw new Error(error.message);
    return { ok: true, user_id: match.id };
  });

export const adminRejectApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        notes: z.string().max(1000).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("cleaner_applications")
      .update({
        status: "rejected",
        review_notes: data.notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============================================================
// Bloco B — Booking chat
// ============================================================

export type BookingMessage = {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_role: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export const listBookingMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ booking_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BookingMessage[]> => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("booking_messages")
      .select("id,booking_id,sender_id,sender_role,body,read_at,created_at")
      .eq("booking_id", data.booking_id)
      .order("created_at", { ascending: true });
    if (error || !rows) return [];
    return rows as BookingMessage[];
  });

export const sendBookingMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        booking_id: z.string().uuid(),
        body: z.string().min(1).max(4000),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    // Look up caller role for this booking
    const { data: b } = await supabase
      .from("bookings")
      .select("user_id,cleaner_id")
      .eq("id", data.booking_id)
      .maybeSingle();
    if (!b) throw new Error("Booking not found");
    let role: "customer" | "cleaner" | "admin" = "admin";
    if (b.user_id === userId) role = "customer";
    else if (b.cleaner_id === userId) role = "cleaner";
    const { error } = await supabase.from("booking_messages").insert({
      booking_id: data.booking_id,
      sender_id: userId,
      sender_role: role,
      body: data.body.trim(),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type BookingDetail = {
  id: string;
  service_slug: string;
  audience: string;
  scheduled_at: string;
  duration_minutes: number;
  price_cents: number;
  status: string;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  cleaner_id: string | null;
  user_id: string;
  cancelled_at: string | null;
  cancel_reason: string | null;
  rescheduled_from_at: string | null;
};

export const getBookingDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<BookingDetail | null> => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("bookings")
      .select(
        "id,service_slug,audience,scheduled_at,duration_minutes,price_cents,status,address_line1,address_line2,city,state,zip,customer_name,customer_email,customer_phone,notes,cleaner_id,user_id,cancelled_at,cancel_reason,rescheduled_from_at",
      )
      .eq("id", data.id)
      .maybeSingle();
    if (error) return null;
    return (row as BookingDetail) ?? null;
  });

// ============================================================
// Bloco C — Cleaner availability
// ============================================================

export type AvailabilitySlot = {
  id: string;
  cleaner_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

export type TimeOff = {
  id: string;
  cleaner_id: string;
  starts_at: string;
  ends_at: string;
  reason: string | null;
};

export const listMyAvailability = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AvailabilitySlot[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("cleaner_availability")
      .select("id,cleaner_id,weekday,start_time,end_time")
      .eq("cleaner_id", userId)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });
    if (error || !data) return [];
    return data as AvailabilitySlot[];
  });

export const addAvailabilitySlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        weekday: z.number().int().min(0).max(6),
        start_time: z.string().regex(/^\d{2}:\d{2}$/),
        end_time: z.string().regex(/^\d{2}:\d{2}$/),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.end_time <= data.start_time) throw new Error("End time must be after start time");
    const { error } = await supabase.from("cleaner_availability").insert({
      cleaner_id: userId,
      weekday: data.weekday,
      start_time: `${data.start_time}:00`,
      end_time: `${data.end_time}:00`,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAvailabilitySlot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("cleaner_availability")
      .delete()
      .eq("id", data.id)
      .eq("cleaner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyTimeOff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TimeOff[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("cleaner_time_off")
      .select("id,cleaner_id,starts_at,ends_at,reason")
      .eq("cleaner_id", userId)
      .order("starts_at", { ascending: true });
    if (error || !data) return [];
    return data as TimeOff[];
  });

export const addTimeOff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
        reason: z.string().max(200).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (new Date(data.ends_at) <= new Date(data.starts_at))
      throw new Error("End must be after start");
    const { error } = await supabase.from("cleaner_time_off").insert({
      cleaner_id: userId,
      starts_at: data.starts_at,
      ends_at: data.ends_at,
      reason: data.reason ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeTimeOff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("cleaner_time_off")
      .delete()
      .eq("id", data.id)
      .eq("cleaner_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public availability for a cleaner (used on public profile page)
export const listCleanerAvailability = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<AvailabilitySlot[]> => {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return [];
    const sb = createClient<Database>(url, key, {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    const { data: profile } = await sb
      .from("cleaner_profiles")
      .select("user_id")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!profile) return [];
    const { data: rows } = await sb
      .from("cleaner_availability")
      .select("id,cleaner_id,weekday,start_time,end_time")
      .eq("cleaner_id", profile.user_id)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true });
    return (rows ?? []) as AvailabilitySlot[];
  });

// ============================================================
// Bloco D — Cancel with reason (customer or cleaner)
// ============================================================

export const cancelBookingWithReason = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        reason: z.string().max(500).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const args: { _booking_id: string; _reason?: string } = {
      _booking_id: data.id,
    };
    if (data.reason) args._reason = data.reason;
    const { error } = await supabase.rpc("cancel_booking", args);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

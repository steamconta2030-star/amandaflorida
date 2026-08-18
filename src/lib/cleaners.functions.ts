import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

// ---------- Public types ----------
export type PublicCleaner = {
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  years_experience: number | null;
  languages: string[];
  zips: string[];
  audiences: string[];
  rating: number;
  review_count: number;
};

export type OpenJob = {
  id: string;
  service_slug: string;
  audience: string;
  scheduled_at: string;
  duration_minutes: number;
  price_cents: number;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  city: string;
  zip: string;
  created_at: string;
};

export type MyClaimedJob = {
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
  customer_email: string;
  customer_phone: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  notes: string | null;
  claimed_at: string | null;
};

export type MyCleanerProfile = {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  years_experience: number | null;
  languages: string[];
  zips: string[];
  audiences: string[];
  rating: number;
  review_count: number;
  published: boolean;
  active: boolean;
};

export type AdminCleaner = MyCleanerProfile & {
  user_id: string;
  created_at: string;
  updated_at: string;
};

// ---------- Server publishable client (public reads) ----------
function serverPublic() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// ---------- Public: list & get ----------
export const listPublishedCleaners = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicCleaner[]> => {
    const sb = serverPublic();
    if (!sb) return [];
    const { data, error } = await sb
      .from("cleaner_profiles")
      .select(
        "slug,display_name,headline,bio,photo_url,years_experience,languages,zips,audiences,rating,review_count",
      )
      .eq("published", true)
      .eq("active", true)
      .order("rating", { ascending: false });
    if (error || !data) return [];
    return data as PublicCleaner[];
  },
);

export const getCleanerBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }): Promise<PublicCleaner | null> => {
    const sb = serverPublic();
    if (!sb) return null;
    const { data: row, error } = await sb
      .from("cleaner_profiles")
      .select(
        "slug,display_name,headline,bio,photo_url,years_experience,languages,zips,audiences,rating,review_count",
      )
      .eq("published", true)
      .eq("active", true)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) return null;
    return (row as PublicCleaner) ?? null;
  });

// ---------- Cleaner: identity ----------
export const amIACleaner = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<boolean> => {
    const { supabase, userId } = context;
    const { data } = await supabase.rpc("has_cleaner_role", { _uid: userId });
    return !!data;
  });

// ---------- Cleaner: own profile ----------
export const getMyCleanerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyCleanerProfile | null> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("cleaner_profiles")
      .select(
        "id,slug,display_name,headline,bio,photo_url,years_experience,languages,zips,audiences,rating,review_count,published,active",
      )
      .eq("user_id", userId)
      .maybeSingle();
    if (error) return null;
    return (data as MyCleanerProfile) ?? null;
  });

const profileUpdateSchema = z.object({
  display_name: z.string().min(2).max(80),
  headline: z.string().max(140).nullable(),
  bio: z.string().max(2000).nullable(),
  photo_url: z.string().url().nullable(),
  years_experience: z.number().int().min(0).max(80).nullable(),
  languages: z.array(z.string().min(2).max(8)).max(10),
  zips: z.array(z.string().min(3).max(10)).max(30),
  audiences: z.array(z.enum(["home", "rental", "move"])).max(3),
});

export const updateMyCleanerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => profileUpdateSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("cleaner_profiles")
      .update({
        display_name: data.display_name,
        headline: data.headline,
        bio: data.bio,
        photo_url: data.photo_url,
        years_experience: data.years_experience,
        languages: data.languages,
        zips: data.zips,
        audiences: data.audiences,
      })
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Cleaner: marketplace ----------
export const listOpenJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OpenJob[]> => {
    const { supabase } = context;
    const { data, error } = await supabase.rpc("list_open_jobs");
    if (error || !data) return [];
    return data as OpenJob[];
  });

export const claimJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ booking_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase.rpc("claim_job", {
      _booking_id: data.booking_id,
    });
    if (error) throw new Error(error.message);
    return { ok: true, row };
  });

export const listMyClaimedJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MyClaimedJob[]> => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id,service_slug,audience,scheduled_at,duration_minutes,price_cents,status,address_line1,city,zip,customer_name,customer_email,customer_phone,bedrooms,bathrooms,square_feet,notes,claimed_at",
      )
      .eq("cleaner_id", userId)
      .order("scheduled_at", { ascending: true });
    if (error || !data) return [];
    return data as MyClaimedJob[];
  });

export const updateMyJobStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["in_progress", "completed"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.rpc("update_cleaner_booking_status", {
      _booking_id: data.id,
      _status: data.status,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Admin: manage cleaners ----------
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

export const adminListCleaners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminCleaner[]> => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("cleaner_profiles")
      .select(
        "id,user_id,slug,display_name,headline,bio,photo_url,years_experience,languages,zips,audiences,rating,review_count,published,active,created_at,updated_at",
      )
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return data as AdminCleaner[];
  });

const adminUpsertSchema = z.object({
  email: z.string().email(),
  display_name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, dashes"),
  headline: z.string().max(140).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  years_experience: z.number().int().min(0).max(80).optional().nullable(),
  languages: z.array(z.string()).max(10).default([]),
  zips: z.array(z.string()).max(30).default([]),
  audiences: z
    .array(z.enum(["home", "rental", "move"]))
    .max(3)
    .default([]),
  published: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const adminUpsertCleaner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => adminUpsertSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve user_id by email via Auth Admin API
    const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listErr) throw new Error(listErr.message);
    const match = list.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!match) {
      throw new Error("No user with that email. Ask them to sign up first, then add them.");
    }
    const targetUserId = match.id;

    // Grant cleaner role
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .upsert(
        { user_id: targetUserId, role: "cleaner" },
        { onConflict: "user_id,role", ignoreDuplicates: true },
      );
    if (roleErr) throw new Error(roleErr.message);

    const payload = {
      user_id: targetUserId,
      slug: data.slug,
      display_name: data.display_name,
      headline: data.headline ?? null,
      bio: data.bio ?? null,
      photo_url: data.photo_url ?? null,
      years_experience: data.years_experience ?? null,
      languages: data.languages,
      zips: data.zips,
      audiences: data.audiences,
      published: data.published,
      active: data.active,
    };

    const { error: upErr } = await supabaseAdmin
      .from("cleaner_profiles")
      .upsert(payload, { onConflict: "user_id" });
    if (upErr) throw new Error(upErr.message);
    return { ok: true, user_id: targetUserId };
  });

export const adminSetCleanerPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        published: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("cleaner_profiles")
      .update({ published: data.published })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCleanerSlugs = createServerFn({ method: "GET" }).handler(
  async (): Promise<string[]> => {
    const sb = serverPublic();
    if (!sb) return [];
    const { data } = await sb
      .from("cleaner_profiles")
      .select("slug")
      .eq("published", true)
      .eq("active", true);
    return (data ?? []).map((r) => r.slug);
  },
);

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const submitSchema = z.object({
  booking_id: z.string().uuid(),
  direction: z.enum(["customer_to_cleaner", "cleaner_to_customer"]),
  ratee_id: z.string().uuid(),
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
});

export const submitBookingRating = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => submitSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("booking_ratings").insert({
      booking_id: data.booking_id,
      rater_id: userId,
      ratee_id: data.ratee_id,
      direction: data.direction,
      stars: data.stars,
      comment: data.comment ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getBookingRatings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ booking_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("booking_ratings")
      .select("id, direction, stars, comment, rater_id, created_at")
      .eq("booking_id", data.booking_id);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

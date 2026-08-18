import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { submitBookingRating, getBookingRatings } from "@/lib/ratings.functions";

type Props = {
  bookingId: string;
  currentUserId: string;
  otherPartyId: string;
  direction: "customer_to_cleaner" | "cleaner_to_customer";
  bookingCompleted: boolean;
};

export function RatingForm({
  bookingId,
  currentUserId,
  otherPartyId,
  direction,
  bookingCompleted,
}: Props) {
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const submit = useServerFn(submitBookingRating);
  const fetchRatings = useServerFn(getBookingRatings);
  const qc = useQueryClient();

  const { data: ratings = [] } = useQuery({
    queryKey: ["booking-ratings", bookingId],
    queryFn: () => fetchRatings({ data: { booking_id: bookingId } }),
  });

  const mine = ratings.find((r) => r.rater_id === currentUserId && r.direction === direction);

  const m = useMutation({
    mutationFn: () =>
      submit({
        data: {
          booking_id: bookingId,
          ratee_id: otherPartyId,
          direction,
          stars,
          comment: comment.trim() || null,
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["booking-ratings", bookingId] }),
  });

  if (!bookingCompleted) {
    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Ratings unlock once the job is marked completed.
      </div>
    );
  }

  if (mine) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground">Your rating</p>
        <div className="mt-2 text-2xl" aria-label={`${mine.stars} stars`}>
          {"★".repeat(mine.stars)}
          <span className="text-muted-foreground">{"★".repeat(5 - mine.stars)}</span>
        </div>
        {mine.comment && <p className="mt-2 text-sm text-muted-foreground">"{mine.comment}"</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">
        Rate {direction === "customer_to_cleaner" ? "your cleaner" : "the customer"}
      </p>
      <div className="mt-3 flex gap-1" role="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={stars === n}
            onClick={() => setStars(n)}
            className={`text-3xl transition ${
              n <= stars ? "text-primary" : "text-muted-foreground/40"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment"
        maxLength={1000}
        rows={3}
        className="mt-3 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      />
      <button
        onClick={() => m.mutate()}
        disabled={m.isPending}
        className="mt-3 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {m.isPending ? "Submitting…" : "Submit rating"}
      </button>
      {m.isError && (
        <p className="mt-2 text-sm text-destructive">
          {(m.error as Error)?.message ?? "Could not submit rating"}
        </p>
      )}
    </div>
  );
}

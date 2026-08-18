import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Nav } from "@/components/tidly/Nav";
import { BookingChat } from "@/components/tidly/BookingChat";
import { RatingForm } from "@/components/tidly/RatingForm";
import { supabase } from "@/integrations/supabase/client";
import { getBookingDetail, cancelBookingWithReason } from "@/lib/marketplace.functions";

export const Route = createFileRoute("/_authenticated/bookings/$id")({
  component: BookingDetailPage,
  head: () => ({
    meta: [{ title: "Booking — Amanda Florida" }, { name: "robots", content: "noindex" }],
  }),
});

function BookingDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getBookingDetail);
  const cancelFn = useServerFn(cancelBookingWithReason);

  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking-detail", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const [reason, setReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  const cancel = useMutation({
    mutationFn: () => cancelFn({ data: { id, reason: reason.trim() || null } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-detail", id] });
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
      qc.invalidateQueries({ queryKey: ["open-jobs"] });
      setShowCancel(false);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <p className="mx-auto max-w-3xl px-5 py-14 text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <section className="mx-auto max-w-lg px-5 py-16 text-center">
          <h1 className="text-2xl font-semibold">Booking not found</h1>
          <button
            type="button"
            onClick={() => navigate({ to: "/bookings" })}
            className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
          >
            Back to bookings
          </button>
        </section>
      </div>
    );
  }

  const when = new Date(booking.scheduled_at);
  const canCancel = booking.status !== "cancelled" && booking.status !== "completed";
  const iAmCustomer = booking.user_id === userId;
  const iAmCleaner = booking.cleaner_id === userId;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <Link
          to={iAmCleaner ? "/cleaner" : "/bookings"}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Booking · {booking.audience}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {booking.service_slug}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {when.toLocaleString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              · {booking.duration_minutes} min
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">${(booking.price_cents / 100).toFixed(0)}</p>
            <span
              className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${
                booking.status === "cancelled"
                  ? "bg-destructive/10 text-destructive"
                  : booking.status === "completed"
                    ? "bg-secondary text-muted-foreground"
                    : "bg-primary/10 text-primary"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        {booking.cancelled_at && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">
              Cancelled {new Date(booking.cancelled_at).toLocaleString()}
            </p>
            {booking.cancel_reason && (
              <p className="mt-1 text-muted-foreground">Reason: {booking.cancel_reason}</p>
            )}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Details
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Address">
                {booking.address_line1}
                {booking.address_line2 ? `, ${booking.address_line2}` : ""}
                <br />
                {booking.city}
                {booking.state ? `, ${booking.state}` : ""} {booking.zip}
              </Row>
              {iAmCleaner && booking.customer_name && (
                <>
                  <Row label="Customer">{booking.customer_name}</Row>
                  {booking.customer_email && (
                    <Row label="Email">
                      <a href={`mailto:${booking.customer_email}`} className="underline">
                        {booking.customer_email}
                      </a>
                    </Row>
                  )}
                  {booking.customer_phone && (
                    <Row label="Phone">
                      <a href={`tel:${booking.customer_phone}`} className="underline">
                        {booking.customer_phone}
                      </a>
                    </Row>
                  )}
                </>
              )}
              {booking.notes && <Row label="Notes">{booking.notes}</Row>}
            </dl>

            {canCancel && (iAmCustomer || iAmCleaner) && (
              <div className="mt-6 border-t border-border pt-4">
                {!showCancel ? (
                  <button
                    type="button"
                    onClick={() => setShowCancel(true)}
                    className="rounded-full border border-destructive/40 px-4 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                  >
                    Cancel booking
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {iAmCleaner
                        ? "Cancelling releases this job back to the open pool."
                        : "We'll notify your cleaner."}{" "}
                      Please share a quick reason.
                    </p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      maxLength={500}
                      placeholder="Optional reason"
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => cancel.mutate()}
                        disabled={cancel.isPending}
                        className="rounded-full bg-destructive px-4 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-60"
                      >
                        {cancel.isPending ? "Cancelling…" : "Confirm cancel"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancel(false)}
                        className="rounded-full border border-input px-4 py-1.5 text-xs font-medium hover:bg-secondary"
                      >
                        Nevermind
                      </button>
                    </div>
                    {cancel.isError && (
                      <p className="text-xs text-destructive">{(cancel.error as Error).message}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Messages
            </h2>
            {booking.cleaner_id ? (
              <div className="mt-4">
                <BookingChat bookingId={booking.id} currentUserId={userId} />
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Chat will open once a cleaner claims this job.
              </div>
            )}
          </div>
        </div>

        {userId && booking.cleaner_id && (iAmCustomer || iAmCleaner) && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Rating
            </h2>
            <div className="mt-4">
              <RatingForm
                bookingId={booking.id}
                currentUserId={userId}
                otherPartyId={iAmCustomer ? booking.cleaner_id : booking.user_id}
                direction={iAmCustomer ? "customer_to_cleaner" : "cleaner_to_customer"}
                bookingCompleted={booking.status === "completed"}
              />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[100px_1fr] gap-3">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Nav } from "@/components/tidly/Nav";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyBookings,
  cancelBooking,
  getBookingIcs,
  listChatSessions,
  type Booking,
} from "@/lib/tidly.functions";

export const Route = createFileRoute("/_authenticated/bookings")({
  component: BookingsPage,
  head: () => ({
    meta: [{ title: "Your bookings — Amanda Florida" }, { name: "robots", content: "noindex" }],
  }),
});

function BookingsPage() {
  const fetchBookings = useServerFn(listMyBookings);
  const fetchChats = useServerFn(listChatSessions);
  const cancelFn = useServerFn(cancelBooking);
  const icsFn = useServerFn(getBookingIcs);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => fetchBookings(),
  });

  const { data: chats } = useQuery({
    queryKey: ["my-chat-sessions"],
    queryFn: () => fetchChats(),
  });

  const bookings: Booking[] = data ?? [];

  // Realtime: refetch on any booking row change for this user
  useEffect(() => {
    const channel = supabase
      .channel("bookings-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () =>
        qc.invalidateQueries({ queryKey: ["my-bookings"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this booking?")) return;
    await cancelFn({ data: { id } });
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
  }

  async function handleDownloadIcs(id: string) {
    const { filename, ics } = await icsFn({ data: { id } });
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Your account</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your bookings</h1>
          <Link to="/str" className="text-sm text-muted-foreground underline hover:text-foreground">
            Rental host? Import your Airbnb calendar →
          </Link>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
        ) : bookings.length === 0 ? (
          <div className="mt-6">
            <p className="max-w-lg text-muted-foreground">
              No bookings yet. Start a quote and we'll show them here.
            </p>
            <div className="mt-6">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Get a quote
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {bookings.map((b) => (
              <li key={b.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {b.audience === "home" ? "Home" : b.audience === "rental" ? "Rental" : "Move"}{" "}
                      · {b.service_slug}
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-tight">
                      {new Date(b.scheduled_at).toLocaleString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {b.address_line1}, {b.city} {b.zip}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold">${(b.price_cents / 100).toFixed(0)}</p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${
                        b.status === "confirmed"
                          ? "bg-primary/10 text-primary"
                          : b.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : b.status === "completed"
                              ? "bg-secondary text-muted-foreground"
                              : "bg-secondary text-foreground"
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>
                </div>
                {b.status === "completed" ? (
                  <div className="mt-4">
                    <Link
                      to="/chat"
                      search={{
                        audience: b.audience as "home" | "rental" | "move",
                      }}
                      className="inline-flex rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Book again
                    </Link>
                  </div>
                ) : b.status !== "cancelled" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to="/bookings/$id"
                      params={{ id: b.id }}
                      className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      Open · Chat
                    </Link>
                    <button
                      onClick={() => handleDownloadIcs(b.id)}
                      className="rounded-full border border-input bg-background px-3.5 py-1.5 text-xs font-medium hover:bg-accent"
                    >
                      Add to calendar
                    </button>
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="rounded-full border border-input bg-background px-3.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      Cancel
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        {chats && chats.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-semibold tracking-tight">Recent chats</h2>
            <ul className="mt-4 space-y-2">
              {chats.map((c) => {
                const firstUser = (
                  c.messages as Array<{
                    role?: string;
                    parts?: Array<{ type?: string; text?: string }>;
                  }>
                )?.find((m) => m?.role === "user");
                const preview =
                  firstUser?.parts?.find((p) => p?.type === "text")?.text ?? "New conversation";
                return (
                  <li key={c.id}>
                    <Link
                      to="/chat"
                      search={{
                        audience:
                          (c.audience as "home" | "rental" | "move" | undefined) ?? undefined,
                        session: c.session_token,
                      }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/40"
                    >
                      <span className="line-clamp-1 text-sm text-foreground">
                        {preview.slice(0, 90)}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(c.updated_at).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

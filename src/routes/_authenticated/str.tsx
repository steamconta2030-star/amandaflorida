import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Nav } from "@/components/tidly/Nav";
import { importStrCalendar, type StrCheckout } from "@/lib/tidly.functions";

export const Route = createFileRoute("/_authenticated/str")({
  component: HostPage,
  head: () => ({
    meta: [
      { title: "STR Host — Airbnb turnovers | Amanda Florida" },
      {
        name: "description",
        content:
          "Import your Airbnb iCal and Amanda Florida schedules turnover cleanings automatically.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function HostPage() {
  const importFn = useServerFn(importStrCalendar);
  const [url, setUrl] = useState("");
  const [checkouts, setCheckouts] = useState<StrCheckout[] | null>(null);

  const mut = useMutation({
    mutationFn: async (calUrl: string) => importFn({ data: { url: calUrl } }),
    onSuccess: (data) => setCheckouts(data),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">STR host mode</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Turnovers on autopilot
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Paste your Airbnb (or Vrbo) iCal export URL. Amanda Florida reads upcoming check-outs and
          lets you book turnover cleanings in one tap.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (url.trim()) mut.mutate(url.trim());
          }}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/…"
            className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={mut.isPending}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {mut.isPending ? "Reading…" : "Import calendar"}
          </button>
        </form>

        {mut.isError && (
          <p className="mt-4 text-sm text-destructive">
            Couldn't read that calendar. Double-check the URL is a public iCal link (ends in .ics).
          </p>
        )}

        {checkouts && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">
              Upcoming check-outs ({checkouts.length})
            </h2>
            {checkouts.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No upcoming reservations in this calendar.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {checkouts.map((c) => (
                  <li
                    key={c.uid}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(c.checkout_iso).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Guest check-out — turnover slot
                      </p>
                    </div>
                    <Link
                      to="/chat"
                      search={{ audience: "rental" }}
                      className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/85"
                    >
                      Book turnover
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="mt-14 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Where do I find my iCal URL?</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>Airbnb → Listings → Availability → Sync calendars → Export.</li>
            <li>
              Copy the link that ends in <code>.ics</code>.
            </li>
            <li>Paste it above. We only read check-out dates.</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

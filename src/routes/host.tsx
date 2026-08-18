import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

export const Route = createFileRoute("/host")({
  head: () => ({
    meta: [
      { title: "Amanda Florida for Airbnb Hosts — Turnover cleaning in Tampa" },
      {
        name: "description",
        content:
          "Automated Airbnb turnover cleaning in Tampa. Photo reports, linen restock, damage alerts. Book from your phone.",
      },
      { property: "og:title", content: "Amanda Florida for Airbnb hosts" },
      { property: "og:description", content: "Turnover cleaning built for short-term rentals." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HostPage,
});

const BENEFITS = [
  {
    title: "Photo report every turnover",
    body: "Every room documented. Know the property is guest-ready before your check-in window.",
  },
  {
    title: "Linen change + restock",
    body: "Fresh linens, restocked amenities (soap, paper, coffee). We flag low inventory automatically.",
  },
  {
    title: "Damage & missing item alerts",
    body: "Cleaner reports issues instantly via the app. You review, we file the Airbnb claim on your behalf.",
  },
  {
    title: "Same-day slots",
    body: "Back-to-back bookings? We prioritize turnovers with tight windows.",
  },
];

function HostPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">For hosts</p>
          <h1 className="mt-3 font-serif text-4xl italic tracking-tight text-foreground md:text-5xl">
            Turnovers, handled.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Amanda Florida is built for Airbnb, VRBO and short-term rental hosts in Tampa.
            Consistent cleaners, photo reports, restock alerts — and one honest price per turnover.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/chat"
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Get a quote
            </Link>
            <Link
              to="/pricing"
              className="rounded-full border border-input bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent"
            >
              See pricing
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-3xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">{b.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>

        <section className="mt-20 rounded-3xl bg-primary/5 p-8 md:p-12">
          <h2 className="font-serif text-3xl italic tracking-tight text-foreground">
            Manage from your phone
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Schedule, get photo reports, message your cleaner and pay — all from the Amanda Florida
            app.
          </p>
          <Link
            to="/chat"
            className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-foreground/85"
          >
            Book your first turnover
          </Link>
        </section>
      </main>
    </div>
  );
}

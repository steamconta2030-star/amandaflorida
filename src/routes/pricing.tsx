import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Transparent cleaning rates | Amanda Florida" },
      {
        name: "description",
        content:
          "Transparent, flat pricing for homes, Airbnbs and move-outs in Tampa. No hidden fees. See what you pay and what cleaners keep.",
      },
      { property: "og:title", content: "Amanda Florida Pricing — Transparent cleaning rates" },
      {
        property: "og:description",
        content: "Flat, honest pricing. See exactly what you pay and what our cleaners keep.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PricingPage,
});

type Tier = {
  name: string;
  price: string;
  unit: string;
  desc: string;
  features: string[];
  cta: string;
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Standard clean",
    price: "$129",
    unit: "starting",
    desc: "Recurring homes, up to 2 bed / 2 bath.",
    features: [
      "Kitchen, bathrooms, floors, dusting",
      "Same cleaner when possible",
      "Reschedule up to 24h before",
      "Satisfaction guarantee",
    ],
    cta: "Book a standard clean",
  },
  {
    name: "Airbnb turnover",
    price: "$95",
    unit: "starting",
    desc: "Fast, checklist-driven turnovers between guests.",
    features: [
      "Photo report of every room",
      "Linen change + restock",
      "Damage / low-stock alerts",
      "Same-day slots when available",
    ],
    cta: "Book a turnover",
    highlight: true,
  },
  {
    name: "Move in / out",
    price: "$249",
    unit: "starting",
    desc: "Deep clean for empty homes — deposit back guaranteed.",
    features: [
      "Inside cabinets, appliances, baseboards",
      "Wall spot-treatment",
      "Before / after photos",
      "Landlord-ready checklist",
    ],
    cta: "Book a move-out",
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
          <h1 className="mt-3 font-serif text-4xl italic tracking-tight text-foreground md:text-5xl">
            Honest, flat pricing.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            No hidden fees. No surprise upsells. You see the price before you book — and we tell you
            exactly what our cleaners keep.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`rounded-3xl border p-6 ${
                t.highlight ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card"
              }`}
            >
              <h2 className="text-lg font-semibold text-foreground">{t.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {t.price}
                </span>
                <span className="text-sm text-muted-foreground">{t.unit}</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-foreground">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/chat"
                className={`mt-8 flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium ${
                  t.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background text-foreground hover:bg-accent"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <section className="mt-24 rounded-3xl border border-border bg-card p-8 md:p-12">
          <h2 className="font-serif text-3xl italic tracking-tight text-foreground">
            How we split the money
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Amanda Florida is a curated network. Cleaners are independent pros — we handle
            marketing, scheduling, payments and support so they can focus on the work.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <div className="text-4xl font-semibold text-foreground">75–80%</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Goes directly to your cleaner. Higher than most platforms.
              </p>
            </div>
            <div>
              <div className="text-4xl font-semibold text-foreground">20–25%</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Amanda Florida's take rate — covers app, payments, insurance, support and vetting.
              </p>
            </div>
            <div>
              <div className="text-4xl font-semibold text-foreground">$0</div>
              <p className="mt-2 text-sm text-muted-foreground">
                To join as a cleaner. No monthly fees, no lead-buying.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 text-center">
          <h2 className="font-serif text-3xl italic tracking-tight text-foreground">Questions?</h2>
          <p className="mt-3 text-muted-foreground">
            Check our{" "}
            <Link to="/faq" className="underline">
              FAQ
            </Link>{" "}
            or{" "}
            <Link to="/contact" className="underline">
              get in touch
            </Link>
            .
          </p>
        </section>
      </main>
    </div>
  );
}

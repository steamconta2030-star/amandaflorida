import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

const SITE_URL = "https://amandaflorida.com";

const FAQ = [
  {
    q: "How fast can I book a cleaning in Tampa?",
    a: "Most quotes take about 60 seconds by chat, and same-week times are usually open.",
  },
  {
    q: "Do you clean Airbnb and short-term rentals?",
    a: "Yes — Airbnb and VRBO turnovers with a photo checklist and STR calendar sync.",
  },
  {
    q: "Do you offer move-in and move-out cleanings?",
    a: "Yes, deposit-ready move-in / move-out cleans are available on short notice.",
  },
  {
    q: "How is pricing calculated?",
    a: "You get a real, transparent price based on home size, service type, and add-ons before booking.",
  },
  {
    q: "What areas do you serve?",
    a: "Tampa Bay and Hillsborough County, FL. Ask by chat if you're on the edge — we'll say honestly.",
  },
  {
    q: "Can I cancel or reschedule?",
    a: "Yes, from your bookings page. Please give us at least 24 hours' notice when possible.",
  },
];

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Amanda Florida cleaning in Tampa, FL" },
      {
        name: "description",
        content:
          "Answers about pricing, service areas, Airbnb turnovers, move-in/out cleans, and cancellations for Amanda Florida in Tampa.",
      },
      { property: "og:title", content: "FAQ — Amanda Florida cleaning in Tampa" },
      {
        property: "og:description",
        content: "Everything you'd ask before booking a cleaning in Tampa Bay.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/faq` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "FAQ", item: `${SITE_URL}/faq` },
          ],
        }),
      },
    ],
  }),
});

function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">FAQ</span>
        </nav>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Frequently asked
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          Questions, answered.
        </h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg">
          Anything else? Ask Amanda Florida directly by chat — a real answer takes about a minute.
        </p>

        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-medium">
                <span>{f.q}</span>
                <span className="mt-1 text-muted-foreground transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85"
          >
            Ask by chat
          </Link>
          <Link
            to="/services"
            className="rounded-full border border-input px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            See services
          </Link>
        </div>
      </section>
    </div>
  );
}

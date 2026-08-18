import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Amanda Florida — Cleaning by chat in Tampa" },
      {
        name: "description",
        content:
          "Amanda Florida is a Tampa cleaning service built around chat. Real quotes in 60 seconds, photo checklists, and a small team that actually cares.",
      },
      { property: "og:title", content: "About Amanda Florida — Cleaning by chat" },
      {
        property: "og:description",
        content: "A tiny Tampa cleaning company obsessed with fast quotes and clean handoffs.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/about` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "About", item: `${SITE_URL}/about` },
          ],
        }),
      },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">About</span>
        </nav>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">About</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          A tiny Tampa team, obsessed with clean handoffs.
        </h1>
        <p className="mt-5 text-base text-muted-foreground md:text-lg">
          Amanda Florida started because getting a real cleaning quote in Tampa was harder than the
          clean itself. We built a chat that gives you a straight price in about a minute, and a
          small crew that shows up on time with a photo checklist when they're done.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <Value
            k="Chat over forms"
            v="You describe the place — or send photos. We quote. That's the intake."
          />
          <Value
            k="Real prices"
            v="No range-then-upsell. The number you see is the number you pay."
          />
          <Value
            k="Photo handoff"
            v="Every clean ends with a checklist and photos of the finished rooms."
          />
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Service area</p>
          <p className="mt-2 text-sm">
            Tampa, FL and neighboring Hillsborough County. Ask by chat if you live on the edge — we
            answer honestly.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85"
          >
            Get a quote
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

function Value({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold tracking-tight">{k}</p>
      <p className="mt-1 text-sm text-muted-foreground">{v}</p>
    </div>
  );
}

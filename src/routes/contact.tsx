import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact Amanda Florida — Tampa cleaning" },
      {
        name: "description",
        content:
          "Reach Amanda Florida in Tampa by chat, email, or phone. Same-day answers on quotes, rescheduling, and Airbnb turnovers.",
      },
      { property: "og:title", content: "Contact Amanda Florida — Tampa cleaning" },
      {
        property: "og:description",
        content: "Chat, email, or call Amanda Florida for Tampa cleaning quotes and support.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Contact", item: `${SITE_URL}/contact` },
          ],
        }),
      },
    ],
  }),
});

function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Contact</span>
        </nav>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          Talk to a human — or Amanda Florida.
        </h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          Fastest answer is the chat. Prefer email? Also fine. We're a small Tampa team; you'll hear
          back the same day.
        </p>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
          <Method
            k="Chat"
            v="Get a real quote in ~60 seconds."
            cta={
              <Link
                to="/chat"
                className="mt-3 inline-flex rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/85"
              >
                Start chat
              </Link>
            }
          />
          <Method
            k="Email"
            v="hello@amandaflorida.com"
            cta={
              <a
                href="mailto:hello@amandaflorida.com"
                className="mt-3 inline-flex rounded-full border border-input px-4 py-2 text-xs font-medium hover:bg-secondary"
              >
                Send email
              </a>
            }
          />
          <Method
            k="Hours"
            v="Mon–Sat, 8am – 6pm ET"
            cta={<span className="mt-3 inline-flex text-xs text-muted-foreground">Tampa, FL</span>}
          />
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            For Airbnb hosts
          </p>
          <p className="mt-2 text-sm">
            Managing turnovers?{" "}
            <Link to="/host" className="underline underline-offset-2">
              See the host tools
            </Link>{" "}
            or ask about calendar sync in chat.
          </p>
        </div>
      </section>
    </div>
  );
}

function Method({ k, v, cta }: { k: string; v: string; cta: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm font-semibold tracking-tight">{k}</p>
      <p className="mt-1 text-sm text-muted-foreground">{v}</p>
      {cta}
    </div>
  );
}

import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";
import { NewsletterForm } from "@/components/tidly/NewsletterForm";
import { POSTS } from "@/lib/blog";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
  head: () => ({
    meta: [
      { title: "Blog — Amanda Florida cleaning in Tampa, FL" },
      {
        name: "description",
        content:
          "Practical cleaning guides for Tampa homes, Airbnb hosts, and renters: turnover checklists, move-out tips, and a cleaning cadence that fits Florida.",
      },
      { property: "og:title", content: "Amanda Florida Blog — Cleaning guides for Tampa" },
      {
        property: "og:description",
        content: "Turnover checklists, move-out tips, and a Tampa-specific cleaning cadence.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/blog` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          ],
        }),
      },
    ],
  }),
});

function BlogLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/blog/$slug");
  if (isChild) return <Outlet />;
  return <BlogIndex />;
}

function BlogIndex() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Blog</span>
        </nav>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">Blog</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          Cleaning guides for Tampa homes & hosts.
        </h1>
        <p className="mt-5 text-base text-muted-foreground md:text-lg">
          Turnover checklists, move-out tips, and a cleaning cadence that fits Florida humidity.
          Written by the crew that actually shows up.
        </p>

        <ul className="mt-12 space-y-6">
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="group block rounded-2xl border border-border bg-card p-5 transition hover:border-foreground/30"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{p.tag}</span>
                  <span>·</span>
                  <time dateTime={p.date}>
                    {new Date(p.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                  <span>·</span>
                  <span>{p.readMinutes} min read</span>
                </div>
                <h2 className="mt-2 text-xl font-semibold tracking-tight group-hover:underline">
                  {p.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-14">
          <NewsletterForm
            source="blog-index"
            title="Get one great cleaning tip a month"
            subtitle="Tampa-specific, short, actionable. No spam."
          />
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Need a real price now?</p>
          <Link
            to="/chat"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
          >
            Get a quote by chat
          </Link>
        </div>
      </section>
    </div>
  );
}

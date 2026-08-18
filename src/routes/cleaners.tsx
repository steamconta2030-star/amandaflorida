import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Nav } from "@/components/tidly/Nav";
import { listPublishedCleaners } from "@/lib/cleaners.functions";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/cleaners")({
  component: CleanersLayout,
  head: () => ({
    meta: [
      { title: "Our cleaners — Amanda Florida network in Tampa" },
      {
        name: "description",
        content:
          "Meet the Tampa cleaners in the Amanda Florida network — each one hand-picked and vetted by Amanda. Homes, Airbnbs and move-ins.",
      },
      { property: "og:title", content: "Our cleaners — Amanda Florida Tampa network" },
      {
        property: "og:description",
        content: "Vetted Tampa cleaners for homes, rentals and moves.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/cleaners` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            { "@type": "ListItem", position: 2, name: "Cleaners", item: `${SITE_URL}/cleaners` },
          ],
        }),
      },
    ],
  }),
});

function CleanersLayout() {
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/cleaners/$slug");
  if (isChild) return <Outlet />;
  return <CleanersIndex />;
}

const AUDIENCE_LABEL: Record<string, string> = {
  home: "Homes",
  rental: "Airbnb",
  move: "Move-in/out",
};

function CleanersIndex() {
  const { data: cleaners = [], isLoading } = useQuery({
    queryKey: ["public-cleaners"],
    queryFn: () => listPublishedCleaners(),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Our cleaners</span>
        </nav>

        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          The Amanda Florida network
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Cleaners hand-picked by Amanda.
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          Every cleaner in the network is vetted, insured, and rated after each job. Chat with
          Amanda Florida and we route your booking to the right person for your home, rental, or
          move.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Book a cleaning
          </Link>
          <a
            href="mailto:hello@amandaflorida.com?subject=Join%20the%20Amanda%20Florida%20network"
            className="rounded-full border border-input px-6 py-3 text-sm font-medium hover:bg-secondary"
          >
            Cleaner? Join the network
          </a>
        </div>

        <div className="mt-14">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading cleaners…</p>
          ) : cleaners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              We're onboarding the first cleaners now. Check back soon.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cleaners.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/cleaners/$slug"
                    params={{ slug: c.slug }}
                    className="group flex h-full flex-col rounded-3xl border border-border bg-card p-5 transition hover:border-foreground/30"
                  >
                    <div className="flex items-center gap-4">
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt={c.display_name}
                          loading="lazy"
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div
                          className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-xl font-semibold text-muted-foreground"
                          aria-hidden
                        >
                          {c.display_name.slice(0, 1)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold tracking-tight group-hover:underline">
                          {c.display_name}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          <span className="text-primary">★ {c.rating.toFixed(1)}</span> ·{" "}
                          {c.review_count} reviews
                          {c.years_experience ? ` · ${c.years_experience}+ yrs` : ""}
                        </p>
                      </div>
                    </div>
                    {c.headline && <p className="mt-4 text-sm text-foreground/90">{c.headline}</p>}
                    <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.audiences.map((a) => (
                        <span
                          key={a}
                          className="rounded-full border border-border bg-background px-2 py-0.5"
                        >
                          {AUDIENCE_LABEL[a] ?? a}
                        </span>
                      ))}
                      {c.zips.slice(0, 4).map((z) => (
                        <span key={z} className="rounded-full bg-secondary px-2 py-0.5">
                          {z}
                        </span>
                      ))}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

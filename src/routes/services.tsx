import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/tidly/Nav";
import { listServices, type Service } from "@/lib/tidly.functions";

const SITE_URL = "https://amandaflorida.com";

const servicesQuery = queryOptions({
  queryKey: ["services-public"],
  queryFn: () => listServices(),
});

export const Route = createFileRoute("/services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: ServicesPage,
  head: ({ loaderData }) => {
    const services = (loaderData as Service[] | undefined) ?? [];
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: services.map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Service",
          name: s.name,
          description: s.description ?? undefined,
          areaServed: "Tampa, FL",
          provider: { "@type": "LocalBusiness", name: "Amanda Florida" },
          offers: {
            "@type": "Offer",
            price: (s.base_price_cents / 100).toFixed(0),
            priceCurrency: "USD",
            url: `${SITE_URL}/services`,
          },
        },
      })),
    };
    return {
      meta: [
        { title: "Cleaning services & pricing in Tampa — Amanda Florida" },
        {
          name: "description",
          content:
            "Standard, deep, move-in/out, and short-term rental turnovers in Tampa Bay. Transparent starting prices and book by chat.",
        },
        {
          property: "og:title",
          content: "Cleaning services & pricing in Tampa — Amanda Florida",
        },
        {
          property: "og:description",
          content:
            "Transparent starting prices for homes, rentals and moves. Book instantly by chat.",
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/services` }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(jsonLd) },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
            ],
          }),
        },
      ],
    };
  },
});

const AUDIENCE_LABEL: Record<Service["audience"], string> = {
  home: "Homeowners",
  rental: "Short-term rentals",
  move: "Move-in / move-out",
};

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);

  const grouped = services.reduce<Record<Service["audience"], Service[]>>(
    (acc, s) => {
      (acc[s.audience] ??= []).push(s);
      return acc;
    },
    { home: [], rental: [], move: [] },
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Services</span>
        </nav>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Services & pricing
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Clean, priced, and booked in one chat.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Starting prices for the Tampa Bay area. Your final quote depends on the size and condition
          of your place — Amanda Florida chats with you to nail it down in under a minute.
        </p>

        <div className="mt-14 space-y-14">
          {(["home", "rental", "move"] as const).map((audience) =>
            grouped[audience].length === 0 ? null : (
              <div key={audience}>
                <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {AUDIENCE_LABEL[audience]}
                </h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {grouped[audience].map((s) => (
                    <article
                      key={s.slug}
                      className="flex flex-col rounded-3xl border border-border bg-card p-6"
                    >
                      <h3 className="text-lg font-semibold tracking-tight">{s.name}</h3>
                      <p className="mt-2 flex-1 text-sm text-muted-foreground">{s.description}</p>
                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            From
                          </p>
                          <p className="text-2xl font-semibold">
                            ${(s.base_price_cents / 100).toFixed(0)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            ~{s.duration_minutes} min
                          </p>
                        </div>
                        <Link
                          to="/chat"
                          search={{ audience }}
                          className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/85"
                        >
                          Book
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-20 rounded-3xl bg-primary/10 p-8 text-center md:p-12">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Not sure which one?</h2>
          <p className="mt-2 text-muted-foreground">
            Send a couple photos in the chat and Amanda Florida picks the right service.
          </p>
          <Link
            to="/chat"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start a quote
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}

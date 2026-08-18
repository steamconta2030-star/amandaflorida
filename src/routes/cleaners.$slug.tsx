import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Nav } from "@/components/tidly/Nav";
import { getCleanerBySlug } from "@/lib/cleaners.functions";

const SITE_URL = "https://amandaflorida.com";

const AUDIENCE_LABEL: Record<string, string> = {
  home: "Homes",
  rental: "Airbnb & rentals",
  move: "Move-in / move-out",
};

const cleanerQuery = (slug: string) =>
  queryOptions({
    queryKey: ["cleaner", slug],
    queryFn: () => getCleanerBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/cleaners/$slug")({
  loader: async ({ params, context }) => {
    const cleaner = await context.queryClient.ensureQueryData(cleanerQuery(params.slug));
    if (!cleaner) throw notFound();
    return { cleaner };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Cleaner not found — Amanda Florida" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const c = loaderData.cleaner;
    const title = `${c.display_name} — Amanda Florida cleaner in Tampa`;
    const description =
      c.headline ??
      `Meet ${c.display_name}, a hand-picked cleaner in the Amanda Florida Tampa network.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(c.photo_url ? [{ property: "og:image", content: c.photo_url }] : []),
        ...(c.photo_url ? [{ name: "twitter:card", content: "summary_large_image" }] : []),
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/cleaners/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              {
                "@type": "ListItem",
                position: 2,
                name: "Cleaners",
                item: `${SITE_URL}/cleaners`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: c.display_name,
                item: `${SITE_URL}/cleaners/${params.slug}`,
              },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: c.display_name,
            image: c.photo_url ?? undefined,
            jobTitle: "Professional cleaner",
            worksFor: { "@type": "Organization", name: "Amanda Florida" },
            areaServed: c.zips.map((z) => ({
              "@type": "PostalAddress",
              addressLocality: "Tampa",
              addressRegion: "FL",
              postalCode: z,
            })),
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: c.rating,
              reviewCount: c.review_count,
            },
          }),
        },
      ],
    };
  },
  component: CleanerDetail,
  notFoundComponent: NotFoundCleaner,
  errorComponent: () => (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load this cleaner</h1>
        <Link to="/cleaners" className="mt-6 inline-block text-primary hover:underline">
          Back to all cleaners
        </Link>
      </div>
    </div>
  ),
});

function CleanerDetail() {
  const { slug } = Route.useParams();
  const { data: cleaner } = useSuspenseQuery(cleanerQuery(slug));
  if (!cleaner) return <NotFoundCleaner />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/cleaners" className="hover:text-foreground">
            Cleaners
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{cleaner.display_name}</span>
        </nav>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
          {cleaner.photo_url ? (
            <img
              src={cleaner.photo_url}
              alt={cleaner.display_name}
              className="h-28 w-28 rounded-3xl object-cover md:h-36 md:w-36"
            />
          ) : (
            <div className="grid h-28 w-28 place-items-center rounded-3xl bg-secondary text-3xl font-semibold text-muted-foreground md:h-36 md:w-36">
              {cleaner.display_name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {cleaner.display_name}
            </h1>
            {cleaner.headline && (
              <p className="mt-2 text-base text-muted-foreground">{cleaner.headline}</p>
            )}
            <p className="mt-3 text-sm text-muted-foreground">
              <span className="text-primary">★ {cleaner.rating.toFixed(1)}</span> ·{" "}
              {cleaner.review_count} reviews
              {cleaner.years_experience ? ` · ${cleaner.years_experience}+ yrs` : ""}
            </p>
          </div>
        </div>

        {cleaner.bio && (
          <div className="prose prose-neutral mt-10 max-w-none text-foreground">
            {cleaner.bio.split("\n").map((p, i) => (
              <p key={i} className="text-base leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Facet title="Services">
            {cleaner.audiences.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              cleaner.audiences.map((a) => <Chip key={a}>{AUDIENCE_LABEL[a] ?? a}</Chip>)
            )}
          </Facet>
          <Facet title="Neighborhoods (ZIP)">
            {cleaner.zips.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              cleaner.zips.map((z) => <Chip key={z}>{z}</Chip>)
            )}
          </Facet>
          <Facet title="Languages">
            {cleaner.languages.length === 0 ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              cleaner.languages.map((l) => <Chip key={l}>{l.toUpperCase()}</Chip>)
            )}
          </Facet>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Book with the Amanda Florida network
          </Link>
          <Link
            to="/cleaners"
            className="rounded-full border border-input px-6 py-3 text-sm font-medium hover:bg-secondary"
          >
            All cleaners
          </Link>
        </div>
      </section>
    </div>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">{children}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">
      {children}
    </span>
  );
}

function NotFoundCleaner() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-2xl font-semibold">Cleaner not found</h1>
        <p className="mt-2 text-muted-foreground">This profile may have been unpublished.</p>
        <Link to="/cleaners" className="mt-6 inline-block text-primary hover:underline">
          See all cleaners
        </Link>
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/reviews")({
  component: ReviewsPage,
  head: () => ({
    meta: [
      { title: "Verified reviews — Amanda Florida Tampa cleaning" },
      {
        name: "description",
        content:
          "Verified customer reviews submitted after completed Amanda Florida cleaning services.",
      },
      { property: "og:title", content: "Verified reviews — Amanda Florida Tampa cleaning" },
      {
        property: "og:description",
        content: "Home, Airbnb, and move-out cleaning experiences in Tampa.",
      },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/reviews` }],
  }),
});

function ReviewsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
          <Link to="/">Home</Link>
          <span className="mx-1.5">/</span>
          <span>Reviews</span>
        </nav>
        <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Verified reviews
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          Feedback connected to completed services.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          Amanda Florida only publishes reviews submitted through a completed booking. New verified
          feedback will appear here as the platform begins operating.
        </p>
        <div className="mt-10 rounded-3xl border border-border bg-card p-8 text-center">
          <p className="text-sm font-medium">No verified reviews published yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Reviews are collected automatically after a service is marked as completed.
          </p>
        </div>
        <div className="mt-12 rounded-3xl bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-semibold">Ready for your own clean?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell Amanda Florida about the space and get a Tampa-area quote by chat.
          </p>
          <Link
            to="/chat"
            className="mt-5 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Get a quote
          </Link>
        </div>
      </section>
    </div>
  );
}

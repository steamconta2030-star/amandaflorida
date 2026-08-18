import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Nav } from "@/components/tidly/Nav";
import { NewsletterForm } from "@/components/tidly/NewsletterForm";
import { trackConversion } from "@/lib/analytics";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/thanks")({
  component: ThanksPage,
  head: () => ({
    meta: [
      { title: "You're booked — Amanda Florida" },
      {
        name: "description",
        content:
          "Thanks for booking with Amanda Florida. See what to expect and share with a friend.",
      },
      { property: "og:title", content: "You're booked — Amanda Florida" },
      {
        property: "og:description",
        content: "Your Tampa cleaning is scheduled. Here's what happens next.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/thanks` }],
  }),
});

function ThanksPage() {
  const shareUrl = `${SITE_URL}/`;
  const shareText = "Booked my Tampa cleaning by chat with Amanda Florida — took a minute:";

  useEffect(() => {
    // Meta standard "Schedule" + GA4 "generate_lead"
    trackConversion("Schedule", { content_name: "booking_confirmed" });
    trackConversion("generate_lead", { value: 1, currency: "USD" });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-2xl px-5 py-16 md:py-24">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Confirmed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
          You're booked. 🎉
        </h1>
        <p className="mt-4 text-base text-muted-foreground md:text-lg">
          You'll get a confirmation email shortly. Your cleaner will text on the way. If plans
          change, cancel from your bookings anytime.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/bookings"
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background hover:bg-foreground/85"
          >
            View my bookings
          </Link>
          <Link
            to="/chat"
            className="rounded-full border border-input px-5 py-2.5 text-sm font-medium hover:bg-secondary"
          >
            Book another
          </Link>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            What happens next
          </p>
          <ol className="mt-3 space-y-2 text-sm">
            <li>1. Confirmation email lands in your inbox.</li>
            <li>2. Cleaner arrives in the time window and texts on the way.</li>
            <li>3. Photo checklist when it's done, so you know what's covered.</li>
          </ol>
        </div>

        <div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-xs uppercase tracking-widest text-primary">Share Amanda Florida</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Know a neighbor who could use a spotless place? Send them Amanda Florida.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`sms:?&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              className="rounded-full border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
            >
              Text
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent("Amanda Florida — Tampa cleaning by chat")}&body=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              className="rounded-full border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
            >
              Email
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-full border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
            >
              WhatsApp
            </a>
          </div>
        </div>
        <div className="mt-10">
          <NewsletterForm
            source="thanks"
            title="Stay tidy between cleanings"
            subtitle="Get one short cleaning tip a month, Tampa-specific."
          />
        </div>
      </section>
    </div>
  );
}

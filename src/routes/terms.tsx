import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Amanda Florida" },
      {
        name: "description",
        content: "The rules for using Amanda Florida as a customer or as a cleaner in our network.",
      },
      { property: "og:title", content: "Amanda Florida — Terms of Service" },
      { property: "og:description", content: "Rules for using Amanda Florida." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="mt-3 font-serif text-4xl italic tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 12, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
          <h2>1. What Amanda Florida is</h2>
          <p>
            Amanda Florida is a marketplace that connects customers with independent professional
            cleaners. Cleaners are not employees of Amanda Florida. Amanda Florida does not perform
            the cleaning services itself.
          </p>

          <h2>2. Bookings and payment</h2>
          <p>
            Prices are shown in the app before you confirm. You authorize us to charge your payment
            method for confirmed bookings, tips and applicable fees. Refunds and credits are handled
            per our support policy.
          </p>

          <h2>3. Cancellation</h2>
          <p>
            Free cancellation up to 24 hours before the scheduled time. Cancellations inside that
            window may incur a fee. If a cleaner cancels, the job is released back to the network
            and you keep your slot when possible.
          </p>

          <h2>4. Your responsibilities</h2>
          <ul>
            <li>Give accurate access details and information about your home.</li>
            <li>Remove valuables you don't want touched.</li>
            <li>Treat cleaners with respect. Harassment ends your account immediately.</li>
          </ul>

          <h2>5. Cleaner responsibilities</h2>
          <ul>
            <li>Show up on time, in uniform, with your own supplies unless agreed otherwise.</li>
            <li>Complete the checklist for the booked service.</li>
            <li>Report any damage or issue immediately via the app.</li>
          </ul>

          <h2>6. Liability</h2>
          <p>
            Amanda Florida is not liable for indirect, incidental or consequential damages. Total
            liability is limited to the amount you paid for the specific booking in dispute. Nothing
            in these terms limits liability where such limitation is not allowed by law.
          </p>

          <h2>7. Disputes</h2>
          <p>
            Report issues within 48 hours of the booking. We'll investigate and mediate. Disputes
            not resolved through support are subject to binding arbitration in the state of Florida
            (or your local jurisdiction if required by law).
          </p>

          <h2>8. Account termination</h2>
          <p>
            You may close your account any time. We may suspend or terminate accounts that violate
            these terms, our community guidelines, or applicable law.
          </p>

          <h2>9. Changes</h2>
          <p>
            We may update these terms. Continued use of Amanda Florida after changes take effect
            means you accept the updated version.
          </p>

          <h2>10. Contact</h2>
          <p>
            Questions? Email <a href="mailto:legal@amandaflorida.com">legal@amandaflorida.com</a>.
          </p>
        </div>
      </main>
    </div>
  );
}

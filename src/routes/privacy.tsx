import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/tidly/Nav";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Amanda Florida" },
      {
        name: "description",
        content: "How Amanda Florida collects, uses and protects your personal information.",
      },
      { property: "og:title", content: "Amanda Florida — Privacy Policy" },
      { property: "og:description", content: "How we handle your data." },
      { property: "og:type", content: "article" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
        <h1 className="mt-3 font-serif text-4xl italic tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 12, 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert">
          <h2>1. Information we collect</h2>
          <p>
            We collect information you give us directly (name, email, phone, address, booking
            details, messages), information from your device (browser, IP, approximate location) and
            information from third parties you connect (payment processors, auth providers).
          </p>

          <h2>2. How we use it</h2>
          <ul>
            <li>To schedule, deliver and support your cleaning bookings.</li>
            <li>To match you with cleaners in our network.</li>
            <li>To process payments and prevent fraud.</li>
            <li>To send booking confirmations, receipts, and — with consent — marketing.</li>
            <li>To improve the product and safety of the platform.</li>
          </ul>

          <h2>3. Sharing</h2>
          <p>
            We share the minimum data needed with the cleaner assigned to your booking (name,
            address, service details, contact if you choose to share it), with payment processors,
            and with service providers who help us run Amanda Florida. We do not sell your personal
            data.
          </p>

          <h2>4. Data retention</h2>
          <p>
            We keep account and booking data while your account is active and for as long as needed
            to comply with legal obligations. You can request deletion at any time.
          </p>

          <h2>5. Your rights</h2>
          <p>
            Depending on where you live, you have the right to access, correct, export or delete
            your personal data, and to object to certain processing. Email{" "}
            <a href="mailto:privacy@amandaflorida.com">privacy@amandaflorida.com</a> to exercise
            these rights.
          </p>

          <h2>6. Security</h2>
          <p>
            We use industry-standard encryption in transit and at rest. No system is perfectly
            secure — please use a strong, unique password and enable 2FA where available.
          </p>

          <h2>7. Children</h2>
          <p>Amanda Florida is not intended for anyone under 18.</p>

          <h2>8. Changes</h2>
          <p>
            We may update this policy. Material changes will be announced via the app or email
            before taking effect.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions? Email{" "}
            <a href="mailto:privacy@amandaflorida.com">privacy@amandaflorida.com</a>.
          </p>
        </div>
      </main>
    </div>
  );
}

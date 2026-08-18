import { useEffect, useState } from "react";
import { getConsent, setConsent, analyticsEnabled } from "@/lib/analytics";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!analyticsEnabled()) return;
    if (getConsent() === "unknown") setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    setConsent("granted");
    setVisible(false);
  };
  const decline = () => {
    setConsent("denied");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur md:inset-x-auto md:right-4 md:left-auto md:bottom-4 md:w-[420px]"
    >
      <p className="text-sm text-foreground">
        We use cookies for analytics and ads to improve Amanda Florida. See our{" "}
        <a href="/privacy" className="underline">
          Privacy Policy
        </a>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={accept}
          className="flex-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/85"
        >
          Accept
        </button>
        <button
          onClick={decline}
          className="rounded-full border border-input px-4 py-2 text-sm font-medium hover:bg-secondary"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

type Props = {
  source: string;
  title?: string;
  subtitle?: string;
  variant?: "card" | "inline";
};

export function NewsletterForm({
  source,
  title = "Cleaning tips for Tampa homes",
  subtitle = "One short email a month. No spam, unsubscribe anytime.",
  variant = "card",
}: Props) {
  const subscribe = useServerFn(subscribeNewsletter);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMsg(null);
    try {
      const locale = typeof navigator !== "undefined" ? navigator.language?.slice(0, 8) : null;
      await subscribe({ data: { email, source, locale } });
      setState("done");
      setMsg("You're in — check your inbox soon.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const wrapperClass =
    variant === "card" ? "rounded-3xl border border-border bg-card p-6 md:p-8" : "";

  return (
    <div className={wrapperClass}>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Newsletter</p>
      <h3 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      <form
        onSubmit={onSubmit}
        className="mt-5 flex flex-col gap-2 sm:flex-row"
        aria-label="Subscribe to Amanda Florida newsletter"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-full border border-input bg-background px-5 py-3 text-sm outline-none focus:border-primary"
          aria-label="Email address"
          disabled={state === "loading" || state === "done"}
        />
        <button
          type="submit"
          disabled={state === "loading" || state === "done"}
          className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {state === "loading" ? "Subscribing…" : state === "done" ? "Subscribed ✓" : "Subscribe"}
        </button>
      </form>
      {msg && (
        <p
          role="status"
          className={`mt-3 text-xs ${
            state === "error" ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { detectLang, t } from "@/lib/i18n";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "tidly_install_dismissed_at";
const DISMISS_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export function InstallPrompt() {
  const [lang] = useState(() => detectLang());
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIos, setShowIos] = useState(false);
  const [visible, setVisible] = useState(false);
  const strings = t(lang);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed / standalone → hide
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // Recently dismissed → hide
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_MS) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS Safari fallback — no beforeinstallprompt available
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (isIos) {
      const timer = setTimeout(() => {
        setShowIos(true);
        setVisible(true);
      }, 4000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg shadow-black/[0.08]">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-lg">
          <span aria-hidden>✨</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{strings.install_title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {showIos ? strings.install_ios_body : strings.install_body}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {!showIos && (
            <button
              type="button"
              onClick={install}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            >
              {strings.install_cta}
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            aria-label={strings.install_dismiss}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

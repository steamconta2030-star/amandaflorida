import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import {
  META_PIXEL_ID,
  GA4_MEASUREMENT_ID,
  TIKTOK_PIXEL_ID,
  GOOGLE_ADS_ID,
  metaPixelSnippet,
  ga4Snippet,
  tiktokPixelSnippet,
  consentDefaultSnippet,
  captureUtm,
  reportWebVitals,
} from "../lib/analytics";

const SITE_URL = "https://amandaflorida.com";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist yet — or has moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to Amanda Florida
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Amanda Florida — Book cleaning in Tampa, FL by chat" },
      {
        name: "description",
        content:
          "Amanda Florida is an AI-powered cleaning service for Tampa, FL. Get a quote and book in 60 seconds — homes, Airbnbs, and move-in/out. No forms, just chat.",
      },
      { name: "theme-color", content: "#FF6B57" },
      { property: "og:title", content: "Amanda Florida — Book cleaning in Tampa by chat" },
      {
        property: "og:description",
        content:
          "AI-powered cleaning for Tampa homes, rentals, and moves. Quote and book in a single conversation.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Amanda Florida" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/icon-512.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:ital,opsz,wght@1,9..144,400;1,9..144,500&display=swap",
      },
      ...(GA4_MEASUREMENT_ID
        ? [
            {
              rel: "preconnect" as const,
              href: "https://www.googletagmanager.com",
            },
          ]
        : []),
    ],
    scripts: [
      { children: consentDefaultSnippet },
      ...(GA4_MEASUREMENT_ID
        ? [
            {
              src: `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`,
              async: true,
            },
            { children: ga4Snippet(GA4_MEASUREMENT_ID, GOOGLE_ADS_ID) },
          ]
        : GOOGLE_ADS_ID
          ? [
              {
                src: `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`,
                async: true,
              },
              { children: `gtag('config','${GOOGLE_ADS_ID}');` },
            ]
          : []),
      ...(META_PIXEL_ID ? [{ children: metaPixelSnippet(META_PIXEL_ID) }] : []),
      ...(TIKTOK_PIXEL_ID ? [{ children: tiktokPixelSnippet(TIKTOK_PIXEL_ID) }] : []),
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

const THEME_INIT = `(function(){try{var t=localStorage.getItem('tidly_theme');var m=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&m)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    captureUtm();
    reportWebVitals();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <FooterLazy />
      <InstallPromptLazy />
      <ConsentBannerLazy />
    </QueryClientProvider>
  );
}

import { ConsentBanner } from "@/components/tidly/ConsentBanner";
function ConsentBannerLazy() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <ConsentBanner />;
}

import { InstallPrompt } from "@/components/tidly/InstallPrompt";
import { Footer } from "@/components/tidly/Footer";
function InstallPromptLazy() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <InstallPrompt />;
}
function FooterLazy() {
  return <Footer />;
}

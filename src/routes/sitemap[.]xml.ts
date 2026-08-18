import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SITE_URL = "https://amandaflorida.com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY;
        let audiences: string[] = [];
        let cleanerSlugs: string[] = [];
        if (url && key) {
          try {
            const sb = createClient<Database>(url, key, {
              auth: {
                storage: undefined,
                persistSession: false,
                autoRefreshToken: false,
              },
            });
            const { data } = await sb
              .from("services_catalog")
              .select("audience")
              .eq("active", true);
            audiences = Array.from(
              new Set((data ?? []).map((s) => s.audience).filter(Boolean) as string[]),
            );
            const { data: cleaners } = await sb
              .from("cleaner_profiles")
              .select("slug")
              .eq("published", true)
              .eq("active", true);
            cleanerSlugs = (cleaners ?? []).map((c) => c.slug);
          } catch {
            // fall through with empty lists
          }
        }

        const { POSTS } = await import("@/lib/blog");
        const urls: { loc: string; changefreq: string; priority: string }[] = [
          { loc: `${SITE_URL}/`, changefreq: "weekly", priority: "1.0" },
          { loc: `${SITE_URL}/services`, changefreq: "weekly", priority: "0.9" },
          { loc: `${SITE_URL}/blog`, changefreq: "weekly", priority: "0.8" },
          { loc: `${SITE_URL}/faq`, changefreq: "monthly", priority: "0.7" },
          { loc: `${SITE_URL}/about`, changefreq: "monthly", priority: "0.6" },
          { loc: `${SITE_URL}/contact`, changefreq: "monthly", priority: "0.6" },

          { loc: `${SITE_URL}/cleaners`, changefreq: "weekly", priority: "0.8" },
          { loc: `${SITE_URL}/chat`, changefreq: "weekly", priority: "0.8" },
          { loc: `${SITE_URL}/pricing`, changefreq: "monthly", priority: "0.8" },
          { loc: `${SITE_URL}/privacy`, changefreq: "yearly", priority: "0.3" },
          { loc: `${SITE_URL}/terms`, changefreq: "yearly", priority: "0.3" },
          { loc: `${SITE_URL}/become-a-cleaner`, changefreq: "monthly", priority: "0.7" },
          { loc: `${SITE_URL}/auth`, changefreq: "monthly", priority: "0.4" },
        ];
        for (const slug of cleanerSlugs) {
          urls.push({
            loc: `${SITE_URL}/cleaners/${slug}`,
            changefreq: "weekly",
            priority: "0.7",
          });
        }
        for (const p of POSTS) {
          urls.push({
            loc: `${SITE_URL}/blog/${p.slug}`,
            changefreq: "monthly",
            priority: "0.7",
          });
        }
        for (const a of audiences) {
          urls.push({
            loc: `${SITE_URL}/chat?audience=${encodeURIComponent(a)}`,
            changefreq: "weekly",
            priority: "0.7",
          });
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});

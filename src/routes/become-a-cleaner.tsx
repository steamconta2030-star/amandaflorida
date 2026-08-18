import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Nav } from "@/components/tidly/Nav";
import { submitCleanerApplication } from "@/lib/marketplace.functions";

export const Route = createFileRoute("/become-a-cleaner")({
  component: BecomeACleanerPage,
  head: () => ({
    meta: [
      {
        title: "Become a cleaner — Join the Amanda Florida network",
      },
      {
        name: "description",
        content:
          "Apply to join Amanda's curated network of professional cleaners. Set your own schedule, pick jobs in your area, and grow with a trusted brand.",
      },
      { property: "og:title", content: "Become a Amanda Florida cleaner" },
      {
        property: "og:description",
        content: "Join a curated cleaner network. Set your own schedule, pick jobs, and grow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { rel: "canonical", href: "/become-a-cleaner" },
    ],
  }),
});

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  zips: string;
  years_experience: string;
  languages: string;
  audiences: Record<"home" | "rental" | "move", boolean>;
  bio: string;
  has_transport: boolean;
  has_supplies: boolean;
};

function BecomeACleanerPage() {
  const submitFn = useServerFn(submitCleanerApplication);
  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    zips: "",
    years_experience: "",
    languages: "en",
    audiences: { home: true, rental: false, move: false },
    bio: "",
    has_transport: false,
    has_supplies: false,
  });

  const mut = useMutation({
    mutationFn: () =>
      submitFn({
        data: {
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim() || null,
          city: form.city.trim() || null,
          zips: form.zips
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          years_experience: form.years_experience ? Number(form.years_experience) : null,
          languages: form.languages
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean),
          audiences: (["home", "rental", "move"] as const).filter((a) => form.audiences[a]),
          bio: form.bio.trim() || null,
          has_transport: form.has_transport,
          has_supplies: form.has_supplies,
        },
      }),
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Join the network</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          Clean with Amanda Florida.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Curated by Amanda. Real jobs, set your own hours, keep your reputation. We handle
          bookings, scheduling, and clients — you show up and shine.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Perk title="Pick your jobs">Take only what fits your calendar.</Perk>
          <Perk title="Real earnings">Transparent pay per job, upfront.</Perk>
          <Perk title="Amanda's brand">Trusted by hundreds of homes.</Perk>
        </div>

        {mut.isSuccess ? (
          <div className="mt-10 rounded-2xl border border-primary/40 bg-primary/5 p-6">
            <p className="text-lg font-semibold">Application received ✓</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Amanda reviews new applications personally. You'll hear from her by email within a few
              business days. In the meantime, create your account so we can activate you the moment
              you're approved.
            </p>
            <a
              href="/auth"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create your account
            </a>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
            className="mt-10 space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input
                  required
                  value={form.full_name}
                  onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
            </div>

            <Field label="ZIPs you can serve (comma separated)">
              <input
                value={form.zips}
                onChange={(e) => setForm((f) => ({ ...f, zips: e.target.value }))}
                placeholder="33602, 33606, 33629"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Years of experience">
                <input
                  type="number"
                  min={0}
                  max={80}
                  value={form.years_experience}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      years_experience: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
              <Field label="Languages (comma separated)">
                <input
                  value={form.languages}
                  onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
                  placeholder="en, es, pt"
                  className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                />
              </Field>
            </div>

            <Field label="Which services can you offer?">
              <div className="flex flex-wrap gap-4 text-sm">
                {(
                  [
                    ["home", "Homes"],
                    ["rental", "Airbnb / rentals"],
                    ["move", "Move-in / out"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.audiences[k]}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          audiences: { ...f.audiences, [k]: e.target.checked },
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Tell us about yourself">
              <textarea
                rows={5}
                maxLength={2000}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Where you've worked, what you specialize in, why you love this work…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
              />
            </Field>

            <div className="flex flex-wrap gap-6 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.has_transport}
                  onChange={(e) => setForm((f) => ({ ...f, has_transport: e.target.checked }))}
                />
                I have my own transportation
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.has_supplies}
                  onChange={(e) => setForm((f) => ({ ...f, has_supplies: e.target.checked }))}
                />
                I bring my own supplies
              </label>
            </div>

            {mut.isError && (
              <p className="text-sm text-destructive">{(mut.error as Error).message}</p>
            )}

            <button
              type="submit"
              disabled={mut.isPending}
              className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {mut.isPending ? "Sending…" : "Submit application"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function Perk({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{children}</p>
    </div>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      {children}
    </label>
  );
}

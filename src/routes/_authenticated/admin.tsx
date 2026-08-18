import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Nav } from "@/components/tidly/Nav";
import {
  adminListBookings,
  adminListLeads,
  adminUpdateBookingStatus,
  amIAdmin,
  type AdminBooking,
  type AdminLead,
} from "@/lib/tidly.functions";
import {
  adminListCleaners,
  adminUpsertCleaner,
  adminSetCleanerPublished,
  type AdminCleaner,
} from "@/lib/cleaners.functions";
import {
  adminListApplications,
  adminApproveApplication,
  adminRejectApplication,
  type CleanerApplication,
} from "@/lib/marketplace.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin — Amanda Florida" }, { name: "robots", content: "noindex" }],
  }),
});

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

function AdminPage() {
  const checkAdminFn = useServerFn(amIAdmin);
  const listFn = useServerFn(adminListBookings);
  const leadsFn = useServerFn(adminListLeads);
  const updateFn = useServerFn(adminUpdateBookingStatus);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const { data: isAdmin, isLoading: checking } = useQuery({
    queryKey: ["am-i-admin"],
    queryFn: () => checkAdminFn(),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => listFn(),
    enabled: !!isAdmin,
  });

  const { data: leads = [] } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => leadsFn(),
    enabled: !!isAdmin,
  });

  const mut = useMutation({
    mutationFn: (v: { id: string; status: Status }) => updateFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-bookings"] }),
  });

  const rowsAll: AdminBooking[] = data ?? [];
  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rowsAll.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!term) return true;
      return (
        r.customer_name?.toLowerCase().includes(term) ||
        r.customer_email?.toLowerCase().includes(term) ||
        r.customer_phone?.toLowerCase().includes(term) ||
        r.address_line1?.toLowerCase().includes(term) ||
        r.service_slug?.toLowerCase().includes(term)
      );
    });
  }, [rowsAll, q, statusFilter]);

  if (checking) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <p className="mx-auto max-w-4xl px-5 py-14 text-sm text-muted-foreground">
          Checking access…
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Nav />
        <section className="mx-auto max-w-lg px-5 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">403</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This area is restricted. Ask an existing admin to grant your account the admin role.
          </p>
          <Link
            to="/bookings"
            className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to your bookings
          </Link>
        </section>
      </div>
    );
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.count += 1;
      acc.revenue += r.price_cents;
      acc.byStatus[r.status as Status] = (acc.byStatus[r.status as Status] ?? 0) + 1;
      return acc;
    },
    { count: 0, revenue: 0, byStatus: {} as Record<Status, number> },
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Bookings dashboard
        </h1>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
          <Stat label="Total" value={String(totals.count)} />
          <Stat label="Revenue" value={`$${(totals.revenue / 100).toFixed(0)}`} />
          {STATUSES.map((s) => (
            <Stat key={s} label={s} value={String(totals.byStatus[s] ?? 0)} />
          ))}
        </div>

        <Trend7d rows={rowsAll} />

        <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, address, service…"
            className="w-full rounded-full border border-input bg-background px-4 py-2 text-sm md:max-w-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
            className="rounded-full border border-input bg-background px-3 py-2 text-xs font-medium"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            {rows.length} of {rowsAll.length}
          </span>
        </div>

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No bookings match.</p>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id} className="border-t border-border align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(b.scheduled_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{b.customer_email}</div>
                      {b.customer_phone && (
                        <div className="text-xs text-muted-foreground">{b.customer_phone}</div>
                      )}
                      <div className="mt-2 flex gap-2">
                        <a
                          href={`mailto:${b.customer_email}?subject=${encodeURIComponent(
                            `Your ${b.service_slug} cleaning with Amanda Florida`,
                          )}`}
                          className="text-[11px] text-muted-foreground underline hover:text-foreground"
                        >
                          Email
                        </a>
                        <Link
                          to="/chat"
                          search={{ audience: b.audience as "home" | "rental" | "move" }}
                          className="text-[11px] text-muted-foreground underline hover:text-foreground"
                        >
                          Rebook
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.service_slug}</div>
                      <div className="text-xs text-muted-foreground">
                        {b.audience} · {b.duration_minutes}m
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.address_line1}
                      <br />
                      {b.city} {b.zip}
                    </td>
                    <td className="px-4 py-3 font-semibold">${(b.price_cents / 100).toFixed(0)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        disabled={mut.isPending}
                        onChange={(e) =>
                          mut.mutate({
                            id: b.id,
                            status: e.target.value as Status,
                          })
                        }
                        className="rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-14 flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Recent leads</h2>
          <span className="text-xs text-muted-foreground">{leads.length} sessions</span>
        </div>
        {leads.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No chat sessions yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border">
            {leads.map((l: AdminLead) => {
              const first = l.messages?.[0] as { content?: string } | undefined;
              const preview =
                typeof first?.content === "string"
                  ? first.content.slice(0, 120)
                  : `${l.messages?.length ?? 0} messages`;
              return (
                <li
                  key={l.id}
                  className="flex flex-col gap-1 px-4 py-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-secondary px-2 py-0.5">
                        {l.audience ?? "—"}
                      </span>
                      <span>{new Date(l.updated_at).toLocaleString()}</span>
                      <span>· {l.lang ?? "en"}</span>
                    </div>
                    <p className="mt-1 truncate text-sm">{preview}</p>
                  </div>
                  <Link
                    to="/chat"
                    search={{
                      audience: (l.audience ?? "home") as "home" | "rental" | "move",
                      session: l.session_token,
                    }}
                    className="shrink-0 rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    Open
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <ApplicationsAdmin isAdmin={!!isAdmin} />
      <CleanersAdmin isAdmin={!!isAdmin} />
    </div>
  );
}

function ApplicationsAdmin({ isAdmin }: { isAdmin: boolean }) {
  const listFn = useServerFn(adminListApplications);
  const approveFn = useServerFn(adminApproveApplication);
  const rejectFn = useServerFn(adminRejectApplication);
  const qc = useQueryClient();

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: () => listFn(),
    enabled: isAdmin,
  });

  const approve = useMutation({
    mutationFn: (v: { id: string; email: string }) => approveFn({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-applications"] });
      qc.invalidateQueries({ queryKey: ["admin-cleaners"] });
    },
  });
  const reject = useMutation({
    mutationFn: (v: { id: string; notes: string | null }) => rejectFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-applications"] }),
  });

  if (!isAdmin) return null;

  const pending = apps.filter((a: CleanerApplication) => a.status === "pending");
  const reviewed = apps.filter((a: CleanerApplication) => a.status !== "pending");

  return (
    <section className="mx-auto max-w-6xl px-5 pb-4 md:px-8">
      <div className="mt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Applications</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pending ({pending.length})</h2>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : pending.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No pending applications.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((a: CleanerApplication) => (
            <li key={a.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold">{a.full_name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.email}
                    {a.phone && ` · ${a.phone}`}
                    {a.city && ` · ${a.city}`}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {a.years_experience != null && `${a.years_experience} yrs · `}
                    {a.audiences.join(", ") || "no services"} · {a.languages.join(", ") || "—"}
                  </p>
                  {a.zips.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ZIPs: {a.zips.slice(0, 8).join(", ")}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    Transport: {a.has_transport ? "✓" : "—"} · Supplies:{" "}
                    {a.has_supplies ? "✓" : "—"}
                  </p>
                  {a.bio && <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm">{a.bio}</p>}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => approve.mutate({ id: a.id, email: a.email })}
                    disabled={approve.isPending}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const notes = window.prompt("Rejection reason (optional):");
                      reject.mutate({ id: a.id, notes: notes || null });
                    }}
                    disabled={reject.isPending}
                    className="rounded-full border border-input px-4 py-1.5 text-xs font-medium hover:bg-destructive/10 hover:text-destructive"
                  >
                    Reject
                  </button>
                </div>
              </div>
              {approve.isError && (
                <p className="mt-2 text-xs text-destructive">{(approve.error as Error).message}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {reviewed.length > 0 && (
        <details className="mt-6 rounded-2xl border border-border bg-card p-4">
          <summary className="cursor-pointer text-sm text-muted-foreground">
            Reviewed ({reviewed.length})
          </summary>
          <ul className="mt-3 space-y-1 text-sm">
            {reviewed.map((a: CleanerApplication) => (
              <li
                key={a.id}
                className="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span>
                  {a.full_name} · {a.email}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 uppercase tracking-widest ${
                    a.status === "approved"
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function CleanersAdmin({ isAdmin }: { isAdmin: boolean }) {
  const listFn = useServerFn(adminListCleaners);
  const upsertFn = useServerFn(adminUpsertCleaner);
  const publishFn = useServerFn(adminSetCleanerPublished);
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const { data: cleaners = [], isLoading } = useQuery({
    queryKey: ["admin-cleaners"],
    queryFn: () => listFn(),
    enabled: isAdmin,
  });

  const publish = useMutation({
    mutationFn: (v: { id: string; published: boolean }) => publishFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-cleaners"] }),
  });

  if (!isAdmin) return null;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Network</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Cleaners ({cleaners.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/85"
        >
          {showForm ? "Close form" : "+ Add cleaner"}
        </button>
      </div>

      {showForm && (
        <CleanerForm
          onSubmit={async (payload) => {
            await upsertFn({ data: payload });
            qc.invalidateQueries({ queryKey: ["admin-cleaners"] });
            setShowForm(false);
          }}
        />
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      ) : cleaners.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No cleaners yet. Add the first one.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
          {cleaners.map((c: AdminCleaner) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className={`rounded-full px-2 py-0.5 uppercase tracking-widest ${
                      c.published ? "bg-primary/10 text-primary" : "bg-foreground/10"
                    }`}
                  >
                    {c.published ? "published" : "draft"}
                  </span>
                  <span>/cleaners/{c.slug}</span>
                  <span>
                    · ★ {c.rating.toFixed(1)} ({c.review_count})
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">{c.display_name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {c.audiences.join(", ") || "—"} · {c.zips.slice(0, 5).join(", ") || "no ZIPs"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => publish.mutate({ id: c.id, published: !c.published })}
                  disabled={publish.isPending}
                  className="rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-60"
                >
                  {c.published ? "Unpublish" : "Publish"}
                </button>
                {c.published && (
                  <Link
                    to="/cleaners/$slug"
                    params={{ slug: c.slug }}
                    className="rounded-full border border-input px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                  >
                    View
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type CleanerFormPayload = {
  email: string;
  display_name: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  photo_url: string | null;
  years_experience: number | null;
  languages: string[];
  zips: string[];
  audiences: ("home" | "rental" | "move")[];
  published: boolean;
  active: boolean;
};

function CleanerForm({ onSubmit }: { onSubmit: (payload: CleanerFormPayload) => Promise<void> }) {
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: "",
    display_name: "",
    slug: "",
    headline: "",
    bio: "",
    photo_url: "",
    years_experience: "",
    languages: "en",
    zips: "",
    audiences: { home: true, rental: false, move: false },
    published: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    try {
      await onSubmit({
        email: form.email.trim(),
        display_name: form.display_name.trim(),
        slug: form.slug.trim().toLowerCase(),
        headline: form.headline.trim() || null,
        bio: form.bio.trim() || null,
        photo_url: form.photo_url.trim() || null,
        years_experience: form.years_experience ? Number(form.years_experience) : null,
        languages: form.languages
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean),
        zips: form.zips
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        audiences: (["home", "rental", "move"] as const).filter((k) => form.audiences[k]),
        published: form.published,
        active: true,
      });
      setState("idle");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Failed to save");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2"
    >
      <label className="text-xs">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          Cleaner email (must already have signed up)
        </span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          Display name
        </span>
        <input
          required
          value={form.display_name}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          Slug (used in /cleaners/…)
        </span>
        <input
          required
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          Years of experience
        </span>
        <input
          type="number"
          min={0}
          max={80}
          value={form.years_experience}
          onChange={(e) => setForm((f) => ({ ...f, years_experience: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs md:col-span-2">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">Headline</span>
        <input
          value={form.headline}
          onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs md:col-span-2">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">Bio</span>
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs md:col-span-2">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          Photo URL
        </span>
        <input
          type="url"
          value={form.photo_url}
          onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          Languages (comma sep, e.g. en, es, pt)
        </span>
        <input
          value={form.languages}
          onChange={(e) => setForm((f) => ({ ...f, languages: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
          ZIPs served (comma sep)
        </span>
        <input
          value={form.zips}
          onChange={(e) => setForm((f) => ({ ...f, zips: e.target.value }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </label>
      <div className="text-xs md:col-span-2">
        <span className="mb-1 block uppercase tracking-widest text-muted-foreground">Services</span>
        <div className="flex flex-wrap gap-4 text-sm">
          {(["home", "rental", "move"] as const).map((a) => (
            <label key={a} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.audiences[a]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    audiences: { ...f.audiences, [a]: e.target.checked },
                  }))
                }
              />
              {a === "home" ? "Homes" : a === "rental" ? "Airbnb" : "Move-in/out"}
            </label>
          ))}
        </div>
      </div>
      <label className="inline-flex items-center gap-2 text-sm md:col-span-2">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
        />
        Publish immediately
      </label>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={state === "saving"}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {state === "saving" ? "Saving…" : "Save cleaner"}
        </button>
        {error && <span className="ml-3 text-xs text-destructive">{error}</span>}
      </div>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Trend7d({ rows }: { rows: AdminBooking[] }) {
  const days = useMemo(() => {
    const out: { key: string; label: string; count: number; revenue: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({
        key,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
        revenue: 0,
      });
    }
    for (const r of rows) {
      const key = new Date(r.created_at).toISOString().slice(0, 10);
      const bucket = out.find((b) => b.key === key);
      if (bucket) {
        bucket.count += 1;
        bucket.revenue += r.price_cents;
      }
    }
    return out;
  }, [rows]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total7 = days.reduce((a, d) => a + d.count, 0);
  const rev7 = days.reduce((a, d) => a + d.revenue, 0);

  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Last 7 days</p>
        <p className="text-xs text-muted-foreground">
          {total7} bookings · ${(rev7 / 100).toFixed(0)}
        </p>
      </div>
      <div className="mt-4 flex items-end gap-2 h-24">
        {days.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-md bg-primary/80"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 4 : 2 }}
              title={`${d.count} bookings · $${(d.revenue / 100).toFixed(0)}`}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

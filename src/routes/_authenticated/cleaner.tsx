import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Nav } from "@/components/tidly/Nav";
import {
  amIACleaner,
  listOpenJobs,
  listMyClaimedJobs,
  claimJob,
  updateMyJobStatus,
  getMyCleanerProfile,
  updateMyCleanerProfile,
  type MyClaimedJob,
  type OpenJob,
  type MyCleanerProfile,
} from "@/lib/cleaners.functions";
import {
  listMyAvailability,
  addAvailabilitySlot,
  removeAvailabilitySlot,
  listMyTimeOff,
  addTimeOff,
  removeTimeOff,
  type AvailabilitySlot,
  type TimeOff,
} from "@/lib/marketplace.functions";

export const Route = createFileRoute("/_authenticated/cleaner")({
  component: CleanerDashboard,
  head: () => ({
    meta: [{ title: "Cleaner dashboard — Amanda Florida" }, { name: "robots", content: "noindex" }],
  }),
});

function CleanerDashboard() {
  const checkFn = useServerFn(amIACleaner);
  const { data: isCleaner, isLoading: checking } = useQuery({
    queryKey: ["am-i-cleaner"],
    queryFn: () => checkFn(),
  });

  const [tab, setTab] = useState<"open" | "mine" | "schedule" | "profile">("open");

  if (checking) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="mx-auto max-w-2xl px-5 py-16 text-sm text-muted-foreground">
          Checking access…
        </div>
      </div>
    );
  }

  if (!isCleaner) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <section className="mx-auto max-w-2xl px-5 py-16">
          <h1 className="text-2xl font-semibold">Not a cleaner yet</h1>
          <p className="mt-3 text-muted-foreground">
            This area is for cleaners in the Amanda Florida network. Apply below and Amanda will
            review your profile.
          </p>
          <Link
            to="/become-a-cleaner"
            className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply to the network
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <section className="mx-auto max-w-5xl px-5 py-10 md:px-8 md:py-14">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Cleaner dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Your Amanda Florida workshop.
        </h1>

        <div className="mt-8 inline-flex flex-wrap gap-1 rounded-full border border-border bg-card p-1 text-sm">
          <TabBtn active={tab === "open"} onClick={() => setTab("open")}>
            Open jobs
          </TabBtn>
          <TabBtn active={tab === "mine"} onClick={() => setTab("mine")}>
            My jobs
          </TabBtn>
          <TabBtn active={tab === "schedule"} onClick={() => setTab("schedule")}>
            Schedule
          </TabBtn>
          <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>
            Profile
          </TabBtn>
        </div>

        <div className="mt-8">
          {tab === "open" && <OpenJobsPanel />}
          {tab === "mine" && <MyJobsPanel />}
          {tab === "schedule" && <SchedulePanel />}
          {tab === "profile" && <ProfilePanel />}
        </div>
      </section>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 transition ${
        active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function OpenJobsPanel() {
  const listFn = useServerFn(listOpenJobs);
  const claimFn = useServerFn(claimJob);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["open-jobs"],
    queryFn: () => listFn(),
    refetchInterval: 20_000,
  });

  const claim = useMutation({
    mutationFn: (id: string) => claimFn({ data: { booking_id: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["open-jobs"] });
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (data.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No open jobs right now — check back soon.
      </div>
    );

  return (
    <ul className="space-y-3">
      {data.map((job: OpenJob) => {
        const when = new Date(job.scheduled_at);
        return (
          <li
            key={job.id}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-full bg-secondary px-2 py-0.5 uppercase tracking-widest">
                  {job.audience}
                </span>
                <span>·</span>
                <time dateTime={job.scheduled_at}>
                  {when.toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
                <span>·</span>
                <span>{job.duration_minutes} min</span>
                <span>·</span>
                <span>
                  {job.city} · {job.zip}
                </span>
              </div>
              <p className="mt-2 text-base font-medium">
                {job.service_slug}
                {job.bedrooms ? ` · ${job.bedrooms} bd` : ""}
                {job.bathrooms ? ` · ${job.bathrooms} ba` : ""}
                {job.square_feet ? ` · ${job.square_feet} sq ft` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pays{" "}
                <span className="font-semibold text-foreground">
                  ${(job.price_cents / 100).toFixed(0)}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => claim.mutate(job.id)}
              disabled={claim.isPending}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {claim.isPending ? "Claiming…" : "Take this job"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function MyJobsPanel() {
  const listFn = useServerFn(listMyClaimedJobs);
  const statusFn = useServerFn(updateMyJobStatus);
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => listFn(),
  });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: "in_progress" | "completed" }) => statusFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-jobs"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (data.length === 0)
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        You haven't claimed any jobs yet. Check "Open jobs".
      </div>
    );

  return (
    <ul className="space-y-3">
      {data.map((job: MyClaimedJob) => {
        const when = new Date(job.scheduled_at);
        return (
          <li key={job.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-secondary px-2 py-0.5 uppercase tracking-widest">
                {job.audience}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 uppercase tracking-widest ${
                  job.status === "completed" ? "bg-primary/10 text-primary" : "bg-foreground/10"
                }`}
              >
                {job.status}
              </span>
              <span>·</span>
              <time dateTime={job.scheduled_at}>
                {when.toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
              <span>·</span>
              <span>{job.duration_minutes} min</span>
            </div>
            <p className="mt-2 text-base font-medium">
              {job.customer_name} — {job.service_slug}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.address_line1}, {job.city} · {job.zip}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              <a className="hover:text-foreground" href={`mailto:${job.customer_email}`}>
                {job.customer_email}
              </a>
              {job.customer_phone && (
                <>
                  {" "}
                  ·{" "}
                  <a className="hover:text-foreground" href={`tel:${job.customer_phone}`}>
                    {job.customer_phone}
                  </a>
                </>
              )}
            </p>
            {job.notes && (
              <p className="mt-3 rounded-xl bg-secondary/60 p-3 text-sm">Notes: {job.notes}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {job.status !== "completed" && (
                <>
                  <button
                    type="button"
                    onClick={() => setStatus.mutate({ id: job.id, status: "in_progress" })}
                    disabled={setStatus.isPending || job.status === "in_progress"}
                    className="rounded-full border border-input px-4 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-60"
                  >
                    Mark in progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus.mutate({ id: job.id, status: "completed" })}
                    disabled={setStatus.isPending}
                    className="rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background hover:bg-foreground/85 disabled:opacity-60"
                  >
                    Complete
                  </button>
                </>
              )}
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${job.address_line1}, ${job.city}, FL ${job.zip}`,
                )}`}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-input px-4 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                Directions
              </a>
              <Link
                to="/bookings/$id"
                params={{ id: job.id }}
                className="rounded-full border border-input px-4 py-1.5 text-xs font-medium hover:bg-secondary"
              >
                Open · Chat
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function SchedulePanel() {
  const listAvailFn = useServerFn(listMyAvailability);
  const addAvailFn = useServerFn(addAvailabilitySlot);
  const rmAvailFn = useServerFn(removeAvailabilitySlot);
  const listToFn = useServerFn(listMyTimeOff);
  const addToFn = useServerFn(addTimeOff);
  const rmToFn = useServerFn(removeTimeOff);
  const qc = useQueryClient();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ["my-availability"],
    queryFn: () => listAvailFn(),
  });
  const { data: offs = [] } = useQuery({
    queryKey: ["my-time-off"],
    queryFn: () => listToFn(),
  });

  const [newSlot, setNewSlot] = useState({
    weekday: 1,
    start_time: "09:00",
    end_time: "17:00",
  });
  const [newOff, setNewOff] = useState({
    starts_at: "",
    ends_at: "",
    reason: "",
  });

  const addAvail = useMutation({
    mutationFn: () => addAvailFn({ data: newSlot }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-availability"] }),
  });
  const rmAvail = useMutation({
    mutationFn: (id: string) => rmAvailFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-availability"] }),
  });
  const addOff = useMutation({
    mutationFn: () =>
      addToFn({
        data: {
          starts_at: new Date(newOff.starts_at).toISOString(),
          ends_at: new Date(newOff.ends_at).toISOString(),
          reason: newOff.reason || null,
        },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-time-off"] });
      setNewOff({ starts_at: "", ends_at: "", reason: "" });
    },
  });
  const rmOff = useMutation({
    mutationFn: (id: string) => rmToFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-time-off"] }),
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Weekly availability
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hours you're generally free to take jobs. Shown on your public profile.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addAvail.mutate();
          }}
          className="mt-4 flex flex-wrap items-end gap-2"
        >
          <label className="text-xs">
            <span className="mb-1 block uppercase tracking-widest text-muted-foreground">Day</span>
            <select
              value={newSlot.weekday}
              onChange={(e) => setNewSlot((s) => ({ ...s, weekday: Number(e.target.value) }))}
              className="rounded-xl border border-input bg-background px-2 py-1.5 text-sm"
            >
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            <span className="mb-1 block uppercase tracking-widest text-muted-foreground">From</span>
            <input
              type="time"
              value={newSlot.start_time}
              onChange={(e) => setNewSlot((s) => ({ ...s, start_time: e.target.value }))}
              className="rounded-xl border border-input bg-background px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs">
            <span className="mb-1 block uppercase tracking-widest text-muted-foreground">To</span>
            <input
              type="time"
              value={newSlot.end_time}
              onChange={(e) => setNewSlot((s) => ({ ...s, end_time: e.target.value }))}
              className="rounded-xl border border-input bg-background px-2 py-1.5 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={addAvail.isPending}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            Add
          </button>
        </form>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        ) : slots.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No hours set yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {slots.map((s: AvailabilitySlot) => (
              <li
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                <span>
                  <strong>{WEEKDAYS[s.weekday]}</strong> · {s.start_time.slice(0, 5)} –{" "}
                  {s.end_time.slice(0, 5)}
                </span>
                <button
                  type="button"
                  onClick={() => rmAvail.mutate(s.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Time off
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Vacations or blocks when you can't take jobs. Private to you.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addOff.mutate();
          }}
          className="mt-4 space-y-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs">
              <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
                Start
              </span>
              <input
                type="datetime-local"
                required
                value={newOff.starts_at}
                onChange={(e) => setNewOff((o) => ({ ...o, starts_at: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-2 py-1.5 text-sm"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block uppercase tracking-widest text-muted-foreground">
                End
              </span>
              <input
                type="datetime-local"
                required
                value={newOff.ends_at}
                onChange={(e) => setNewOff((o) => ({ ...o, ends_at: e.target.value }))}
                className="w-full rounded-xl border border-input bg-background px-2 py-1.5 text-sm"
              />
            </label>
          </div>
          <input
            value={newOff.reason}
            onChange={(e) => setNewOff((o) => ({ ...o, reason: e.target.value }))}
            placeholder="Reason (optional)"
            maxLength={200}
            className="w-full rounded-xl border border-input bg-background px-3 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={addOff.isPending}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            Block time
          </button>
          {addOff.isError && (
            <p className="text-xs text-destructive">{(addOff.error as Error).message}</p>
          )}
        </form>

        {offs.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No time off.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {offs.map((o: TimeOff) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2 text-sm"
              >
                <span>
                  {new Date(o.starts_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  →{" "}
                  {new Date(o.ends_at).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {o.reason && (
                    <span className="ml-2 text-xs text-muted-foreground">· {o.reason}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => rmOff.mutate(o.id)}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ProfilePanel() {
  const getFn = useServerFn(getMyCleanerProfile);
  const updateFn = useServerFn(updateMyCleanerProfile);
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-cleaner-profile"],
    queryFn: () => getFn(),
  });

  const [form, setForm] = useState<Partial<MyCleanerProfile>>({});
  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          display_name: form.display_name ?? "",
          headline: form.headline ?? null,
          bio: form.bio ?? null,
          photo_url: form.photo_url ?? null,
          years_experience: form.years_experience ?? null,
          languages: form.languages ?? [],
          zips: form.zips ?? [],
          audiences: (form.audiences ?? []) as ("home" | "rental" | "move")[],
        },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-cleaner-profile"] }),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!profile)
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No profile yet. Ask Amanda to set up your profile — she'll pick your slug.
      </div>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="max-w-2xl space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span
          className={`rounded-full px-2 py-1 ${
            profile.published ? "bg-primary/10 text-primary" : "bg-foreground/10"
          }`}
        >
          {profile.published ? "Published" : "Draft — Amanda will publish"}
        </span>
        <span>·</span>
        <span>Slug: /cleaners/{profile.slug}</span>
        {profile.published && (
          <Link
            to="/cleaners/$slug"
            params={{ slug: profile.slug }}
            className="hover:text-foreground"
          >
            View public page →
          </Link>
        )}
      </div>

      <Field label="Display name">
        <input
          value={form.display_name ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          maxLength={80}
          required
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Headline">
        <input
          value={form.headline ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value || null }))}
          maxLength={140}
          placeholder="e.g. 8 yrs of Airbnb turnovers in South Tampa"
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Bio">
        <textarea
          value={form.bio ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value || null }))}
          rows={5}
          maxLength={2000}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Photo URL">
        <input
          type="url"
          value={form.photo_url ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value || null }))}
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Years of experience">
          <input
            type="number"
            min={0}
            max={80}
            value={form.years_experience ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                years_experience: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Languages (comma separated, e.g. en, es, pt)">
          <input
            value={(form.languages ?? []).join(", ")}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                languages: e.target.value
                  .split(",")
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean),
              }))
            }
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <Field label="ZIPs you serve (comma separated)">
        <input
          value={(form.zips ?? []).join(", ")}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              zips: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }))
          }
          className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Services you offer">
        <div className="flex flex-wrap gap-4 text-sm">
          {(["home", "rental", "move"] as const).map((a) => (
            <label key={a} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={(form.audiences ?? []).includes(a)}
                onChange={(e) =>
                  setForm((f) => {
                    const set = new Set(f.audiences ?? []);
                    if (e.target.checked) set.add(a);
                    else set.delete(a);
                    return { ...f, audiences: Array.from(set) };
                  })
                }
              />
              {a === "home" ? "Homes" : a === "rental" ? "Airbnb" : "Move-in/out"}
            </label>
          ))}
        </div>
      </Field>

      <div className="pt-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save profile"}
        </button>
        {save.isSuccess && <span className="ml-3 text-xs text-primary">Saved ✓</span>}
        {save.isError && (
          <span className="ml-3 text-xs text-destructive">{(save.error as Error).message}</span>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

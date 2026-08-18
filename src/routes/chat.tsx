import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import { Nav } from "@/components/tidly/Nav";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, saveChatSession, getChatSession } from "@/lib/tidly.functions";

import { useServerFn } from "@tanstack/react-start";
import { detectLang, t, type Lang } from "@/lib/i18n";

const chatSearchSchema = z.object({
  audience: z.enum(["home", "rental", "move"]).optional(),
  session: z.string().optional(),
});

export const Route = createFileRoute("/chat")({
  validateSearch: chatSearchSchema,
  component: ChatPage,
  head: () => ({
    meta: [
      { title: "Chat with Amanda Florida — Book your cleaning" },
      {
        name: "description",
        content: "Get a real cleaning quote and book in Tampa by chatting with Amanda Florida.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ChatPage() {
  const { audience, session } = Route.useSearch();
  const navigate = useNavigate();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const saveFn = useServerFn(saveChatSession);
  const loadFn = useServerFn(getChatSession);

  // Session token: from URL or generated once (persists in URL for shareable resume)
  const [sessionToken] = useState<string>(() => {
    if (session) return session;
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  });

  useEffect(() => {
    if (!session) {
      // Reflect the token in the URL so refresh/share works
      navigate({
        to: "/chat",
        search: { audience, session: sessionToken },
        replace: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLang(detectLang());
    supabase.auth.getUser().then(({ data }) => {
      setSignedIn(!!data.user);
      setUserEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const strings = t(lang);
  const audienceLabel: Record<string, string> = {
    home: strings.home_label,
    rental: strings.rental_label,
    move: strings.move_label,
  };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { audience, lang },
      }),
    [audience, lang],
  );

  const initialMessages = useMemo<UIMessage[]>(
    () => [
      {
        id: "welcome",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: audience
              ? strings.chat_welcome_audience(audienceLabel[audience])
              : strings.chat_welcome_new,
          },
        ],
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audience, lang],
  );

  const { messages, sendMessage, setMessages, status, error } = useChat({
    id: `${sessionToken}-${lang}`,
    messages: initialMessages,
    transport,
  });

  // Load persisted session on mount (if signed-in and token exists)
  const loadedRef = useRef(false);
  useEffect(() => {
    if (!signedIn || loadedRef.current) return;
    loadedRef.current = true;
    loadFn({ data: { session_token: sessionToken } })
      .then((row) => {
        if (row && Array.isArray(row.messages) && row.messages.length > 1) {
          setMessages(row.messages as unknown as UIMessage[]);
        }
      })
      .catch(() => {});
  }, [signedIn, sessionToken, loadFn, setMessages]);

  // Debounced auto-save on message change (signed-in users only)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    if (messages.length <= 1) return; // skip empty/welcome-only
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveFn({
        data: {
          session_token: sessionToken,
          audience: audience ?? null,
          lang,
          messages: messages as never,
        },
      }).catch(() => {});
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [messages, signedIn, sessionToken, audience, lang, saveFn]);

  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const busy = status === "submitted" || status === "streaming";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !files?.length) || busy) return;
    setInput("");
    const attached = files;
    setFiles(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    await sendMessage({
      text: text || (attached?.length ? "Here are photos of the place." : ""),
      files: attached ?? undefined,
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Nav />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 md:px-6">
        <header className="mb-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {audience ? audienceLabel[audience] : strings.nav_quote}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight md:text-3xl">
            Chat with Amanda Florida
          </h1>
        </header>

        <div
          ref={scroller}
          className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-border bg-card p-4 md:p-6"
          style={{ minHeight: "50vh", maxHeight: "70vh" }}
        >
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} signedIn={signedIn} userEmail={userEmail} />
          ))}
          {status === "submitted" && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5">
                <TypingDots />
              </div>
            </div>
          )}
          {error && (
            <p className="text-sm text-destructive">Something went wrong. Try again in a moment.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4">
          {files && files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2 px-2">
              {Array.from(files).map((f, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground"
                >
                  📷 {f.name.length > 24 ? f.name.slice(0, 22) + "…" : f.name}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => setFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-40"
              aria-label={strings.chat_attach}
              title={strings.chat_attach}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={strings.chat_placeholder}
              rows={1}
              className="flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
              style={{ maxHeight: 160 }}
            />
            <button
              type="submit"
              disabled={busy || (!input.trim() && !files?.length)}
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {!signedIn && (
            <p className="mt-2 px-2 text-xs text-muted-foreground">
              {strings.chat_signed_out_hint_a}{" "}
              <Link to="/auth" className="underline hover:text-foreground">
                {strings.chat_signed_out_hint_b}
              </Link>{" "}
              {strings.chat_signed_out_hint_c}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </span>
  );
}

type QuoteData = {
  service_slug: string;
  audience: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  cadence: string;
  price_low_cents: number;
  price_high_cents: number;
  duration_minutes: number;
  suggested_slots_iso: string[];
  summary: string;
};

type BookingProposal = {
  service_slug: string;
  audience: "home" | "rental" | "move";
  scheduled_at_iso: string;
  duration_minutes: number;
  price_cents: number;
  address_line1: string;
  city: string;
  state: string;
  zip: string;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
};

function MessageBubble({
  message,
  signedIn,
  userEmail,
}: {
  message: UIMessage;
  signedIn: boolean;
  userEmail: string | null;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%] space-y-2">
        {message.parts.map((part, i) => {
          if (part.type === "text") {
            if (!part.text) return null;
            return (
              <div
                key={i}
                className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-secondary text-foreground"
                }`}
              >
                {isUser ? (
                  part.text
                ) : (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-strong:text-foreground">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            );
          }
          if (part.type === "file" && part.mediaType?.startsWith("image/")) {
            return (
              <img
                key={i}
                src={part.url}
                alt="attachment"
                className="max-h-48 rounded-2xl border border-border object-cover"
              />
            );
          }
          if (part.type === "tool-estimate_quote") {
            if (part.state !== "output-available") {
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-secondary px-3.5 py-2.5 text-xs text-muted-foreground"
                >
                  Preparing your quote…
                </div>
              );
            }
            return <QuoteCard key={i} quote={part.output as QuoteData} />;
          }
          if (part.type === "tool-propose_booking") {
            if (part.state !== "output-available") {
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-secondary px-3.5 py-2.5 text-xs text-muted-foreground"
                >
                  Preparing booking…
                </div>
              );
            }
            return (
              <BookingConfirmCard
                key={i}
                proposal={part.output as BookingProposal}
                signedIn={signedIn}
                userEmail={userEmail}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

function formatSlot(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function QuoteCard({ quote }: { quote: QuoteData }) {
  const low = (quote.price_low_cents / 100).toFixed(0);
  const high = (quote.price_high_cents / 100).toFixed(0);
  const hours = Math.floor(quote.duration_minutes / 60);
  const mins = quote.duration_minutes % 60;
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-[10px] uppercase tracking-widest text-primary">Estimated quote</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight">
          ${low}
          {low !== high ? `–$${high}` : ""}
        </span>
        <span className="text-xs text-muted-foreground">
          · {hours ? `${hours}h ` : ""}
          {mins ? `${mins}m` : ""}
        </span>
      </div>
      <p className="mt-2 text-sm text-foreground">{quote.summary}</p>
      {quote.suggested_slots_iso?.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Suggested slots
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {quote.suggested_slots_iso.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs"
              >
                {formatSlot(s)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BookingConfirmCard({
  proposal,
  signedIn,
  userEmail,
}: {
  proposal: BookingProposal;
  signedIn: boolean;
  userEmail: string | null;
}) {
  const navigate = useNavigate();
  const create = useServerFn(createBooking);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const price = (proposal.price_cents / 100).toFixed(0);

  const handleConfirm = async () => {
    setErr(null);
    if (!signedIn) {
      navigate({ to: "/auth" });
      return;
    }
    setConfirming(true);
    try {
      const { getUtm } = await import("@/lib/analytics");
      const utm = getUtm();
      const utmLine = utm ? `\n---\nattribution: ${JSON.stringify(utm)}` : "";
      const res = await create({
        data: {
          ...proposal,
          customer_email: proposal.customer_email || userEmail || "",
          notes: (proposal.notes ?? "") + utmLine,
        },
      });
      setConfirmed(res.id);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save booking");
    } finally {
      setConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="text-[10px] uppercase tracking-widest text-primary">Booking confirmed</p>
        <p className="mt-1 text-sm">
          You're set for <b>{formatSlot(proposal.scheduled_at_iso)}</b>. We'll email{" "}
          {userEmail ?? proposal.customer_email} the details.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/thanks"
            className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            See what's next
          </Link>
          <Link
            to="/bookings"
            className="inline-flex rounded-full border border-input bg-background px-4 py-2 text-xs font-medium hover:bg-secondary"
          >
            View bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Review & confirm
      </p>
      <div className="mt-2 space-y-1 text-sm">
        <p>
          <b>{formatSlot(proposal.scheduled_at_iso)}</b> · ${price}
        </p>
        <p className="text-muted-foreground">
          {proposal.address_line1}, {proposal.city}, {proposal.state} {proposal.zip}
        </p>
        <p className="text-muted-foreground">
          {proposal.customer_name}
          {proposal.customer_phone ? ` · ${proposal.customer_phone}` : ""}
        </p>
      </div>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
      <button
        type="button"
        onClick={handleConfirm}
        disabled={confirming}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {confirming ? "Saving…" : signedIn ? "Confirm booking" : "Sign in to confirm"}
      </button>
    </div>
  );
}

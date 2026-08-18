import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listBookingMessages,
  sendBookingMessage,
  type BookingMessage,
} from "@/lib/marketplace.functions";
import { supabase } from "@/integrations/supabase/client";

export function BookingChat({
  bookingId,
  currentUserId,
}: {
  bookingId: string;
  currentUserId: string | null;
}) {
  const listFn = useServerFn(listBookingMessages);
  const sendFn = useServerFn(sendBookingMessage);
  const qc = useQueryClient();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["booking-messages", bookingId],
    queryFn: () => listFn({ data: { booking_id: bookingId } }),
    refetchInterval: 15_000,
  });

  const send = useMutation({
    mutationFn: (text: string) => sendFn({ data: { booking_id: bookingId, body: text } }),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["booking-messages", bookingId] });
    },
  });

  // Realtime updates
  useEffect(() => {
    const ch = supabase
      .channel(`booking-msg-${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        () => qc.invalidateQueries({ queryKey: ["booking-messages", bookingId] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [bookingId, qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.length]);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="max-h-[420px] min-h-[240px] flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Say hi 👋</p>
        ) : (
          data.map((m: BookingMessage) => {
            const mine = m.sender_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-widest opacity-70">
                    {m.sender_role}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words">{m.body}</p>
                  <p className="mt-1 text-[10px] opacity-60">
                    {new Date(m.created_at).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = body.trim();
          if (trimmed) send.mutate(trimmed);
        }}
        className="flex gap-2 border-t border-border p-3"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          maxLength={4000}
          className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={send.isPending || !body.trim()}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </div>
  );
}

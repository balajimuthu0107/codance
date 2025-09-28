"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatbotProps = {
  projectId: string; // kept for API compatibility, not used by proxy
  mode?: "messages" | "prompt"; // default "prompt"
  useAxios?: boolean; // optional
  headers?: Record<string, string>; // optional extra headers (Authorization will be stripped)
  title?: string;
  placeholder?: string;
  openByDefault?: boolean;
  className?: string;
};

export default function Chatbot({
  projectId,
  mode = "prompt",
  useAxios = false,
  headers,
  title = "Chat with Orchids AI",
  placeholder = "Type your message...",
  openByDefault = false,
  className,
}: ChatbotProps) {
  const [open, setOpen] = useState(openByDefault);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: "Hi! How can I help you today?" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Only send Content-Type header; never send Authorization from frontend
  const computedHeaders = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase() === "authorization") continue; // strip auth if provided
        h[k] = v;
      }
    }
    return h;
  }, [headers]);

  // Call local proxy route only
  const sendToOrchids = useCallback(
    async (userText: string, history: ChatMessage[]) => {
      if (mode === "messages") {
        const url = `/api/orchids-test?mode=messages`;
        const body = {
          messages: history
            .concat({ id: `tmp-${Date.now()}`, role: "user" as const, content: userText })
            .map((m) => ({ role: m.role, content: m.content })),
        };

        if (useAxios) {
          const { default: axios } = await import("axios");
          const res = await axios.post(url, body, { headers: computedHeaders });
          const content = res.data?.choices?.[0]?.message?.content ?? res.data?.message?.content ?? "";
          return String(content);
        } else {
          const res = await fetch(url, { method: "POST", headers: computedHeaders, body: JSON.stringify(body) });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || `HTTP ${res.status}`);
          }
          const data = await res.json().catch(() => ({}));
          const content = data?.choices?.[0]?.message?.content ?? data?.message?.content ?? "";
          return String(content);
        }
      } else {
        // prompt mode
        const url = `/api/orchids-test`;
        const body = { input: userText };

        if (useAxios) {
          const { default: axios } = await import("axios");
          const res = await axios.post(url, body, { headers: computedHeaders });
          return String(res.data?.message ?? "");
        } else {
          const res = await fetch(url, { method: "POST", headers: computedHeaders, body: JSON.stringify(body) });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || `HTTP ${res.status}`);
          }
          const data = await res.json().catch(() => ({}));
          return String(data?.message ?? "");
        }
      }
    },
    [mode, useAxios, computedHeaders]
  );

  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const text = input.trim();
      if (!text || loading) return;

      setError(null);
      setLoading(true);

      const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      try {
        const reply = await sendToOrchids(text, messages);
        const botMsg: ChatMessage = { id: `a-${Date.now()}`, role: "assistant", content: reply || "…" };
        setMessages((prev) => [...prev, botMsg]);
      } catch (err: any) {
        setError(String(err?.message || err));
        setMessages((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, role: "assistant", content: "Sorry, I couldn't process that request." },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading, messages, sendToOrchids]
  );

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="fixed bottom-6 right-6 z-[10000] inline-flex h-14 w-14 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black border border-border shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <span className="text-2xl leading-none">💬</span>
      </button>

      {/* Chat panel/modal */}
      {open && (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
          {/* Backdrop (click to close on small screens) */}
          <div
            className="absolute inset-0 bg-black/30 md:bg-transparent pointer-events-auto md:pointer-events-none"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* Panel */}
          <div
            className={[
              "pointer-events-auto absolute bottom-24 right-4 md:right-6",
              "w-[calc(100vw-2rem)] max-w-md md:max-w-sm",
              "rounded-xl border bg-background shadow-2xl",
              "flex h-[72vh] md:h-[560px] flex-col",
              className || "",
            ].join(" ")}
            role="dialog"
            aria-modal="true"
            aria-label="Orchids AI Chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">💬</span>
                <h2 className="text-sm font-semibold">{title}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={[
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm",
                      ].join(" ")}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm shadow-sm text-muted-foreground">
                    Thinking…
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && <div className="px-4 pb-2 text-xs text-destructive">{error}</div>}

            {/* Input */}
            <form onSubmit={handleSend} className="border-t p-3">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={placeholder}
                  className="min-h-[44px] max-h-32 flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">Press Enter to send, Shift+Enter for a new line.</div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
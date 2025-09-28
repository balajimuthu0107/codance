"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Demo ticket data representing multi-channel unified inbox
export type Ticket = {
  id: string;
  channel: "email" | "chat" | "social";
  customer: string;
  subject: string;
  preview: string;
  message: string;
  time: string;
};

const DEMO_TICKETS: Ticket[] = [
  {
    id: "tkt-1001",
    channel: "email",
    customer: "Alice Johnson",
    subject: "Payment failed on checkout",
    preview: "My card keeps getting declined...",
    message:
      "Hi team, my payment failed twice during checkout with a 'card declined' message. I'm a bit frustrated because I need this today.",
    time: "2m ago",
  },
  {
    id: "tkt-1002",
    channel: "chat",
    customer: "Diego Fernández",
    subject: "App not loading on Android",
    preview: "Stuck on splash screen",
    message:
      "Hola, the app is not loading on my Android Pixel 7. It stays on the splash screen. Any fix?",
    time: "7m ago",
  },
  {
    id: "tkt-1003",
    channel: "social",
    customer: "@karen-tech",
    subject: "Refund for double charge",
    preview: "I was charged twice last month",
    message:
      "Hey, I was charged twice for my subscription last month. This is terrible service. Please refund ASAP!",
    time: "12m ago",
  },
];

export const InboxClient = () => {
  const [channelFilter, setChannelFilter] = useState<"all" | Ticket["channel"]>("all");
  const [selected, setSelected] = useState<Ticket>(DEMO_TICKETS[0]);
  const [compose, setCompose] = useState("");
  const [classification, setClassification] = useState<any | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [loadingClassify, setLoadingClassify] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [search, setSearch] = useState("");
  const [classificationMap, setClassificationMap] = useState<Record<string, any>>({});
  const [draftMap, setDraftMap] = useState<Record<string, string>>({});
  const [loadingAnalyzeAll, setLoadingAnalyzeAll] = useState(false);
  const [sending, setSending] = useState(false);
  // NEW: Snooze & Saved Replies state
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});
  const [showSnoozed, setShowSnoozed] = useState(false);
  const SAVED_REPLIES = useMemo(
    () => [
      {
        id: "acknowledge",
        label: "Acknowledge + Gather Info",
        text:
          "Hi {{name}}, thanks for reaching out. I'm sorry about the trouble. Could you please share a few more details (screenshots, device/browser, steps to reproduce)? I'll investigate and get back shortly.",
      },
      {
        id: "refund",
        label: "Refund Apology",
        text:
          "Hi {{name}}, I'm sorry for the inconvenience. I've initiated a refund for the duplicate charge. It may take 3–5 business days to reflect. Please let me know if there's anything else I can help with.",
      },
      {
        id: "fix-shared",
        label: "Known Issue Workaround",
        text:
          "Hi {{name}}, we're aware of this issue and a fix is on the way. Meanwhile, a quick workaround is to clear the app cache and sign in again. I'll follow up once the update is live.",
      },
    ],
    []
  );

  const priorityRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

  // Safely parse JSON from a Response. Returns {} on empty/invalid JSON.
  async function safeJson<T = any>(res: Response): Promise<T> {
    try {
      const text = await res.text();
      if (!text) return {} as T;
      return JSON.parse(text) as T;
    } catch {
      return {} as T;
    }
  }

  const tickets = useMemo(() => {
    const now = Date.now();
    const base = DEMO_TICKETS.filter((t) => {
      const isSnoozedActive = (snoozedUntil[t.id] || 0) > now;
      const inFilter = channelFilter === "all" || t.channel === channelFilter;
      const inSearch =
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.message.toLowerCase().includes(search.toLowerCase());
      // Hide snoozed tickets unless toggled on
      if (!showSnoozed && isSnoozedActive) return false;
      return inFilter && inSearch;
    });
    // Sort by priority if analyzed
    return [...base].sort((a, b) => {
      const pa = classificationMap[a.id]?.priority ?? "medium";
      const pb = classificationMap[b.id]?.priority ?? "medium";
      return (priorityRank[pa] ?? 2) - (priorityRank[pb] ?? 2);
    });
  }, [channelFilter, search, classificationMap, snoozedUntil, showSnoozed]);

  useEffect(() => {
    if (tickets.length && !tickets.find((t) => t.id === selected?.id)) {
      setSelected(tickets[0]);
    }
  }, [tickets, selected?.id]);

  // Keep selected classification/draft in sync with analyzed maps
  useEffect(() => {
    if (!selected) return;
    if (classificationMap[selected.id]) {
      setClassification(classificationMap[selected.id]);
    }
    if (draftMap[selected.id]) {
      setDraft(draftMap[selected.id]);
      if (!compose) setCompose(draftMap[selected.id]);
    }
  }, [selected, classificationMap, draftMap]);

  // NEW: Keyboard shortcuts (j/k navigate, c classify, g generate, s send)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isTyping = tag === "input" || tag === "textarea" || (e as any).isComposing;
      if (isTyping) return;
      const idx = tickets.findIndex((t) => t.id === selected?.id);
      if (e.key === "j") {
        const next = tickets[Math.min(idx + 1, tickets.length - 1)];
        if (next) setSelected(next);
      } else if (e.key === "k") {
        const prev = tickets[Math.max(idx - 1, 0)];
        if (prev) setSelected(prev);
      } else if (e.key.toLowerCase() === "c") {
        handleClassify();
      } else if (e.key.toLowerCase() === "g") {
        handleDraft();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleAutoSend();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tickets, selected, compose, classification]);

  async function handleClassify() {
    if (!selected) return;
    setLoadingClassify(true);
    try {
      const resp = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: selected.message, channel: selected.channel }),
      });
      const json = await safeJson(resp);
      setClassification(json);
      setClassificationMap((m) => ({ ...m, [selected.id]: json }));
    } finally {
      setLoadingClassify(false);
    }
  }

  async function handleDraft() {
    if (!selected) return;
    setLoadingDraft(true);
    try {
      const resp = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: selected.message,
          sentiment: classification?.sentiment,
          customer: { name: selected.customer },
        }),
      });
      const json: any = await safeJson(resp);
      const reply = json?.reply || "";
      setDraft(reply);
      setCompose(reply);
      if (reply) setDraftMap((m) => ({ ...m, [selected.id]: reply }));
    } finally {
      setLoadingDraft(false);
    }
  }

  async function analyzeAll() {
    setLoadingAnalyzeAll(true);
    try {
      const results = await Promise.all(
        DEMO_TICKETS.map(async (t) => {
          const c = await fetch("/api/classify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: t.message, channel: t.channel }),
          }).then((r) => safeJson(r));

          const d: any = await fetch("/api/respond", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: t.message,
              sentiment: (c as any)?.sentiment,
              customer: { name: t.customer },
            }),
          }).then((r) => safeJson(r));

          return { id: t.id, classification: c, draft: d?.reply || "" };
        })
      );

      setClassificationMap(results.reduce((acc, r) => ({ ...acc, [r.id]: r.classification }), {} as Record<string, any>));
      setDraftMap(results.reduce((acc, r) => ({ ...acc, [r.id]: r.draft }), {} as Record<string, string>));
    } finally {
      setLoadingAnalyzeAll(false);
    }
  }

  async function handleAutoSend() {
    if (!selected) return;
    setSending(true);
    try {
      let body = compose || draft;
      if (!body) {
        // Generate if missing
        const gen = await fetch("/api/respond", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: selected.message,
            sentiment: classification?.sentiment,
            customer: { name: selected.customer },
          }),
        }).then((r) => safeJson(r));
        body = gen?.reply || "";
        if (body) {
          setDraft(body);
          setCompose(body);
          setDraftMap((m) => ({ ...m, [selected.id]: body! }));
        }
      }

      const toBase = selected.customer.replace(/\W+/g, "").toLowerCase();
      const to = selected.channel === "social" ? `${toBase}@social.example.com` : `${toBase}@example.com`;

      await fetch("/api/inbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          subject: `Re: ${selected.subject}`,
          body,
          channel: selected.channel,
          meta: {
            ticketId: selected.id,
            priority: (classificationMap[selected.id] || classification)?.priority,
            categories: (classificationMap[selected.id] || classification)?.categories,
          },
        }),
      });
    } finally {
      setSending(false);
    }
  }

  // NEW: Snooze helpers
  function snooze(hours: number) {
    if (!selected) return;
    const until = Date.now() + hours * 60 * 60 * 1000;
    setSnoozedUntil((m) => ({ ...m, [selected.id]: until }));
  }
  function unsnooze(id?: string) {
    const key = id || selected?.id;
    if (!key) return;
    setSnoozedUntil((m) => {
      const { [key]: _, ...rest } = m;
      return rest;
    });
  }

  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-secondary/40 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Inbox</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Demo</Badge>
            <Button size="sm" variant="secondary" onClick={analyzeAll} disabled={loadingAnalyzeAll}>
              {loadingAnalyzeAll ? "Analyzing…" : "Analyze All"}
            </Button>
          </div>
        </div>
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-2">
          <Button
            variant={channelFilter === "all" ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => setChannelFilter("all")}
          >
            All Channels
          </Button>
          <Button
            variant={channelFilter === "email" ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => setChannelFilter("email")}
          >
            Email
          </Button>
          <Button
            variant={channelFilter === "chat" ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => setChannelFilter("chat")}
          >
            Chat
          </Button>
          <Button
            variant={channelFilter === "social" ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => setChannelFilter("social")}
          >
            Social
          </Button>
          {/* NEW: Snoozed Toggle */}
          <Button
            variant={showSnoozed ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => setShowSnoozed((v) => !v)}
          >
            {showSnoozed ? "Showing Snoozed" : "Hide Snoozed"}
          </Button>
        </div>
        <Separator />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Real-time updates</p>
          <p>• AI classification</p>
          <p>• Knowledge-base replies</p>
          <p>• Keyboard: j/k, c, g, s</p>
        </div>
        <Separator />
        <div className="text-sm">
          <Link href="/dashboard" className="underline">View Dashboard →</Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="grid grid-cols-[360px_1fr]">
        {/* Ticket list */}
        <div className="border-r h-[100dvh] overflow-y-auto p-4 space-y-3">
          {tickets.map((t) => {
            const until = snoozedUntil[t.id] || 0;
            const isSnoozed = until > Date.now();
            return (
              <Card
                key={t.id}
                onClick={() => setSelected(t)}
                className={`cursor-pointer ${selected?.id === t.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {t.subject}
                      {isSnoozed && (
                        <Badge variant="outline">Snoozed</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {classificationMap[t.id]?.priority && (
                        <Badge>{classificationMap[t.id].priority}</Badge>
                      )}
                      <Badge variant="outline">{t.channel}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-3">
                  <p className="text-sm line-clamp-2 text-muted-foreground">{t.preview}</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t.customer} · {t.time}
                    {isSnoozed && (
                      <>
                        {" "}· until {new Date(until).toLocaleTimeString()}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ticket detail */}
        <section className="h-[100dvh] overflow-y-auto p-6 space-y-4">
          {selected && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{selected.subject}</h2>
                  <div className="text-sm text-muted-foreground">
                    {selected.customer} · {selected.channel} · {selected.time}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleClassify} disabled={loadingClassify}>
                    {loadingClassify ? "Classifying..." : "Classify"}
                  </Button>
                  <Button variant="secondary" onClick={handleDraft} disabled={loadingDraft}>
                    {loadingDraft ? "Generating..." : "Generate Reply"}
                  </Button>
                  <Button variant="default" onClick={handleAutoSend} disabled={sending}>
                    {sending ? "Sending..." : "Auto Send"}
                  </Button>
                  {/* NEW: Snooze controls */}
                  <div className="flex gap-1">
                    <Button variant="outline" onClick={() => snooze(1)}>Snooze 1h</Button>
                    <Button variant="outline" onClick={() => snooze(4)}>4h</Button>
                    <Button variant="outline" onClick={() => snooze(24)}>1d</Button>
                    <Button variant="destructive" onClick={() => unsnooze()}>Unsnooze</Button>
                  </div>
                </div>
              </div>

              {/* Show quick status */}
              {(classificationMap[selected.id] || classification) && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Priority: {(classificationMap[selected.id] || classification)?.priority}</Badge>
                  <Badge variant="outline">Sentiment: {(classificationMap[selected.id] || classification)?.sentiment}</Badge>
                </div>
              )}

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Customer Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{selected.message}</p>
                </CardContent>
              </Card>

              {(classificationMap[selected.id] || classification) && (
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">AI Classification</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-muted-foreground">Categories:</span>
                      {(((classificationMap[selected.id] || classification)?.categories) || []).map((c: string) => (
                        <Badge key={c} variant="secondary">{c}</Badge>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <div>
                        <span className="text-muted-foreground">Priority:</span>{" "}
                        <Badge>{(classificationMap[selected.id] || classification)?.priority}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sentiment:</span>{" "}
                        <Badge variant="outline">{(classificationMap[selected.id] || classification)?.sentiment}</Badge>
                      </div>
                    </div>
                    {(classificationMap[selected.id] || classification)?.source && (
                      <div className="text-xs text-muted-foreground">source: {(classificationMap[selected.id] || classification)?.source}</div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">Reply</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* NEW: Saved Replies quick insert */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Saved replies:</span>
                    {SAVED_REPLIES.map((tpl) => (
                      <Button
                        key={tpl.id}
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const txt = tpl.text.replaceAll("{{name}}", selected.customer.split(" ")[0]);
                          setCompose((c) => (c ? c + "\n\n" + txt : txt));
                        }}
                      >
                        {tpl.label}
                      </Button>
                    ))}
                  </div>

                  <Textarea
                    value={compose}
                    onChange={(e) => setCompose(e.target.value)}
                    placeholder="Type or generate a reply..."
                    rows={6}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      AI draft: {draft || draftMap[selected.id] ? "ready" : "none"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={() => setCompose(draftMap[selected.id] || draft)} disabled={!(draftMap[selected.id] || draft)}>
                        Use AI Draft
                      </Button>
                      <Button onClick={handleAutoSend} disabled={sending}>Send</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
};
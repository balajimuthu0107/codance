"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export const DashboardClient = () => {
  // Live KPI state updated via SSE
  const [totals, setTotals] = useState({
    received: 0,
    aiReplies: 0,
    autoSent: 0,
    responseRate: 0, // %
  });

  // Email playground state
  const [play, setPlay] = useState({ to: "", subject: "", text: "", threadId: "" });
  const [sending, setSending] = useState(false);
  const [replying, setReplying] = useState(false);
  const [events, setEvents] = useState<Array<{ ts: number; event: any }>>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // New: SLA alert threshold and ROI inputs
  const [slaThreshold, setSlaThreshold] = useState(70);
  const [roi, setRoi] = useState({ avgHandleMins: 6, hourlyCost: 25, monthlyVolume: 800 });
  const roiCalc = useMemo(() => {
    const coverage = Math.max(0, Math.min(100, Math.round((totals.aiReplies / Math.max(1, totals.received)) * 100)));
    const minutesSaved = (coverage / 100) * roi.monthlyVolume * roi.avgHandleMins;
    const hoursSaved = minutesSaved / 60;
    const costSaved = hoursSaved * roi.hourlyCost;
    return { coverage, minutesSaved: Math.round(minutesSaved), hoursSaved: Math.round(hoursSaved * 10) / 10, costSaved: Math.round(costSaved) };
  }, [totals.aiReplies, totals.received, roi]);

  // ... keep last7 demo data for the mini bar chart (visual only)
  const last7 = [
    { d: "Mon", received: 18, ai: 15, sent: 12 },
    { d: "Tue", received: 22, ai: 18, sent: 14 },
    { d: "Wed", received: 16, ai: 12, sent: 10 },
    { d: "Thu", received: 20, ai: 17, sent: 15 },
    { d: "Fri", received: 24, ai: 21, sent: 18 },
    { d: "Sat", received: 14, ai: 12, sent: 9 },
    { d: "Sun", received: 14, ai: 9, sent: 9 },
  ];

  useEffect(() => {
    const es = new EventSource("/api/events/stream");

    es.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data || "{}");
        const type: string = evt?.type || "";

        setTotals((prev) => {
          let { received, aiReplies, autoSent } = prev;

          if (type === "inbox.intake") {
            received += 1;
            if (evt?.data?.autoSend?.ok) autoSent += 1;
          }

          if (type === "classification.created") {
            aiReplies += 1;
          }

          if (type === "inbox.send") {
            autoSent += 1;
          }

          const responseRate = received > 0 ? Math.round(((aiReplies + autoSent) / (2 * received)) * 100) : 0;
          return { received, aiReplies, autoSent, responseRate };
        });
      } catch {}
    };

    return () => es.close();
  }, []);

  // Poll recent inbound events from n8n webhook for display
  useEffect(() => {
    let timer: any;
    const load = async () => {
      try {
        const r = await fetch("/api/webhooks/n8n");
        const j = await r.json().catch(() => ({}));
        if (Array.isArray(j?.events)) setEvents(j.events);
      } catch {}
      finally {
        timer = setTimeout(load, 5000);
      }
    };
    load();
    return () => clearTimeout(timer);
  }, []);

  const maxVal = Math.max(...last7.map((x) => x.received));
  const coveragePct = Math.round((totals.aiReplies / Math.max(1, totals.received)) * 100);
  const autoSentPct = Math.round((totals.autoSent / Math.max(1, totals.received)) * 100);
  const circumference = 2 * Math.PI * 36; // r=36

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support Analytics</h1>
          <p className="text-sm text-muted-foreground">Unified inbox performance, AI automation, and ROI signals</p>
        </div>
        <a href="/inbox" className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground">Open Inbox</a>
      </div>

      {/* Live SLA Alert + Threshold */}
      <div className="rounded-lg border p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm text-muted-foreground">SLA Alert Threshold</div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              className="w-24"
              value={slaThreshold}
              onChange={(e) => setSlaThreshold(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        {totals.responseRate < slaThreshold && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 text-destructive px-3 py-2 text-sm">
            Response rate {totals.responseRate}% is below your SLA target of {slaThreshold}%. Consider enabling Auto-Send or tightening templates.
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Messages Received</div>
          <div className="mt-2 text-3xl font-semibold">{totals.received}</div>
          <div className="mt-2 h-2 w-full rounded bg-muted">
            <div className="h-2 rounded bg-chart-2" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">AI Replies Generated</div>
          <div className="mt-2 text-3xl font-semibold">{totals.aiReplies}</div>
          <div className="mt-2 h-2 w-full rounded bg-muted">
            <div className="h-2 rounded bg-chart-3" style={{ width: `${Math.round((totals.aiReplies / Math.max(1, totals.received)) * 100)}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{Math.round((totals.aiReplies / Math.max(1, totals.received)) * 100)}% coverage</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Auto-Sent</div>
          <div className="mt-2 text-3xl font-semibold">{totals.autoSent}</div>
          <div className="mt-2 h-2 w-full rounded bg-muted">
            <div className="h-2 rounded bg-chart-4" style={{ width: `${Math.round((totals.autoSent / Math.max(1, totals.received)) * 100)}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{Math.round((totals.autoSent / Math.max(1, totals.received)) * 100)}% sent rate</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Response Rate</div>
          <div className="mt-2 text-3xl font-semibold">{totals.responseRate}%</div>
          <div className="mt-2 h-2 w-full rounded bg-muted">
            <div className="h-2 rounded bg-chart-5" style={{ width: `${totals.responseRate}%` }} />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Within SLA</div>
        </div>
      </div>

      {/* Percentage Graphs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border p-6 flex items-center gap-6">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <circle cx="50" cy="50" r="36" className="stroke-muted" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="36"
                className="stroke-chart-3"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${circumference} ${circumference}`,
                  strokeDashoffset: `${circumference * (1 - coveragePct / 100)}`,
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{coveragePct}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">AI Coverage</div>
            <div className="text-2xl font-semibold">{totals.aiReplies}/{Math.max(1, totals.received)}</div>
            <div className="mt-1 text-xs text-muted-foreground">AI replies over total received</div>
          </div>
        </div>
        <div className="rounded-lg border p-6 flex items-center gap-6">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <circle cx="50" cy="50" r="36" className="stroke-muted" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="36"
                className="stroke-chart-5"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${circumference} ${circumference}`,
                  strokeDashoffset: `${circumference * (1 - totals.responseRate / 100)}`,
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{totals.responseRate}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Response Rate</div>
            <div className="text-2xl font-semibold">Within SLA</div>
            <div className="mt-1 text-xs text-muted-foreground">Replies meeting target timeframe</div>
          </div>
        </div>
        <div className="rounded-lg border p-6 flex items-center gap-6">
          <div className="relative h-24 w-24">
            <svg viewBox="0 0 100 100" className="h-24 w-24">
              <circle cx="50" cy="50" r="36" className="stroke-muted" strokeWidth="10" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="36"
                className="stroke-chart-4"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: `${circumference} ${circumference}`,
                  strokeDashoffset: `${circumference * (1 - autoSentPct / 100)}`,
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{autoSentPct}%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Auto-Sent Rate</div>
            <div className="text-2xl font-semibold">{totals.autoSent}/{Math.max(1, totals.received)}</div>
            <div className="mt-1 text-xs text-muted-foreground">Automations sent over total received</div>
          </div>
        </div>
      </div>

      {/* 7-day Bar Chart */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Last 7 days</h2>
            <p className="text-sm text-muted-foreground">Received vs AI Replies vs Auto-Sent</p>
          </div>
          <div className="text-sm text-muted-foreground">Max/day: {maxVal}</div>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-3">
          {last7.map((x) => (
            <div key={x.d} className="flex flex-col items-center gap-2">
              <div className="h-40 w-8 relative">
                {/* Received (base) */}
                <div className="absolute bottom-0 w-8 rounded bg-muted" style={{ height: `${Math.round((x.received / maxVal) * 100)}%` }} />
                {/* AI Replies overlay */}
                <div className="absolute bottom-0 w-8 rounded bg-chart-3/80" style={{ height: `${Math.round((x.ai / maxVal) * 100)}%` }} />
                {/* Auto-Sent overlay (thin) */}
                <div className="absolute bottom-0 w-8 rounded bg-chart-4/90" style={{ height: `${Math.round((x.sent / maxVal) * 100)}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">{x.d}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-muted inline-block" /> Received</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-chart-3 inline-block" /> AI Replies</div>
          <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-chart-4 inline-block" /> Auto-Sent</div>
        </div>
      </div>

      {/* What to do next */}
      <div className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Suggested Actions</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Enable Auto-Send for "Billing" and "Login Issues" categories to increase deflection.</li>
          <li>Tighten reply templates for negative sentiment to improve CSAT.</li>
          <li>Add a workflow in n8n to route "Refund" tickets directly to Finance.</li>
          <li>Set SLA alerts in n8n when response rate drops below 70% for two consecutive days.</li>
        </ul>
      </div>

      {/* ROI Estimator */}
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">ROI Estimator</h2>
          <span className="text-xs text-muted-foreground">Based on AI coverage and your team costs</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Avg Handle Time (mins)</div>
            <Input
              type="number"
              value={roi.avgHandleMins}
              onChange={(e) => setRoi((p) => ({ ...p, avgHandleMins: Math.max(0, Number(e.target.value) || 0) }))}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Hourly Cost ($)</div>
            <Input
              type="number"
              value={roi.hourlyCost}
              onChange={(e) => setRoi((p) => ({ ...p, hourlyCost: Math.max(0, Number(e.target.value) || 0) }))}
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Monthly Volume</div>
            <Input
              type="number"
              value={roi.monthlyVolume}
              onChange={(e) => setRoi((p) => ({ ...p, monthlyVolume: Math.max(0, Number(e.target.value) || 0) }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm">
          <div className="rounded-md border p-3"><div className="text-muted-foreground">AI Coverage</div><div className="mt-1 text-xl font-semibold">{roiCalc.coverage}%</div></div>
          <div className="rounded-md border p-3"><div className="text-muted-foreground">Minutes Saved</div><div className="mt-1 text-xl font-semibold">{roiCalc.minutesSaved}</div></div>
          <div className="rounded-md border p-3"><div className="text-muted-foreground">Hours Saved</div><div className="mt-1 text-xl font-semibold">{roiCalc.hoursSaved}</div></div>
          <div className="rounded-md border p-3"><div className="text-muted-foreground">Estimated Savings</div><div className="mt-1 text-xl font-semibold">${roiCalc.costSaved}</div></div>
        </div>
        <div className="text-xs text-muted-foreground">Estimates assume proportional deflection by AI coverage.</div>
      </div>

      {/* Email Playground (n8n integration) */}
      <div className="rounded-lg border p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Email Playground</h2>
          <span className="text-xs text-muted-foreground">Hooks into /api/email/send, /api/email/reply and /api/webhooks/n8n</span>
        </div>

        {err && <div className="text-sm text-destructive">{err}</div>}
        {ok && <div className="text-sm text-emerald-600">{ok}</div>}
        {copied && <div className="text-sm text-emerald-600">{copied}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Send new email */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-medium">Send Email</div>
            <Input
              placeholder="To (you@example.com)"
              value={play.to}
              onChange={(e) => setPlay((p) => ({ ...p, to: e.target.value }))}
            />
            <Input
              placeholder="Subject"
              value={play.subject}
              onChange={(e) => setPlay((p) => ({ ...p, subject: e.target.value }))}
            />
            <Textarea
              placeholder="Body (text)"
              value={play.text}
              onChange={(e) => setPlay((p) => ({ ...p, text: e.target.value }))}
              className="min-h-28"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  setErr(null); setOk(null); setSending(true);
                  try {
                    const resp = await fetch("/api/email/send", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ to: play.to, subject: play.subject, text: play.text })
                    });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    setOk("Sent via n8n webhook ✔");
                  } catch (e: any) {
                    setErr(e?.message || String(e));
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending || !play.to || !play.subject || !play.text}
                className="w-full md:w-auto"
              >{sending ? "Sending..." : "Send"}</Button>
              <Button
                variant="secondary"
                className="w-full md:w-auto"
                disabled={!play.to || !play.subject || !play.text}
                onClick={async () => {
                  const cmd = `curl -X POST '${typeof window !== 'undefined' ? window.location.origin : ''}/api/email/send' \\n+  -H 'Content-Type: application/json' \\n+  -d '${JSON.stringify({ to: play.to, subject: play.subject, text: play.text }).replace(/'/g, "'\\''")}'`;
                  try {
                    await navigator.clipboard.writeText(cmd);
                    setCopied("cURL for Send copied");
                    setTimeout(() => setCopied(null), 1500);
                  } catch {}
                }}
              >Copy cURL</Button>
            </div>
          </div>

          {/* Reply to existing thread */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="text-sm font-medium">Reply Email</div>
            <Input
              placeholder="Gmail Thread ID"
              value={play.threadId}
              onChange={(e) => setPlay((p) => ({ ...p, threadId: e.target.value }))}
            />
            <Textarea
              placeholder="Reply text"
              value={play.text}
              onChange={(e) => setPlay((p) => ({ ...p, text: e.target.value }))}
              className="min-h-28"
            />
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={async () => {
                  setErr(null); setOk(null); setReplying(true);
                  try {
                    const resp = await fetch("/api/email/reply", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ threadId: play.threadId, text: play.text })
                    });
                    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                    setOk("Reply queued via n8n webhook ✔");
                  } catch (e: any) {
                    setErr(e?.message || String(e));
                  } finally {
                    setReplying(false);
                  }
                }}
                disabled={replying || !play.threadId || !play.text}
                className="w-full md:w-auto"
              >{replying ? "Replying..." : "Reply"}</Button>
              <Button
                variant="secondary"
                className="w-full md:w-auto"
                disabled={!play.threadId || !play.text}
                onClick={async () => {
                  const cmd = `curl -X POST '${typeof window !== 'undefined' ? window.location.origin : ''}/api/email/reply' \\n+  -H 'Content-Type: application/json' \\n+  -d '${JSON.stringify({ threadId: play.threadId, text: play.text }).replace(/'/g, "'\\''")}'`;
                  try {
                    await navigator.clipboard.writeText(cmd);
                    setCopied("cURL for Reply copied");
                    setTimeout(() => setCopied(null), 1500);
                  } catch {}
                }}
              >Copy cURL</Button>
            </div>
          </div>
        </div>

        {/* Recent inbound events from n8n */}
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium mb-3">Recent n8n → Site Events</div>
          {events.length === 0 ? (
            <div className="text-sm text-muted-foreground">No events yet. Configure your n8n workflows to POST here with x-n8n-secret.</div>
          ) : (
            <div className="space-y-2">
              {events.map((it, idx) => (
                <div key={idx} className="rounded border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{it.event?.type || "(no type)"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(it.ts).toLocaleTimeString()}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground break-words">{JSON.stringify(it.event?.data || {}, null, 0)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Sparkles, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="min-h-screen">
      {/* Hero - Comparison Style */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary to-background" />
        <div className="container mx-auto px-6 text-center space-y-6">
          <BadgeLike>Comparison</BadgeLike>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight !whitespace-pre-line">Cupid AI

          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            See why modern teams switch for higher resolution rates, faster setup, and measurably better ROI.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/dashboard" className="!whitespace-pre-line"><Button size="lg" className="gap-2"><Sparkles className="h-4 w-4" /> Try Now</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">See Pricing</Button></Link>
          </div>
          <p className="text-xs text-muted-foreground">No credit card. Deploy in minutes.</p>
        </div>
      </section>

      {/* Social proof (text-only to avoid new assets) */}
      <section className="container mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm text-muted-foreground">
          <div>
            <span className="font-semibold text-foreground">+35% CSAT</span> after rollout
          </div>
          <div>
            <span className="font-semibold text-foreground">-40% handle time</span> with AI suggestions
          </div>
          <div>
            <span className="font-semibold text-foreground">Days, not weeks</span> to go live
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="container mx-auto px-6 pb-16">
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-6 border-b md:border-b-0 md:border-r">
                <h3 className="text-2xl font-semibold tracking-tight">What you get</h3>
                <p className="text-sm text-muted-foreground mt-1">Feature-by-feature comparison</p>
              </div>
              <div className="p-6 border-b md:border-b-0 md:border-r">
                <h3 className="text-xl font-semibold">Our Platform</h3>
                <p className="text-xs text-muted-foreground">AI-first, deploy fast</p>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">Zendesk AI</h3>
                <p className="text-xs text-muted-foreground">Legacy-first, add-on AI</p>
              </div>
            </div>

            <div className="divide-y">
              {rows.map((row) =>
              <div key={row.title} className="grid grid-cols-1 md:grid-cols-3">
                  <div className="p-6">
                    <div className="font-medium !whitespace-pre-line">{row.title}</div>
                    <div className="text-sm text-muted-foreground">{row.desc}</div>
                  </div>
                  <div className="p-6 md:border-x flex items-center gap-2">
                    {row.us ?
                  <Check className="h-5 w-5 text-emerald-600" /> :

                  <X className="h-5 w-5 text-destructive" />
                  }
                    <span className="text-sm !whitespace-pre-line !whitespace-pre-line">{row.usText}</span>
                  </div>
                  <div className="p-6 flex items-center gap-2">
                    {row.them ?
                  <Check className="h-5 w-5 text-emerald-600" /> :

                  <X className="h-5 w-5 text-destructive" />
                  }
                    <span className="text-sm !w-[49px] !h-5 !whitespace-pre-line">{row.themText}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard" className="!whitespace-pre-line"><Button size="lg" className="w-full sm:w-auto">Open Dashboard</Button></Link>
          <Link href="/analytics"><Button size="lg" variant="secondary" className="w-full sm:w-auto">View Analytics</Button></Link>
          <Link href="/pricing"><Button size="lg" variant="outline" className="w-full sm:w-auto">Compare Plans</Button></Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="container mx-auto px-6 pb-20 grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-xl font-semibold">Set up in days</h3>
            <p className="text-sm text-muted-foreground">Import macros, connect channels, and go live quickly with best-practice templates.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-xl font-semibold">Agent-quality responses</h3>
            <p className="text-sm text-muted-foreground">Human-in-the-loop controls with explainable suggestions and safe-guardrails.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-xl font-semibold">Proven ROI</h3>
            <p className="text-sm text-muted-foreground">Track deflection, CSAT, and handle time reductions with built-in analytics.</p>
          </CardContent>
        </Card>
      </section>

      {/* Customer Ratings */}
      <section className="container mx-auto px-6 pb-20">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`h-5 w-5 ${i < 4 ? "text-amber-500 fill-current" : "text-amber-500/60"}`} />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Rated <span className="font-semibold text-foreground">4.8/5</span> by 1,200+ support leaders
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-sm">"Onboarding was fast and our CSAT jumped within two weeks. Draft quality is consistently high."</p>
              <div className="text-xs text-muted-foreground">Maya N. — Head of Support, Fintech</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-sm">"We reduced handle time by ~38% and finally have analytics that the exec team trusts."</p>
              <div className="text-xs text-muted-foreground">Alex R. — Support Ops, SaaS</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-2">
              <p className="text-sm">"Great balance of automation and control. Agents love the suggestions and approval flow."</p>
              <div className="text-xs text-muted-foreground">Priya S. — Support Lead, E‑commerce</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Feedback */}
      <section className="container mx-auto px-6 pb-20">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-2">Tell us what you think</h3>
            <p className="text-sm text-muted-foreground mb-4">Share quick feedback to help us improve. Optional email if you want a reply.</p>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setSubmitted(false);
                if (!message.trim()) return;
                setSubmitting(true);
                try {
                  const ratingNum = rating ? Number(rating) : undefined;
                  const resp = await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      message: message.trim(),
                      email: email.trim() || undefined,
                      rating: typeof ratingNum === "number" && !Number.isNaN(ratingNum) ? ratingNum : undefined,
                    }),
                  });
                  if (!resp.ok) {
                    const j = await resp.json().catch(() => ({}));
                    throw new Error(j?.error || `HTTP ${resp.status}`);
                  }
                  setSubmitted(true);
                  setMessage("");
                  setEmail("");
                  setRating("");
                } catch (err: any) {
                  setError(String(err?.message || err));
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Textarea
                placeholder="Your feedback..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-28"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={5}
                  placeholder="Rating 1-5 (optional)"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                />
                <div className="flex items-start md:items-center">
                  <Button type="submit" disabled={submitting || !message.trim()} className="w-full md:w-auto">
                    {submitting ? "Sending..." : "Send Feedback"}
                  </Button>
                </div>
              </div>
              {submitted && (
                <div className="text-sm text-emerald-600">Thanks! Your feedback was sent.</div>
              )}
              {error && (
                <div className="text-sm text-destructive">{error}</div>
              )}
            </form>
          </CardContent>
        </Card>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-6 pb-24">
        <div className="relative overflow-hidden rounded-xl border p-8 md:p-10 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent to-secondary" />
          <h3 className="text-2xl md:text-3xl font-semibold">Upgrade your support with AI that actually ships</h3>
          <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl mx-auto">Experience faster onboarding, smarter automation, and happier customers.</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/dashboard" className="!whitespace-pre-line"><Button size="lg">Start</Button></Link>
            <Link href="/pricing"><Button size="lg" variant="outline">See Plans</Button></Link>
          </div>
        </div>
      </section>

      // removed page-level footer (now provided globally in RootLayout)
    </div>);

}

const rows = [
{
  title: "Setup speed",
  desc: "Time to first response with AI enabled",
  us: true,
  them: false,
  usText: "Days",
  themText: "Weeks"
},
{
  title: "Unified inbox",
  desc: "Email, chat, and social in one place",
  us: true,
  them: true,
  usText: "Included",
  themText: "Included"
},
{
  title: "AI suggested replies",
  desc: "Context-aware, editable",
  us: true,
  them: true,
  usText: "Advanced",
  themText: "Basic"
},
{
  title: "Auto classification & routing",
  desc: "Intent, priority, sentiment",
  us: true,
  them: true,
  usText: "Granular",
  themText: "Limited"
},
{
  title: "Analytics & ROI tracking",
  desc: "Deflection, CSAT, handle time",
  us: true,
  them: false,
  usText: "Built-in",
  themText: "Add-ons"
},
{
  title: "Cost",
  desc: "Payback period & savings",
  us: true,
  them: false,
  usText: "Low-cost",
  themText: "High"
}] as
const;

function BadgeLike({ children }: {children: React.ReactNode;}) {
  return (
    <span className="inline-block rounded-full border px-3 py-1 text-xs text-muted-foreground bg-secondary/60">
      {children}
    </span>);

}
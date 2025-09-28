import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="container mx-auto px-6 py-16 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Simple, transparent pricing</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start free. Upgrade as your team scales. No contracts, cancel anytime.
        </p>
      </section>

      {/* Tiers */}
      <section className="container mx-auto px-6 pb-24 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Free - Community */}
        <TierCard
          badge="Community"
          title="Free"
          price="$0"
          period="/mo"
          cta={{ href: "/register", label: "Get Started" }}
          features={[
            "50 tickets/month across all channels",
            "Basic AI categorization",
            "2 email integrations (Gmail/Outlook)",
            "5 automated response templates",
            "Basic analytics dashboard",
            "Community support",
          ]}
          negatives={["No Jira integration", "No sentiment analysis", "No multi-language support"]}
          highlight={false}
        />

        {/* Growth */}
        <TierCard
          badge="Most Popular"
          title="Growth"
          price="$19"
          period="/mo"
          cta={{ href: "/register?plan=growth", label: "Start Growth" }}
          features={[
            "500 tickets/month included",
            "Advanced AI categorization + priority detection",
            "Sentiment analysis with emotion triggers",
            "5 channel integrations (email, chat, social)",
            "Jira API integration",
            "10 custom response templates",
            "Basic knowledge base (50 articles)",
            "Email support",
            "$0.04/ticket overage after 500",
          ]}
          highlight
        />

        {/* Scale */}
        <TierCard
          badge="Best Value"
          title="Scale"
          price="$79"
          period="/mo"
          cta={{ href: "/register?plan=scale", label: "Choose Scale" }}
          features={[
            "2,000 tickets/month included",
            "All Growth features",
            "Multi-language support (25 languages)",
            "Advanced workflow automation",
            "Custom AI training on company data",
            "Voice message processing",
            "Unlimited integrations",
            "Advanced analytics + reporting",
            "Priority support (4-hour response)",
            "$0.03/ticket overage after 2,000",
          ]}
          highlight={false}
        />

        {/* Enterprise */}
        <TierCard
          badge="Enterprise"
          title="Enterprise"
          price="$299"
          period="/mo"
          cta={{ href: "/register?plan=enterprise", label: "Contact Sales" }}
          features={[
            "Custom limits & SLAs",
            "Security reviews & SSO/SAML",
            "Dedicated onboarding",
            "Custom workflows & integrations",
            "Premium support",
          ]}
          description="Designed for large enterprises with advanced security, compliance, and customization needs."
          highlight={false}
        />
      </section>

      {/* Footnote */}
      <section className="container mx-auto px-6 pb-16 text-center text-sm text-muted-foreground">
        <p>
          Prices in USD. Overage billed monthly as noted. You can upgrade, downgrade, or cancel anytime.
        </p>
      </section>
    </div>
  );
}

type TierCardProps = {
  badge?: string;
  title: string;
  price: string;
  period: string;
  features: string[];
  negatives?: string[];
  cta: { href: string; label: string };
  description?: string;
  highlight?: boolean;
};

function TierCard({ badge, title, price, period, features, negatives = [], cta, description, highlight }: TierCardProps) {
  return (
    <Card className={highlight ? "border-primary shadow-sm" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">{title}</CardTitle>
          {badge ? (
            <span className="text-xs rounded-full border px-2 py-1 bg-secondary/70 text-muted-foreground">{badge}</span>
          ) : null}
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{price}</span>
            <span className="text-sm text-muted-foreground">{period}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
          {negatives.map((n) => (
            <li key={n} className="flex items-start gap-2 text-muted-foreground">
              <X className="h-4 w-4 mt-0.5" />
              <span>{n}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full">
          <Link href={cta.href}>{cta.label}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
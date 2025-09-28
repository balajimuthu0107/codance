"use client"

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export const ProfileClient = () => {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      const redirect = encodeURIComponent("/profile");
      router.push(`/login?redirect=${redirect}`);
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-muted rounded animate-pulse" />
          <div className="space-y-6">
            <div className="h-40 bg-muted rounded animate-pulse" />
            <div className="h-40 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null; // Redirecting

  const name = session.user.name || "—";
  const email = session.user.email || "—";
  const companyNameRaw = (session as any)?.user?.company?.name || (session as any)?.user?.companyName;
  const companyName = (typeof companyNameRaw === "string" && companyNameRaw.trim().length > 0) ? companyNameRaw : "CODANCE";
  const teamSizeRaw = (session as any)?.user?.company?.teamSize;
  const teamSize: number | string =
    typeof teamSizeRaw === "number"
      ? Math.max(5, teamSizeRaw)
      : typeof teamSizeRaw === "string"
        ? (isNaN(parseInt(teamSizeRaw, 10)) ? 5 : Math.max(5, parseInt(teamSizeRaw, 10)))
        : 5;
  const plan = (session as any)?.user?.plan || (session as any)?.user?.subscription?.productName || "Free Plan";
  const role = (session as any)?.user?.role || "Member";

  return (
    <div className="container mx-auto px-6 py-10 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">Your Profile</h1>
        <p className="text-sm text-muted-foreground">View your account, company, and role information.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-medium">Personal details</h2>
              <p className="text-sm text-muted-foreground">These are used across your workspace.</p>
            </div>
            <div className="divide-y">
              <div className="py-4 grid grid-cols-3 items-start gap-3">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="col-span-2 text-sm">{name}</div>
              </div>
              <div className="py-4 grid grid-cols-3 items-start gap-3">
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="col-span-2 text-sm">{email}</div>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/inbox"><Button size="sm">Go to Inbox</Button></Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-3">
              <h2 className="text-lg font-medium">Company</h2>
              <div className="grid grid-cols-3 items-start gap-3">
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="col-span-2 text-sm">{companyName}</div>
              </div>
              <div className="grid grid-cols-3 items-start gap-3">
                <div className="text-sm text-muted-foreground">Team size</div>
                <div className="col-span-2 text-sm">{teamSize}</div>
              </div>
              <div className="grid grid-cols-3 items-start gap-3">
                <div className="text-sm text-muted-foreground">Plan</div>
                <div className="col-span-2 text-sm">{plan}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Role</h2>
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs">{role}</span>
              </div>
              <ul className="list-disc pl-5 text-sm space-y-1 text-muted-foreground">
                <li>Respond to customer tickets</li>
                <li>Use AI suggestions and approvals</li>
                <li>Maintain quality and CSAT</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-base font-medium">Usage</h3>
            <p className="text-sm text-muted-foreground">Last 7 days overview of your actions.</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="text-muted-foreground">Analyzed</div>
                <div className="font-medium">48</div>
              </div>
              <div>
                <div className="text-muted-foreground">Drafts</div>
                <div className="font-medium">36</div>
              </div>
              <div>
                <div className="text-muted-foreground">Auto-sent</div>
                <div className="font-medium">22</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-base font-medium">Shortcuts</h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard"><Button variant="secondary" size="sm">View Dashboard</Button></Link>
              <Link href="/analytics"><Button variant="secondary" size="sm">Analytics</Button></Link>
              <Link href="/pricing"><Button variant="outline" size="sm">Upgrade</Button></Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-2">
            <h3 className="text-base font-medium">Notifications</h3>
            <p className="text-sm text-muted-foreground">Daily summary is enabled for your role.</p>
            <div className="text-xs text-muted-foreground">Manage preferences coming soon.</div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
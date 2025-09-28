"use client"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Simple site-wide header navigation
// Named export as required
export const SiteHeader = () => {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();

  const handleSignOut = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") || "" : "";
    const { error } = await authClient.signOut({
      fetchOptions: {
        auth: { type: "Bearer", token },
      },
    });
    // Always clear local state/token and refresh UI regardless of API outcome
    localStorage.removeItem("bearer_token");
    refetch();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">Cupid AI</Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <Link href="/inbox" className="hover:text-foreground">Inbox</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* If session is loading, render nothing special to avoid flicker */}
          {isPending ? (
            <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              <Link href="/profile"><Button variant="secondary" size="sm">{session.user.name?.split(" ")[0] || "Profile"}</Button></Link>
              <Button size="sm" variant="ghost" onClick={handleSignOut}>Sign out</Button>
            </div>
          ) : (
            <>
              <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link href="/register"><Button size="sm" className="">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
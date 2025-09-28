"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const LoginForm = () => {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isPending, startTransition] = useTransition();

  const callbackURL = search.get("redirect") || "/dashboard";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL,
      });

      if (error?.code) {
        toast.error("Invalid email or password. Please make sure you have already registered an account and try again.");
        return;
      }

      router.push(typeof callbackURL === "string" && callbackURL.length > 0 ? callbackURL : "/");
    });
  };

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      const { error } = await authClient.signIn.social({ provider: "google" });
      if (error?.code) {
        toast.error("Google sign-in failed");
        return;
      }
      router.push(typeof callbackURL === "string" && callbackURL.length > 0 ? callbackURL : "/dashboard");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="off" />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} />
        <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      {/* Social auth separator */}
      <div className="relative text-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t" />
        </div>
        <span className="relative bg-card px-2 text-xs text-muted-foreground">or</span>
      </div>

      <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isPending}>
        {/* Simple Google mark */}
        <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-5 w-5">
          <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.7-5.5 3.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.6l2.7-2.6C16.9 2.4 14.7 1.5 12 1.5 6.8 1.5 2.5 5.8 2.5 11S6.8 20.5 12 20.5c6.9 0 9.5-4.8 9.5-7.3 0-.5-.1-.9-.1-1H12z"/>
        </svg>
        Continue with Google
      </Button>
    </form>
  );
};

export default LoginForm;
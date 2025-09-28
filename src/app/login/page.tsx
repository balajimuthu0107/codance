import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="text-sm text-muted-foreground">Welcome back. Enter your credentials to continue.</p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground">
              New here? <Link href="/register" className="underline underline-offset-4">Create an account</Link>
            </p>
            <div className="flex justify-center">
              <Button asChild variant="ghost" size="sm">
                <Link href="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
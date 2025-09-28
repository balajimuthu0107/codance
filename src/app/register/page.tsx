import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="text-sm text-muted-foreground">Join us to access the demo dashboard and analytics.</p>
            </div>
            <RegisterForm />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="underline underline-offset-4">Sign in</Link>
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
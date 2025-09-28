import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const protectedPaths = ["/dashboard", "/analytics"];

  // Enforce auth only on protected routes
  if (protectedPaths.includes(url.pathname)) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Proceed and set embedding-friendly headers globally
  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self' http://localhost:3000 https://mydomain.com https://www.mydomain.com"
  );
  response.headers.delete("x-frame-options");
  response.headers.delete("X-Frame-Options");
  return response;
}

export const config = {
  runtime: "nodejs",
  matcher: ["/(.*)"], // Apply middleware globally; auth enforced only for specific routes
};
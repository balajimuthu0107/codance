import Link from "next/link";

// Simple site-wide footer
// Named export as required
export const SiteFooter = () => {
  return (
    <footer className="border-t py-10 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="order-2 md:order-1">© {new Date().getFullYear()} Cupid AI. All rights reserved.</p>
        <nav className="order-1 md:order-2 flex items-center gap-4">
          <Link href="/pricing" className="hover:underline">Pricing</Link>
          <Link href="/analytics" className="hover:underline">Analytics</Link>
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/login" className="hover:underline">Login</Link>
          <Link href="/register" className="hover:underline">Register</Link>
        </nav>
      </div>
    </footer>
  );
};
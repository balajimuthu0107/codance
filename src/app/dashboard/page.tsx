// ... keep existing code ...
// remove entire client implementation and replace with a server component wrapper
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardPage() {
  return <DashboardClient />;
}
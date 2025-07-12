
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="student">{children}</DashboardLayout>;
}

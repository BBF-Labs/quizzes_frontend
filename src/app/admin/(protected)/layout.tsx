import { AdminLayoutWrapper } from "@/components/admin";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Qz",
  description: "Management console for BetaForge Labs Quizzes",
};

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}



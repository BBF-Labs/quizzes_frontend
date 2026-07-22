import type { Metadata } from "next";
import { AdminWrapper } from "@/components/wrappers";
import type React from "react";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin · BBF Lab Quizzes",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminWrapper>{children}</AdminWrapper>;
}

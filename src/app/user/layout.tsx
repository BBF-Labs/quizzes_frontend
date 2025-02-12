import { Header } from "@/components";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      <Header />
      <main>{children}</main>
    </div>
  );
}

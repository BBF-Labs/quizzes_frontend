import Link from "next/link";
import { AdminGuard } from "@/components/admin-guard";
import { AdminUserActions } from "@/components/admin-user-actions";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 max-w-7xl h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-5 overflow-hidden">
              <Link href="/" className="flex items-end gap-2 group shrink-0">
                <span className="text-lg font-bold tracking-widest text-foreground uppercase leading-none group-hover:text-primary transition-colors">Qz.</span>
                <span className="hidden sm:inline text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase leading-none mb-[2px]">/ Admin</span>
              </Link>
              <span className="hidden sm:inline text-border/50">|</span>
              <Link
                href="/admin"
                className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors uppercase whitespace-nowrap"
              >
                Campaigns
              </Link>
            </div>
            <AdminUserActions />
          </div>
        </header>
        <main className="flex-1 container mx-auto px-4 max-w-7xl py-10">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}



"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Search, Download, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginationController } from "@/components/common";
import { useSubscribers } from "@/hooks";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function SubscribersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const search = searchParams.get("search") ?? "";
  const statusFilter = searchParams.get("status") ?? "";

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  const { data: subscribersData, isLoading } = useSubscribers({
    page,
    limit: 20,
    search: search || undefined,
    newsletterStatus: statusFilter || undefined,
  });

  const subscriberEntries = subscribersData?.data || [];
  const totalPages =
    subscribersData?.page && subscribersData?.limit
      ? Math.ceil(subscribersData.total / subscribersData.limit)
      : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            Audience Management
          </span>
        </div>
        <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
          Subscribers
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
          Newsletter Mailing List
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            className="pl-9 rounded-(--radius) bg-background/50 font-mono text-xs uppercase tracking-widest"
            value={search}
            onChange={(e) => {
              updateQueryParams({ search: e.target.value || null, page: "1" });
            }}
          />
        </div>
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => {
            updateQueryParams({
              status: value === "all" ? null : value,
              page: "1",
            });
          }}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-140 rounded-(--radius) bg-background/50 border border-input font-mono text-xs uppercase focus-visible:ring-0">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="rounded-(--radius) border-border/40 bg-card/95 font-mono text-xs uppercase">
            <SelectItem
              value="all"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              All Statuses
            </SelectItem>
            <SelectItem
              value="active"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Active
            </SelectItem>
            <SelectItem
              value="pending"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Pending
            </SelectItem>
            <SelectItem
              value="unsubscribed"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Unsubscribed
            </SelectItem>
            <SelectItem
              value="bounced"
              className="rounded-(--radius) font-mono text-xs uppercase"
            >
              Bounced
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="rounded-(--radius) font-mono text-[10px] tracking-widest uppercase gap-2"
        >
          <Download className="size-3.5" /> Export
        </Button>
      </div>

      {/* List */}
      <Card className="rounded-(--radius) border-border/50 bg-card/40 overflow-hidden">
        <CardHeader className="border-b border-border/10">
          <CardTitle className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted-foreground">
            Current Subscribers{" "}
            {subscribersData?.total ? `(${subscribersData.total})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[10px] uppercase tracking-wider">
              <thead>
                <tr className="border-b border-border/5 bg-secondary/5">
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Contact
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Joined
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground">
                    Source
                  </th>
                  <th className="px-6 py-4 font-bold text-muted-foreground text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/5">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-muted-foreground animate-pulse"
                    >
                      Retrieving contacts from sync engine…
                    </td>
                  </tr>
                ) : subscriberEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center space-y-3"
                    >
                      <Users className="size-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-xs font-bold">No subscribers found</p>
                    </td>
                  </tr>
                ) : (
                  subscriberEntries.map((contact) => (
                    <tr
                      key={contact._id}
                      className="hover:bg-primary/5 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground font-bold">
                            {contact.name || "Anonymous Subscriber"}
                          </span>
                          <span className="text-[9px] text-muted-foreground lowercase tracking-normal">
                            {contact.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[9px] font-bold border",
                            contact.newsletterStatus === "active"
                              ? "border-green-500/50 text-green-500 bg-green-500/5"
                              : "border-yellow-500/50 text-yellow-500 bg-yellow-500/5",
                          )}
                        >
                          {contact.newsletterStatus || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-3" />
                          {format(new Date(contact.createdAt), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {contact.source.replace(/_/g, " ")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-(--radius) group-hover:bg-primary/10 group-hover:text-primary transition-all"
                        >
                          <Mail className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <PaginationController
            page={page}
            totalPages={totalPages}
            onPageChange={(nextPage) =>
              updateQueryParams({ page: String(nextPage) })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}

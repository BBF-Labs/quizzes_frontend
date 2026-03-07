"use client";

import { useEffect, useState } from "react";
import { Check, Info, Users, Building2, School, MapPin } from "lucide-react";
import { IAudienceFilter } from "@/hooks/use-campaigns";
import { useUniversities } from "@/hooks/use-universities";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AudienceSelectorProps {
  value: IAudienceFilter;
  onChange: (value: IAudienceFilter) => void;
}

type UniversityOption = {
  _id?: string;
  id?: string;
  name: string;
};

const ROLES = [
  "super_admin",
  "uni_admin",
  "admin",
  "staff",
  "moderator",
  "student",
] as const;
const WAITLIST_STATUS = ["active", "removed"] as const;
const NEWSLETTER_STATUS = [
  "pending",
  "active",
  "unsubscribed",
  "bounced",
] as const;

export function AudienceSelector({ value, onChange }: AudienceSelectorProps) {
  const { data: universitiesData } = useUniversities();
  const [activeTab, setActiveTab] = useState<
    "platform" | "lanes" | "institution" | "overrides"
  >("platform");

  const universities: UniversityOption[] = Array.isArray(universitiesData?.data)
    ? (universitiesData.data as UniversityOption[])
    : [];

  const filter = value || {};
  const [specificEmailsText, setSpecificEmailsText] = useState(
    filter.specificEmails?.join("\n") || "",
  );

  useEffect(() => {
    const next = filter.specificEmails?.join("\n") || "";
    setSpecificEmailsText(next);
  }, [filter.specificEmails]);

  const updateFilter = (updates: Partial<IAudienceFilter>) => {
    onChange({ ...filter, ...updates });
  };

  const toggleLane = (lane: "waitlist" | "newsletter") => {
    const lanes = filter.contactLanes || {};
    updateFilter({
      contactLanes: {
        ...lanes,
        [lane]: !lanes[lane],
      },
    });
  };

  return (
    <div className="border border-border/40 bg-card/20 overflow-hidden">
      {/* Mini Tabs */}
      <div className="flex border-b border-border/25 bg-secondary/10">
        {(["platform", "lanes", "institution", "overrides"] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-all border-r border-border/25 last:border-r-0",
                activeTab === tab
                  ? "bg-background text-primary"
                  : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* PLATFORM SECTION */}
        {activeTab === "platform" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="flex flex-col gap-3">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                <Users className="size-3" /> Core Targets
              </label>
              <div className="flex flex-wrap gap-4">
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() =>
                    updateFilter({ includeContacts: !filter.includeContacts })
                  }
                >
                  <div
                    className={cn(
                      "size-3.5 border transition-all flex items-center justify-center",
                      filter.includeContacts !== false
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {filter.includeContacts !== false && (
                      <Check className="size-2.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    Include Contacts
                  </span>
                </div>

                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() =>
                    updateFilter({ includeUsers: !filter.includeUsers })
                  }
                >
                  <div
                    className={cn(
                      "size-3.5 border transition-all flex items-center justify-center",
                      filter.includeUsers !== false
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30",
                    )}
                  >
                    {filter.includeUsers !== false && (
                      <Check className="size-2.5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider">
                    Include Registered Users
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/20 space-y-3">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Functional Roles
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      const current = filter.roles || [];
                      const next = current.includes(role)
                        ? current.filter((r) => r !== role)
                        : [...current, role];
                      updateFilter({ roles: next });
                    }}
                    className={cn(
                      "px-2 py-1 border text-[9px] font-mono uppercase tracking-widest transition-all",
                      filter.roles?.includes(role)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-border/60",
                    )}
                  >
                    {role.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LANES SECTION */}
        {activeTab === "lanes" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Waitlist Lane */}
              <div className="space-y-3">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => toggleLane("waitlist")}
                >
                  <div
                    className={cn(
                      "size-4 border-2 transition-all flex items-center justify-center",
                      filter.contactLanes?.waitlist
                        ? "border-primary bg-primary"
                        : "border-border/40",
                    )}
                  >
                    {filter.contactLanes?.waitlist && (
                      <Check className="size-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">
                    Waitlist Lane
                  </span>
                </div>

                {filter.contactLanes?.waitlist && (
                  <div className="pl-7 space-y-2">
                    <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1">
                      Status Filter
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {WAITLIST_STATUS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            const cs = filter.contactStatus || {};
                            const current = cs.waitlistStatus || [];
                            const next = current.includes(status)
                              ? current.filter((s) => s !== status)
                              : [...current, status];
                            updateFilter({
                              contactStatus: { ...cs, waitlistStatus: next },
                            });
                          }}
                          className={cn(
                            "px-2 py-0.5 border text-[8px] font-mono uppercase transition-all",
                            filter.contactStatus?.waitlistStatus?.includes(
                              status,
                            )
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/30 text-muted-foreground",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Newsletter Lane */}
              <div className="space-y-3">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => toggleLane("newsletter")}
                >
                  <div
                    className={cn(
                      "size-4 border-2 transition-all flex items-center justify-center",
                      filter.contactLanes?.newsletter
                        ? "border-primary bg-primary"
                        : "border-border/40",
                    )}
                  >
                    {filter.contactLanes?.newsletter && (
                      <Check className="size-3 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest">
                    Newsletter Lane
                  </span>
                </div>

                {filter.contactLanes?.newsletter && (
                  <div className="pl-7 space-y-2">
                    <p className="text-[9px] font-mono uppercase text-muted-foreground mb-1">
                      Status Filter
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {NEWSLETTER_STATUS.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            const cs = filter.contactStatus || {};
                            const current = cs.newsletterStatus || [];
                            const next = current.includes(status)
                              ? current.filter((s) => s !== status)
                              : [...current, status];
                            updateFilter({
                              contactStatus: { ...cs, newsletterStatus: next },
                            });
                          }}
                          className={cn(
                            "px-2 py-0.5 border text-[8px] font-mono uppercase transition-all",
                            filter.contactStatus?.newsletterStatus?.includes(
                              status,
                            )
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/30 text-muted-foreground",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INSTITUTION SECTION */}
        {activeTab === "institution" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                  <Building2 className="size-3" /> University Target
                </label>
                <Select
                  value={filter.universityId || "all"}
                  onValueChange={(value) =>
                    updateFilter({
                      universityId: value === "all" ? undefined : value,
                    })
                  }
                >
                  <SelectTrigger className="w-full rounded-none bg-background/50 border border-border/40 font-mono text-xs uppercase focus-visible:ring-0">
                    <SelectValue placeholder="Global (All Universities)" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-border/40 bg-card/95 font-mono text-xs uppercase">
                    <SelectItem
                      value="all"
                      className="rounded-none font-mono text-xs uppercase"
                    >
                      Global (All Universities)
                    </SelectItem>
                    {universities
                      .filter((u) => Boolean(u._id ?? u.id))
                      .map((u) => (
                        <SelectItem
                          key={u._id ?? u.id ?? u.name}
                          value={(u._id ?? u.id) as string}
                          className="rounded-none font-mono text-xs uppercase"
                        >
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                    <MapPin className="size-3" /> Campus ID
                  </label>
                  <Input
                    value={filter.campusId || ""}
                    onChange={(e) =>
                      updateFilter({ campusId: e.target.value || undefined })
                    }
                    placeholder="INSTITUTION_ID"
                    className="rounded-none h-9 font-mono text-[10px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground flex items-center gap-2">
                    <School className="size-3" /> College ID
                  </label>
                  <Input
                    value={filter.collegeId || ""}
                    onChange={(e) =>
                      updateFilter({ collegeId: e.target.value || undefined })
                    }
                    placeholder="INSTITUTION_ID"
                    className="rounded-none h-9 font-mono text-[10px]"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border/10">
                <div className="flex items-start gap-2">
                  <Info className="size-3 text-blue-400 mt-0.5" />
                  <p className="text-[9px] font-mono text-muted-foreground uppercase leading-relaxed">
                    Broadcasting to specific institutes will only reach users &
                    contacts associated with those nodes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERRIDES SECTION */}
        {activeTab === "overrides" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  Safety Exclusions
                </label>
                <div className="space-y-2">
                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() =>
                      updateFilter({
                        excludeUnsubscribed: !filter.excludeUnsubscribed,
                      })
                    }
                  >
                    <div
                      className={cn(
                        "size-3.5 border transition-all flex items-center justify-center",
                        filter.excludeUnsubscribed !== false
                          ? "border-primary bg-primary"
                          : "border-border/30",
                      )}
                    >
                      {filter.excludeUnsubscribed !== false && (
                        <Check className="size-2.5 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono uppercase">
                      Exclude Unsubscribed
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2 group cursor-pointer"
                    onClick={() =>
                      updateFilter({ excludeBounced: !filter.excludeBounced })
                    }
                  >
                    <div
                      className={cn(
                        "size-3.5 border transition-all flex items-center justify-center",
                        filter.excludeBounced !== false
                          ? "border-primary bg-primary"
                          : "border-border/30",
                      )}
                    >
                      {filter.excludeBounced !== false && (
                        <Check className="size-2.5 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono uppercase">
                      Exclude Bounced
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  Recency Guard
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={filter.excludeRecentRecipientHours || 0}
                    onChange={(e) =>
                      updateFilter({
                        excludeRecentRecipientHours:
                          parseInt(e.target.value) || 0,
                      })
                    }
                    className="rounded-none h-9 w-20 font-mono text-xs"
                  />
                  <span className="text-[9px] font-mono uppercase text-muted-foreground">
                    Hours since last email
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/20">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Specific Overrides
              </label>
              <div className="space-y-3">
                <p className="text-[9px] font-mono text-muted-foreground uppercase">
                  Target specific emails (one per line):
                </p>
                <textarea
                  value={specificEmailsText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setSpecificEmailsText(text);
                    updateFilter({
                      specificEmails: text
                        .split(/\r?\n/)
                        .map((em) => em.trim())
                        .filter(Boolean),
                    });
                  }}
                  rows={3}
                  className="w-full rounded-none font-mono text-[10px] border border-input bg-background/30 px-3 py-2 text-foreground focus:outline-none focus:border-primary resize-none"
                  placeholder="user@example.com"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

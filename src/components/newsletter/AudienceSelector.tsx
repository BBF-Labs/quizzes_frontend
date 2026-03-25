"use client";

import { useState } from "react";
import { Check, Info, Users, X } from "lucide-react";
import { IAudienceFilter } from "@/hooks";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AudienceSelectorProps {
  value: IAudienceFilter;
  onChange: (value: IAudienceFilter) => void;
  disabled?: boolean;
}

const ROLES = ["super_admin", "creator", "moderator", "student"] as const;
const WAITLIST_STATUS = ["active", "removed"] as const;
const NEWSLETTER_STATUS = [
  "pending",
  "active",
  "unsubscribed",
  "bounced",
] as const;

export function AudienceSelector({
  value,
  onChange,
  disabled = false,
}: AudienceSelectorProps) {
  const [activeTab, setActiveTab] = useState<
    "platform" | "lanes" | "overrides"
  >("platform");

  const filter = value || {};
  const [newEmailInput, setNewEmailInput] = useState("");
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const updateFilter = (updates: Partial<IAudienceFilter>) => {
    onChange({ ...filter, ...updates });
  };

  const addEmail = (email: string) => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return;

    const currentEmails = filter.specificEmails || [];
    if (currentEmails.includes(trimmed)) return;

    updateFilter({ specificEmails: [...currentEmails, trimmed] });
    setNewEmailInput("");
  };

  const removeEmail = (email: string) => {
    const currentEmails = filter.specificEmails || [];
    updateFilter({ specificEmails: currentEmails.filter((e) => e !== email) });
  };

  const startEditingEmail = (email: string) => {
    setEditingEmail(email);
    setEditingValue(email);
  };

  const saveEditedEmail = () => {
    if (!editingEmail) return;

    const trimmed = editingValue.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // If empty or invalid, just cancel editing
    if (!trimmed || !emailRegex.test(trimmed)) {
      setEditingEmail(null);
      setEditingValue("");
      return;
    }

    const currentEmails = filter.specificEmails || [];

    // If it's a duplicate (and not the same email), cancel
    if (trimmed !== editingEmail && currentEmails.includes(trimmed)) {
      setEditingEmail(null);
      setEditingValue("");
      return;
    }

    // Update the email
    const updatedEmails = currentEmails.map((e) =>
      e === editingEmail ? trimmed : e,
    );

    updateFilter({ specificEmails: updatedEmails });
    setEditingEmail(null);
    setEditingValue("");
  };

  const cancelEditingEmail = () => {
    setEditingEmail(null);
    setEditingValue("");
  };

  const handleEmailInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail(newEmailInput);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEditedEmail();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEditingEmail();
    }
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
        {(["platform", "lanes", "overrides"] as const).map((tab) => (
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
        ))}
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
                  className={cn(
                    "flex items-center gap-2 group",
                    !disabled && "cursor-pointer",
                  )}
                  onClick={() =>
                    !disabled &&
                    updateFilter({ includeContacts: !filter.includeContacts })
                  }
                >
                  <div
                    className={cn(
                      "size-3.5 border transition-all flex items-center justify-center",
                      filter.includeContacts !== false
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30",
                      disabled && "opacity-50",
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
                  className={cn(
                    "flex items-center gap-2 group",
                    !disabled && "cursor-pointer",
                  )}
                  onClick={() =>
                    !disabled &&
                    updateFilter({ includeUsers: !filter.includeUsers })
                  }
                >
                  <div
                    className={cn(
                      "size-3.5 border transition-all flex items-center justify-center",
                      filter.includeUsers !== false
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30",
                      disabled && "opacity-50",
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
                      if (disabled) return;
                      const current = filter.roles || [];
                      const next = current.includes(role)
                        ? current.filter((r) => r !== role)
                        : [...current, role];
                      updateFilter({ roles: next });
                    }}
                    disabled={disabled}
                    className={cn(
                      "px-2 py-1 border text-[9px] font-mono uppercase tracking-widest transition-all",
                      filter.roles?.includes(role)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/40 text-muted-foreground hover:border-border/60",
                      disabled && "opacity-50 cursor-not-allowed",
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
                  className={cn(
                    "flex items-center gap-3 group",
                    !disabled && "cursor-pointer",
                  )}
                  onClick={() => !disabled && toggleLane("waitlist")}
                >
                  <div
                    className={cn(
                      "size-4 border-2 transition-all flex items-center justify-center",
                      filter.contactLanes?.waitlist
                        ? "border-primary bg-primary"
                        : "border-border/40",
                      disabled && "opacity-50",
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
                            if (disabled) return;
                            const cs = filter.contactStatus || {};
                            const current = cs.waitlistStatus || [];
                            const next = current.includes(status)
                              ? current.filter((s) => s !== status)
                              : [...current, status];
                            updateFilter({
                              contactStatus: { ...cs, waitlistStatus: next },
                            });
                          }}
                          disabled={disabled}
                          className={cn(
                            "px-2 py-0.5 border text-[8px] font-mono uppercase transition-all",
                            filter.contactStatus?.waitlistStatus?.includes(
                              status,
                            )
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/30 text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed",
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
                  className={cn(
                    "flex items-center gap-3 group",
                    !disabled && "cursor-pointer",
                  )}
                  onClick={() => !disabled && toggleLane("newsletter")}
                >
                  <div
                    className={cn(
                      "size-4 border-2 transition-all flex items-center justify-center",
                      filter.contactLanes?.newsletter
                        ? "border-primary bg-primary"
                        : "border-border/40",
                      disabled && "opacity-50",
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
                            if (disabled) return;
                            const cs = filter.contactStatus || {};
                            const current = cs.newsletterStatus || [];
                            const next = current.includes(status)
                              ? current.filter((s) => s !== status)
                              : [...current, status];
                            updateFilter({
                              contactStatus: { ...cs, newsletterStatus: next },
                            });
                          }}
                          disabled={disabled}
                          className={cn(
                            "px-2 py-0.5 border text-[8px] font-mono uppercase transition-all",
                            filter.contactStatus?.newsletterStatus?.includes(
                              status,
                            )
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/30 text-muted-foreground",
                            disabled && "opacity-50 cursor-not-allowed",
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
                    className={cn(
                      "flex items-center gap-2 group",
                      !disabled && "cursor-pointer",
                    )}
                    onClick={() =>
                      !disabled &&
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
                        disabled && "opacity-50",
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
                    className={cn(
                      "flex items-center gap-2 group",
                      !disabled && "cursor-pointer",
                    )}
                    onClick={() =>
                      !disabled &&
                      updateFilter({ excludeBounced: !filter.excludeBounced })
                    }
                  >
                    <div
                      className={cn(
                        "size-3.5 border transition-all flex items-center justify-center",
                        filter.excludeBounced !== false
                          ? "border-primary bg-primary"
                          : "border-border/30",
                        disabled && "opacity-50",
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
                    className="rounded-(--radius) h-9 w-20 font-mono text-xs"
                    disabled={disabled}
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
                  Target specific emails:
                </p>

                {/* Email chips display */}
                <div className="flex flex-wrap gap-2 min-h-10 p-3 border border-border/40 bg-black/10">
                  {(filter.specificEmails || []).map((email) => (
                    <div key={email}>
                      {editingEmail === email ? (
                        <Input
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={saveEditedEmail}
                          onKeyDown={handleEditKeyDown}
                          className="h-7 py-0 px-2 min-w-40 w-auto inline-block rounded-(--radius) font-mono text-[10px] bg-background border-primary"
                        />
                      ) : (
                        <div
                          className={cn(
                            "group flex items-center gap-1.5 px-2 py-1 border border-primary/40 bg-primary/10 text-primary font-mono text-[10px] uppercase transition-all hover:bg-primary hover:text-primary-foreground",
                            !disabled && "cursor-pointer",
                            disabled && "opacity-50",
                          )}
                        >
                          <span
                            className="truncate max-w-50"
                            onClick={() =>
                              !disabled && startEditingEmail(email)
                            }
                          >
                            {email}
                          </span>
                          {!disabled && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEmail(email);
                              }}
                              className="size-3 flex items-center justify-center text-primary/60 hover:text-primary-foreground transition-colors"
                            >
                              <X className="size-2.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty state */}
                  {(!filter.specificEmails ||
                    filter.specificEmails.length === 0) && (
                    <span className="text-[9px] font-mono text-muted-foreground/40 italic">
                      No specific emails set
                    </span>
                  )}
                </div>

                {/* Input field for adding emails */}
                {!disabled && (
                  <div className="space-y-2">
                    <Input
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      onKeyDown={handleEmailInputKeyDown}
                      onBlur={() => addEmail(newEmailInput)}
                      placeholder="user@example.com (press Enter to add)"
                      className="rounded-(--radius) h-9 font-mono text-[10px] bg-background/50 focus:bg-background transition-colors"
                    />
                    <p className="text-[8px] font-mono text-muted-foreground/50 italic">
                      Press Enter or click outside to add. Click any email to
                      edit. Invalid or duplicate emails will be ignored.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

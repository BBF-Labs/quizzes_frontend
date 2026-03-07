"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Plus, ArrowRight, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCampaigns,
  useCreateCampaign,
  ICampaign,
  ILinkContext,
  INewsletterImage,
  CampaignType,
  IAudienceFilter
} from "@/hooks/use-campaigns";
import { LinkBuilder } from "@/components/newsletter/LinkBuilder";
import { ImageManager } from "@/components/newsletter/ImageManager";
import { AudienceSelector } from "@/components/newsletter/AudienceSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_CLASS: Record<string, string> = {
  draft: "border-border text-muted-foreground",
  generating: "bg-blue-400/10 border-blue-400/50 text-blue-400 animate-pulse",
  approved: "bg-primary/10 border-primary/60 text-primary",
  dispatching: "bg-yellow-400/10 border-yellow-400/50 text-yellow-400",
  done: "bg-green-400/10 border-green-400/50 text-green-400",
  failed: "bg-destructive/10 border-destructive/50 text-destructive",
  cancelled: "bg-orange-400/10 border-orange-400/50 text-orange-400",
  scheduled: "bg-purple-400/10 border-purple-400/50 text-purple-400",
};

const TYPE_LABELS: Record<string, string> = {
  newsletter: "Newsletter",
  announcement: "Announcement",
  product_update: "Product",
  waitlist_update: "Waitlist",
  system_update: "System",
  exam_reminder: "Exam",
  quiz_available: "Quiz",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.4 } },
};

export default function AdminPage() {
  const { data: campaigns, isLoading, refetch } = useCampaigns();
  const createMutation = useCreateCampaign();
  const [showNewForm, setShowNewForm] = useState(false);

  interface CampaignForm {
    title: string;
    subjectLine: string;
    previewText: string;
    promptInstruction: string;
    linkContexts: ILinkContext[];
    images: INewsletterImage[];
    campaignType: CampaignType;
    audience: "single" | "broadcast";
    audienceFilter: IAudienceFilter;
  }

  const initialForm: CampaignForm = {
    title: "",
    subjectLine: "",
    previewText: "",
    promptInstruction: "",
    linkContexts: [] as ILinkContext[],
    images: [] as INewsletterImage[],
    campaignType: "newsletter" as CampaignType,
    audience: "broadcast" as "single" | "broadcast",
    audienceFilter: {
      includeContacts: true,
      includeUsers: true,
      excludeUnsubscribed: true,
      excludeBounced: true,
    } as IAudienceFilter,
  };

  const [form, setForm] = useState(initialForm);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      toast.success(
        "Campaign draft created. You can now configure content and generate an AI draft.",
      );
      setShowNewForm(false);
      setForm(initialForm);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ??
          "Could not create campaign draft. Check required fields and try again.",
      );
    }
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: "easeOut", duration: 0.45 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
      >
        <div>
          <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
              Communications
            </span>
          </div>
          <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
            Campaigns Manager
          </h1>
          <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
            {campaigns?.length ?? 0} active campaign
            {campaigns?.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            id="refresh-campaigns"
            onClick={() => refetch()}
            variant="outline"
            size="icon"
            className="rounded-none h-9 w-9"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            id="new-campaign-btn"
            onClick={() => setShowNewForm(true)}
            className="flex-1 sm:flex-initial rounded-none font-mono text-xs h-9 tracking-[0.15em] uppercase shadow-[0_0_15px_rgba(0,110,255,0.1)] hover:shadow-[0_0_25px_rgba(0,110,255,0.2)] transition-all"
          >
            <Plus className="size-3.5" />
            New Campaign
          </Button>
        </div>
      </motion.div>

      {/* New Campaign Form */}
      {showNewForm && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 0.3 }}
          className="border border-primary/40 bg-card/60 p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
              New Campaign
            </span>
            <button
              onClick={() => {
                setShowNewForm(false);
                setForm(initialForm);
              }}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="rounded-none font-mono"
                  placeholder="March 2026 Update"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  Subject Line *
                </label>
                <Input
                  value={form.subjectLine}
                  onChange={(e) =>
                    setForm({ ...form, subjectLine: e.target.value })
                  }
                  required
                  className="rounded-none font-mono"
                  placeholder="What's new at Qz this month"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Preview Text
              </label>
              <Input
                value={form.previewText}
                onChange={(e) =>
                  setForm({ ...form, previewText: e.target.value })
                }
                className="rounded-none font-mono"
                placeholder="Inbox preview snippet…"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                AI Prompt Instruction
              </label>
              <textarea
                value={form.promptInstruction}
                onChange={(e) =>
                  setForm({ ...form, promptInstruction: e.target.value })
                }
                rows={4}
                className="w-full rounded-none font-mono text-sm border border-input bg-transparent px-3 py-2 text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 resize-none dark:bg-input/30"
                placeholder="Write a newsletter announcing our new exam timetable feature…"
              />
            </div>

            {/* Visual Assets */}
            <div className="bg-background/20 p-5 border border-border/20">
              <ImageManager
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Campaign Type</label>
                  <select
                    value={form.campaignType}
                    onChange={(e) => setForm({ ...form, campaignType: e.target.value as CampaignType })}
                    className="w-full h-10 px-3 py-2 bg-background/50 border border-input text-xs font-mono rounded-none focus:outline-none focus:border-primary transition-all uppercase"
                  >
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="product_update">Product Update</option>
                    <option value="waitlist_update">Waitlist Update</option>
                    <option value="system_update">System Update</option>
                  </select>
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Broadcast Mode</label>
                  <div className="flex gap-2">
                    {["broadcast", "single"].map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={form.audience === opt ? "default" : "outline"}
                        onClick={() => setForm({ ...form, audience: opt as any })}
                        className="flex-1 rounded-none font-mono text-[10px] uppercase h-10"
                      >
                         {opt}
                      </Button>
                    ))}
                  </div>
               </div>
            </div>

            {/* Target Audience / Filters */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                Target Audience Filter
              </label>
              <AudienceSelector 
                value={form.audienceFilter}
                onChange={(filter) => setForm({ ...form, audienceFilter: filter })}
              />
            </div>

            {/* Link Builder */}
            <div className="bg-background/40 border border-border/30 p-5">
              <LinkBuilder
                links={form.linkContexts}
                onChange={(links) => setForm({ ...form, linkContexts: links })}
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="rounded-none font-mono text-xs tracking-[0.15em] uppercase"
              >
                {createMutation.isPending ? "Creating…" : "Create Draft"}
              </Button>
              <Button
                type="button"
                onClick={() => setShowNewForm(false)}
                variant="outline"
                className="rounded-none font-mono text-xs tracking-[0.15em] uppercase"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Campaign List */}
      {isLoading ? (
        <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase animate-pulse">
          Loading campaigns…
        </div>
      ) : !campaigns?.length ? (
        <div className="border border-dashed border-border/50 py-24 text-center">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
            No campaigns yet. Create your first one.
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {campaigns.map((c: ICampaign) => (
            <motion.div key={c._id} variants={itemVariants}>
              <Link
                href={`/admin/campaigns/${c._id}`}
                id={`campaign-${c._id}`}
                className="block border border-border/50 bg-card/40 p-0 hover:border-primary transition-all duration-300 group"
              >
                {/* Simple Mono Title */}
                <div className="flex items-center gap-2 p-2 border-b border-border/25 bg-secondary/10">
                  <h3 className="text-lg font-mono font-bold tracking-[0.2em] uppercase text-foreground group-hover:text-primary transition-colors truncate flex-1">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono tracking-widest uppercase border border-primary/30 px-1.5 py-0.5 rounded-none text-primary/70">
                      {TYPE_LABELS[c.campaignType] || c.campaignType}
                    </span>
                    <span
                      className={cn(
                        "text-[8px] font-mono tracking-widest uppercase border px-1.5 py-0.5 rounded-none",
                        STATUS_CLASS[c.status],
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                </div>

                <div className="px-5 py-4 flex items-center justify-between">
                  <div className="space-y-1.5 truncate mr-4">
                    <p className="text-xs font-mono text-muted-foreground truncate">
                      {c.subjectLine}
                    </p>
                    {(c.status === "dispatching" ||
                      c.status === "done" ||
                      c.status === "failed") && (
                      <p className="text-[10px] font-mono text-muted-foreground/60 flex gap-3">
                        <span>
                          SENT: <span className="text-foreground">{c.stats.sent}</span>
                        </span>
                        {c.stats.sent > 0 && (
                          <>
                            <span>
                              OPEN: <span className="text-green-500">{(c.stats.openRate * 100).toFixed(1)}%</span>
                            </span>
                            <span>
                              CLICK: <span className="text-blue-500">{(c.stats.clickRate * 100).toFixed(1)}%</span>
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

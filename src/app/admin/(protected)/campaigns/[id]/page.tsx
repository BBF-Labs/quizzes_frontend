"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  RefreshCw,
  ArrowLeft,
  Settings2,
  ImageIcon,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useCampaign,
  useUpdateCampaign,
  useGenerateCampaign,
  useApproveCampaign,
  useSendCampaignPreview,
  ILinkContext,
  INewsletterImage,
  IAudienceFilter,
  CampaignType,
} from "@/hooks/use-campaigns";
import { EmailPreview } from "@/components/newsletter/EmailPreview";
import { LinkBuilder } from "@/components/newsletter/LinkBuilder";
import { ImageManager } from "@/components/newsletter/ImageManager";
import { AudienceSelector } from "@/components/newsletter/AudienceSelector";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
const MdEditor = dynamic(
  () => import("md-editor-rt").then((mod) => mod.MdEditor),
  { ssr: false },
);
import { useTheme } from "next-themes";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSocket } from "@/hooks/use-socket";

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
  welcome: "Welcome",
};

const TAB_VALUES = ["configure", "assets", "ai-writer", "composing"] as const;
type CampaignTab = (typeof TAB_VALUES)[number];

function isCampaignTab(value: string | null): value is CampaignTab {
  return TAB_VALUES.includes(value as CampaignTab);
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "object" && error !== null) {
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
    if (response?.data?.message) {
      return response.data.message;
    }
  }

  return fallback;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const { data: campaign, isLoading, refetch } = useCampaign(id);
  const updateMutation = useUpdateCampaign(id);
  const generateMutation = useGenerateCampaign(id);
  const approveMutation = useApproveCampaign(id);
  const sendPreviewMutation = useSendCampaignPreview(id);

  const [promptInstruction, setPromptInstruction] = useState("");
  const [linkContexts, setLinkContexts] = useState<ILinkContext[]>([]);
  const [images, setImages] = useState<INewsletterImage[]>([]);
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  const [campaignType, setCampaignType] = useState<CampaignType>("newsletter");
  const [audience, setAudience] = useState<"single" | "broadcast">("broadcast");
  const [audienceFilter, setAudienceFilter] = useState<IAudienceFilter>({});

  const [promptDirty, setPromptDirty] = useState(false);
  const [linksDirty, setLinksDirty] = useState(false);
  const [imagesDirty, setImagesDirty] = useState(false);
  const [bodyDirty, setBodyDirty] = useState(false);
  const [metaDirty, setMetaDirty] = useState(false);
  const [targetDirty, setTargetDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<CampaignTab>(() => {
    const initialTab = searchParams.get("tab");
    return isCampaignTab(initialTab) ? initialTab : "configure";
  });
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { socket } = useSocket();

  // Debounce refetch to prevent socket + polling simultaneous requests
  const refetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedRefetch = useCallback((source: string) => {
    // Clear any pending refetch
    if (refetchTimeoutRef.current) {
      clearTimeout(refetchTimeoutRef.current);
    }

    console.log(`[Refetch] Scheduled from ${source}`);

    // Schedule new refetch with small delay to batch requests
    refetchTimeoutRef.current = setTimeout(() => {
      console.log(`[Refetch] Executing batched refetch from ${source}`);
      refetch();
      refetchTimeoutRef.current = null;
    }, 100); // 100ms debounce window
  }, [refetch]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (data: { campaignId: string; type: string }) => {
      console.log(`[Socket] Received email:updated event:`, data);
      console.log(`[Socket] Current page campaign ID: ${id}`);

      if (data.campaignId === id) {
        console.log(`[Socket] IDs match! Triggering refetch for ${id}...`);
        debouncedRefetch("socket");
        toast.info("Campaign updated in real-time.");
      } else {
        console.log(
          `[Socket] ID mismatch. Data ID: ${data.campaignId}, Current ID: ${id}`,
        );
      }
    };

    socket.on("email:updated", handleUpdate);
    return () => {
      socket.off("email:updated", handleUpdate);
    };
  }, [socket, id, debouncedRefetch]);

  // Auto-refresh during dispatch (now uses debounced version)
  useEffect(() => {
    if (campaign?.status === "dispatching") {
      const interval = setInterval(() => debouncedRefetch("polling"), 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, debouncedRefetch]);

  // Sync local state from fetched data
  useEffect(() => {
    if (!campaign) return;

    queueMicrotask(() => {
      if (!promptDirty) setPromptInstruction(campaign.promptInstruction ?? "");
      if (!linksDirty) setLinkContexts(campaign.linkContexts ?? []);
      if (!imagesDirty) setImages(campaign.images ?? []);
      if (!bodyDirty) setBodyMarkdown(campaign.bodyMarkdown ?? "");
      if (!metaDirty) {
        setTitle(campaign.title ?? "");
        setSubjectLine(campaign.subjectLine ?? "");
        setCampaignType(campaign.campaignType ?? "newsletter");
        setAudience(campaign.audience ?? "broadcast");
      }
      if (!targetDirty) setAudienceFilter(campaign.audienceFilter ?? {});
    });
  }, [
    campaign,
    promptDirty,
    linksDirty,
    imagesDirty,
    bodyDirty,
    metaDirty,
    targetDirty,
  ]);

  // Cleanup refetch timeout on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading)
    return (
      <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase animate-pulse">
        Loading…
      </div>
    );
  if (!campaign)
    return (
      <div className="text-xs font-mono text-destructive tracking-widest uppercase">
        Campaign not found.
      </div>
    );

  const isDraft = campaign.status === "draft";
  const isEditable = isDraft; // Only draft campaigns can be edited

  const isDirty =
    promptDirty ||
    linksDirty ||
    imagesDirty ||
    bodyDirty ||
    metaDirty ||
    targetDirty;

  // Validation helper
  const validateCampaignData = (): boolean => {
    // Check required fields
    if (!title.trim()) {
      toast.error("Campaign title is required.");
      return false;
    }

    if (!subjectLine.trim()) {
      toast.error("Email subject line is required.");
      return false;
    }

    if (!promptInstruction.trim() || promptInstruction.length < 10) {
      toast.error("AI instructions must be at least 10 characters.");
      return false;
    }

    // Validate link contexts
    for (const link of linkContexts) {
      if (!link.baseUrl.trim()) {
        toast.error("All link contexts must have a base URL.");
        return false;
      }
      try {
        new URL(link.baseUrl);
      } catch {
        toast.error(`Invalid URL: ${link.baseUrl}`);
        return false;
      }
    }

    // Validate images
    for (const img of images) {
      if (img.url && !img.url.trim()) {
        toast.error("Image URLs cannot be empty.");
        return false;
      }
      if (!img.altText.trim()) {
        toast.error("All images must have alt text.");
        return false;
      }
    }

    return true;
  };

  const saveChanges = async () => {
    if (!isEditable) {
      toast.info("Only draft campaigns can be edited. This campaign is " + campaign.status + ".");
      return;
    }

    // Validate before sending
    if (!validateCampaignData()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        title,
        subjectLine,
        campaignType,
        audience,
        audienceFilter,
        promptInstruction,
        linkContexts,
        images,
        bodyMarkdown,
      });

      // Only reset dirty flags AFTER mutation succeeds
      setPromptDirty(false);
      setLinksDirty(false);
      setImagesDirty(false);
      setBodyDirty(false);
      setMetaDirty(false);
      setTargetDirty(false);

      toast.success("Campaign changes saved.");
    } catch (error: unknown) {
      // On error, mark everything as dirty again
      setPromptDirty(true);
      setLinksDirty(true);
      setImagesDirty(true);
      setBodyDirty(true);
      setMetaDirty(true);
      setTargetDirty(true);
      toast.error(
        getErrorMessage(
          error,
          "Could not save campaign changes. Please try again.",
        ),
      );
    }
  };

  const handleTabChange = (value: string) => {
    const nextTab: CampaignTab = isCampaignTab(value) ? value : "configure";
    setActiveTab(nextTab);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextTab === "configure") {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", nextTab);
    }

    const query = nextParams.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, "", nextUrl);
  };

  const handleGenerate = async () => {
    try {
      if (promptDirty || linksDirty || imagesDirty) await saveChanges();
      await generateMutation.mutateAsync();
      toast.success(
        "AI draft generation queued. Content will update once processing completes.",
      );
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Could not queue AI draft generation. Update instructions and try again.",
        ),
      );
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      toast.success(
        "Campaign approved. Dispatch has been queued and is running in the background.",
      );
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Could not approve campaign. Ensure the body is ready and try again.",
        ),
      );
    }
  };

  const handleSendPreview = async () => {
    try {
      await sendPreviewMutation.mutateAsync();
      toast.success(
        "Test email queued. It should arrive at your admin address shortly.",
      );
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(
          error,
          "Could not queue test email. Check SMTP settings and try again.",
        ),
      );
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ease: "easeOut", duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Back + Header */}
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="size-3" /> All Campaigns
        </button>

        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-2 w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-mono font-bold tracking-[0.2em] uppercase text-foreground truncate max-w-50 sm:max-w-md">
                {campaign.title}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono tracking-widest uppercase border border-primary/30 px-1.5 py-0.5 rounded-none text-primary/70">
                  {TYPE_LABELS[campaign.campaignType] || campaign.campaignType}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-mono tracking-widest uppercase border px-1.5 py-0.5 rounded-none",
                    STATUS_CLASS[campaign.status || "draft"],
                  )}
                >
                  {campaign.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-muted-foreground truncate">
                {campaign.subjectLine}
              </p>
              {isDirty && (
                <span
                  className="size-1.5 rounded-none bg-primary animate-pulse"
                  title="Unsaved changes"
                />
              )}
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 w-full lg:w-auto flex-wrap lg:justify-end">
            <Button
              id="refresh-campaign"
              onClick={() => refetch()}
              variant="outline"
              size="icon"
              className="rounded-none"
            >
              <RefreshCw className="size-4" />
            </Button>

            {isDirty && isEditable && (
              <Button
                onClick={saveChanges}
                disabled={updateMutation.isPending}
                className="rounded-none font-mono text-[10px] tracking-widest uppercase bg-primary/90 hover:bg-primary px-4"
              >
                {updateMutation.isPending ? (
                  <RefreshCw className="size-4 animate-spin mr-2" />
                ) : (
                  <Check className="size-4 mr-2" />
                )}
                Sync Changes
              </Button>
            )}

            {campaign.bodyMarkdown && (
              <Button
                id="send-preview"
                onClick={handleSendPreview}
                disabled={sendPreviewMutation.isPending}
                variant="outline"
                className="rounded-none font-mono text-[10px] tracking-widest uppercase border-border/60 hover:bg-secondary px-4"
              >
                <RefreshCw
                  className={cn(
                    "size-4",
                    sendPreviewMutation.isPending && "animate-spin",
                  )}
                />
                {sendPreviewMutation.isPending ? "Sending…" : "Send Test"}
              </Button>
            )}

            {isDraft && (
              <Button
                id="generate-campaign"
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                variant="outline"
                className="rounded-none font-mono text-[10px] tracking-widest uppercase border-primary/50 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground shadow-[0_0_10px_rgba(0,110,255,0.1)] hover:shadow-[0_0_20px_rgba(0,110,255,0.2)] transition-all px-4"
              >
                <Sparkles className="size-4" />
                {generateMutation.isPending
                  ? "Generating…"
                  : "Generate AI Body"}
              </Button>
            )}

            {isDraft && campaign.bodyMarkdown && (
              <Button
                id="approve-campaign"
                onClick={handleApprove}
                disabled={approveMutation.isPending}
                className="rounded-none font-mono text-[10px] tracking-widest uppercase shadow-[0_0_15px_rgba(0,110,255,0.1)] hover:shadow-[0_0_25px_rgba(0,110,255,0.2)] transition-all px-4"
              >
                <Check className="size-4" />
                {approveMutation.isPending
                  ? "Approving…"
                  : "Approve & Dispatch"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Stats */}
      <AnimatePresence>
        {(campaign.status === "dispatching" ||
          campaign.status === "done" ||
          campaign.status === "failed") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-border/50 bg-card/60 px-6 py-5 flex flex-wrap items-center gap-6 sm:gap-10"
          >
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                Dispatched
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {campaign.stats?.sent ?? 0}
              </p>
            </div>

            {campaign.stats?.sent > 0 && (
              <>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    Open Rate
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-400">
                    {(campaign.stats?.openRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    Click Rate
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-400">
                    {(campaign.stats?.clickRate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                    Bounced
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-destructive/80">
                    {campaign.stats?.bounced ?? 0}
                  </p>
                </div>
              </>
            )}

            {campaign.status === "dispatching" && (
              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="size-1.5 rounded-none bg-yellow-400 animate-pulse" />
                <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest">
                  Dispatching —{" "}
                  {campaign.dispatchTotal
                    ? `${Math.round((campaign.stats.sent / campaign.dispatchTotal) * 100)}%`
                    : "Active"}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList
          variant="line"
          className="bg-transparent border-b border-border/20 w-auto min-w-full justify-start rounded-none h-auto px-0 mb-6 overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap shrink-0"
        >
          <TabsTrigger
            value="configure"
            className="rounded-none data-[state=active]:bg-primary/5"
          >
            <Settings2 className="size-3.5 mr-1.5" /> CONFIGURE
          </TabsTrigger>
          <TabsTrigger
            value="assets"
            className="rounded-none data-[state=active]:bg-primary/5"
          >
            <ImageIcon className="size-3.5 mr-1.5" /> ASSETS
          </TabsTrigger>
          <TabsTrigger
            value="ai-writer"
            className="rounded-none data-[state=active]:bg-primary/5"
          >
            <Sparkles className="size-3.5 mr-1.5" /> AI WRITER
          </TabsTrigger>
          <TabsTrigger
            value="composing"
            className="rounded-none data-[state=active]:bg-primary/5"
          >
            <PenTool className="size-3.5 mr-1.5" /> COMPOSING
          </TabsTrigger>
        </TabsList>

        <div className="min-h-125">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {activeTab === "configure" && (
                <div className="space-y-6">
                  <div className="border border-border/40 bg-card/40 p-6 space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Campaign Title
                      </label>
                      <Input
                        value={title}
                        disabled={!isEditable}
                        onChange={(e) => {
                          setTitle(e.target.value);
                          setMetaDirty(true);
                        }}
                        className="rounded-none h-10 bg-background/50 font-mono text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                          Campaign Type
                        </label>
                        <Select value={campaignType} onValueChange={(value) => {
                          setCampaignType(value as CampaignType);
                          setMetaDirty(true);
                        }} disabled={!isEditable}>
                          <SelectTrigger className="rounded-none bg-background/50 border border-border/40 font-mono text-xs uppercase focus-visible:ring-0 disabled:opacity-50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="product_update">Product Update</SelectItem>
                            <SelectItem value="waitlist_update">Waitlist Update</SelectItem>
                            <SelectItem value="system_update">System Update</SelectItem>
                            <SelectItem value="exam_reminder">Exam Reminder</SelectItem>
                            <SelectItem value="quiz_available">Quiz Available</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                          Broadcast Mode
                        </label>
                        <div className="flex gap-2">
                          {(["broadcast", "single"] as const).map((opt) => (
                            <Button
                              key={opt}
                              type="button"
                              variant={audience === opt ? "default" : "outline"}
                              disabled={!isEditable}
                              onClick={() => {
                                setAudience(opt);
                                setMetaDirty(true);
                              }}
                              className="flex-1 rounded-none font-mono text-[10px] uppercase h-10"
                            >
                              {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border/20 space-y-3">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Audience Filter Configuration
                      </label>
                      <AudienceSelector
                        value={audienceFilter}
                        onChange={(filter) => {
                          setAudienceFilter(filter);
                          setTargetDirty(true);
                        }}
                      />
                      <p className="text-[9px] text-muted-foreground font-mono italic">
                        Select &quot;all&quot; alone, or choose specific
                        audiences without &quot;all&quot;
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "assets" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="border border-border/40 bg-card/40 p-6">
                      <LinkBuilder
                        links={linkContexts}
                        onChange={(newLinks) => {
                          setLinkContexts(newLinks);
                          setLinksDirty(true);
                        }}
                        disabled={!isDraft}
                      />
                    </div>
                    <div className="border border-border/40 bg-card/40 p-6">
                      <ImageManager
                        images={images}
                        onChange={(newImages) => {
                          setImages(newImages);
                          setImagesDirty(true);
                        }}
                        disabled={!isDraft}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ai-writer" && (
                <div className="space-y-6">
                  <div className="border border-border/40 bg-card/40 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                        Generation Instructions (Z)
                      </span>
                    </div>
                    <textarea
                      value={promptInstruction}
                      onChange={(e) => {
                        setPromptInstruction(e.target.value);
                        setPromptDirty(true);
                      }}
                      disabled={!isDraft}
                      rows={8}
                      className="w-full rounded-none font-mono text-sm border border-input bg-background/30 px-3 py-2 text-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-0 resize-none"
                      placeholder={`Write a ${campaignType.replace("_", " ")} for our students...`}
                    />
                    <div className="flex items-center gap-4 pt-4 border-t border-border/10">
                      <Button
                        onClick={handleGenerate}
                        disabled={generateMutation.isPending || !isDraft}
                        className="rounded-none font-mono text-xs tracking-widest uppercase"
                      >
                        {generateMutation.isPending ? (
                          <RefreshCw className="size-3.5 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="size-3.5 mr-2" />
                        )}
                        Generate AI Draft
                      </Button>
                      <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest italic">
                        Z uses the context provided in Assets to build the body.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "composing" && (
                <div className="h-[calc(100vh-280px)] min-h-175 flex flex-col border border-border/30 overflow-hidden bg-card/20">
                  <ResizablePanelGroup
                    orientation={isMobile ? "vertical" : "horizontal"}
                    className="flex-1 h-full min-h-150"
                  >
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col newsletter-editor-container">
                        <div className="px-4 py-2 bg-background/40 border-b border-border/20 flex items-center justify-between">
                          <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
                            Source Markdown
                          </span>
                          {bodyDirty && (
                            <span className="text-[8px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 animate-pulse">
                              Modified
                            </span>
                          )}
                        </div>
                        <MdEditor
                          id="newsletter-body"
                          value={bodyMarkdown}
                          onChange={(val) => {
                            setBodyMarkdown(val);
                            setBodyDirty(true);
                          }}
                          theme={theme === "dark" ? "dark" : "light"}
                          language="en-US"
                          modelValue={bodyMarkdown}
                          preview={false}
                          placeholder="Start writing or use Z to generate a draft..."
                          disabled={!isDraft}
                          className="border-none! bg-transparent! flex-1"
                          toolbars={[
                            "bold",
                            "italic",
                            "strikeThrough",
                            "-",
                            "title",
                            "sub",
                            "sup",
                            "quote",
                            "unorderedList",
                            "orderedList",
                            "-",
                            "link",
                            "image",
                            "table",
                          ]}
                        />
                      </div>
                    </ResizablePanel>

                    <ResizableHandle
                      withHandle
                      className="bg-border/40 hover:bg-primary/40 transition-colors"
                    />

                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col bg-background/50 overflow-hidden border-l border-border/10">
                        <div className="px-4 py-2 bg-background/40 border-b border-border/20 flex items-center justify-between">
                          <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
                            Email Preview
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="size-1.5 rounded-none bg-green-500 animate-pulse" />
                            <span className="text-[8px] font-mono text-muted-foreground uppercase">
                              Real-time Rendering
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 overflow-y-auto preview-scroll-panel bg-[#f8fafc] dark:bg-zinc-950">
                          <EmailPreview
                            category={
                              campaign.audienceFilter?.contactLanes?.waitlist
                                ? "waitlist"
                                : "newsletter"
                            }
                            type="promotional"
                            title={title}
                            markdownBody={bodyMarkdown}
                            links={(linkContexts || []).map((l) => ({
                              label: l.label,
                              url: `${l.baseUrl}${l.pathTemplate}`,
                            }))}
                            name="Admin (Preview)"
                            className="border-none! p-0! sm:p-8!"
                          />
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <style jsx global>{`
          .newsletter-editor-container .md-editor {
            --md-bk-color: transparent !important;
            height: 100% !important;
          }
          .newsletter-editor-container .md-editor-toolbar-wrapper {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
          .preview-scroll-panel::-webkit-scrollbar {
            width: 4px;
          }
          .preview-scroll-panel::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </Tabs>
    </motion.div>
  );
}

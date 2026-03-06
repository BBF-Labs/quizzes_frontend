"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Check, Plus, Trash2, RefreshCw,
  Eye, EyeOff, ArrowLeft, Link2, Settings2, Image, FileText, PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCampaign, useUpdateCampaign, useGenerateCampaign, useApproveCampaign, useSendCampaignPreview, ILinkContext, INewsletterImage } from "@/hooks/use-campaigns";
import { EmailPreview } from "@/components/newsletter/EmailPreview";
import { LinkBuilder } from "@/components/newsletter/LinkBuilder";
import { ImageManager } from "@/components/newsletter/ImageManager";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
const MdEditor = dynamic(() => import("md-editor-rt").then((mod) => mod.MdEditor), { ssr: false });
import "md-editor-rt/lib/style.css";
import { useTheme } from "next-themes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSocket } from "@/hooks/use-socket";

const STATUS_CLASS: Record<string, string> = {
  draft: "border-border text-muted-foreground",
  generating: "bg-blue-400/10 border-blue-400/50 text-blue-400 animate-pulse",
  approved: "bg-primary/10 border-primary/60 text-primary",
  dispatching: "bg-yellow-400/10 border-yellow-400/50 text-yellow-400",
  done: "bg-green-400/10 border-green-400/50 text-green-400",
  failed: "bg-destructive/10 border-destructive/50 text-destructive",
};



export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: campaign, isLoading, refetch } = useCampaign(id);
  const updateMutation = useUpdateCampaign(id);
  const generateMutation = useGenerateCampaign(id);
  const approveMutation = useApproveCampaign(id);
  const sendPreviewMutation = useSendCampaignPreview(id);

  const [showPreview, setShowPreview] = useState(false);
  const [promptInstruction, setPromptInstruction] = useState("");
  const [linkContexts, setLinkContexts] = useState<ILinkContext[]>([]);
  const [images, setImages] = useState<INewsletterImage[]>([]);
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [subjectLine, setSubjectLine] = useState("");
  
  const [promptDirty, setPromptDirty] = useState(false);
  const [linksDirty, setLinksDirty] = useState(false);
  const [imagesDirty, setImagesDirty] = useState(false);
  const [bodyDirty, setBodyDirty] = useState(false);
  const [metaDirty, setMetaDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("configure");
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { socket } = useSocket();

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    
    const handleUpdate = (data: { campaignId: string; type: string }) => {
      console.log(`[Socket] Received newsletter:updated event:`, data);
      console.log(`[Socket] Current page campaign ID: ${id}`);
      
      if (data.campaignId === id) {
        console.log(`[Socket] IDs match! Triggering refetch for ${id}...`);
        refetch();
        toast.info("Campaign updated in real-time.");
      } else {
        console.log(`[Socket] ID mismatch. Data ID: ${data.campaignId}, Current ID: ${id}`);
      }
    };

    socket.on("newsletter:updated", handleUpdate);
    return () => { socket.off("newsletter:updated", handleUpdate); };
  }, [socket, id, refetch]);

  // Auto-refresh during dispatch
  useEffect(() => {
    if (campaign?.status === "dispatching") {
      const interval = setInterval(() => refetch(), 5000);
      return () => clearInterval(interval);
    }
  }, [campaign?.status, refetch]);

  // Sync local state from fetched data
  useEffect(() => {
    if (campaign && !promptDirty) setPromptInstruction(campaign.promptInstruction ?? "");
    if (campaign && !linksDirty) setLinkContexts(campaign.linkContexts ?? []);
    if (campaign && !imagesDirty) setImages(campaign.images ?? []);
    if (campaign && !bodyDirty) setBodyMarkdown(campaign.bodyMarkdown ?? "");
    if (campaign && !metaDirty) {
      setTitle(campaign.title ?? "");
      setSubjectLine(campaign.subjectLine ?? "");
    }
  }, [campaign]);

  if (isLoading) return (
    <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase animate-pulse">Loading…</div>
  );
  if (!campaign) return (
    <div className="text-xs font-mono text-destructive tracking-widest uppercase">Campaign not found.</div>
  );

  const isDraft = campaign.status === "draft";

  const isDirty = promptDirty || linksDirty || imagesDirty || bodyDirty || metaDirty;

  const saveChanges = async () => {
    try {
      await updateMutation.mutateAsync({ 
        title,
        subjectLine,
        promptInstruction, 
        linkContexts, 
        images,
        bodyMarkdown 
      });
      setPromptDirty(false);
      setLinksDirty(false);
      setImagesDirty(false);
      setBodyDirty(false);
      setMetaDirty(false);
      toast.success("All changes synced.");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Save failed");
    }
  };

  const handleGenerate = async () => {
    try {
      if (promptDirty || linksDirty || imagesDirty) await saveChanges();
      await generateMutation.mutateAsync();
      toast.success("AI body generated!");
      setShowPreview(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Generation failed");
    }
  };

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync();
      toast.success("Campaign approved — dispatch queued!");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Approval failed");
    }
  };
  
  const handleSendPreview = async () => {
    try {
      await sendPreviewMutation.mutateAsync();
      toast.success("Test email sent to your admin address!");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Test send failed");
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
                <h1 className="text-2xl font-mono font-bold tracking-[0.2em] uppercase text-foreground truncate max-w-[200px] sm:max-w-md">{campaign.title}</h1>
                <span className={cn(
                  "text-[9px] font-mono tracking-widest uppercase border px-1.5 py-0.5 rounded-none",
                  STATUS_CLASS[campaign.status || "draft"]
                )}>
                  {campaign.status}
                </span>
              </div>
            <div className="flex items-center gap-2">
               <p className="text-xs font-mono text-muted-foreground truncate">{campaign.subjectLine}</p>
               {isDirty && <span className="size-1.5 rounded-none bg-primary animate-pulse" title="Unsaved changes" />}
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

            {isDirty && (
              <Button
                onClick={saveChanges}
                disabled={updateMutation.isPending}
                className="rounded-none font-mono text-[10px] tracking-widest uppercase bg-primary/90 hover:bg-primary px-4"
              >
                {updateMutation.isPending ? <RefreshCw className="size-4 animate-spin mr-2" /> : <Check className="size-4 mr-2" />}
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
                <RefreshCw className={cn("size-4", sendPreviewMutation.isPending && "animate-spin")} />
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
                {generateMutation.isPending ? "Generating…" : "Generate AI Body"}
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
                {approveMutation.isPending ? "Approving…" : "Approve & Dispatch"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dispatch Stats */}
      <AnimatePresence>
        {(campaign.status === "dispatching" || campaign.status === "done" || campaign.status === "failed") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-border/50 bg-card/60 px-6 py-5 flex flex-wrap items-center gap-6 sm:gap-10"
          >
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Sent</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{campaign.stats?.sent ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">Failed</p>
              <p className="text-2xl sm:text-3xl font-bold text-destructive">{campaign.stats?.failed ?? 0}</p>
            </div>
            {campaign.status === "dispatching" && (
              <div className="flex items-center gap-2 sm:ml-auto">
                <div className="size-1.5 rounded-none bg-yellow-400 animate-pulse" />
                <span className="text-[10px] font-mono text-yellow-400 uppercase tracking-widest">
                  Dispatching — refreshing every 5s
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList variant="line" className="bg-transparent border-b border-border/20 w-auto min-w-full justify-start rounded-none h-auto px-0 mb-6 overflow-x-auto overflow-y-hidden no-scrollbar flex-nowrap shrink-0">
          <TabsTrigger value="configure" className="rounded-none data-[state=active]:bg-primary/5">
            <Settings2 className="size-3.5 mr-1.5" /> CONFIGURE
          </TabsTrigger>
          <TabsTrigger value="assets" className="rounded-none data-[state=active]:bg-primary/5">
            <Image className="size-3.5 mr-1.5" /> ASSETS
          </TabsTrigger>
          <TabsTrigger value="ai-writer" className="rounded-none data-[state=active]:bg-primary/5">
            <Sparkles className="size-3.5 mr-1.5" /> AI WRITER
          </TabsTrigger>
          <TabsTrigger value="composing" className="rounded-none data-[state=active]:bg-primary/5">
            <PenTool className="size-3.5 mr-1.5" /> COMPOSING
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* ────── CONFIGURE ────── */}
          <TabsContent value="configure">
            <motion.div key="configure" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="border border-border/40 bg-card/40 p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Campaign Title</label>
                  <Input 
                    value={title} 
                    onChange={(e) => { setTitle(e.target.value); setMetaDirty(true); }}
                    className="rounded-none h-10 bg-background/50 font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Subject Line</label>
                  <Input 
                    value={subjectLine} 
                    onChange={(e) => { setSubjectLine(e.target.value); setMetaDirty(true); }}
                    className="rounded-none h-10 bg-background/50 font-mono text-sm"
                  />
                </div>
                <div className="pt-4 border-t border-border/20">
                   <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Targeting</p>
                   <div className="flex gap-2">
                       {campaign.targetAudience.map((aud, idx) => (
                         <span key={`${aud}-${idx}`} className="bg-secondary/40 border border-border/50 px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-foreground/70">
                           {aud}
                         </span>
                       ))}
                   </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ────── ASSETS ────── */}
          <TabsContent value="assets">
            <motion.div key="assets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
               <div className="grid grid-cols-1 gap-8">
                 <div className="border border-border/40 bg-card/40 p-6">
                   <LinkBuilder 
                      links={linkContexts} 
                      onChange={(newLinks) => { setLinkContexts(newLinks); setLinksDirty(true); }} 
                      disabled={!isDraft} 
                   />
                 </div>
                 <div className="border border-border/40 bg-card/40 p-6">
                    <ImageManager 
                      images={images} 
                      onChange={(newImages) => { setImages(newImages); setImagesDirty(true); }} 
                      disabled={!isDraft} 
                    />
                 </div>
               </div>
            </motion.div>
          </TabsContent>

          {/* ────── AI WRITER ────── */}
          <TabsContent value="ai-writer">
            <motion.div key="ai-writer" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
               <div className="border border-border/40 bg-card/40 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">Generation Instructions (Z)</span>
                  </div>
                  <textarea
                    value={promptInstruction}
                    onChange={(e) => { setPromptInstruction(e.target.value); setPromptDirty(true); }}
                    disabled={!isDraft}
                    rows={8}
                    className="w-full rounded-none font-mono text-sm border border-input bg-background/30 px-3 py-2 text-foreground focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-0 resize-none"
                    placeholder="Focus on the benefits of our new platform features..."
                  />
                  <div className="flex items-center gap-4 pt-4 border-t border-border/10">
                    <Button
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending || !isDraft}
                      className="rounded-none font-mono text-xs tracking-widest uppercase"
                    >
                      {generateMutation.isPending ? <RefreshCw className="size-3.5 animate-spin mr-2" /> : <Sparkles className="size-3.5 mr-2" />}
                      Generate AI Draft
                    </Button>
                    <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest italic">
                      Z uses the context provided in Assets to build the body.
                    </p>
                  </div>
               </div>
            </motion.div>
          </TabsContent>

          {/* ────── COMPOSING (SPLIT VIEW) ────── */}
          <TabsContent value="composing" className="h-[calc(100vh-280px)] min-h-[700px] flex flex-col">
            <motion.div key="composing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col h-full border border-border/30 overflow-hidden bg-card/20">
              <ResizablePanelGroup orientation={isMobile ? "vertical" : "horizontal"} className="flex-1 h-full min-h-[600px]">
                {/* EDITOR PANEL */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col newsletter-editor-container">
                    <div className="px-4 py-2 bg-background/40 border-b border-border/20 flex items-center justify-between">
                       <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">Source Markdown</span>
                       {bodyDirty && <span className="text-[8px] font-mono uppercase bg-primary/10 text-primary px-1.5 py-0.5 animate-pulse">Modified</span>}
                    </div>
                    <MdEditor
                      id="newsletter-body"
                      value={bodyMarkdown}
                      onChange={(val) => { setBodyMarkdown(val); setBodyDirty(true); }}
                      theme={theme === "dark" ? "dark" : "light"}
                      language="en-US"
                      modelValue={bodyMarkdown}
                      preview={false}
                      placeholder="Start writing or use Z to generate a draft..."
                      disabled={!isDraft}
                      className="!border-none !bg-transparent flex-1"
                      toolbars={[
                        'bold', 'italic', 'strikeThrough', '-', 
                        'title', 'sub', 'sup', 'quote', 'unorderedList', 'orderedList', '-', 
                        'link', 'image', 'table'
                      ]}
                    />
                  </div>
                </ResizablePanel>
                
                <ResizableHandle withHandle className="bg-border/40 hover:bg-primary/40 transition-colors" />

                {/* PREVIEW PANEL */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col bg-background/50 overflow-hidden border-l border-border/10">
                    <div className="px-4 py-2 bg-background/40 border-b border-border/20 flex items-center justify-between">
                       <span className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground">Email Preview</span>
                       <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-none bg-green-500 animate-pulse" />
                          <span className="text-[8px] font-mono text-muted-foreground uppercase">Real-time Rendering</span>
                       </div>
                    </div>
                    <div className="flex-1 overflow-y-auto preview-scroll-panel bg-[#f8fafc] dark:bg-zinc-950">
                       <EmailPreview 
                          category={(campaign.targetAudience || []).includes("waitlist") ? "waitlist" : "newsletter"}
                          type="promotional"
                          title={title}
                          markdownBody={bodyMarkdown}
                          links={(linkContexts || []).map(l => ({ label: l.label, url: `${l.baseUrl}${l.pathTemplate}` }))}
                          name="Admin (Preview)"
                          className="!border-none !p-0 sm:!p-8"
                        />
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </motion.div>
            <style jsx global>{`
              .newsletter-editor-container .md-editor {
                --md-bk-color: transparent !important;
                height: 100% !important;
              }
              .newsletter-editor-container .md-editor-toolbar-wrapper {
                border-bottom: 1px solid rgba(255,255,255,0.05);
              }
              .preview-scroll-panel::-webkit-scrollbar { width: 4px; }
              .preview-scroll-panel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
              .no-scrollbar::-webkit-scrollbar { display: none; }
              .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
}

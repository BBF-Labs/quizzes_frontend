"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  RefreshCcw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Play,
  Save,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  useInferenceStatus,
  useProbeInference,
  useSwitchInference,
  useTestInference,
  ProviderName,
  ProviderProbeResult,
} from "@/hooks/admin/use-ai-inference";

const PROVIDER_METADATA: Record<
  ProviderName,
  { name: string; endpoint: string; defaultModel: string; badgeColor: string }
> = {
  openai: {
    name: "OpenAI",
    endpoint: "api.openai.com",
    defaultModel: "openai/gpt-4o-mini",
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  openrouter: {
    name: "OpenRouter",
    endpoint: "openrouter.ai/api",
    defaultModel: "openai/openrouter/free",
    badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
  },
  google: {
    name: "Google Gemini",
    endpoint: "generativelanguage.googleapis.com",
    defaultModel: "googleai/gemini-3.5-flash-lite",
    badgeColor: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  groq: {
    name: "Groq LPU",
    endpoint: "api.groq.com",
    defaultModel: "groq/openai/gpt-oss-20b",
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
};

export default function AIInferencePage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const { data: status, isLoading: isStatusLoading, refetch: refetchStatus } =
    useInferenceStatus();
  const probeMutation = useProbeInference();
  const switchMutation = useSwitchInference();
  const testMutation = useTestInference();

  // Local probe state per provider
  const [probeResults, setProbeResults] = React.useState<
    Partial<Record<ProviderName, ProviderProbeResult>>
  >({});
  const [probingProvider, setProbingProvider] = React.useState<ProviderName | "all" | null>(
    null,
  );

  // Form state
  const [selectedProvider, setSelectedProvider] = React.useState<ProviderName>("openai");
  const [defaultModel, setDefaultModel] = React.useState("openai/gpt-4o-mini");
  const [fallbackModel, setFallbackModel] = React.useState("openai/gpt-4o");
  const [timeoutMs, setTimeoutMs] = React.useState(25000);
  const [tierOverride, setTierOverride] = React.useState<"auto" | "free" | "paid">("auto");
  const [allowFreeUserPaid, setAllowFreeUserPaid] = React.useState(false);

  // Playground state
  const [testPrompt, setTestPrompt] = React.useState(
    "Explain binary search in one clear, concise sentence.",
  );
  const [testModelOverride, setTestModelOverride] = React.useState("");
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    text?: string;
    error?: string;
    latencyMs: number;
    modelUsed?: string;
  } | null>(null);

  // Sync state when backend status loads
  React.useEffect(() => {
    if (status) {
      setSelectedProvider(status.activeProvider);
      setDefaultModel(status.defaultModel);
      if (status.fallbackModel) setFallbackModel(status.fallbackModel);
      setTimeoutMs(status.timeoutMs || 25000);
      setTierOverride(status.tierOverride || "auto");
      setAllowFreeUserPaid(Boolean(status.allowFreeUserPaid));
    }
  }, [status]);

  // Probe single provider
  const handleProbeSingle = async (provider: ProviderName) => {
    setProbingProvider(provider);
    try {
      const res = await probeMutation.mutateAsync(provider);
      if ("provider" in res) {
        setProbeResults((prev) => ({ ...prev, [provider]: res }));
      }
    } finally {
      setProbingProvider(null);
    }
  };

  // Probe all providers concurrently
  const handleProbeAll = async () => {
    setProbingProvider("all");
    try {
      const res = await probeMutation.mutateAsync(undefined);
      if ("results" in res) {
        setProbeResults(res.results);
      }
    } finally {
      setProbingProvider(null);
    }
  };

  // Quick activate provider
  const handleQuickActivate = (provider: ProviderName) => {
    const meta = PROVIDER_METADATA[provider];
    setSelectedProvider(provider);
    setDefaultModel(meta.defaultModel);
    switchMutation.mutate({
      provider,
      defaultModel: meta.defaultModel,
      reason: `Quick activated ${meta.name} from admin UI`,
    });
  };

  // Save full configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    switchMutation.mutate({
      provider: selectedProvider,
      defaultModel: defaultModel.trim(),
      fallbackModel: fallbackModel.trim() || undefined,
      timeoutMs,
      tierOverride,
      allowFreeUserPaid,
      reason: "Manual AI Inference configuration updated by admin",
    });
  };

  // Test inference
  const handleRunTest = async () => {
    try {
      const res = await testMutation.mutateAsync({
        prompt: testPrompt,
        model: testModelOverride.trim() || defaultModel.trim(),
        timeoutMs,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err?.response?.data?.message || err.message,
        latencyMs: 0,
      });
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="border border-destructive/40 bg-destructive/5 p-8 rounded-none flex items-start gap-3 max-w-2xl">
        <ShieldAlert className="size-5 text-destructive shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-mono text-sm uppercase tracking-widest font-bold text-destructive">
            Super Admin Access Required
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            AI Inference switching controls provider routing and failovers across production. Only{" "}
            <code className="text-foreground">super_admin</code> accounts can modify these settings.
          </p>
        </div>
      </div>
    );
  }

  const providersList: ProviderName[] = ["openai", "openrouter", "google", "groq"];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-block border border-primary/60 px-2 py-1 mb-3 bg-primary/5">
          <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
            System &bull; Inference Engine
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-mono font-bold tracking-[0.2em] uppercase text-foreground">
              AI Inference Control
            </h1>
            <p className="text-xs font-mono text-muted-foreground mt-1 tracking-widest uppercase">
              Provider Probe &bull; Dynamic Hot-Swap &bull; Latency &amp; Failover
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStatus()}
              disabled={isStatusLoading}
              className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-9 px-3"
            >
              <RefreshCcw className={cn("size-3.5", isStatusLoading && "animate-spin")} />
              Sync
            </Button>
            <Button
              onClick={handleProbeAll}
              disabled={probingProvider !== null}
              className="rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-9 px-4 bg-primary text-primary-foreground"
            >
              <Zap className={cn("size-3.5", probingProvider === "all" && "animate-pulse")} />
              {probingProvider === "all" ? "Probing All…" : "Probe All Providers"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Provider Health & Latency Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground">
            Provider Endpoints &amp; Live Latency
          </h2>
          <span className="text-[10px] font-mono text-muted-foreground/60">
            Active Provider:{" "}
            <span className="text-primary font-bold uppercase">
              {status?.activeProvider || "loading…"}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {providersList.map((p) => {
            const meta = PROVIDER_METADATA[p];
            const probe = probeResults[p];
            const isActive = status?.activeProvider === p;
            const isConfigured = status?.configuredProviders?.[p] ?? true;
            const isProbing = probingProvider === p || probingProvider === "all";

            return (
              <Card
                key={p}
                className={cn(
                  "rounded-none border-border/60 bg-card/40 backdrop-blur transition-all duration-200 relative overflow-hidden",
                  isActive && "border-primary shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-primary/40",
                )}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-primary px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest uppercase text-primary-foreground">
                    ACTIVE
                  </div>
                )}

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
                        {meta.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-[10px] text-muted-foreground/70">
                        {meta.endpoint}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="space-y-1.5 font-mono text-xs border-y border-border/40 py-2.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">Status</span>
                      {isProbing ? (
                        <span className="text-[10px] text-primary animate-pulse">Probing…</span>
                      ) : probe ? (
                        <span
                          className={cn(
                            "px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-bold rounded-none",
                            probe.status === "operational" &&
                              "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
                            probe.status === "degraded" &&
                              "bg-amber-500/15 text-amber-400 border border-amber-500/30",
                            probe.status === "down" &&
                              "bg-rose-500/15 text-rose-400 border border-rose-500/30",
                            probe.status === "not_configured" &&
                              "bg-muted text-muted-foreground border border-border/40",
                          )}
                        >
                          {probe.status}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">Not probed</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">Latency</span>
                      <span className="font-mono font-bold text-foreground">
                        {probe?.latencyMs != null ? `${probe.latencyMs} ms` : "--"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">Key Status</span>
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          isConfigured ? "text-emerald-400" : "text-rose-400 font-bold",
                        )}
                      >
                        {isConfigured ? (probe?.keyMasked || "Configured") : "Missing Key"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProbeSingle(p)}
                      disabled={isProbing}
                      className="rounded-none font-mono text-[9px] uppercase tracking-wider flex-1 h-8"
                    >
                      <Activity className={cn("size-3 mr-1", isProbing && "animate-spin")} />
                      Probe
                    </Button>
                    <Button
                      variant={isActive ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleQuickActivate(p)}
                      disabled={isActive || switchMutation.isPending}
                      className="rounded-none font-mono text-[9px] uppercase tracking-wider flex-1 h-8"
                    >
                      {isActive ? "Current" : "Activate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Configuration & Playground Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runtime Configuration Form */}
        <Card className="rounded-none border-border/60 bg-card/40 backdrop-blur">
          <CardHeader className="border-b border-border/40 p-4">
            <CardTitle className="font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Cpu className="size-4 text-primary" />
              Runtime Hot-Swap Settings
            </CardTitle>
            <CardDescription className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
              Instant updates stored in MongoDB feature flags &bull; Zero redeploy required
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSaveConfig} className="space-y-5">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Active Provider
                </label>
                <Select
                  value={selectedProvider}
                  onValueChange={(val: ProviderName) => {
                    setSelectedProvider(val);
                    setDefaultModel(PROVIDER_METADATA[val].defaultModel);
                  }}
                >
                  <SelectTrigger className="rounded-none font-mono text-xs">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-mono text-xs">
                    <SelectItem value="openai">OpenAI (Direct API &bull; 4o-mini)</SelectItem>
                    <SelectItem value="openrouter">OpenRouter (Unified Gateway)</SelectItem>
                    <SelectItem value="google">Google Gemini (GenAI)</SelectItem>
                    <SelectItem value="groq">Groq LPU (Ultra-Low Latency)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] font-mono text-muted-foreground/60">
                  Primary engine used for completions, study sessions, and tutor chats.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Default Model Target
                </label>
                <Input
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="rounded-none font-mono text-xs"
                  placeholder="e.g. openai/gpt-4o-mini"
                  required
                />
                <div className="flex gap-1.5 flex-wrap pt-1">
                  {Object.entries(PROVIDER_METADATA).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDefaultModel(val.defaultModel)}
                      className="px-2 py-0.5 border border-border/50 bg-background/50 hover:border-primary/60 font-mono text-[9px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {val.defaultModel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Fallback Model Target
                </label>
                <Input
                  value={fallbackModel}
                  onChange={(e) => setFallbackModel(e.target.value)}
                  className="rounded-none font-mono text-xs"
                  placeholder="e.g. openai/gpt-4o"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Clock className="size-3 text-primary" />
                    Request Timeout (Failover trigger)
                  </label>
                  <span className="font-mono text-xs font-bold text-primary">
                    {timeoutMs.toLocaleString()} ms
                  </span>
                </div>
                <Slider
                  min={3000}
                  max={60000}
                  step={1000}
                  value={[timeoutMs]}
                  onValueChange={(val) => setTimeoutMs(val[0])}
                  className="py-2"
                />
                <p className="text-[10px] font-mono text-muted-foreground/60">
                  If any provider query exceeds this threshold, the request is aborted and automatically rotates to the next provider/model.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border/30">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Tier Override
                </label>
                <Select
                  value={tierOverride}
                  onValueChange={(val: "auto" | "free" | "paid") => setTierOverride(val)}
                >
                  <SelectTrigger className="rounded-none font-mono text-xs">
                    <SelectValue placeholder="Select tier override" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none font-mono text-xs">
                    <SelectItem value="auto">auto (Standard subscription check)</SelectItem>
                    <SelectItem value="free">free (Force all requests to free tier)</SelectItem>
                    <SelectItem value="paid">paid (Grant paid model access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                disabled={switchMutation.isPending}
                className="w-full rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-10 mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="size-3.5" />
                {switchMutation.isPending ? "Applying on the Fly…" : "Save & Apply on the Fly"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Live Playground / Testing Panel */}
        <Card className="rounded-none border-border/60 bg-card/40 backdrop-blur flex flex-col">
          <CardHeader className="border-b border-border/40 p-4">
            <CardTitle className="font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Play className="size-4 text-emerald-400" />
              Live Inference Playground
            </CardTitle>
            <CardDescription className="font-mono text-[10px] tracking-wider uppercase text-muted-foreground">
              Send test prompts to verify runtime responses, latency, and tokens
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Test Prompt
                </label>
                <Textarea
                  rows={3}
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  className="rounded-none font-mono text-xs resize-none"
                  placeholder="Type a test instruction…"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground block">
                  Model Override (Optional)
                </label>
                <Input
                  value={testModelOverride}
                  onChange={(e) => setTestModelOverride(e.target.value)}
                  className="rounded-none font-mono text-xs"
                  placeholder={`Leave blank to test active model (${defaultModel})`}
                />
              </div>

              <Button
                type="button"
                onClick={handleRunTest}
                disabled={testMutation.isPending}
                variant="outline"
                className="w-full rounded-none font-mono text-[10px] tracking-widest uppercase gap-2 h-9 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
              >
                <Zap className={cn("size-3.5", testMutation.isPending && "animate-spin")} />
                {testMutation.isPending ? "Generating Inference…" : "Send Test Prompt"}
              </Button>
            </div>

            {/* Test Output Box */}
            <div className="border border-border/50 bg-background/80 p-4 space-y-2 min-h-[160px] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Inference Output
                </span>
                {testResult && (
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold",
                      testResult.success ? "text-emerald-400" : "text-rose-400",
                    )}
                  >
                    ⏱️ {testResult.latencyMs} ms &bull; {testResult.modelUsed || "default"}
                  </span>
                )}
              </div>

              <div className="font-mono text-xs text-foreground/90 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                {testMutation.isPending ? (
                  <span className="text-muted-foreground animate-pulse">
                    Awaiting response from AI provider…
                  </span>
                ) : testResult ? (
                  testResult.success ? (
                    testResult.text
                  ) : (
                    <span className="text-rose-400 font-bold">Error: {testResult.error}</span>
                  )
                ) : (
                  <span className="text-muted-foreground/50">
                    Ready. Click &quot;Send Test Prompt&quot; to test provider inference.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

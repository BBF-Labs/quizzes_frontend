"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Link2, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, Reorder } from "framer-motion";

export interface ILinkContext {
  label: string;
  baseUrl: string;
  pathTemplate: string;
}

const LINK_VARS = [
  "/:contactId",
  "/:email",
  "/:unsubscribeToken",
  "/:universityId",
  "/:institutionId",
  "/:userId",
  "/:name",
];

function LinkItem({
  link,
  index,
  updateLink,
  removeLink,
  injectVar,
  disabled,
}: {
  link: ILinkContext;
  index: number;
  updateLink: (i: number, field: keyof ILinkContext, value: string) => void;
  removeLink: (i: number) => void;
  injectVar: (i: number, v: string) => void;
  disabled?: boolean;
}) {
  const [isEditingPath, setIsEditingPath] = React.useState<number>(-1);

  return (
    <Reorder.Item
      value={link}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      dragListener={!disabled}
      className="border border-border/40 bg-background/40 p-5 space-y-5 relative group"
    >
      <div className="flex items-start gap-5">
        {!disabled && (
          <div className="mt-7 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-primary transition-colors shrink-0">
            <GripVertical className="size-4" />
          </div>
        )}
        <div className="flex-1 space-y-5">
          {/* Header Style Label */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-border/30" />
            <div className="bg-secondary/40 border border-border/50 px-2.5 py-1">
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-primary/80">
                Link Node #{index + 1}
              </span>
            </div>
            <div className="h-px flex-1 bg-border/30" />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="ml-2 text-muted-foreground/40 hover:text-destructive transition-colors rounded-none"
                title="Remove Node"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/70">
                Display Label
              </label>
              <Input
                value={link.label}
                onChange={(e) => updateLink(index, "label", e.target.value)}
                disabled={disabled}
                className="rounded-none font-mono text-xs h-9 bg-background/50 focus:bg-background transition-colors"
                placeholder="View Dashboard"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/70">
                Base URL
              </label>
              <Input
                value={link.baseUrl}
                onChange={(e) => updateLink(index, "baseUrl", e.target.value)}
                disabled={disabled}
                className="rounded-none font-mono text-xs h-9 bg-background/50 focus:bg-background transition-colors"
                placeholder="https://app.qz.tech"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground/70 flex items-center justify-between">
              <span>Path Template</span>
              <span className="text-[8px] opacity-40 font-normal italic lowercase">
                Tap segments to edit
              </span>
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary", "bg-primary/5");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-primary/5",
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-primary/5",
                );
                const variable = e.dataTransfer.getData("variable");
                if (variable) injectVar(index, variable);
              }}
              className="flex items-center gap-1.5 flex-wrap font-mono text-xs bg-black/10 p-2 border border-border/20 min-h-11 transition-all duration-200"
            >
              <span className="text-muted-foreground/40 font-bold select-none">
                /
              </span>

              {link.pathTemplate
                .split("/")
                .filter(Boolean)
                .map((seg, sIdx, array) => (
                  <React.Fragment key={`${sIdx}-${seg}`}>
                    {isEditingPath === sIdx ? (
                      <Input
                        autoFocus
                        value={seg}
                        onChange={(e) => {
                          const segments = link.pathTemplate
                            .split("/")
                            .filter(Boolean);
                          segments[sIdx] = e.target.value;
                          updateLink(
                            index,
                            "pathTemplate",
                            "/" + segments.join("/"),
                          );
                        }}
                        onBlur={() => setIsEditingPath(-1 as any)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setIsEditingPath(-1 as any);
                          if (e.key === "Escape") setIsEditingPath(-1 as any);
                        }}
                        disabled={disabled}
                        className="h-7 py-0 px-2 min-w-20 w-auto inline-block rounded-none font-mono text-[11px] bg-background border-primary"
                      />
                    ) : (
                      <div className="relative group/seg inline-block">
                      <button
                        type="button"
                        onClick={() => !disabled && setIsEditingPath(sIdx)}
                        className={cn(
                          "px-2 py-1 border transition-all truncate max-w-[200px] flex items-center gap-1.5 pr-6 rounded-none",
                          seg.startsWith(":") 
                            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground font-bold shadow-[0_0_10px_rgba(0,110,255,0.05)]" 
                            : "border-border/60 bg-secondary/10 text-foreground/80 hover:border-primary/40 hover:bg-secondary/30"
                        )}
                      >
                        {seg.startsWith(":") && <span className="size-1 bg-primary rounded-none animate-pulse" />}
                        {seg}
                      </button>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const segments = link.pathTemplate.split('/').filter(Boolean);
                            segments.splice(sIdx, 1);
                            updateLink(index, "pathTemplate", "/" + segments.join("/"));
                          }}
                          className="absolute right-1 top-1/2 -translate-y-1/2 size-4 flex items-center justify-center text-muted-foreground/40 hover:text-destructive transition-colors rounded-none"
                        >
                          <X className="size-2.5" />
                        </button>
                      )}
                    </div>
                    )}
                    <span className="text-muted-foreground/40 font-bold select-none">
                      /
                    </span>
                  </React.Fragment>
                ))}

              {!disabled && (
                <button
                  type="button"
                  onClick={() => {
                    const segments = link.pathTemplate
                      .split("/")
                      .filter(Boolean);
                    segments.push("new-segment");
                    updateLink(index, "pathTemplate", "/" + segments.join("/"));
                    setIsEditingPath(segments.length - 1);
                  }}
                  className="size-7 flex items-center justify-center border border-dashed border-border/40 text-muted-foreground/40 hover:border-primary/60 hover:text-primary/60 transition-all hover:bg-primary/5"
                  title="Add Segment"
                >
                  <Plus className="size-3" />
                </button>
              )}
            </div>
          </div>

          {/* Var handles */}
          {!disabled && (
            <div className="flex items-center gap-2 flex-wrap bg-secondary/20 p-2 border border-border/20">
              <span className="text-[8px] font-mono uppercase text-muted-foreground/60 mr-1">
                Inject Variables:
              </span>
              {LINK_VARS.map((v) => (
                <button
                  key={v}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("variable", v);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => injectVar(index, v)}
                  className="text-[9px] font-mono bg-background border border-border hover:border-primary hover:text-primary px-1.5 py-0.5 transition-all cursor-move active:scale-95 shadow-xs"
                >
                  {v}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-[10px] font-mono text-muted-foreground/40 italic">
              Resolved:{" "}
              <span className="text-muted-foreground/60 truncate">
                {link.baseUrl}
                {link.pathTemplate}
              </span>
            </p>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="flex items-center gap-1.5 text-[10px] font-mono text-destructive hover:bg-destructive/10 px-2 py-1 transition-colors uppercase tracking-tighter"
              >
                <Trash2 className="size-3" /> Remove Node
              </button>
            )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return "https://qz.blabs.tech"; // Fallback for SSR
};

const LINK_TEMPLATES = (): ILinkContext[] => [
  {
    label: "View Dashboard",
    baseUrl: getBaseUrl(),
    pathTemplate: "/:contactId/dashboard",
  },
  {
    label: "Institution Portal",
    baseUrl: getBaseUrl(),
    pathTemplate: "/:universityId",
  },
  {
    label: "Course Details",
    baseUrl: getBaseUrl(),
    pathTemplate: "/courses/:contactId",
  },
  {
    label: "Unsubscribe",
    baseUrl: getBaseUrl(),
    pathTemplate: "/unsubscribe?token=:unsubscribeToken",
  },
];

interface LinkBuilderProps {
  links: ILinkContext[];
  onChange: (links: ILinkContext[]) => void;
  disabled?: boolean;
}

export function LinkBuilder({ links, onChange, disabled }: LinkBuilderProps) {
  const addLink = (template?: ILinkContext) => {
    onChange([
      ...links,
      template || { label: "", baseUrl: "https://", pathTemplate: "/" },
    ]);
  };

  const updateLink = (i: number, field: keyof ILinkContext, value: string) => {
    onChange(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  };

  const removeLink = (i: number) => {
    onChange(links.filter((_, idx) => idx !== i));
  };

  const injectVar = (i: number, v: string) => {
    const link = links[i];
    let path = link.pathTemplate;
    // Handle double slash if path ends with / and v starts with /
    if (path.endsWith("/") && v.startsWith("/")) {
      path = path.slice(0, -1);
    } else if (!path.endsWith("/") && !v.startsWith("/")) {
      path = path + "/";
    }
    updateLink(i, "pathTemplate", path + v);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="size-3.5 text-primary" />
          <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-muted-foreground">
            Advanced Link Builder
          </span>
        </div>
        {!disabled && (
          <Button
            type="button"
            onClick={() => addLink()}
            variant="outline"
            size="xs"
            className="rounded-none font-mono text-[10px] tracking-widest uppercase border-primary/40 text-primary bg-primary/5 hover:bg-primary hover:text-primary-foreground"
          >
            <Plus className="size-3" /> New Link
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Library */}
        {!disabled && (
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Template Library
              </p>
              <div className="space-y-2">
                {LINK_TEMPLATES().map((tmpl, idx) => (
                  <motion.div
                    key={`tmpl-${idx}`}
                    whileHover={{ x: 4 }}
                    onClick={() => addLink(tmpl)}
                    className="p-3 border border-border/40 bg-secondary/20 cursor-pointer hover:border-primary/50 transition-all group"
                  >
                    <p className="text-[10px] font-bold text-foreground group-hover:text-primary mb-1">
                      {tmpl.label}
                    </p>
                    <p className="text-[9px] font-mono text-muted-foreground/60 truncate">
                      {tmpl.baseUrl}
                      {tmpl.pathTemplate}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/20">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                Drag-and-Drop Active
              </p>
              <p className="text-[9px] font-mono text-muted-foreground/50 leading-relaxed">
                Reorder links to prioritize which context the AI sees first.
              </p>
            </div>
          </div>
        )}

        {/* Main: Active Links */}
        <div
          className={cn(
            "space-y-3",
            !disabled ? "lg:col-span-3" : "lg:col-span-4",
          )}
        >
          {links.length === 0 ? (
            <div className="h-full border border-dashed border-border/60 flex flex-col items-center justify-center p-12 text-center opacity-40">
              <Link2 className="size-8 mb-4 text-muted-foreground" />
              <p className="text-xs font-mono uppercase tracking-widest">
                No links active
              </p>
              <p className="text-[10px] font-mono mt-1 italic">
                Click a template or "New Link" to start
              </p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={links}
              onReorder={onChange}
              className="space-y-4"
            >
              {links.map((link, i) => (
                <LinkItem
                  key={`link-node-${i}`}
                  link={link}
                  index={i}
                  updateLink={updateLink}
                  removeLink={removeLink}
                  injectVar={injectVar}
                  disabled={disabled}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}

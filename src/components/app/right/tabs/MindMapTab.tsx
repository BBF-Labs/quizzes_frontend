"use client";

import { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import type { StudioMindMap, MindMapNode } from "@/types/session";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MindMapTabProps {
  mindMap: StudioMindMap | undefined;
}

// ─── Custom node ──────────────────────────────────────────────────────────────

function MindMapNodeComponent({
  data,
}: {
  data: { label: string; type: MindMapNode["type"] };
}) {
  const colorClass: Record<MindMapNode["type"], string> = {
    concept: "border-primary/60 bg-primary/10 text-primary",
    topic: "border-border/60 bg-card/60 text-foreground",
    detail: "border-border/30 bg-card/20 text-muted-foreground",
    question: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div
      className={cn(
        "px-2 py-1 border text-[10px] font-mono leading-tight max-w-30 text-center",
        colorClass[data.type] ?? colorClass.topic,
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="size-1.5! bg-border/60!"
      />
      {data.label}
      <Handle
        type="source"
        position={Position.Right}
        className="size-1.5! bg-border/60!"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNodeComponent,
};

// ─── Inner graph (requires ReactFlowProvider above) ───────────────────────────

function MindMapGraph({ mindMap }: { mindMap: StudioMindMap }) {
  const nodes: Node[] = useMemo(
    () =>
      mindMap.nodes.map((n) => ({
        id: n.id,
        type: "mindMapNode",
        position: n.position,
        data: { label: n.label, type: n.type },
      })),
    [mindMap.nodes],
  );

  const edges: Edge[] = useMemo(
    () =>
      mindMap.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        style: { stroke: "hsl(var(--border))", strokeWidth: 1 },
        labelStyle: { fontSize: 9, fontFamily: "monospace" },
      })),
    [mindMap.edges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      panOnScroll
      className="bg-transparent"
    >
      <Background color="hsl(var(--border))" gap={24} size={0.5} />
      <Controls
        showZoom
        showFitView
        showInteractive={false}
        className="[&>button]:bg-card/60 [&>button]:border-border/40 [&>button]:text-muted-foreground"
      />
    </ReactFlow>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MindMapTab({ mindMap }: MindMapTabProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground/50">
          Mind Map
        </span>
        {mindMap && (
          <span className="text-[9px] font-mono text-muted-foreground/40">
            {mindMap.nodes.length} nodes
          </span>
        )}
      </div>

      {!mindMap || mindMap.nodes.length === 0 ? (
        <p className="text-[10px] font-mono text-muted-foreground/40 text-center py-4">
          No mind map yet — Z will build one as you study
        </p>
      ) : (
        <div className="h-80 border border-border/30 bg-card/10">
          <ReactFlowProvider>
            <MindMapGraph mindMap={mindMap} />
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
}

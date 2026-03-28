"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  type Connection,
  Handle,
  Position,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import type { MindMapContent, MindMapNode, MindMapEdge } from "@/types/session";
import { nanoid } from "nanoid";
import { PlusIcon } from "lucide-react";
import dagre from "dagre";

// ─── Layout logic ─────────────────────────────────────────────────────────────

const nodeWidth = 220; // safe max-width for our nodes
const nodeHeight = 60;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "LR") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Increase ranksep (horizontal gap) to prevent squishing text, nodesep for vertical
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: "left" as Position,
      sourcePosition: "right" as Position,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// ─── Custom node ──────────────────────────────────────────────────────────────

function MindMapNodeComponent({
  id,
  data,
  selected,
}: {
  id: string;
  data: { label: string; type: MindMapNode["type"] };
  selected?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(data.label);
  const { setNodes, setEdges, getNode } = useReactFlow();

  const colorClass: Record<MindMapNode["type"], string> = {
    concept: "border-primary/60 bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.1)]",
    topic: "border-border/60 bg-card/60 text-foreground",
    detail: "border-border/30 bg-card/20 text-muted-foreground",
    question: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400",
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          n.data = { ...n.data, label: value };
        }
        return n;
      }),
    );
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const parentNode = getNode(id);
    if (!parentNode) return;
    
    const newNodeId = nanoid();
    const newNode: Node = {
      id: newNodeId,
      type: "mindMapNode",
      position: { x: parentNode.position.x + 250, y: parentNode.position.y + 50 },
      data: { label: "New Detail", type: "detail" },
    };
    
    const newEdge: Edge = {
      id: `${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "hsl(var(--primary) / 0.6)", strokeWidth: 2 },
      labelStyle: { fontSize: 10, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  };

  return (
    <div
      className={cn(
        "px-4 py-2 border text-[11px] font-mono leading-tight max-w-45 text-center transition-all duration-300 relative group",
        "rounded-(--radius)",
        colorClass[data.type] ?? colorClass.topic,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 10, height: 10, background: "hsl(var(--primary))", border: "2px solid hsl(var(--background))", left: -5 }}
      />
      {isEditing ? (
        <input
          autoFocus
          className="bg-transparent border-none outline-none text-center w-full font-mono text-[11px] text-inherit"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleBlur();
          }}
        />
      ) : (
        <div className="select-none pointer-events-none">{data.label}</div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 10, height: 10, background: "hsl(var(--primary))", border: "2px solid hsl(var(--background))", right: -5 }}
      />
      
      {/* Quick Add Button */}
      <button
        onClick={handleAddChild}
        className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground rounded-full p-1 shadow-md hover:scale-110 active:scale-95 z-10"
        title="Add Child"
      >
        <PlusIcon className="w-3 h-3" />
      </button>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNodeComponent,
};

// ─── Inner graph (requires ReactFlowProvider above) ───────────────────────────

function MindMapGraph({ content }: { content: MindMapContent }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Initialize state once when content first loaded or drastically changes (e.g. new generation)
  useEffect(() => {
    let initialNodes: Node[] = [];
    let initialEdges: Edge[] = [];
    
    if (content.nodes) {
      initialNodes = content.nodes.map((n: MindMapNode) => ({
        id: String(n.id),
        type: "mindMapNode",
        position: { x: 0, y: 0 },
        data: { label: String(n.label), type: n.type },
      } as Node));
    }
    
    if (content.edges) {
      initialEdges = content.edges.reduce((acc: Edge[], e: MindMapEdge) => {
        // Robust check for LLM graph hallucinations: resolve IDs if the LLM provided a label string instead of real ID
        let validSource = initialNodes.find(n => n.id === String(e.source))?.id;
        if (!validSource) validSource = initialNodes.find(n => n.data.label.toLowerCase() === String(e.source).toLowerCase())?.id;
        
        let validTarget = initialNodes.find(n => n.id === String(e.target))?.id;
        if (!validTarget) validTarget = initialNodes.find(n => n.data.label.toLowerCase() === String(e.target).toLowerCase())?.id;

        if (validSource && validTarget) {
          acc.push({
            id: e.id || `${validSource}-${validTarget}`,
            source: validSource,
            target: validTarget,
            label: e.label,
            type: "smoothstep",
            animated: true,
            className: "stroke-primary opacity-60",
            style: { strokeWidth: 2 },
            labelStyle: { fontSize: 10, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" },
          } as Edge);
        }
        return acc;
      }, []);
    }
    
    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [content, setNodes, setEdges]); // WARNING: Ensure `content` doesn't change reference on every parent render.

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ 
      ...params, 
      type: "smoothstep",
      animated: true, 
      style: { stroke: "hsl(var(--primary) / 0.6)", strokeWidth: 2 } 
    }, eds)),
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.3 }}
      nodesDraggable={true}
      nodesConnectable={true}
      elementsSelectable={true}
      panOnScroll
      className="bg-transparent"
    >
      <Background color="hsl(var(--border))" gap={20} size={0.5} style={{ opacity: 0.2 }} />
      <Controls
        showZoom
        showFitView
        showInteractive={true}
        className="[&>button]:bg-card/80 [&>button]:border-border/40 [&>button]:text-muted-foreground hover:[&>button]:text-primary transition-colors"
      />
    </ReactFlow>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MindMapVisualizer({ content }: { content: MindMapContent }) {
  if (!content || !content.nodes || content.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 font-mono text-xs uppercase tracking-widest bg-card/5 border border-dashed border-border/20">
        Empty Mind Map
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-125 border border-border/40 bg-card/20 relative overflow-hidden group">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest bg-background/80 px-2 py-0.5 rounded-sm border border-border/20 backdrop-blur-sm">
          Interactive Canvas Active — Double click nodes to edit, drag handles to connect
        </span>
      </div>
      <ReactFlowProvider>
        <MindMapGraph content={content} />
      </ReactFlowProvider>
    </div>
  );
}

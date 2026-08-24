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
import { Plus } from "lucide-react";
import dagre from "dagre";

// ─── Layout logic ─────────────────────────────────────────────────────────────

const nodeWidth = 240;
const nodeHeight = 64;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "LR",
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 140, nodesep: 60 });

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
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
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
    concept:
      "border-[#0C60FC] bg-blue-50/90 text-[#0C60FC] shadow-sm ring-2 ring-blue-500/20 font-extrabold",
    topic:
      "border-indigo-200/90 bg-indigo-50/80 text-indigo-900 font-bold shadow-2xs",
    detail:
      "border-slate-200 bg-white text-slate-800 font-semibold shadow-2xs hover:border-slate-300",
    question:
      "border-amber-300 bg-amber-50/90 text-amber-900 font-bold shadow-2xs",
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
      position: {
        x: parentNode.position.x + 280,
        y: parentNode.position.y + 60,
      },
      data: { label: "New Concept", type: "detail" },
    };

    const newEdge: Edge = {
      id: `${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
      type: "smoothstep",
      animated: true,
      style: { stroke: "#0C60FC", strokeWidth: 2 },
      labelStyle: {
        fontSize: 10,
        fontWeight: 600,
        fill: "#64748B",
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => [...eds, newEdge]);
  };

  return (
    <div
      className={cn(
        "px-4 py-2.5 border text-xs leading-relaxed max-w-55 text-center transition-all duration-200 relative group select-none",
        "rounded-2xl",
        colorClass[data.type] ?? colorClass.topic,
        selected && "ring-2 ring-[#0C60FC] ring-offset-2 ring-offset-white shadow-md",
      )}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 9,
          height: 9,
          background: "#0C60FC",
          border: "2px solid #FFFFFF",
          left: -5,
        }}
      />
      {isEditing ? (
        <input
          autoFocus
          className="bg-transparent border-none outline-none text-center w-full text-xs font-bold text-inherit"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleBlur();
          }}
        />
      ) : (
        <div className="select-none pointer-events-none line-clamp-3">
          {data.label}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 9,
          height: 9,
          background: "#0C60FC",
          border: "2px solid #FFFFFF",
          right: -5,
        }}
      />

      {/* Quick Add Button */}
      <button
        type="button"
        onClick={handleAddChild}
        className="absolute -right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0C60FC] text-white rounded-full p-1 shadow-md hover:scale-115 active:scale-95 z-10 cursor-pointer"
        title="Add connected node"
      >
        <Plus className="size-3 stroke-[2.5]" />
      </button>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  mindMapNode: MindMapNodeComponent,
};

// ─── Inner graph ──────────────────────────────────────────────────────────────

function MindMapGraph({ content }: { content: MindMapContent }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    let initialNodes: Node[] = [];
    let initialEdges: Edge[] = [];

    if (content.nodes) {
      initialNodes = content.nodes.map(
        (n: MindMapNode) =>
          ({
            id: String(n.id),
            type: "mindMapNode",
            position: { x: 0, y: 0 },
            data: { label: String(n.label), type: n.type },
          }) as Node,
      );
    }

    if (content.edges) {
      initialEdges = content.edges.reduce((acc: Edge[], e: MindMapEdge) => {
        let validSource = initialNodes.find(
          (n) => n.id === String(e.source),
        )?.id;
        if (!validSource)
          validSource = initialNodes.find(
            (n) =>
              n.data.label.toLowerCase() === String(e.source).toLowerCase(),
          )?.id;

        let validTarget = initialNodes.find(
          (n) => n.id === String(e.target),
        )?.id;
        if (!validTarget)
          validTarget = initialNodes.find(
            (n) =>
              n.data.label.toLowerCase() === String(e.target).toLowerCase(),
          )?.id;

        if (validSource && validTarget) {
          acc.push({
            id: e.id || `${validSource}-${validTarget}`,
            source: validSource,
            target: validTarget,
            label: e.label,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#0C60FC", strokeWidth: 2, opacity: 0.7 },
            labelStyle: {
              fontSize: 10,
              fontWeight: 600,
              fill: "#64748B",
            },
          } as Edge);
        }
        return acc;
      }, []);
    }

    if (initialNodes.length > 0) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [content, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#0C60FC", strokeWidth: 2, opacity: 0.7 },
          },
          eds,
        ),
      ),
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
      className="bg-[#F7F9FC]"
    >
      <Background
        color="#CBD5E1"
        gap={20}
        size={1}
        style={{ opacity: 0.4 }}
      />
      <Controls
        showZoom
        showFitView
        showInteractive={true}
        className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm [&>button]:rounded-xl [&>button]:border-none [&>button]:text-slate-600 hover:[&>button]:text-[#0C60FC] hover:[&>button]:bg-slate-50 transition-colors"
      />
    </ReactFlow>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MindMapVisualizer({ content }: { content: MindMapContent }) {
  if (!content || !content.nodes || content.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold text-xs uppercase tracking-wider bg-slate-50/50 border border-dashed border-slate-200 rounded-[28px]">
        Empty Mind Map
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-125 border border-slate-200/80 bg-white rounded-[28px] relative overflow-hidden group shadow-xs">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-bold text-slate-600 bg-white/90 px-3 py-1 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-sm">
          Interactive Canvas · Double-click to edit text · Drag handles to connect concepts
        </span>
      </div>
      <ReactFlowProvider>
        <MindMapGraph content={content} />
      </ReactFlowProvider>
    </div>
  );
}

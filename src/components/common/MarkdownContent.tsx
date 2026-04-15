"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import type { Components } from "react-markdown";

interface MarkdownContentProps {
  children: string;
  components?: Components;
}

/**
 * Shared markdown renderer with GFM, LaTeX (KaTeX), and raw HTML support.
 * Wrap with a prose/className div at the call site as needed.
 */
export function MarkdownContent({ children, components }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeRaw, rehypeKatex]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}

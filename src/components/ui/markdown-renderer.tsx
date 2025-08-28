import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-lg font-semibold text-foreground mb-2"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-base font-semibold text-foreground mb-2"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-sm font-semibold text-foreground mb-1"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p className="text-sm text-muted-foreground mb-2" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside text-sm text-muted-foreground mb-2"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside text-sm text-muted-foreground mb-2"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className="text-sm text-muted-foreground" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-muted-foreground" {...props} />
          ),
          code: ({ ...props }) => (
            <code
              className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-primary/20 pl-3 italic text-sm text-muted-foreground mb-2"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

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
    <div className={`prose prose-sm max-w-none prose-neutral dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => (
            <h1
              className="text-2xl font-black text-foreground mb-4 mt-6 first:mt-0 tracking-tight"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-xl font-bold text-foreground mb-3 mt-5 first:mt-0 tracking-tight"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-lg font-bold text-foreground mb-2 mt-4 first:mt-0"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p className="text-base leading-relaxed text-foreground/80 mb-4" {...props} />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-outside ml-4 text-base space-y-2 mb-4"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-outside ml-4 text-base space-y-2 mb-4"
              {...props}
            />
          ),
          li: ({ ...props }) => (
            <li className="pl-1 text-foreground/80" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-bold text-foreground" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-foreground/70" {...props} />
          ),
          code: ({ ...props }) => (
            <code
              className="bg-muted px-1.5 py-0.5 rounded text-[0.8em] font-mono text-foreground border border-border/50"
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-teal-500/40 pl-4 py-1 italic text-foreground/70 bg-teal-500/5 rounded-r mb-4"
              {...props}
            />
          ),
          a: ({ ...props }) => (
            <a 
              className="text-teal-600 dark:text-teal-400 font-medium underline underline-offset-4 hover:text-teal-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: () => <hr className="my-6 border-border/60" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

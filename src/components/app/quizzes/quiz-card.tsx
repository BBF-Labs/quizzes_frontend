"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PlayCircle, Trash2, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export interface QuizCardProps {
  id: string;
  title: string;
  description?: string;
  href: string;
  takeHref?: string;
  courseTitle?: string;
  courseCode?: string;
  questionCount: number;
  lectureCount?: number;
  passingScore?: number;
  averageScore?: number;
  tags?: string[];
  createdAt: string;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function QuizCard({
  id,
  title,
  description,
  href,
  takeHref,
  courseTitle,
  courseCode,
  questionCount,
  lectureCount,
  passingScore,
  averageScore,
  tags,
  createdAt,
  onDelete,
  isDeleting,
}: QuizCardProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.22 } },
      }}
      className="group relative border border-border/40 bg-card/30 hover:border-primary/40 hover:bg-primary/5 transition-all overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Delete button (optional) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete(id);
          }}
          disabled={isDeleting}
          className="absolute top-2 right-2 p-1 text-muted-foreground/30 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all disabled:opacity-20 z-10"
          aria-label="Delete quiz"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      <Link href={href} className="block p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono font-bold text-sm text-foreground line-clamp-2 pr-2">
            {title}
          </p>
          {takeHref ? (
            <Link
              href={takeHref}
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 mt-0.5 p-0.5 text-muted-foreground/40 hover:text-primary transition-colors"
              aria-label="Take quiz"
            >
              <PlayCircle className="size-3.5" />
            </Link>
          ) : (
            <span className="shrink-0 mt-0.5 p-0.5 text-muted-foreground/40 group-hover:text-primary transition-colors">
              <PlayCircle className="size-3.5" />
            </span>
          )}
        </div>

        {/* Description or Course metadata */}
        {description ? (
          <p className="mt-1 text-[10px] font-mono text-muted-foreground/60 line-clamp-2 min-h-4">
            {description}
          </p>
        ) : (
          <p className="mt-1 text-[10px] font-mono text-muted-foreground/60 min-h-4 truncate">
            {[courseTitle, courseCode].filter(Boolean).join(" · ") || "General"}
          </p>
        )}

        {/* Badges */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-border/40">
            {questionCount} Qs
          </Badge>
          {lectureCount !== undefined && (
            <Badge variant="outline" className="text-[9px] font-mono h-4 px-1.5 border-border/40">
              {lectureCount} lectures
            </Badge>
          )}
          {passingScore !== undefined && (
            <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1.5 bg-primary/10 text-primary border-primary/20">
              Pass {passingScore}%
            </Badge>
          )}
          {averageScore !== undefined && (
            <Badge variant="secondary" className="text-[9px] font-mono h-4 px-1.5 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              avg {Math.round(averageScore)}%
            </Badge>
          )}
        </div>

        {/* Tags (optional) */}
        {(tags?.length ?? 0) > 0 && (
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            <TagIcon className="size-2.5 text-muted-foreground/30 shrink-0" />
            {tags?.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[9px] font-mono text-muted-foreground/40">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-[9px] font-mono text-muted-foreground/40">
          {formatDate(createdAt)}
        </p>
      </Link>
    </motion.div>
  );
}

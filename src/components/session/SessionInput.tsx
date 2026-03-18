"use client";

import { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function SessionInput({
  onSend,
  disabled = false,
  placeholder = "Ask Z something…",
}: SessionInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-expand textarea
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <div className="border-t border-border/50 bg-background px-4 py-3">
      <div className="flex items-end gap-2 border border-border/60 bg-card/40 px-3 py-2 focus-within:border-primary/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/50",
            "focus:outline-none max-h-40 overflow-y-auto leading-relaxed",
            disabled && "cursor-not-allowed opacity-50",
          )}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={cn(
            "mb-0.5 flex size-7 shrink-0 items-center justify-center bg-primary text-primary-foreground transition-all",
            "hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Send message"
        >
          <ArrowUp className="size-3.5" />
        </button>
      </div>
      <p className="mt-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}

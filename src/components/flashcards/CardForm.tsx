import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CardForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial?: { front: string; back: string };
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [front, setFront] = useState(initial?.front ?? "");
  const [back, setBack] = useState(initial?.back ?? "");

  const valid = front.trim() && back.trim();

  return (
    <div className="border border-primary/30 bg-primary/5 p-3 flex flex-col gap-2">
      <Input
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="Front…"
        className="h-7 text-[11px] font-mono"
        autoFocus
      />
      <Input
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Back…"
        className="h-7 text-[11px] font-mono"
        onKeyDown={(e) => {
          if (e.key === "Enter" && valid) onSave(front, back);
        }}
      />
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[9px] font-mono"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-6 text-[9px] font-mono"
          disabled={!valid || loading}
          onClick={() => onSave(front, back)}
        >
          {loading ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

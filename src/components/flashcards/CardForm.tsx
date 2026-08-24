import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 sm:p-8 shadow-xl flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#0C60FC]">
          Edit Flashcard
        </span>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Front (Question)
        </label>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Enter question or prompt…"
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C60FC]/10 transition resize-none"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Back (Answer)
        </label>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Enter answer or explanation…"
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0C60FC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0C60FC]/10 transition resize-none"
        />
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="rounded-xl bg-slate-950 px-5 py-2 text-xs font-extrabold text-white hover:bg-[#0C60FC] transition-colors"
          disabled={!valid || loading}
          onClick={() => onSave(front, back)}
        >
          {loading ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}


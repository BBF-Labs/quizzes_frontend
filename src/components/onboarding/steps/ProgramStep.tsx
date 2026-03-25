"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ProgramStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

interface Program {
  _id: string;
  name: string;
  code?: string;
}

export default function ProgramStep({
  onComplete,
  initialData,
}: ProgramStepProps) {
  const universityId = (initialData?.universityId as string) || "";
  const initialProgram = initialData?.program as Program | undefined;
  const initialProgramName =
    initialProgram?.name ?? (initialData?.programName as string) ?? "";
  const initialProgramId =
    initialProgram?._id ?? (initialData?.programId as string) ?? "";

  const [inputValue, setInputValue] = useState(initialProgramName);
  const [selectedId, setSelectedId] = useState<string>(initialProgramId);
  const [showDropdown, setShowDropdown] = useState(false);

  const search = inputValue.trim();

  const { data: programs = [], isLoading } = useQuery<Program[]>({
    queryKey: ["programs", universityId, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "12",
        sortBy: "name",
        sortOrder: "asc",
      });
      if (search.trim().length >= 2) {
        params.set("search", search.trim());
      }
      const res = await api.get(`/institutions/programs?${params.toString()}`);
      return res.data.data.results || res.data.data || [];
    },
    enabled: !!universityId && search.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const isConfirmed = !!selectedId && !!inputValue;

  const handleSelect = (program: Program) => {
    setInputValue(program.name);
    setSelectedId(program._id);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (isConfirmed) {
      onComplete({
        programId: selectedId,
        programName: inputValue,
      });
    }
  };

  if (!universityId) {
    return (
      <div className="text-center py-10">
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          Select a university first to load available programs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.04em] uppercase leading-tight">
          What are you studying?
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Search for your degree program. We’ll use this to group you with your
          coursemates.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={
                isLoading ? "SEARCHING..." : "SEARCH YOUR PROGRAM..."
              }
              value={isLoading ? "" : inputValue}
              autoFocus
              disabled={isLoading}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onChange={(e) => {
                setInputValue(e.target.value);
                setSelectedId("");
                setShowDropdown(true);
              }}
              className={`w-full bg-transparent border-border/50 rounded-(--radius) uppercase font-mono text-xs placeholder:text-muted-foreground/40 h-14 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary tracking-wider ${
                isLoading
                  ? "animate-pulse border-primary/50"
                  : isConfirmed
                    ? "border-primary"
                    : ""
              }`}
            />

            {isLoading && (
              <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                <span className="text-[10px] font-mono tracking-[0.2em] text-primary animate-pulse">
                  SEARCHING...
                </span>
              </div>
            )}

            {showDropdown && !isLoading && programs.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-0.5 bg-background border border-border z-50 max-h-60 overflow-y-auto">
                {programs.map((program) => (
                  <div
                    key={program._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(program);
                    }}
                    className={`px-4 py-3 text-[10px] font-mono cursor-pointer border-b border-border/50 last:border-0 uppercase tracking-wider transition-colors ${
                      selectedId === program._id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <span className="font-bold truncate block">
                      {program.name}
                    </span>
                    {program.code && (
                      <span className="text-muted-foreground mt-1 block">
                        {program.code}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {showDropdown &&
              !isLoading &&
              search.length >= 2 &&
              programs.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-0.5 bg-background border border-border z-50 px-4 py-3">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    No results — try a shorter name.
                  </p>
                </div>
              )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isConfirmed}
            className="w-14 h-14 rounded-(--radius) bg-primary text-primary-foreground hover:bg-white hover:text-primary hover:ring-1 hover:ring-inset hover:ring-primary flex items-center justify-center transition-all duration-300 disabled:opacity-30 group cursor-pointer disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,110,255,0.2)]"
          >
            <ArrowRight className="w-6 h-6 stroke-[3px] transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>

        {isConfirmed && (
          <p className="text-[10px] font-mono text-primary uppercase tracking-widest">
            ✓ {inputValue} selected
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ArrowRight } from "lucide-react";

interface University {
  _id: string;
  name: string;
  acronym?: string;
  country?: string;
}

interface UniversityStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

export default function UniversityStep({
  onComplete,
  initialData,
}: UniversityStepProps) {
  const initialUni = initialData?.university as University | undefined;
  const initialUniversityName =
    initialUni?.name ?? (initialData?.universityName as string) ?? "";
  const initialUniversityId =
    initialUni?._id ?? (initialData?.universityId as string) ?? "";
  const [inputValue, setInputValue] = useState(initialUniversityName);
  const [selectedId, setSelectedId] = useState<string>(initialUniversityId);
  const [showDropdown, setShowDropdown] = useState(false);

  const search = inputValue.trim();

  const { data: universities = [], isFetching } = useQuery<University[]>({
    queryKey: ["universities", search],
    queryFn: async () => {
      if (search.length < 2) return [];
      const res = await api.get(
        `/institutions/universities?search=${search}&limit=10`,
      );
      return res.data.data.results || res.data.data || [];
    },
    enabled: search.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const isConfirmed = !!selectedId && !!inputValue;

  const handleSelect = (uni: University) => {
    setInputValue(uni.name);
    setSelectedId(uni._id);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (isConfirmed) {
      onComplete({ universityId: selectedId, universityName: inputValue });
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.04em] uppercase leading-tight">
          Where do you study?
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Select your university to get started. We use this to tailor your
          study materials.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={
                isFetching ? "SEARCHING..." : "SEARCH YOUR UNIVERSITY..."
              }
              value={isFetching ? "" : inputValue}
              autoFocus
              disabled={isFetching}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onChange={(e) => {
                setInputValue(e.target.value);
                setSelectedId("");
                setShowDropdown(true);
              }}
              className={`w-full bg-transparent border-border/50 rounded-(--radius) uppercase font-mono text-xs placeholder:text-muted-foreground/40 h-14 px-4 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary tracking-wider ${
                isFetching
                  ? "animate-pulse border-primary/50"
                  : isConfirmed
                    ? "border-primary"
                    : ""
              }`}
            />
            {isFetching && (
              <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                <span className="text-[10px] font-mono tracking-[0.2em] text-primary animate-pulse">
                  SEARCHING...
                </span>
              </div>
            )}
            {showDropdown && !isFetching && universities.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-0.5 bg-background border border-border z-50 max-h-48 overflow-y-auto">
                {universities.map((uni) => (
                  <div
                    key={uni._id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(uni);
                    }}
                    className={`px-4 py-3 text-[10px] font-mono cursor-pointer border-b border-border/50 last:border-0 uppercase tracking-wider transition-colors ${
                      selectedId === uni._id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    <span className="font-bold">{uni.name}</span>
                    {uni.country && (
                      <span className="ml-2 text-muted-foreground">
                        {uni.country}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showDropdown &&
              !isFetching &&
              search.length >= 2 &&
              universities.length === 0 && (
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

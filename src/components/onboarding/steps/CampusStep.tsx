import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Campus {
  _id: string;
  name: string;
  address?: string;
}

interface CampusStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

export default function CampusStep({
  onComplete,
  initialData,
}: CampusStepProps) {
  const universityId = initialData?.universityId as string;

  const { data: campuses = [], isLoading } = useQuery<Campus[]>({
    queryKey: ["campuses", universityId],
    queryFn: async () => {
      if (!universityId) return [];
      const res = await api.get(
        `/institutions/campuses?universityId=${universityId}`,
      );
      return res.data.data.results || res.data.data || [];
    },
    enabled: !!universityId,
  });

  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(
    (initialData?.campus as Campus) ||
      (initialData?.campusId
        ? {
            _id: initialData.campusId as string,
            name: (initialData?.campusName as string) || "",
          }
        : null),
  );

  const handleSubmit = () => {
    if (selectedCampus) {
      onComplete({
        campusId: selectedCampus._id,
        campusName: selectedCampus.name,
      });
    }
  };

  const handleSkip = () => {
    onComplete({ skipped: true });
  };

  if (!universityId) {
    return (
      <div className="text-left py-10">
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">
          Please select a university first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.04em] uppercase leading-tight">
          Where&apos;s your hub?
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Almost all unis have multiple locations. Let&apos;s find yours.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoading && (
              <div className="py-8 flex justify-center">
                <Loader2 className="size-6 animate-spin text-primary/40" />
              </div>
            )}

            {!isLoading &&
              campuses.length > 0 &&
              campuses.map((campus: Campus) => (
                <motion.div
                  key={campus._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  layout
                  className="w-full"
                >
                  <Card
                    onClick={() => setSelectedCampus(campus)}
                    className={`w-full rounded-none border-border p-4 cursor-pointer transition-all hover:border-primary/50 flex flex-row flex-nowrap items-center justify-between group text-left ${
                      selectedCampus?._id === campus._id
                        ? "bg-primary/5 border-primary shadow-[0_0_15px_rgba(var(--primary),0.05)]"
                        : "bg-card/50"
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div
                        className={`size-10 flex items-center justify-center border transition-colors ${
                          selectedCampus?._id === campus._id
                            ? "bg-primary border-primary"
                            : "bg-black/20 border-border group-hover:border-primary/30"
                        }`}
                      >
                        <MapPin
                          className={`size-5 ${selectedCampus?._id === campus._id ? "text-white" : "text-primary/60"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight uppercase truncate">
                          {campus.name}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest truncate">
                          {campus.address || "Main Site"}
                        </p>
                      </div>
                    </div>
                    <CheckCircle2
                      className={`size-5 shrink-0 ml-3 ${
                        selectedCampus?._id === campus._id
                          ? "text-primary opacity-100"
                          : "text-transparent opacity-0"
                      }`}
                    />
                  </Card>
                </motion.div>
              ))}

            {!isLoading && campuses.length === 0 && (
              <div className="py-10 flex flex-col items-center justify-center text-center opacity-70">
                <p className="text-xs font-mono uppercase tracking-widest mb-2 font-bold">
                  No sub-campuses listed.
                </p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground max-w-50">
                  Your university might only have one main location.
                </p>
                <Button
                  onClick={handleSkip}
                  variant="ghost"
                  className="mt-4 rounded-none text-[10px] font-mono uppercase tracking-widest"
                >
                  Skip this step
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!selectedCampus}
            className="w-full rounded-none font-mono text-xs tracking-[0.2em] uppercase h-12 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-all"
          >
            Continue
          </Button>
          <button
            onClick={handleSkip}
            className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors text-center py-2"
          >
            [ Skip for now ]
          </button>
        </div>
      </div>
    </div>
  );
}

import type { ComponentState } from "@/hooks/common/use-status";

interface StatusDotProps {
  state: ComponentState;
  className?: string;
}

/**
 * 10px colored dot used inside <ComponentStatusCard /> and <StatusBanner />.
 * Operational = solid emerald. Degraded/down = amber/rose with a soft pulse.
 */
export function StatusDot({ state, className = "" }: StatusDotProps) {
  const color =
    state === "operational"
      ? "bg-emerald-500"
      : state === "degraded"
        ? "bg-amber-500"
        : "bg-rose-500";
  const pulse = state !== "operational";

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${color} ${
        pulse ? "animate-pulse" : ""
      } ${className}`}
      aria-hidden="true"
    />
  );
}

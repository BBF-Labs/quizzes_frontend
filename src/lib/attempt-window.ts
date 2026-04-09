import { intervalToDuration } from "date-fns";

export const formatNextAttemptWindow = (nextAttemptAt: string): string | null => {
  const next = new Date(nextAttemptAt);
  if (Number.isNaN(next.getTime())) return null;

  const diffMs = next.getTime() - Date.now();
  if (diffMs <= 0) return "less than a minute";

  const duration = intervalToDuration({
    start: 0,
    end: diffMs,
  });
  const days = duration.days ?? 0;
  const hours = duration.hours ?? 0;
  const minutes = duration.minutes ?? 0;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatNextAttemptTime = (nextAttemptAt: string): string | null => {
  const next = new Date(nextAttemptAt);
  if (Number.isNaN(next.getTime())) return null;
  return next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};


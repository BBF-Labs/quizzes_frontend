/**
 * Frontend mirror of the backend `quizzes_backend/src/status/interfaces.ts`.
 * Kept in sync manually — there's no schema-typing boundary we can share
 * across the monorepo.
 */

export type ComponentState = "operational" | "degraded" | "down";
export type GlobalState = "operational" | "partial_outage" | "major_outage";

export interface ComponentStatus {
  id: "mongodb" | "redis" | "openrouter" | "api";
  label: string;
  state: ComponentState;
  latencyMs: number | null;
  message?: string;
  updatedAt: string;
}

export interface GlobalStatus {
  state: GlobalState;
  label: string;
  components: ComponentStatus[];
  generatedAt: string;
}

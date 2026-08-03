"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";

/**
 * Frontend mirror of the backend `quizzes_backend/src/status/interfaces.ts`
 * and `quizzes_backend/src/status/reports/interfaces.ts`. Kept in sync
 * manually — there's no schema-typing boundary we can share across the
 * monorepo.
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

export interface HistoryHour {
  hourStart: string;
  state: ComponentState;
  uptimePercent: number;
}

export interface ComponentHistory {
  id: "mongodb" | "redis" | "openrouter" | "api";
  label: string;
  hours: HistoryHour[];
  uptimePercent24h: number;
}

export interface StatusHistory {
  hours: number;
  slotCount: number;
  startedAt: string;
  endedAt: string;
  components: ComponentHistory[];
}

export type IncidentState = Exclude<ComponentState, "operational">;

export interface IncidentRun {
  state: IncidentState;
  startedAt: string;
  endedAt: string;
  hourCount: number;
  uptimePercent: number;
  isOngoing: boolean;
}

export interface ComponentIncidents {
  id: "mongodb" | "redis" | "openrouter" | "api";
  label: string;
  windowHours: number;
  hasActiveIncident: boolean;
  incidents: IncidentRun[];
}

export interface StatusIncidents {
  hours: number;
  startedAt: string;
  endedAt: string;
  components: ComponentIncidents[];
}

// ─── Community incident reports ────────────────────────────────────────────────

export type ReportSeverity = "slow" | "down";

export interface IncidentReportInput {
  componentId: "mongodb" | "redis" | "openrouter" | "api";
  severity: ReportSeverity;
  description: string;
  reporterName?: string;
  reporterEmail?: string;
}

export interface IncidentReport {
  id: string;
  componentId: "mongodb" | "redis" | "openrouter" | "api";
  componentLabel: string;
  severity: ReportSeverity;
  description: string;
  reporterName?: string;
  createdAt: string;
}

export interface IncidentReportList {
  reports: IncidentReport[];
  total: number;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Live status snapshot — refetches every 30s on the client so the page
 * reflects real-time probe results without a full page reload.
 *
 * Backend cache TTL is 10s, so 30s on the FE is comfortable (3 cache
 * hits per cycle) and keeps the polling light.
 */
export function useGlobalStatus() {
  return useQuery({
    queryKey: queryKeys.status.live(),
    queryFn: async () => {
      const res = await api.get<{ data: GlobalStatus }>("/status");
      return res.data.data;
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    staleTime: 15_000,
  });
}

/**
 * 24h status history — refetches every 60s. Hour buckets only change on the
 * hour boundary, so this can be quite lazy.
 */
export function useStatusHistory(hours = 24) {
  return useQuery({
    queryKey: queryKeys.status.history(hours),
    queryFn: async () => {
      const res = await api.get<{ data: StatusHistory }>(
        `/status/history?hours=${hours}`,
      );
      return res.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

/**
 * Compressed non-operational runs per component. Drives the "Past incidents"
 * collapsible feed on the status page.
 */
export function useStatusIncidents(hours = 24) {
  return useQuery({
    queryKey: queryKeys.status.incidents(hours),
    queryFn: async () => {
      const res = await api.get<{ data: StatusIncidents }>(
        `/status/incidents?hours=${hours}`,
      );
      return res.data.data;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

/**
 * Recent community reports. Drives the "What users are saying" panel on the
 * status page. 30s refresh — fresh enough to feel live, cheap enough that a
 * hot polling tab won't pound the backend.
 */
export function useIncidentReports(componentId?: string) {
  return useQuery({
    queryKey: queryKeys.status.reports(componentId),
    queryFn: async () => {
      const params: Record<string, string> = { limit: "50" };
      if (componentId) params.componentId = componentId;
      const res = await api.get<{ data: IncidentReportList }>("/status/reports", {
        params,
      });
      return res.data.data;
    },
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}

/**
 * Submit a public incident report. Invalidates `useIncidentReports` on success
 * so the new entry shows up immediately. Rate-limited 5/hour/IP server-side —
 * we surface the 429 in the toast.
 *
 * Invalidation is scoped to the reports subtree only — the live status,
 * history, and incident feeds don't depend on community reports, so we
 * don't want to spam-refetch them on every submit.
 */
export function useSubmitIncidentReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: IncidentReportInput): Promise<IncidentReport> => {
      const res = await api.post<{ data: IncidentReport }>(
        "/status/reports",
        input,
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the unfiltered list and the filtered list for the
      // component this report was about, so the new entry appears in:
      //   - the public "all reports" panel, and
      //   - any future per-service filter the user has open.
      queryClient.invalidateQueries({
        queryKey: queryKeys.status.reports(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.status.reports(variables.componentId),
      });
    },
  });
}

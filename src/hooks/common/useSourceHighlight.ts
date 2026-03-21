"use client";

import { useState, useCallback, useRef } from "react";
import type { ISourceCitation } from "@/types/session";

interface HighlightState {
  activeCitationId: string | null;
  highlightedExcerpt: string | undefined;
}

interface UseSourceHighlightReturn extends HighlightState {
  highlightCitation: (
    citationId: string,
    citations: ISourceCitation[],
    openLeftPanel: () => void,
  ) => void;
}

export function useSourceHighlight(): UseSourceHighlightReturn {
  const [state, setState] = useState<HighlightState>({
    activeCitationId: null,
    highlightedExcerpt: undefined,
  });

  // Keep a ref to the pending clear-timer so we can cancel it if
  // highlightCitation is called again before the 2 s window expires.
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const highlightCitation = useCallback(
    (
      citationId: string,
      citations: ISourceCitation[],
      openLeftPanel: () => void,
    ) => {
      const citation = citations.find((c) => c.id === citationId);
      if (!citation) return;

      // Cancel any pending auto-clear from a previous highlight
      if (clearTimerRef.current !== null) {
        clearTimeout(clearTimerRef.current);
      }

      setState({
        activeCitationId: citation.materialId,
        highlightedExcerpt: citation.excerpt,
      });

      // Ensure the left panel is open so the user sees the highlighted card
      openLeftPanel();

      // Auto-clear the highlight after 2 s
      clearTimerRef.current = setTimeout(() => {
        clearTimerRef.current = null;
        setState({ activeCitationId: null, highlightedExcerpt: undefined });
      }, 2000);
    },
    [],
  );

  return {
    activeCitationId: state.activeCitationId,
    highlightedExcerpt: state.highlightedExcerpt,
    highlightCitation,
  };
}

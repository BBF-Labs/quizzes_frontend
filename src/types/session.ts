export type ZSessionMessageType = "thinking" | "directive" | "message";

// ─── Directive Payload Types ──────────────────────────────────────────────────

export interface ZAskQuestionPayload {
  question: string;
  /** Multiple-choice options — absent for free-text questions */
  options?: string[];
}

export interface ZAskQuestionsPayload {
  questions: Array<{ id: string; question: string; options?: string[] }>;
}

export interface ZShowQuizPayload {
  quizId: string;
  questions: Array<{ id: string; question: string; options: string[] }>;
}

export interface ZShowPlanPayload {
  title?: string;
  steps: Array<{ id: string; title: string; description?: string }>;
}

export interface ZUnlockTopicPayload {
  topicTitle: string;
  topicId?: string;
  description?: string;
}

export interface ZShowResultPayload {
  score?: number;
  total?: number;
  message?: string;
  topicTitle?: string;
}

export interface ZShowSuggestionPayload {
  topicTitle?: string;
  description?: string;
  /** Pre-defined suggestion actions rendered as individual buttons */
  suggestions?: Array<{ actionType: string; label: string; description?: string }>;
  /** Single generic action (used when suggestions array is absent) */
  actionType?: string;
  label?: string;
}

export interface ZShowSummaryPayload {
  topicTitle?: string;
  content?: string;
  keyPoints?: string[];
}

/** Discriminated union — TypeScript narrows payload by type */
export type ZDirective =
  | { type: "ASK_QUESTION"; payload: ZAskQuestionPayload }
  | { type: "ASK_QUESTIONS"; payload: ZAskQuestionsPayload }
  | { type: "SHOW_QUIZ"; payload: ZShowQuizPayload }
  | { type: "SHOW_PLAN"; payload: ZShowPlanPayload }
  | { type: "UNLOCK_TOPIC"; payload: ZUnlockTopicPayload }
  | { type: "SHOW_RESULT"; payload: ZShowResultPayload }
  | { type: "SHOW_SUGGESTION"; payload: ZShowSuggestionPayload }
  | { type: "SHOW_SUMMARY"; payload: ZShowSummaryPayload };

// ─── Session Messages ─────────────────────────────────────────────────────────

export interface ZSessionMessage {
  /** Client-generated UUID used as React key */
  id: string;
  /** Server-assigned message ID — used for directive resolution tracking */
  messageId: string;
  type: ZSessionMessageType;
  content: string;
  timestamp: string;
  /** Present only when type === "directive" */
  directive?: ZDirective;
}

export type ConnectionType = "sse" | "polling" | "disconnected";

// ─── Agent Plan ───────────────────────────────────────────────────────────────

export interface ZAgentPlan {
  currentTaskId?: string;
  steps?: Array<{ id: string; title: string; status?: string }>;
}

// ─── Step API Input ───────────────────────────────────────────────────────────

export type StepInput =
  | { stepType: "answer_submitted"; payload: { taskId?: string; answers: string[] } }
  | { stepType: "approve_plan" }
  | { stepType: "message"; payload: { content: string } }
  | { stepType: "task_skipped"; payload: { taskId?: string } };

// ─── Session ──────────────────────────────────────────────────────────────────

export interface ZSession {
  id: string;
  title: string;
  status: "active" | "paused" | "completed";
  createdAt: string;
  updatedAt: string;
  userId?: string;
  subject?: string;
  messages?: ZSessionMessage[];
  agentPlan?: ZAgentPlan;
}

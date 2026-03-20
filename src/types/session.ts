export type ZSessionMessageType =
  | "text"
  | "thinking"
  | "directive"
  | "tool_call"
  | "tool_result";

// ─── Session Material (Sources Panel) ────────────────────────────────────────

export type SessionMaterialProcessingStatus = "pending" | "ready" | "failed";

export interface ISessionMaterial {
  id: string;
  filename: string;
  type: "pdf" | "docx" | "txt" | "md" | string;
  /** File size in bytes */
  size: number;
  processingStatus: SessionMaterialProcessingStatus;
  url?: string;
}

// ─── Source Citation ──────────────────────────────────────────────────────────

export interface ISourceCitation {
  id: string;
  materialId: string;
  excerpt: string;
  page?: number;
}

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
  suggestions?: Array<{
    actionType: string;
    label: string;
    description?: string;
  }>;
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
  role: "user" | "z" | "peer" | "system";
  type: ZSessionMessageType;
  content: string;
  timestamp: string;
  /** Present only when type === "directive" */
  directive?: ZDirective;
  /** Present only when type === "thinking" */
  thinking?: string;
  /** Present only when type === "tool_call" */
  toolCall?: { name: string; input: Record<string, unknown> };
  /** Present only when type === "tool_result" */
  toolResult?: unknown;
  mode?: string;
  isStreaming?: boolean;
}

export type ConnectionType = "sse" | "polling" | "disconnected";

// ─── Agent Task ───────────────────────────────────────────────────────────────

export interface SessionTask {
  taskId: string;
  type: string;
  label: string;
  questionCount?: number;
  status: "pending" | "active" | "completed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  directiveFired?: string;
  result?: {
    score?: number;
    passed?: boolean;
    questionsAsked?: number;
    questionsCorrect?: number;
    mode?: string;
  };
}

// ─── Agent Topic ───────────────────────────────────────────────────────────────

export interface AgentTopic {
  topicTitle: string;
  tasks: SessionTask[];
  status: "locked" | "active" | "completed";
  unlockedAt?: string;
}

// ─── Agent Lecture ────────────────────────────────────────────────────────────

export interface AgentLecture {
  materialId?: string;
  lectureTitle: string;
  lectureNumber?: string;
  topics: AgentTopic[];
}

// ─── Agent Plan ───────────────────────────────────────────────────────────────

export interface ZAgentPlan {
  goal: string;
  plan: AgentLecture[];
  totalTasks: number;
  completedTasks: number;
  estimatedMinutes: number;
  currentTaskId?: string;
  planApprovedByUser: boolean;
  planApprovedAt?: string;
  generatedAt: string;
}

// ─── Session Progress ─────────────────────────────────────────────────────────

export interface SessionProgress {
  [key: string]: unknown;
}

// ─── Session Gating Settings ──────────────────────────────────────────────────

export interface GatingSettings {
  enabled?: boolean;
  passingScore?: number;
  advanceOnPass?: boolean;
}

// ─── Session Summary ──────────────────────────────────────────────────────────

export interface SessionSummary {
  topicsCovered: string[];
  overallScore: number;
  strongAreas: string[];
  weakAreas: string[];
  recommendation: string;
  nextSessionFocus: string;
  encouragement: string;
  generatedAt: string;
}

// ─── Session Summary (for list view) ───────────────────────────────────────────

export interface SessionSummaryLight {
  overallScore: number;
  topicsCovered: string[];
}

// ─── Step API Input ───────────────────────────────────────────────────────────

export type StepInput =
  | {
      stepType: "answer_submitted";
      payload: { taskId?: string; answers: string[] };
    }
  | { stepType: "approve_plan" }
  | {
      stepType: "message";
      payload: { content: string; clientMessageId?: string };
    }
  | { stepType: "task_skipped"; payload: { taskId?: string } };

// ─── Create Session Input ─────────────────────────────────────────────────────

export interface CreateSessionInput {
  courseId?: string;
  mode: "ai" | "peer";
  gatingSettings?: GatingSettings;
}

// ─── Material ─────────────────────────────────────────────────────────────────

export interface ZMaterial {
  id: string;
  title: string;
  type: "pdf" | "doc" | "slides" | "text" | "img" | "link" | "data";
  url?: string;
  isProcessed: boolean;
}

// ─── Session (Full Shape) ─────────────────────────────────────────────────────

export interface ZSession {
  id: string;
  title?: string;
  name?: string;
  courseId?: string;
  mode: "ai" | "peer";
  zMessages: ZSessionMessage[];
  materials?: ZMaterial[];
  startedAt?: string;
  status: "active" | "completed";
}

export interface ZSessionSummary {
  _id: string;
  title?: string;
  courseId?: string;
  mode: "ai" | "peer";
  startedAt?: string;
  status: "active" | "completed";
  lastMessage?: string;
}

export type ZAppMessageType =
  | "text"
  | "directive"
  | "tool_call"
  | "tool_result";

// ─── App Material (Sources Panel) ───────────────────────────────────────────

export type AppMaterialProcessingStatus = "pending" | "ready" | "failed";

export interface IAppMaterial {
  id: string;
  filename: string;
  type: "pdf" | "docx" | "txt" | "md" | string;
  /** File size in bytes */
  size: number;
  processingStatus: AppMaterialProcessingStatus;
  url?: string;
}

export interface SessionHighlight {
  id: string;
  materialId: string;
  pageNumber: number;
  text: string;
  note?: string;
  color?: string;
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  createdAt: string;
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

// ─── App Messages ────────────────────────────────────────────────────────────

export interface ZAppMessage {
  /** Client-generated UUID used as React key */
  id: string;
  /** Server-assigned message ID — used for directive resolution tracking */
  messageId: string;
  role: "user" | "z" | "peer" | "system";
  authorId?: string;
  authorName?: string;
  type: ZAppMessageType;
  content: string;
  timestamp: string;
  /** Present only when type === "directive" */
  directive?: ZDirective;
  /** Present only when type === "tool_call" */
  toolCall?: { name: string; input: Record<string, unknown> };
  /** Present only when type === "tool_result" */
  toolResult?: unknown;
  mode?: string;
  isStreaming?: boolean;
  status?: "sending" | "sent" | "error";
  replyToMessageId?: string;
  rating?: 1 | -1;
}

export type ConnectionType = "socket" | "sse" | "polling" | "disconnected";

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

// ─── Create App Input ────────────────────────────────────────────────────────

export interface CreateAppInput {
  courseId?: string;
  mode: "free" | "structured";
  planningMode?: "planning" | "fast";
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

// ─── App (Full Shape) ──────────────────────────────────────────────────────────

export interface ZArtifact {
  artifactId: string;
  type: string;
  title: string;
  content: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface SessionCitation {
  citationId: string;
  marker: string;
  materialId: string;
  filename: string;
  excerpt: string;
  pageNumber?: number;
  messageId: string;
}

export interface ZApp {
  id: string;
  title?: string;
  name?: string;
  courseId?: string;
  mode: "free" | "structured";
  planningMode?: "planning" | "fast";
  zMessages: ZAppMessage[];
  citations?: SessionCitation[];
  materials?: ZMaterial[];
  highlights?: SessionHighlight[];
  artifacts?: ZArtifact[];
  sharedNotes?: SharedNote[];
  notes?: StudioNote[];
  studio?: {
    exportedFiles?: StudioExport[];
    notes?: StudioNote[];
    flashcards?: StudioFlashcard[];
    quizzes?: StudioQuiz[];
    mindMap?: StudioMindMap;
  };
  startedAt?: string;
  status: "active" | "completed";
}

export interface ZAppSummary {
  id: string;
  title?: string;
  name?: string;
  courseId?: string;
  mode: "free" | "structured";
  startedAt?: string;
  status: "active" | "completed";
  lastMessage?: string;
}

// ─── Studio Types ─────────────────────────────────────────────────────────────

export interface StudioNote {
  id: string;
  title: string;
  content: string;
  generatedByZ: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SharedNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface StudioFlashcard {
  id: string;
  front: string;
  back: string;
  savedToLibrary: boolean;
  createdAt: string;
}

export interface StudioFlashcardSet {
  id: string;
  title: string;
  flashcards: StudioFlashcard[];
  savedToLibrary: boolean;
  createdAt: string;
}

export interface StudioQuiz {
  id: string;
  title: string;
  topicTitle: string;
  questionCount: number;
  generatedAt: string;
  savedToBank: boolean;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: "concept" | "topic" | "detail" | "question";
  position: { x: number; y: number };
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface StudioMindMap {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  updatedAt: string;
}

export type MindMapContent = StudioMindMap;

export interface StudioExport {
  id: string;
  type: "markdown" | "pdf";
  url: string;
  createdAt: string;
}

// ─── Library: Flashcard Sets ──────────────────────────────────────────────────

export interface FlashcardSetSummary {
  id: string;
  title: string;
  courseTitle?: string;
  courseCode?: string;
  cardCount: number;
  tags?: string[];
  createdAt: string;
}

export interface LibraryFlashcard {
  id: string;
  front: string;
  back: string;
  createdAt: string;
}

export interface FlashcardSetDetail {
  id: string;
  title: string;
  courseTitle?: string;
  courseCode?: string;
  cards: LibraryFlashcard[];
  tags?: string[];
  createdAt: string;
}

// ─── Library: Quizzes ─────────────────────────────────────────────────────────

export interface QuizSummary {
  id: string;
  title: string;
  courseTitle?: string;
  courseCode?: string;
  questionCount: number;
  lectureCount?: number;
  averageScore?: number;
  totalAttempts?: number;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type:
    | "mcq"
    | "free_text"
    | "true_false"
    | "short_answer"
    | "fill_in"
    | "fill_in_blank"
    | "essay";
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  explanation?: string;
}

export interface QuizConfig {
  selectedKeys: string[]; // "lectureIdx:topicIdx"
  feedbackMode: "immediate" | "deferred";
  timerMode: "none" | "per_question" | "total";
  timerSeconds: number;
  autoNext: boolean;
  allowSkip: boolean;
  shuffle: boolean;
  passingScore: number;
  useZGrading: boolean;
  showHints: boolean;
}

export interface QuizTopic {
  topicTitle: string;
  /** Admin-facing quizzes use 'title' instead of 'topicTitle' */
  title?: string;
  questions?: QuizQuestion[];
  /** Number of questions — returned by GET (structure-only). Use instead of questions.length on config screen. */
  questionCount?: number;
  /** Admin-facing quizzes group questions by type */
  questionTypes?: { type: string; questions: QuizQuestion[] }[];
}

export interface QuizLecture {
  lectureTitle: string;
  /** Admin-facing quizzes use 'title' instead of 'lectureTitle' */
  title?: string;
  topics: QuizTopic[];
}

export interface QuizDetail {
  id: string;
  title: string;
  courseTitle?: string;
  courseCode?: string;
  lectures: QuizLecture[];
  createdAt: string;
  /** Remaining attempts in the current 12-hour window. null = unlimited (paid tier). */
  remainingAttempts: number | null;
}

// ─── System Quizzes (Qz-team created) ────────────────────────────────────────

export interface SystemQuizSummary {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  status: "draft" | "published" | "archived";
  isAvailable: boolean;
  passingScore: number;
  tags: string[];
  questionCount: number;
  lectureCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemQuizDetail {
  _id: string;
  title: string;
  description?: string;
  courseId: string;
  status: "draft" | "published" | "archived";
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  passingScore: number;
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showHints: boolean;
    showExplanations: boolean;
  };
  tags: string[];
  lectures: QuizLecture[];
  remainingAttempts: number | null;
  nextAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ZGradeResultItem {
  questionId: string;
  score: number;
  isCorrect: boolean;
  feedback: string;
}

export interface ZGradeResult {
  results: ZGradeResultItem[];
}

// ─── Library: Notes ───────────────────────────────────────────────────────────

export interface NoteSummary {
  id: string;
  sessionId: string;
  title: string;
  contentPreview: string;
  generatedByZ: boolean;
  sessionName?: string;
  courseTitle?: string;
  createdAt: string;
}

export interface NoteDetail {
  id: string;
  sessionId: string;
  sourceNoteId: string;
  title: string;
  content: string;
  generatedByZ: boolean;
  sessionName?: string;
  courseTitle?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Library: Materials ───────────────────────────────────────────────────────

export interface MaterialSummary {
  id: string;
  title: string;
  courseTitle?: string;
  courseCode?: string;
  mimeType: string;
  size: number;
  processingStatus: "pending" | "processing" | "ready" | "failed";
  flashcardsGenerated: boolean;
  quizGenerated: boolean;
  libraryStatus?: "pending_review" | "published" | "rejected" | null;
  isImported?: boolean;
  createdAt: string;
}

export interface MaterialDetail extends MaterialSummary {
  uploadId?: string;
  lectures?: Array<{
    title: string;
    topics: Array<{ title: string }>;
  }>;
}

// ─── Library: Mind Maps ──────────────────────────────────────────────────────

export interface MindMapSummary {
  id: string;
  sessionId: string;
  sessionName?: string;
  courseTitle?: string;
  courseCode?: string;
  title: string;
  nodeCount: number;
  edgeCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface MindMapDetail {
  id: string;
  title: string;
  sessionId?: string;
  mindMap: StudioMindMap;
  createdAt: string;
  updatedAt?: string;
}

// ─── Study Partner App (superset of ZApp with studio workspace) ──────────────

export interface IZStudyPartnerApp extends ZApp {
  notes?: StudioNote[];
  sharedNotes?: SharedNote[];
  flashcards?: StudioFlashcard[];
  quizzes?: StudioQuiz[];
  mindMap?: StudioMindMap;
  exports?: StudioExport[];
}

// ─── Aliases for backward compatibility ──────────────────────────────────────
export type ZSession = ZApp;
export type ZSessionSummary = ZAppSummary;
export type ZSessionMessage = ZAppMessage;
export type CreateSessionInput = CreateAppInput;

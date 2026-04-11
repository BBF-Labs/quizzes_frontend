// Socket.io event names used on the frontend
export const EVENT_NAMES = {
  // Campaign events
  CAMPAIGN_DISPATCH_STARTED: "campaign:dispatch:started",
  CAMPAIGN_DISPATCH_PROGRESS: "campaign:dispatch:progress",
  CAMPAIGN_DISPATCH_COMPLETED: "campaign:dispatch:completed",
  CAMPAIGN_DISPATCH_FAILED: "campaign:dispatch:failed",

  // AI quiz generation events
  QUIZ_GENERATION_STARTED: "quiz:generation:started",
  QUIZ_GENERATION_PLAN_READY: "quiz:generation:plan_ready",
  QUIZ_GENERATION_TASK_STARTED: "quiz:generation:task:started",
  QUIZ_GENERATION_TASK_DONE: "quiz:generation:task:done",
  QUIZ_GENERATION_TASK_FAILED: "quiz:generation:task:failed",
  QUIZ_GENERATION_COMPLETED: "quiz:generation:completed",
  QUIZ_GENERATION_FAILED: "quiz:generation:failed",

  // Public quiz generation events
  PUBLIC_QUIZ_GENERATION_STARTED: "public_quiz:generation:started",
  PUBLIC_QUIZ_GENERATION_PROGRESS: "public_quiz:generation:progress",
  PUBLIC_QUIZ_GENERATION_LECTURE_STARTED: "public_quiz:generation:lecture:started",
  PUBLIC_QUIZ_GENERATION_LECTURE_COMPLETED:
    "public_quiz:generation:lecture:completed",
  PUBLIC_QUIZ_GENERATION_LECTURE_FAILED: "public_quiz:generation:lecture:failed",
  PUBLIC_QUIZ_GENERATION_COMPLETED: "public_quiz:generation:completed",
  PUBLIC_QUIZ_GENERATION_FAILED: "public_quiz:generation:failed",
} as const;

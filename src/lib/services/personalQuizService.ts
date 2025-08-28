import Config from "@/config";
import {
  IPersonalQuiz,
  IPersonalQuizProgress,
  IQuizSession,
} from "../../interfaces";

const API_BASE = Config.API_URL;

class PersonalQuizService {
  private activeSessions: Map<string, IQuizSession> = new Map();
  private autoSaveIntervals: Map<string, NodeJS.Timeout> = new Map();
  private pendingProgress: Map<string, Partial<IPersonalQuizProgress>> =
    new Map();

  // Start a quiz session with auto-save
  startQuizSession(
    quizId: string,
    userId: string,
    autoSave: boolean = true,
    saveInterval: number = 30
  ): string {
    const sessionId = `session_${quizId}_${userId}_${Date.now()}`;

    const session: IQuizSession = {
      quizId,
      userId,
      sessionId,
      progress: {
        quizId,
        userId,
        currentQuestion: 0,
        answers: [],
        score: 0,
        timeSpent: 0,
        isCompleted: false,
        lastSaved: new Date(),
        startedAt: new Date(),
      },
      autoSave,
      saveInterval,
    };

    this.activeSessions.set(sessionId, session);

    if (autoSave) {
      this.startAutoSave(sessionId, saveInterval);
    }

    // Save initial session to cloud
    this.saveSessionToCloud(sessionId);

    return sessionId;
  }

  // Get current session
  getSession(sessionId: string): IQuizSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  // Update quiz progress with auto-save
  updateProgress(
    sessionId: string,
    updates: Partial<IPersonalQuizProgress>
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Update local session
    Object.assign(session.progress, updates);
    session.progress.lastSaved = new Date();

    // Queue for cloud sync
    this.queueProgressUpdate(sessionId, updates);

    // Auto-save immediately for critical updates
    if (updates.isCompleted || updates.currentQuestion !== undefined) {
      this.saveSessionToCloud(sessionId);
    }
  }

  // Answer a question
  answerQuestion(
    sessionId: string,
    questionIndex: number,
    answer: string
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Ensure answers array is long enough
    while (session.progress.answers.length <= questionIndex) {
      session.progress.answers.push("");
    }

    session.progress.answers[questionIndex] = answer;
    session.progress.currentQuestion = questionIndex + 1;
    session.progress.lastSaved = new Date();

    this.queueProgressUpdate(sessionId, {
      answers: session.progress.answers,
      currentQuestion: session.progress.currentQuestion,
    });
  }

  // Complete quiz
  completeQuiz(sessionId: string, finalScore: number, timeSpent: number): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.progress.isCompleted = true;
    session.progress.score = finalScore;
    session.progress.timeSpent = timeSpent;
    session.progress.completedAt = new Date();
    session.progress.lastSaved = new Date();

    // Save completion immediately
    this.saveSessionToCloud(sessionId);

    // Stop auto-save for completed quiz
    this.stopAutoSave(sessionId);
  }

  // Resume quiz from saved progress
  async resumeQuiz(sessionId: string): Promise<IPersonalQuizProgress | null> {
    try {
      // Try to load from cloud first
      const cloudProgress = await this.loadProgressFromCloud();
      if (cloudProgress) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
          session.progress = cloudProgress;
          return cloudProgress;
        }
      }
    } catch (error) {
      console.error("Failed to load progress from cloud:", error);
    }

    // Fallback to local session
    const session = this.activeSessions.get(sessionId);
    return session?.progress || null;
  }

  // Start auto-save for a session
  private startAutoSave(sessionId: string, intervalSeconds: number): void {
    if (this.autoSaveIntervals.has(sessionId)) {
      this.stopAutoSave(sessionId);
    }

    const interval = setInterval(() => {
      this.saveSessionToCloud(sessionId);
    }, intervalSeconds * 1000);

    this.autoSaveIntervals.set(sessionId, interval);
  }

  // Stop auto-save for a session
  stopAutoSave(sessionId: string): void {
    const interval = this.autoSaveIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.autoSaveIntervals.delete(sessionId);
    }
  }

  // Queue progress update for cloud sync
  private queueProgressUpdate(
    sessionId: string,
    updates: Partial<IPersonalQuizProgress>
  ): void {
    const existing = this.pendingProgress.get(sessionId) || {};
    this.pendingProgress.set(sessionId, { ...existing, ...updates });
  }

  // Save session to cloud
  private async saveSessionToCloud(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    try {
      // Save progress to cloud storage
      await this.saveProgressToCloud(session.progress);

      // Clear pending updates
      this.pendingProgress.delete(sessionId);

      console.log(`Session ${sessionId} saved to cloud`);
    } catch (error) {
      console.error(`Failed to save session ${sessionId} to cloud:`, error);
    }
  }

  // Load progress from cloud
  private async loadProgressFromCloud(): Promise<IPersonalQuizProgress | null> {
    try {
      // This would typically call your backend API to retrieve saved progress
      // For now, we'll return null and implement this when backend is ready
      return null;
    } catch (error) {
      console.error("Failed to load progress from cloud:", error);
      return null;
    }
  }

  // Save progress to cloud (backend API call)
  private async saveProgressToCloud(
    progress: IPersonalQuizProgress
  ): Promise<void> {
    // This would call your backend API to save progress
    // For now, we'll store in localStorage as a fallback
    if (typeof window !== "undefined") {
      const key = `quiz_progress_${progress.quizId}_${progress.userId}`;
      localStorage.setItem(key, JSON.stringify(progress));
    }
  }

  // Generate personal quiz
  async generatePersonalQuiz(
    materialIds: string[],
    quizData: {
      title: string;
      description?: string;
      courseId: string;
      questionCount: number;
      difficulty: "easy" | "medium" | "hard";
      estimatedDuration: number;
      tags: string[];
    }
  ): Promise<IPersonalQuiz> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE}/personal-quizzes/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...quizData,
        materialIds,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate personal quiz");
    }

    const data = await response.json();
    return data.quiz;
  }

  // Get user's personal quizzes
  async getUserPersonalQuizzes(courseId?: string): Promise<IPersonalQuiz[]> {
    const token = this.getAuthToken();
    const params = new URLSearchParams();
    if (courseId) params.append("courseId", courseId);

    const response = await fetch(`${API_BASE}/personal-quizzes?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch personal quizzes");
    }

    const data = await response.json();
    return data.quizzes;
  }

  // Get personal quiz by ID
  async getPersonalQuizById(id: string): Promise<IPersonalQuiz> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE}/personal-quizzes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch personal quiz");
    }

    const data = await response.json();
    return data.quiz;
  }

  // Update personal quiz
  async updatePersonalQuiz(
    id: string,
    updates: Partial<IPersonalQuiz>
  ): Promise<IPersonalQuiz> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE}/personal-quizzes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to update personal quiz");
    }

    const data = await response.json();
    return data.quiz;
  }

  // Share personal quiz
  async sharePersonalQuiz(id: string): Promise<{ shareUrl: string }> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE}/personal-quizzes/${id}/share`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to share personal quiz");
    }

    const data = await response.json();
    return data;
  }

  // Delete personal quiz
  async deletePersonalQuiz(id: string): Promise<void> {
    const token = this.getAuthToken();
    const response = await fetch(`${API_BASE}/personal-quizzes/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete personal quiz");
    }
  }

  // Get shared quiz by token
  async getSharedQuizByToken(token: string): Promise<IPersonalQuiz> {
    const response = await fetch(
      `${API_BASE}/personal-quizzes/shared/${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch shared quiz");
    }

    const data = await response.json();
    return data.quiz;
  }

  // End quiz session
  endQuizSession(sessionId: string): void {
    this.stopAutoSave(sessionId);
    this.activeSessions.delete(sessionId);
    this.pendingProgress.delete(sessionId);
  }

  // Get all active sessions
  getActiveSessions(): IQuizSession[] {
    return Array.from(this.activeSessions.values());
  }

  // Force save all pending progress
  async forceSaveAll(): Promise<void> {
    const sessionIds = Array.from(this.activeSessions.keys());
    await Promise.all(sessionIds.map((id) => this.saveSessionToCloud(id)));
  }

  private getAuthToken(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  }
}

export const personalQuizService = new PersonalQuizService();

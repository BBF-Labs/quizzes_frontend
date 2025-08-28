import {
  IFlashcard,
  IFlashcardStats,
  IFlashcardFilters,
} from "../../interfaces";

import Config from "@/config";
import axios from "axios";

class FlashcardService {
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private pendingChanges: Map<string, Partial<IFlashcard>> = new Map();
  private lastSyncTime: Date = new Date();
  private updateTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEBOUNCE_DELAY = 1000; // 1 second debounce

  // Start auto-save for flashcards
  startAutoSave(intervalMs: number = 30000, accessToken: string) {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = setInterval(() => {
      this.syncPendingChanges(accessToken);
    }, intervalMs);
  }

  // Stop auto-save
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }

    // Clear all pending timeouts and changes
    this.clearAllPending();
  }

  // Queue a change for auto-save with debouncing
  queueChange(flashcardId: string, changes: Partial<IFlashcard>) {
    // Clear any existing timeout for this flashcard
    const existingTimeout = this.updateTimeouts.get(flashcardId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set a new timeout to queue the change after debounce delay
    const timeoutId = setTimeout(() => {
      const existing = this.pendingChanges.get(flashcardId);

      // Merge changes intelligently to prevent conflicts
      if (existing) {
        // For numeric fields like reviewCount, use the latest value
        // For other fields, merge them
        const mergedChanges: Partial<IFlashcard> = { ...existing };

        // Handle specific fields that should use latest values
        if (changes.reviewCount !== undefined) {
          mergedChanges.reviewCount = changes.reviewCount;
        }
        if (changes.masteryLevel !== undefined) {
          mergedChanges.masteryLevel = changes.masteryLevel;
        }
        if (changes.lastReviewed !== undefined) {
          mergedChanges.lastReviewed = changes.lastReviewed;
        }
        if (changes.tags !== undefined) {
          mergedChanges.tags = changes.tags;
        }
        if (changes.difficulty !== undefined) {
          mergedChanges.difficulty = changes.difficulty;
        }
        if (changes.isPublic !== undefined) {
          mergedChanges.isPublic = changes.isPublic;
        }

        this.pendingChanges.set(flashcardId, mergedChanges);
      } else {
        this.pendingChanges.set(flashcardId, changes);
      }

      // Clear the timeout reference
      this.updateTimeouts.delete(flashcardId);
    }, this.DEBOUNCE_DELAY);

    this.updateTimeouts.set(flashcardId, timeoutId);
  }

  // Sync pending changes to cloud
  private async syncPendingChanges(accessToken: string) {
    if (this.pendingChanges.size === 0) return;

    const changes = Array.from(this.pendingChanges.entries());
    try {
      this.pendingChanges.clear();

      // Batch update flashcards
      await Promise.all(
        changes.map(([id, changeData]) =>
          this.updateFlashcard(id, changeData, accessToken)
        )
      );

      this.lastSyncTime = new Date();
      console.log(`Synced ${changes.length} flashcard changes to cloud`);
    } catch (error) {
      console.error("Failed to sync flashcard changes:", error);
      // Re-queue failed changes
      changes.forEach(([id, changeData]) => {
        this.pendingChanges.set(id, changeData);
      });
    }
  }

  // Generate flashcards from material
  async generateFlashcards(
    materialId: string,
    count: number = 10,
    accessToken: string
  ): Promise<IFlashcard[]> {
    const response = await axios.post(
      `${Config.API_URL}/flashcards/generate`,
      { materialId, count },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data.flashcards;
  }

  // Get user's flashcards
  async getUserFlashcards(
    accessToken: string,
    courseId?: string,
    materialId?: string
  ): Promise<IFlashcard[]> {
    const params: any = {};
    if (courseId) params.courseId = courseId;
    if (materialId) params.materialId = materialId;

    const response = await axios.get(`${Config.API_URL}/flashcards`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params,
    });

    return response.data.flashcards;
  }

  // Get flashcards by course with filters
  async getFlashcardsByCourse(
    courseId: string,
    accessToken: string,
    filters?: IFlashcardFilters
  ): Promise<IFlashcard[]> {
    const params: any = {};

    if (filters?.difficulty) params.difficulty = filters.difficulty;
    if (filters?.tags) params.tags = JSON.stringify(filters.tags);
    if (filters?.masteryLevel)
      params.masteryLevel = JSON.stringify(filters.masteryLevel);
    if (filters?.lastReviewed)
      params.lastReviewed = JSON.stringify(filters.lastReviewed);

    const response = await axios.get(
      `${Config.API_URL}/flashcards/course/${courseId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      }
    );

    return response.data.flashcards;
  }

  // Update flashcard (with cloud sync)
  async updateFlashcard(
    id: string,
    updates: Partial<IFlashcard>,
    accessToken: string
  ): Promise<IFlashcard> {
    try {
      console.log(`Updating flashcard ${id} with:`, updates);
      const response = await axios.put(
        `${Config.API_URL}/flashcards/${id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(`Flashcard ${id} updated successfully`);
      return response.data.flashcard;
    } catch (error: any) {
      console.error(
        `Failed to update flashcard ${id}:`,
        error.response?.data || error.message
      );

      // Check for MongoDB conflict error and retry once
      if (
        error.response?.data?.message?.includes("conflict") ||
        error.code === 40
      ) {
        console.log(
          `MongoDB conflict detected for flashcard ${id}, retrying after clearing pending changes...`
        );

        // Clear pending changes and wait a bit
        this.clearAllPending();
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Retry the update
        try {
          const retryResponse = await axios.put(
            `${Config.API_URL}/flashcards/${id}`,
            updates,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          console.log(`Flashcard ${id} updated successfully on retry`);
          return retryResponse.data.flashcard;
        } catch (retryError: any) {
          console.error(
            `Retry also failed for flashcard ${id}:`,
            retryError.response?.data || retryError.message
          );
          throw retryError;
        }
      }

      throw error;
    }
  }

  // Update flashcard with auto-save
  async updateFlashcardWithAutoSave(
    id: string,
    updates: Partial<IFlashcard>,
    accessToken: string
  ): Promise<void> {
    // Update locally first
    this.queueChange(id, updates);

    // Only update immediately for mastery level changes (not reviewCount to avoid conflicts)
    if (updates.masteryLevel !== undefined) {
      try {
        await this.updateFlashcard(
          id,
          { masteryLevel: updates.masteryLevel },
          accessToken
        );
      } catch (error) {
        console.error(
          "Immediate update failed, will retry with auto-save:",
          error
        );
      }
    }
  }

  // Get flashcard statistics
  async getFlashcardStats(accessToken: string): Promise<IFlashcardStats> {
    const response = await axios.get(`${Config.API_URL}/flashcards/stats`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data.stats;
  }

  // Share flashcard
  async shareFlashcard(
    id: string,
    accessToken: string
  ): Promise<{ shareUrl: string }> {
    const response = await axios.post(
      `${Config.API_URL}/flashcards/${id}/share`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return response.data;
  }

  // Delete flashcard
  async deleteFlashcard(id: string, accessToken: string): Promise<void> {
    await axios.delete(`${Config.API_URL}/flashcards/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Remove from pending changes
    this.pendingChanges.delete(id);
  }

  // Get shared flashcard (no auth required)
  async getSharedFlashcard(id: string): Promise<IFlashcard> {
    const response = await axios.get(
      `${Config.API_URL}/flashcards/shared/${id}`
    );
    return response.data.flashcard;
  }

  // Force sync all pending changes
  async forceSync(accessToken: string): Promise<void> {
    await this.syncPendingChanges(accessToken);
  }

  // Get sync status
  getSyncStatus() {
    return {
      pendingChanges: this.pendingChanges.size,
      lastSyncTime: this.lastSyncTime,
      isAutoSaveActive: !!this.autoSaveInterval,
    };
  }

  // Clear all pending changes and timeouts (for debugging/cleanup)
  clearAllPending() {
    this.pendingChanges.clear();
    this.updateTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.updateTimeouts.clear();
    console.log("All pending flashcard changes and timeouts cleared");
  }
}

export const flashcardService = new FlashcardService();

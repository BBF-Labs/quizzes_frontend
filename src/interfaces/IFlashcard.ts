export interface IFlashcard {
  _id: string;
  courseId: string;
  materialId: string;
  front: string;
  back: string;
  lectureNumber: string;
  createdBy: string;
  isPublic: boolean;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  lastReviewed?: Date;
  reviewCount: number;
  masteryLevel: number;
}

export interface IFlashcardStats {
  totalFlashcards: number;
  totalReviews: number;
  averageMasteryLevel: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  recentActivity: Date[];
}

export interface IFlashcardFilters {
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  masteryLevel?: {
    min: number;
    max: number;
  };
  lastReviewed?: {
    days: number;
  };
}

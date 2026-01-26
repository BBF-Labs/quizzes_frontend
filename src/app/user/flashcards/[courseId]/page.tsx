"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Brain,
  Zap,
  BookOpen,
  Cloud,
  CloudOff,
  RefreshCw,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { FloatingAIWidget } from "../../../../components/ui/floating-ai-widget";
import { FlashcardCard } from "../../../../components/FlashcardCard";

import { IFlashcard } from "../../../../interfaces";
import { useAuth } from "@/context";
import axios from "axios";
import Config from "@/config";

interface Course {
  _id: string;
  code: string;
  title: string;
  about: string;
}

export default function CourseFlashcardsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const { credentials } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sync states
  const [syncStatus, setSyncStatus] = useState({
    pendingChanges: 0,
    lastSyncTime: new Date(),
    isAutoSaveActive: true,
  });

  // Load course and flashcards
  useEffect(() => {
    loadCourseAndFlashcards();
    const cleanup = startAutoSave();

    return cleanup;
  }, [courseId]);

  const loadCourseAndFlashcards = async () => {
    try {
      setLoading(true);

      // Load flashcards for this specific course directly from backend
      const response = await axios.get(
        `${Config.API_URL}/flashcards/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      const courseFlashcards = response.data.flashcards;
      setFlashcards(courseFlashcards);

      // Load course info from the first flashcard's courseId
      if (courseFlashcards.length > 0) {
        const firstCard = courseFlashcards[0];
        if (firstCard.courseId) {
          const courseData = firstCard.courseId as any;
          setCourse({
            _id: courseData._id,
            code: courseData.code,
            title: courseData.title,
            about: `Course materials for ${courseData.code}: ${courseData.title}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to load course flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const startAutoSave = () => {
    // Set up auto-save every 30 seconds
    const autoSaveInterval = setInterval(async () => {
      await syncFlashcards();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(autoSaveInterval);
  };

  const handleFlashcardDelete = async (id: string) => {
    try {
      // Delete from backend first
      await axios.delete(`${Config.API_URL}/flashcards/${id}`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      // Update local state
      setFlashcards((prev) => prev.filter((card) => card._id !== id));
    } catch (error) {
      console.error("Failed to delete flashcard:", error);
      // Refresh from server on failure
      loadCourseAndFlashcards();
    }
  };

  const handleFlashcardUpdate = async (updated: IFlashcard) => {
    try {
      // Sync to backend first
      const response = await axios.put(
        `${Config.API_URL}/flashcards/${updated._id}`,
        updated,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      // Update local state with the response from backend (ensures consistency)
      const backendUpdatedFlashcard = response.data.flashcard;
      setFlashcards((prev) =>
        prev.map((card) =>
          card._id === updated._id ? backendUpdatedFlashcard : card
        )
      );

      // Force a refresh from the backend to ensure we have the latest data
      await syncFlashcards();

      // Update sync status
      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: Math.max(0, prev.pendingChanges - 1),
      }));
    } catch (error) {
      console.error("Frontend: Failed to sync flashcard update:", error);
      // Increment pending changes on failure
      setSyncStatus((prev) => ({
        ...prev,
        pendingChanges: prev.pendingChanges + 1,
      }));
    }
  };

  const syncFlashcards = async () => {
    try {
      // Get all flashcards that need syncing
      const response = await axios.get(
        `${Config.API_URL}/flashcards/course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      const serverFlashcards = response.data.flashcards;
      setFlashcards(serverFlashcards);

      // Update sync status
      setSyncStatus((prev) => ({
        ...prev,
        lastSyncTime: new Date(),
        pendingChanges: 0,
      }));
    } catch (error) {
      console.error("Failed to sync flashcards:", error);
    }
  };

  const nextFlashcard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const previousFlashcard = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const goToFlashcard = (index: number) => {
    setCurrentIndex(index);
  };

  const forceSync = async () => {
    try {
      await syncFlashcards();
    } catch (error) {
      console.error("Failed to force sync:", error);
    }
  };

  const getSyncStatusColor = () => {
    if (syncStatus.pendingChanges > 0) return "text-amber-600";
    return "text-emerald-600";
  };

  const getSyncStatusIcon = () => {
    if (syncStatus.pendingChanges > 0) return <CloudOff className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            Loading course flashcards...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Course not found
          </h2>
          <Button onClick={() => router.push("/user/flashcards")}>
            Back to Flashcards
          </Button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
          <div className="text-center py-12">
            <div className="relative mb-6">
              <Brain className="w-20 h-20 text-muted-foreground mx-auto" />
              <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-20" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              No flashcards for this course yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by generating flashcards from your course materials.
            </p>
            <Button
              onClick={() => router.push("/user/flashcards")}
              className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Flashcards
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="ghost"
                onClick={() => router.push("/user/flashcards")}
                className="mb-4 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Flashcards
              </Button>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-teal-500">
                  {course.code}: {course.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sync Status */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                {getSyncStatusIcon()}
                <span className={`text-sm font-medium ${getSyncStatusColor()}`}>
                  {syncStatus.pendingChanges > 0
                    ? `${syncStatus.pendingChanges} pending`
                    : "Synced"}
                </span>
              </div>

              <Button
                onClick={forceSync}
                variant="outline"
                size="sm"
                className="border-border hover:bg-muted"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    syncStatus.pendingChanges > 0 ? "animate-spin" : ""
                  }`}
                />
                Sync
              </Button>
            </div>
          </div>
        </div>

        {/* Flashcard Carousel */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Flashcard {currentIndex + 1} of {flashcards.length} for{" "}
              {course.code}
            </h2>
          </div>

          {/* Flashcard Card with Side Navigation */}
          <div className="flex items-center justify-center gap-6 mb-8">
            {/* Left Navigation Button */}
            <Button
              onClick={previousFlashcard}
              variant="outline"
              size="lg"
              disabled={flashcards.length <= 1}
              className="border-border hover:bg-muted rounded-full w-14 h-14 p-0 shadow-lg"
            >
              <ChevronLeft className="w-7 h-7" />
            </Button>

            {/* Flashcard Card */}
            <div className="w-full max-w-2xl">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                }}
              >
                <FlashcardCard
                  flashcard={flashcards[currentIndex]}
                  onDelete={handleFlashcardDelete}
                  onUpdate={(updated) => handleFlashcardUpdate(updated as any)}
                  showActions={false}
                />
              </motion.div>
            </div>

            {/* Right Navigation Button */}
            <Button
              onClick={nextFlashcard}
              variant="outline"
              size="lg"
              disabled={flashcards.length <= 1}
              className="border-border hover:bg-muted rounded-full w-14 h-14 p-0 shadow-lg"
            >
              <ChevronRight className="w-7 h-7" />
            </Button>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {flashcards.map((_, index) => (
              <button
                key={index}
                onClick={() => goToFlashcard(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? "bg-primary scale-125"
                    : "bg-muted hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* AI Assistant Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              AI Learning Assistant
            </h2>
            <p className="text-muted-foreground">
              Use the floating AI widget in the bottom-right corner to ask
              questions about your flashcards
            </p>
          </div>
        </div>
      </div>

      {/* Floating AI Widget */}
      <FloatingAIWidget
        contextId={flashcards[currentIndex]?._id}
        contextType="flashcard"
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Filter,
  BookOpen,
  Star,
  TrendingUp,
  Cloud,
  CloudOff,
  RefreshCw,
  Upload,
  FileText,
  CheckCircle,
  Brain,
  Target,
  Zap,
  ChevronRight,
  Loader,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { flashcardService } from "../../../lib/services/flashcardService";
import { IFlashcardStats } from "../../../interfaces";

// Extended IFlashcard interface to handle nested courseId from API
interface IFlashcard {
  _id: string;
  courseId: string | { _id: string; code: string; title: string };
  materialId: string | { _id: string; title: string; questionRefType: string };
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
  createdAt: string;
  updatedAt: string;
}
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import { getAllCourses } from "@/controllers";
import { showToast } from "@/components";
import axios, { AxiosError } from "axios";
import Config from "@/config";

interface Material {
  _id: string;
  title: string;
  url: string;
  type: "pdf" | "doc" | "slides" | "text" | "img" | "link" | "data";
  questionRefType: string;
  isProcessed: boolean;
  uploadedBy:
    | string
    | {
        _id: string;
        name: string;
        username: string;
        email: string;
        role: string;
      };
  courseId:
    | string
    | {
        _id: string;
        code: string;
        title: string;
        about: string;
        creditHours: number;
        year: number;
        semester: number;
      };
  createdAt: string;
  updatedAt: string;
}

interface Course {
  _id: string;
  code: string;
  title: string;
  about: string;
  creditHours: number;
  year: number;
  semester: number;
  approvedQuestionsCount: number;
  isDeleted: boolean;
  students: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CourseGroup {
  course: Course;
  flashcards: IFlashcard[];
  stats: {
    totalCards: number;
    mastered: number;
    needReview: number;
    averageMastery: number;
  };
}

export default function FlashcardsPage() {
  const { credentials } = useSelector((state: RootState) => state.auth);
  const [flashcards, setFlashcards] = useState<IFlashcard[]>([]);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<IFlashcardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [syncStatus, setSyncStatus] = useState({
    pendingChanges: 0,
    lastSyncTime: new Date(),
    isAutoSaveActive: true,
  });

  // Material selection states
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedUploadCourse, setSelectedUploadCourse] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMaterialId, setUploadedMaterialId] = useState<string | null>(
    null
  );
  const [selectedMaterialPreview, setSelectedMaterialPreview] = useState<
    string | null
  >(null);

  // Load flashcards, materials and stats
  useEffect(() => {
    loadFlashcards();
    loadMaterials();
    loadCourses();
    loadStats();
    startAutoSave();
  }, []);

  // Group flashcards by course when flashcards change
  useEffect(() => {
    groupFlashcardsByCourse();
  }, [flashcards, courses]);

  // Scroll to top of modal when material is selected
  useEffect(() => {
    if (selectedMaterialPreview && showMaterialSelector) {
      const modal = document.querySelector('[data-modal="material-selector"]');
      if (modal) {
        modal.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [selectedMaterialPreview, showMaterialSelector]);

  // Auto-select course when there's an exact match in search
  useEffect(() => {
    if (courseSearchTerm.trim()) {
      const exactMatch = courses.find(
        (course) =>
          course.code.toLowerCase() === courseSearchTerm.toLowerCase() ||
          course.title.toLowerCase() === courseSearchTerm.toLowerCase()
      );

      if (exactMatch && selectedUploadCourse !== exactMatch._id) {
        setSelectedUploadCourse(exactMatch._id);
      }
    }
  }, [courseSearchTerm, courses, selectedUploadCourse]);

  const groupFlashcardsByCourse = () => {
    if (!flashcards.length || !courses.length) {
      return;
    }

    const groups: CourseGroup[] = [];

    courses.forEach((course) => {
      // Handle both string and object courseId formats
      const courseFlashcards = flashcards.filter((card) => {
        if (typeof card.courseId === "string") {
          return card.courseId === course._id;
        } else if (
          card.courseId &&
          typeof card.courseId === "object" &&
          "_id" in card.courseId
        ) {
          return card.courseId._id === course._id;
        }
        return false;
      });

      if (courseFlashcards.length > 0) {
        // Sort flashcards by creation date (newest first)
        const sortedFlashcards = courseFlashcards.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });

        const mastered = sortedFlashcards.filter(
          (card) => card.masteryLevel >= 80
        ).length;
        const needReview = sortedFlashcards.filter(
          (card) => card.masteryLevel < 60
        ).length;
        const averageMastery = Math.round(
          sortedFlashcards.reduce((sum, card) => sum + card.masteryLevel, 0) /
            sortedFlashcards.length
        );

        groups.push({
          course,
          flashcards: sortedFlashcards,
          stats: {
            totalCards: sortedFlashcards.length,
            mastered,
            needReview,
            averageMastery,
          },
        });
      }
    });

    // Sort groups by the newest flashcard in each course
    groups.sort((a, b) => {
      const newestA = new Date(a.flashcards[0]?.createdAt || 0).getTime();
      const newestB = new Date(b.flashcards[0]?.createdAt || 0).getTime();
      return newestB - newestA; // Newest first
    });

    setCourseGroups(groups);
  };

  const loadFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardService.getUserFlashcards(
        credentials.accessToken
      );
      // Transform the data to match our local interface
      const transformedData: IFlashcard[] = data.map((card: any) => ({
        _id: card._id,
        courseId: card.courseId,
        materialId: card.materialId,
        front: card.front,
        back: card.back,
        lectureNumber: card.lectureNumber,
        createdBy: card.createdBy,
        isPublic: card.isPublic,
        tags: card.tags || [],
        difficulty: card.difficulty || "medium",
        lastReviewed: card.lastReviewed,
        reviewCount: card.reviewCount || 0,
        masteryLevel: card.masteryLevel || 0,
        createdAt: card.createdAt || new Date().toISOString(),
        updatedAt: card.updatedAt || new Date().toISOString(),
      }));
      setFlashcards(transformedData);
    } catch (error) {
      console.error("Failed to load flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      // Fetch real user materials from backend
      const response = await axios.get(`${Config.API_URL}/materials/user`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      setMaterials(response.data.materials);
    } catch (error) {
      console.error("Failed to load materials:", error);
      // Fallback to empty array if API fails
      setMaterials([]);
    }
  };

  const loadCourses = async () => {
    try {
      const coursesData = await getAllCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to load courses:", error);
    }
  };

  const loadStats = async () => {
    try {
      const data = await flashcardService.getFlashcardStats(
        credentials.accessToken
      );
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const startAutoSave = () => {
    flashcardService.startAutoSave(30000, credentials.accessToken); // Auto-save every 30 seconds
  };

  const handleMaterialSelection = (materialId: string) => {
    setSelectedMaterial(materialId);
    setSelectedMaterialPreview(materialId);
  };

  const handleCourseSearch = (searchTerm: string) => {
    setCourseSearchTerm(searchTerm);

    // Auto-select course if there's an exact match
    if (searchTerm.trim()) {
      const exactMatch = courses.find(
        (course) =>
          course.code.toLowerCase() === searchTerm.toLowerCase() ||
          course.title.toLowerCase() === searchTerm.toLowerCase()
      );

      if (exactMatch) {
        setSelectedUploadCourse(exactMatch._id);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const uploadMaterial = async () => {
    if (!selectedUploadCourse || !uploadTitle) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("courseId", selectedUploadCourse);
      formData.append("title", uploadTitle);
      formData.append("questionRefType", "lecture");
      if (uploadFile) {
        formData.append("file", uploadFile);
      }

      const response = await axios.post(
        `${Config.API_URL}/materials/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
          onUploadProgress: (progressEvent: any) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      // Store the uploaded material ID for generation
      const uploadedMaterial = response.data.material;
      setUploadedMaterialId(uploadedMaterial._id);

      // Show success message
      showToast("Material uploaded successfully!", "success");

      // Reset form
      setUploadFile(null);
      setUploadTitle("");
      setSelectedUploadCourse("");

      // Refresh materials
      loadMaterials();
    } catch (error: any) {
      console.error("Upload failed:", error);
      showToast(error.response?.data?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedMaterial && !uploadedMaterialId) {
      showToast(
        "Please select a material or upload a new one to generate flashcards from.",
        "error"
      );
      return;
    }

    setGeneratingFlashcards(true);
    try {
      // Generate flashcards for the selected material
      const newFlashcards: IFlashcard[] = [];
      const materialToProcess = uploadedMaterialId || selectedMaterial;

      if (materialToProcess) {
        const generated = await flashcardService.generateFlashcards(
          materialToProcess,
          flashcardCount,
          credentials.accessToken
        );
        // Transform the generated data to match our local interface
        const transformedGenerated = generated.map((card: any) => ({
          _id: card._id,
          courseId: card.courseId,
          materialId: card.materialId,
          front: card.front,
          back: card.back,
          lectureNumber: card.lectureNumber,
          createdBy: card.createdBy,
          isPublic: card.isPublic,
          tags: card.tags || [],
          difficulty: card.difficulty || "medium",
          lastReviewed: card.lastReviewed,
          reviewCount: card.reviewCount || 0,
          masteryLevel: card.masteryLevel || 0,
          createdAt: card.createdAt || new Date().toISOString(),
          updatedAt: card.updatedAt || new Date().toISOString(),
        }));
        newFlashcards.push(...transformedGenerated);
      }

      // Add new flashcards to the list
      setFlashcards((prev) => [...prev, ...newFlashcards]);
      setSelectedMaterial("");
      setUploadedMaterialId(null);
      setShowMaterialSelector(false);

      // Show success message
      showToast(
        `Successfully generated ${newFlashcards.length} flashcards!`,
        "success"
      );
    } catch (error: any) {
      if (
        error instanceof AxiosError &&
        error.response?.data?.message ===
          "Error validating user AI access: Your subscription does not allow you to use our AI Model"
      ) {
        showToast(
          "Failed to generate flashcards. Please upgrade your subscription.",
          "error"
        );
      } else {
        showToast("Failed to generate flashcards. Please try again.", "error");
      }
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const forceSync = async () => {
    try {
      await flashcardService.forceSync(credentials.accessToken);
      const status = flashcardService.getSyncStatus();
      setSyncStatus(status);
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

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    return course ? `${course.code}: ${course.title}` : "Unknown Course";
  };

  const filteredCourseGroups = courseGroups.filter((group) => {
    if (searchTerm) {
      return (
        group.course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.flashcards.some(
          (card) =>
            card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.back.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (selectedCourse && selectedCourse !== "all") {
      return group.course._id === selectedCourse;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl opacity-20 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            Loading your flashcards...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                  My Flashcards
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Review and manage your personalized flashcards with AI-powered
                learning
              </p>
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
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync
              </Button>

              <Button
                onClick={() => setShowMaterialSelector(true)}
                className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Zap className="w-4 h-4 mr-2" />
                Generate New
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Cards
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.totalFlashcards}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                      <Star className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Reviews
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.totalReviews}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Mastery
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(stats.averageMasteryLevel)}%
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl">
                      <Target className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Recent Activity
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stats.recentActivity.length}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Material Selector Modal */}
        {showMaterialSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMaterialSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="group relative  rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 shadow-2xl max-w-4xl w-full max-h-[80vh] "
              onClick={(e) => e.stopPropagation()}
              data-modal="material-selector"
            >
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Generate Flashcards
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMaterialSelector(false)}
                    className="border-border hover:bg-muted"
                  >
                    ✕
                  </Button>
                </div>
                <p className="text-muted-foreground mb-3">
                  Upload new materials or select existing ones to generate
                  flashcards
                </p>

                {/* Experimental Feature Banner */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-amber-500 rounded-full">
                      <span className="text-xs text-white font-bold">AI</span>
                    </div>
                    <div className="text-xs text-amber-800">
                      <span className="font-medium">
                        AI-Powered Generation:
                      </span>{" "}
                      This feature uses experimental AI technology. Results may
                      vary and processing can take several minutes for large
                      documents.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {/* Upload Section - Only show when no material is selected */}
                {!selectedMaterial && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Upload New Material
                    </h3>

                    {/* Upload Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Material Title
                        </label>
                        <Input
                          placeholder="Enter material title"
                          value={uploadTitle}
                          onChange={(e) => setUploadTitle(e.target.value)}
                          className="border-border focus:border-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Course
                        </label>
                        <div className="space-y-2">
                          <Input
                            placeholder="Search courses..."
                            value={courseSearchTerm}
                            onChange={(e) => handleCourseSearch(e.target.value)}
                            className="border-border focus:border-primary"
                          />
                          <Select
                            value={selectedUploadCourse}
                            onValueChange={setSelectedUploadCourse}
                          >
                            <SelectTrigger className="border-border">
                              <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses
                                .filter(
                                  (course) =>
                                    course.code
                                      .toLowerCase()
                                      .includes(
                                        courseSearchTerm.toLowerCase()
                                      ) ||
                                    course.title
                                      .toLowerCase()
                                      .includes(courseSearchTerm.toLowerCase())
                                )
                                .map((course) => (
                                  <SelectItem
                                    key={course._id}
                                    value={course._id}
                                  >
                                    {course.code}: {course.title}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

                          {/* Auto-selection indicator */}
                          {selectedUploadCourse && courseSearchTerm && (
                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-emerald-700">
                                  Auto-selected:{" "}
                                  {
                                    courses.find(
                                      (c) => c._id === selectedUploadCourse
                                    )?.code
                                  }
                                  :{" "}
                                  {
                                    courses.find(
                                      (c) => c._id === selectedUploadCourse
                                    )?.title
                                  }
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Choose File
                        </label>

                        {/* File Upload Area */}
                        <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-colors duration-200">
                          <Input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt,.pptx,.ppt"
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
                            {!uploadFile ? (
                              <div className="space-y-3">
                                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    Click to upload or drag and drop
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    PDF, DOC, DOCX, TXT, PPT, PPTX (Max 50MB)
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <FileText className="w-12 h-12 text-primary mx-auto" />
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {uploadFile.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(uploadFile.size / 1024 / 1024).toFixed(2)}{" "}
                                    MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </label>
                        </div>

                        {/* Upload Button */}
                        <div className="mt-4">
                          <Button
                            onClick={uploadMaterial}
                            disabled={
                              !uploadTitle ||
                              !selectedUploadCourse ||
                              isUploading ||
                              uploadFile == null
                            }
                            className="w-full button-gradient"
                          >
                            {isUploading ? (
                              <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Uploading... {uploadProgress}%
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Material
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Experimental Feature Warning */}
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <div className="p-1 bg-amber-500 rounded-full mt-0.5">
                              <span className="text-xs text-white font-bold">
                                !
                              </span>
                            </div>
                            <div className="text-xs text-amber-800">
                              <p className="font-medium mb-1">
                                Experimental Feature
                              </p>
                              <p>
                                Our current AI model works best with text files
                                (.txt) and may be slower with other formats. PDF
                                processing is limited and may not extract all
                                content properly.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Material Preview - Show when material is selected */}
                {selectedMaterial && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Selected Material
                    </h3>

                    <div className="p-4 border-2 border-primary bg-primary/5 rounded-xl">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-lg">
                            {
                              materials.find((m) => m._id === selectedMaterial)
                                ?.title
                            }
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {(() => {
                              const material = materials.find(
                                (m) => m._id === selectedMaterial
                              );
                              if (!material) return "Unknown Course";

                              if (
                                typeof material.courseId === "object" &&
                                material.courseId &&
                                "_id" in material.courseId
                              ) {
                                return `${material.courseId.code}: ${material.courseId.title}`;
                              } else if (
                                typeof material.courseId === "string"
                              ) {
                                return getCourseName(material.courseId);
                              }
                              return "Unknown Course";
                            })()}{" "}
                            •{" "}
                            {materials
                              .find((m) => m._id === selectedMaterial)
                              ?.type.toUpperCase()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMaterial("")}
                          className="border-border hover:bg-muted"
                        >
                          Change
                        </Button>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Type:{" "}
                          {materials
                            .find((m) => m._id === selectedMaterial)
                            ?.type.toUpperCase()}
                        </span>
                        <span>
                          Status:{" "}
                          {materials.find((m) => m._id === selectedMaterial)
                            ?.isProcessed
                            ? "Processed"
                            : "Pending"}
                        </span>
                        <span>
                          Created:{" "}
                          {materials.find((m) => m._id === selectedMaterial)
                            ?.createdAt
                            ? new Date(
                                materials.find(
                                  (m) => m._id === selectedMaterial
                                )?.createdAt || ""
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      {/* Generate Buttons */}
                      <div className="flex items-center justify-between pt-3 border-t border-primary/20">
                        <div className="text-sm text-primary/70">
                          Ready to generate {flashcardCount} flashcards
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleGenerateFlashcards}
                            disabled={generatingFlashcards}
                            className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                          >
                            {generatingFlashcards ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Generate Flashcards
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Generate Flashcards
                              </>
                            )}
                          </Button>
                          <Link href="/user/personal-quizzes">
                            <Button
                              variant="outline"
                              className="border-primary/30 text-primary hover:bg-primary/10"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Generate Quiz
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Newly Uploaded Material */}
                {uploadedMaterialId && (
                  <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-1 bg-emerald-500 rounded-full">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-800">
                          Material Uploaded Successfully!
                        </h4>
                        <p className="text-sm text-emerald-700">
                          {uploadTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-emerald-600">
                        <p>Ready to generate flashcards from this material</p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedMaterial("");
                          setShowMaterialSelector(false);
                          // Trigger flashcard generation directly
                          handleGenerateFlashcards();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Flashcards
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t border-border/30 pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {selectedMaterial
                      ? "Generate from Selected Material"
                      : "Generate from Existing Materials"}
                  </h3>

                  {/* Flashcard Count Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Number of flashcards to generate
                    </label>
                    <Select
                      value={flashcardCount.toString()}
                      onValueChange={(value) =>
                        setFlashcardCount(parseInt(value))
                      }
                    >
                      <SelectTrigger className="w-32 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="15">15</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Materials List - Only show when no material is selected */}
                  {!selectedMaterial && (
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div
                          key={material._id}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedMaterial === material._id
                              ? "border-primary bg-primary/5 shadow-lg"
                              : "border-border hover:border-primary/30 hover:bg-muted/30"
                          }`}
                          onClick={() => handleMaterialSelection(material._id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {selectedMaterial === material._id ? (
                                <div className="p-1 bg-gradient-to-br from-primary to-secondary rounded-full">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                              ) : (
                                <div className="p-1 bg-muted rounded-full">
                                  <FileText className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground">
                                {material.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {(() => {
                                  if (
                                    typeof material.courseId === "object" &&
                                    material.courseId &&
                                    "_id" in material.courseId &&
                                    material.courseId.code &&
                                    material.courseId.title
                                  ) {
                                    return `${material.courseId.code}: ${material.courseId.title}`;
                                  } else if (
                                    typeof material.courseId === "string" &&
                                    material.courseId.trim() !== ""
                                  ) {
                                    return getCourseName(material.courseId);
                                  }
                                  return "Course information unavailable";
                                })()}{" "}
                                • {material.type.toUpperCase()}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span>{material.type.toUpperCase()}</span>
                                <span>
                                  {material.isProcessed
                                    ? "Processed"
                                    : "Pending"}
                                </span>
                                <span>
                                  {new Date(
                                    material.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!selectedMaterial && materials.length === 0 && (
                    <div className="text-center py-8">
                      <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No materials uploaded yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Upload course materials to start generating flashcards
                      </p>
                    </div>
                  )}

                  {/* Selection Summary */}
                  {selectedMaterial && (
                    <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <h4 className="font-medium text-primary">
                          Material Selected
                        </h4>
                      </div>
                      <p className="text-sm text-primary/70">
                        Ready to generate {flashcardCount} flashcards from{" "}
                        {
                          materials.find((m) => m._id === selectedMaterial)
                            ?.title
                        }
                      </p>
                    </div>
                  )}

                  {/* No Selection Message */}
                  {selectedMaterial === "" && materials.length > 0 && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-1 bg-amber-500 rounded-full">
                          <span className="text-xs text-white font-bold">
                            !
                          </span>
                        </div>
                        <h4 className="font-medium text-amber-800">
                          No Material Selected
                        </h4>
                      </div>
                      <p className="text-sm text-amber-700">
                        Click on materials above to select them for flashcard
                        generation, or upload a new material above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Search
              </label>
              <Input
                placeholder="Search courses or flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-border focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Course
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.code}: {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            Showing {filteredCourseGroups.length} course
            {filteredCourseGroups.length !== 1 ? "s" : ""} with flashcards
          </p>

          {filteredCourseGroups.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-sm border-emerald-200 text-emerald-700 bg-emerald-50"
              >
                {filteredCourseGroups.reduce(
                  (sum, group) => sum + group.stats.mastered,
                  0
                )}{" "}
                Mastered
              </Badge>
              <Badge
                variant="outline"
                className="text-sm border-amber-200 text-amber-700 bg-amber-50"
              >
                {filteredCourseGroups.reduce(
                  (sum, group) => sum + group.stats.needReview,
                  0
                )}{" "}
                Need Review
              </Badge>
            </div>
          )}
        </div>

        {/* Course Groups */}
        {filteredCourseGroups.length > 0 ? (
          <div className="space-y-8">
            {filteredCourseGroups.map((group, groupIndex) => (
              <motion.div
                key={group.course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 p-6"
              >
                {/* Course Header */}
                <div className="mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {group.course.code}: {group.course.title}
                      </h2>
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {group.course.about}
                    </p>

                    {/* Course Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {group.stats.totalCards} flashcards
                      </span>
                      <span className="text-emerald-600">
                        {group.stats.mastered} mastered
                      </span>
                      <span className="text-amber-600">
                        {group.stats.needReview} need review
                      </span>
                      <span className="text-purple-600">
                        {group.stats.averageMastery}% avg mastery
                      </span>
                    </div>
                  </div>
                </div>

                {/* Course Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-muted/30 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">
                      {group.stats.totalCards}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Cards
                    </div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {group.stats.mastered}
                    </div>
                    <div className="text-sm text-emerald-600">Mastered</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">
                      {group.stats.needReview}
                    </div>
                    <div className="text-sm text-amber-600">Need Review</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {group.stats.averageMastery}%
                    </div>
                    <div className="text-sm text-purple-600">Avg Mastery</div>
                  </div>
                </div>

                {/* Course Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className="text-sm">
                      {group.course.creditHours} Credit Hours
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      Semester {group.course.semester}
                    </Badge>
                    <Badge variant="outline" className="text-sm">
                      {group.course.year}
                    </Badge>
                  </div>

                  <Link href={`/user/flashcards/${group.course._id}`}>
                    <Button className="button-gradient text-primary">
                      Study Course
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <Brain className="w-20 h-20 text-muted-foreground mx-auto" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-2xl opacity-20" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              No flashcards found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || selectedCourse !== ""
                ? "Try adjusting your filters or search terms."
                : "Start by generating flashcards from your course materials."}
            </p>
            <Button
              onClick={() => setShowMaterialSelector(true)}
              className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Flashcards
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

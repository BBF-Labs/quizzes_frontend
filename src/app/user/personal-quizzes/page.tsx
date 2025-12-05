"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Clock,
  Users,
  Star,
  Target,
  Edit,
  Trash2,
  Play,
  Eye,
  Tag,
  Upload,
  FileText,
  CheckCircle,
  Loader,
  X,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components";

import { showToast } from "@/components";
import { FloatingAIWidget } from "@/components/ui/floating-ai-widget";
import axios from "axios";
import Config from "@/config";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";

interface PersonalQuiz {
  _id: string;
  title: string;
  description: string;
  courseId: {
    _id: string;
    code: string;
    title: string;
  };
  materialId: {
    _id: string;
    title: string;
    type: string;
  };
  questions: Array<{
    question: string;
    options: string[];
    answer: string;
    type: "mcq" | "fill-in" | "true-false";
    difficulty: "basic" | "intermediate" | "advanced" | "critical";
    hint?: string;
    explanation?: string;
  }>;
  settings: {
    timeLimit?: number;
    shuffleQuestions: boolean;
    showHints: boolean;
    showExplanations: boolean;
    allowRetakes: boolean;
    passingScore: number;
  };
  stats: {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    lastAttempted?: string;
  };
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

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

export default function PersonalQuizzesPage() {
  const { credentials } = useSelector((state: RootState) => state.auth);
  const [quizzes, setQuizzes] = useState<PersonalQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingQuiz, setDeletingQuiz] = useState<string | null>(null);

  // Quiz creation modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedMaterialId, setUploadedMaterialId] = useState<string | null>(
    null
  );
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  useEffect(() => {
    loadPersonalQuizzes();
    loadMaterials();
    loadCourses();
  }, []);

  // Auto-select course when there's an exact match in search
  useEffect(() => {
    if (courseSearchTerm.trim()) {
      const exactMatch = courses.find(
        (course) =>
          course.code.toLowerCase() === courseSearchTerm.toLowerCase() ||
          course.title.toLowerCase() === courseSearchTerm.toLowerCase()
      );

      if (exactMatch && selectedCourse !== exactMatch._id) {
        setSelectedCourse(exactMatch._id);
      }
    }
  }, [courseSearchTerm, courses, selectedCourse]);

  const loadPersonalQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${Config.API_URL}/personal-quizzes/user`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );
      setQuizzes(response.data.quizzes);
    } catch (error: any) {
      console.error("Failed to load personal quizzes:", error);
      showToast(
        error.response?.data?.message || "Failed to load personal quizzes",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/materials/user`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      setMaterials(response.data.materials);
    } catch (error) {
      console.error("Failed to load materials:", error);
      setMaterials([]);
    }
  };

  const loadCourses = async () => {
    try {
      const response = await axios.get(`${Config.API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error("Failed to load courses:", error);
      setCourses([]);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    try {
      setDeletingQuiz(quizId);
      await axios.delete(`${Config.API_URL}/personal-quizzes/${quizId}`, {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });

      showToast("Quiz deleted successfully", "success");
      setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId));
    } catch (error: any) {
      console.error("Failed to delete quiz:", error);
      showToast(
        error.response?.data?.message || "Failed to delete quiz",
        "error"
      );
    } finally {
      setDeletingQuiz(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basic":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find((c) => c._id === courseId);
    return course ? `${course.code}: ${course.title}` : "Unknown Course";
  };

  const handleCourseSearch = (searchTerm: string) => {
    setCourseSearchTerm(searchTerm);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const uploadMaterial = async () => {
    if (!selectedCourse || !uploadTitle) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("courseId", selectedCourse);
      formData.append("title", uploadTitle);
      formData.append("questionRefType", "QUIZ");
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

      const uploadedMaterial = response.data.material;
      setUploadedMaterialId(uploadedMaterial._id);

      showToast("Material uploaded successfully!", "success");

      setUploadFile(null);
      setUploadTitle("");
      setSelectedCourse("");

      loadMaterials();
    } catch (error: any) {
      console.error("Upload failed:", error);
      showToast(error.response?.data?.message || "Upload failed", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const createQuiz = async () => {
    const materialToProcess = uploadedMaterialId || selectedMaterial;

    if (!materialToProcess) {
      showToast(
        "Please select a material or upload a new one to create a quiz.",
        "error"
      );
      return;
    }

    setCreatingQuiz(true);
    try {
      await axios.post(
        `${Config.API_URL}/personal-quizzes`,
        {
          materialId: materialToProcess,
          count: questionCount,
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
          },
        }
      );

      showToast("Quiz created successfully!", "success");
      setShowCreateModal(false);
      setSelectedMaterial("");
      setUploadedMaterialId(null);
      setUploadFile(null);
      setUploadTitle("");
      setSelectedCourse("");

      // Refresh quizzes list
      loadPersonalQuizzes();
    } catch (error: any) {
      console.error("Failed to create quiz:", error);
      showToast(
        error.response?.data?.message ||
          "Failed to create quiz. Please try again.",
        "error"
      );
    } finally {
      setCreatingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="relative">
            <BookOpen className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-20 animate-pulse" />
          </div>
          <p className="text-muted-foreground text-lg">
            Loading your personal quizzes...
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
                <div className="p-2 bg-primary/20 rounded-xl">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-teal-500">
                  My Personal Quizzes
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Create and manage your personalized quizzes generated from your
                materials
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Quiz
              </Button>
            </div>
          </div>

          {/* Stats */}
          {quizzes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Quizzes
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {quizzes.length}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                      <Target className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Questions
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {quizzes.reduce(
                          (sum, quiz) => sum + quiz.questions.length,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/20 rounded-xl">
                      <Play className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Attempts
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {quizzes.reduce(
                          (sum, quiz) => sum + quiz.stats.totalAttempts,
                          0
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Best Score
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {quizzes.length > 0
                          ? Math.max(...quizzes.map((q) => q.stats.bestScore))
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        {/* Quizzes List */}
        {quizzes.length > 0 ? (
          <div className="space-y-6">
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all duration-300 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {quiz.title}
                      </h3>
                      {quiz.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">
                      {quiz.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {quiz.courseId.code}: {quiz.courseId.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {quiz.materialId.title}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {quiz.settings.timeLimit || "No limit"} min
                      </span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {quiz.tags.map((tag, tagIndex) => (
                        <Badge
                          key={tagIndex}
                          variant="outline"
                          className="text-xs border-border/50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Quiz Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {quiz.questions.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Questions
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {quiz.stats.totalAttempts}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Attempts
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {quiz.stats.bestScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Best Score
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <div className="text-lg font-bold text-foreground">
                          {quiz.stats.averageScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Score
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getDifficultyColor(
                        quiz.questions[0]?.difficulty || "basic"
                      )}`}
                    >
                      {quiz.questions[0]?.difficulty || "basic"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Created {new Date(quiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/user/personal-quizzes/${quiz._id}/take`}>
                      <Button size="sm" className="button-gradient">
                        <Play className="w-4 h-4 mr-2" />
                        Take Quiz
                      </Button>
                    </Link>
                    <Link href={`/user/personal-quizzes/${quiz._id}`}>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    <Link href={`/user/personal-quizzes/${quiz._id}?mode=edit`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border hover:bg-muted"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => deleteQuiz(quiz._id)}
                      disabled={deletingQuiz === quiz._id}
                    >
                      {deletingQuiz === quiz._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <BookOpen className="w-20 h-20 text-muted-foreground mx-auto" />
              <div className="absolute inset-0 bg-primary rounded-full blur-2xl opacity-20" />
            </div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              No personal quizzes yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start by uploading materials and generating your first personal
              quiz using AI.
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Quiz
            </Button>
          </div>
        )}

        {/* Create Quiz Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="group relative rounded-2xl bg-card border border-border/50 shadow-2xl max-w-4xl w-full max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Create Personal Quiz
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(false)}
                    className="border-border hover:bg-muted"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-muted-foreground mb-3">
                  Upload new materials or select existing ones to create a
                  personalized quiz using AI
                </p>

                {/* Experimental Feature Banner */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
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
                            value={selectedCourse}
                            onValueChange={setSelectedCourse}
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
                          {selectedCourse && courseSearchTerm && (
                            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm text-emerald-700">
                                  Auto-selected:{" "}
                                  {
                                    courses.find(
                                      (c) => c._id === selectedCourse
                                    )?.code
                                  }
                                  :{" "}
                                  {
                                    courses.find(
                                      (c) => c._id === selectedCourse
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
                          Question Count
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="15"
                          value={questionCount}
                          onChange={(e) =>
                            setQuestionCount(
                              Math.min(
                                15,
                                Math.max(1, parseInt(e.target.value) || 1)
                              )
                            )
                          }
                          className="border-border focus:border-primary"
                          placeholder="Number of questions (1-15)"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum 15 questions allowed
                        </p>
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
                              !selectedCourse ||
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
                                content properly.{" "}
                                <strong>
                                  Note: Our model cannot read images in files.
                                </strong>
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
                        <div className="p-2 bg-primary rounded-lg">
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
                    </div>

                    {/* Question Count Input for Selected Material */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Question Count
                      </label>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        value={questionCount}
                        onChange={(e) =>
                          setQuestionCount(
                            Math.min(
                              20,
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          )
                        }
                        className="border-border focus:border-primary"
                        placeholder="Number of questions (1-20)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum 20 questions allowed
                      </p>
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
                        <p>Ready to create quiz from this material</p>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedMaterial("");
                          setShowCreateModal(false);
                          createQuiz();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Quiz
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border-t border-border/30 pt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {selectedMaterial
                      ? "Create from Selected Material"
                      : "Create from Existing Materials"}
                  </h3>

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
                          onClick={() => setSelectedMaterial(material._id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {selectedMaterial === material._id ? (
                                <div className="p-1 bg-primary rounded-full">
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
                        Upload course materials to start creating quizzes
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
                        Ready to create quiz from{" "}
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
                        Click on materials above to select them for quiz
                        creation, or upload a new material above.
                      </p>
                    </div>
                  )}

                  {/* Create Quiz Button */}
                  {selectedMaterial && (
                    <div className="mt-6">
                      <Button
                        onClick={createQuiz}
                        disabled={creatingQuiz}
                        className="w-full button-gradient shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                      >
                        {creatingQuiz ? (
                          <>
                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                            Creating Quiz...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Quiz from Selected Material
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Floating AI Widget */}
        <FloatingAIWidget contextType="general" />
      </div>
    </div>
  );
}

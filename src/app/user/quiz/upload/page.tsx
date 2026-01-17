"use client";

import type React from "react";
import axios, { AxiosError } from "axios";
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Search,
  LinkIcon,
  File,
  UploadIcon as UploadImg,
  X,
  Loader,
} from "lucide-react";
import {
  Label,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  RadioGroup,
  RadioGroupItem,
  Progress,
  showToast,
} from "@/components";
import Link from "next/link";
import { getAllCourses } from "@/controllers";
import Config from "@/config";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";

interface Course {
  _id: string;
  code: string;
  title: string;
}

const baseUrl = Config.API_URL;

export default function UploadPage() {
  const { credentials } = useSelector((state: RootState) => state.auth);
  const [uploadType, setUploadType] = useState<"link" | "file">("link");
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [courseType, setCourseType] = useState("");
  const [lectureNumber, setLectureNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const coursesResponse = await getAllCourses();
        setCourses(coursesResponse);
      } catch (error) {
        console.error("Error fetching courses:", error);
        showToast("Failed to load courses", "error");
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.title
        .trim()
        .replace(" ", "")
        .toLowerCase()
        .includes(searchTerm.trim().replace(" ", "").toLowerCase()) ||
      c.code
        .trim()
        .replace(" ", "")
        .toLowerCase()
        .includes(searchTerm.trim().replace(" ", "").toLowerCase())
  );

  // Auto-select course when there's only one search result
  useEffect(() => {
    if (filteredCourses.length === 1) {
      setCourseId(filteredCourses[0]._id);
    }
  }, [filteredCourses]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadType("file");
      showToast("File added successfully", "success");
    }
  }, []);

  const uploadMaterial = async (
    formData: FormData | object,
    uploadType: "file" | "link"
  ) => {
    const accessToken = credentials.accessToken;
    if (!accessToken) {
      showToast("Authentication token not found", "error");
      return;
    }

    try {
      const url =
        uploadType === "file"
          ? `${baseUrl}/materials/upload`
          : `${baseUrl}/materials/li/upload`;
      const config = {
        headers: {
          "Content-Type":
            uploadType === "file" ? "multipart/form-data" : "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        onUploadProgress: (progressEvent: any) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      };

      const response = await axios.post(url, formData, config);

      if (response) {
        showToast(
          `${uploadType === "file" ? "File" : "Link"} uploaded successfully`,
          "success"
        );

        setTitle("");
        setLink("");
        setFile(null);
        setCourseType("");
        setLectureNumber("");
        setSearchTerm("");
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        showToast(error.response?.data?.message || "Try again", "error");
      } else {
        showToast("Something went wrong", "error");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    const questionRefType =
      courseType === "lecture" ? lectureNumber : courseType.toUpperCase();

    if (uploadType === "file" && file) {
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title);
      formData.append("questionRefType", questionRefType);
      formData.append("file", file);
      await uploadMaterial(formData, "file");
    } else if (uploadType === "link") {
      const body = {
        title: title,
        courseId: courseId,
        questionRefType: questionRefType,
        link: link,
      };
      await uploadMaterial(body, "link");
    }
  };

  const isFormValid = () => {
    return (
      courseId &&
      title &&
      courseType &&
      ((uploadType === "link" && link) || (uploadType === "file" && file)) &&
      (courseType !== "lecture" || lectureNumber) &&
      !isLoadingCourses
    );
  };

  if (isUploading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin h-8 w-8 text-teal-500" />
        <span className="ml-2 text-lg text-zinc-400">
          Uploading your material...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-teal-500">
            Upload Learning Material
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your knowledge and help others learn. Upload lecture
            materials, quizzes, or study resources.
          </p>
        </motion.div>

        <Card className="backdrop-blur-sm bg-card/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Upload Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-base font-medium">Upload Type</Label>
                  <RadioGroup
                    defaultValue="link"
                    onValueChange={(value) =>
                      setUploadType(value as "link" | "file")
                    }
                    className="flex flex-wrap gap-4 mt-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="link" id="link" />
                      <Label htmlFor="link" className="ml-2 cursor-pointer">
                        Link
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="file" id="file" />
                      <Label htmlFor="file" className="ml-2 cursor-pointer">
                        File Upload
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="course-search">Search Course</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="course-search"
                      type="text"
                      placeholder="Search for a course"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="courseId">Select Course</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingCourses ? (
                        <SelectItem value="loading" disabled>
                          Loading courses...
                        </SelectItem>
                      ) : (
                        filteredCourses.map((c) => (
                          <SelectItem key={c._id} value={c._id}>
                            {c.code} - {c.title}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your material"
                    className="mt-1"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="courseType">Type</Label>
                  <Select value={courseType} onValueChange={setCourseType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture">Lecture</SelectItem>
                      <SelectItem value="ia">IA</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {courseType === "lecture" && (
                  <div className="sm:col-span-2">
                    <Label htmlFor="lectureNumber">Lecture Number</Label>
                    <Input
                      id="lectureNumber"
                      type="number"
                      value={lectureNumber}
                      onChange={(e) => setLectureNumber(e.target.value)}
                      placeholder="Enter lecture number"
                      className="mt-1"
                      required
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  {uploadType === "link" ? (
                    <div>
                      <Label htmlFor="link">Link</Label>
                      <div className="relative mt-1">
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="link"
                          type="url"
                          value={link}
                          onChange={(e) => setLink(e.target.value)}
                          placeholder="Enter material link"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="file">Upload File</Label>
                      <div
                        className={`mt-1 relative rounded-lg border-2 border-dashed p-6 transition-colors ${
                          isDragging
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/25"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {file ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <File className="h-8 w-8 text-primary" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFile(null);
                                showToast("File removed", "success");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <UploadImg className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-semibold text-primary hover:text-primary/80"
                              >
                                <span className="text-center">
                                  Upload a file
                                </span>
                                <Input
                                  id="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) => {
                                    const selectedFile = e.target.files?.[0];
                                    if (selectedFile) {
                                      setFile(selectedFile);
                                      showToast(
                                        "File added successfully",
                                        "success"
                                      );
                                    }
                                  }}
                                  accept=".doc,.docx,.pdf,.ppt,.pptx,.jpg,.jpeg,.png,.json,.txt"
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOC, PPT, or images up to 10MB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    <Progress value={uploadProgress} />
                    <p className="text-sm text-center text-muted-foreground">
                      Uploading... {uploadProgress}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!isFormValid() || isUploading}
                  variant="gradient"
                >
                  {isUploading ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Upload
                      <Upload className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Link
                  target="_blank"
                  href="https://wa.me/233599835538?text=Hi%20Admin%20%40%20BF%20Labs%2C%0A%0AI%20hope%20you%27re%20doing%20well.%20I%20am%20currently%20trying%20to%20access%20my%20course%20on%20the%20platform%2C%20but%20it%20seems%20that%20my%20course%20isn%27t%20listed%20or%20available.%20Could%20you%20please%20assist%20in%20adding%20it%20or%20provide%20guidance%20on%20how%20to%20proceed%3F%0A%0AThank%20you%20for%20your%20help%21%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D"
                >
                  <Button
                    variant="outline"
                    className="flex-1 sm:flex-none"
                    type="button"
                  >
                    Contact Admin
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

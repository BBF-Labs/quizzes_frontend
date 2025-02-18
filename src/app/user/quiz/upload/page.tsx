"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Search,
  LinkIcon,
  File,
  UploadIcon as UploadImg,
  X,
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
} from "@/components";
import Link from "next/link";

// Mock data for courses (replace with actual data fetching in production)
const courses = [
  { id: "math101", name: "Mathematics 101" },
  { id: "phys201", name: "Physics 201" },
  { id: "chem301", name: "Chemistry 301" },
];

export default function UploadPage() {
  const [uploadType, setUploadType] = useState<"link" | "material">("link");
  const [course, setCourse] = useState("");
  const [title, setTitle] = useState("");
  const [lectureType, setLectureType] = useState("");
  const [lectureNumber, setLectureNumber] = useState("");
  const [material, setMaterial] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setMaterial(file);
      setUploadType("material");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    // Reset after upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-12 px-4 mt-24 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-primary via-blue-500 to-violet-500 bg-clip-text text-transparent">
            Upload Learning Material
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your knowledge and help others learn. Upload lecture
            materials, quizzes, or study resources.
          </p>
        </motion.div>

        <Card className="backdrop-blur-sm bg-card/50">
          <CardHeader>
            <CardTitle className="text-2xl">Upload Details</CardTitle>
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
                  <Label className="text-base">Upload Type</Label>
                  <RadioGroup
                    defaultValue="link"
                    onValueChange={(value) =>
                      setUploadType(value as "link" | "material")
                    }
                    className="flex flex-wrap gap-4 mt-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="link" id="link" />
                      <Label htmlFor="link" className="ml-2">
                        Link
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="material" id="material" />
                      <Label htmlFor="material" className="ml-2">
                        Material (docs, slides, img)
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
                  <Label htmlFor="course">Select Course</Label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCourses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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

                <div>
                  <Label htmlFor="lecture-type">Type</Label>
                  <Select value={lectureType} onValueChange={setLectureType}>
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

                {lectureType === "lecture" && (
                  <div>
                    <Label htmlFor="lecture-number">Lecture Number</Label>
                    <Input
                      id="lecture-number"
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
                      <Label htmlFor="material">Upload Material</Label>
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
                        {material ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <File className="h-8 w-8 text-primary" />
                              <span className="text-sm">{material.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setMaterial(null)}
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
                                <span>Upload a file</span>
                                <Input
                                  id="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={(e) =>
                                    setMaterial(e.target.files?.[0] || null)
                                  }
                                  accept=".doc,.docx,.pdf,.ppt,.pptx,.jpg,.jpeg,.png"
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
                {isUploading && (
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
                  disabled={isUploading}
                  variant="gradient"
                >
                  {isUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      Upload
                      <Upload className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Link href="https://wa.me/233208860872?text=Hi%20Admin%20%40%20BBF%20Labs%2C%0A%0AI%20hope%20you%27re%20doing%20well.%20I%20am%20currently%20trying%20to%20access%20my%20course%20on%20the%20platform%2C%20but%20it%20seems%20that%20my%20course%20isn%27t%20listed%20or%20available.%20Could%20you%20please%20assist%20in%20adding%20it%20or%20provide%20guidance%20on%20how%20to%20proceed%3F%0A%0AThank%20you%20for%20your%20help%21%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D">
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

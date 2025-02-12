"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Search,
  LinkIcon,
  File,
  Image as UploadImg,
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
} from "@/components";

// Mock data for courses (replace with actual data fetching in production)
const courses = [
  { id: "math101", name: "Mathematics 101" },
  { id: "phys201", name: "Physics 201" },
  { id: "chem301", name: "Chemistry 301" },
  // Add more courses as needed
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

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle upload logic here
    console.log("Upload attempt", {
      uploadType,
      course,
      title,
      lectureType,
      lectureNumber,
      material,
      link,
    });
  };

  return (
    <div>
      <div className="max-w-3xl mx-auto mt-24 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-center text-3xl font-extrabold">
            Upload Learning Material
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Contribute to our quiz database and help others learn
          </p>
        </motion.div>
        <Card>
          <CardHeader>
            <CardTitle>Upload Details</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.form
              className="space-y-6"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              <div className="space-y-4">
                <div>
                  <Label>Upload Type</Label>
                  <RadioGroup
                    defaultValue="link"
                    onValueChange={(value) =>
                      setUploadType(value as "link" | "material")
                    }
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="link" id="link" />
                      <Label htmlFor="link">Link</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="material" id="material" />
                      <Label htmlFor="material">
                        Material (docs, slides, img)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="course-search">Search Course</Label>
                  <div className="relative">
                    <Input
                      id="course-search"
                      type="text"
                      placeholder="Search for a course"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="course">Select Course</Label>
                  <Select value={course} onValueChange={setCourse}>
                    <SelectTrigger>
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

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for your material"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lecture-type">Type</Label>
                  <Select value={lectureType} onValueChange={setLectureType}>
                    <SelectTrigger>
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
                      required
                    />
                  </div>
                )}

                {uploadType === "link" ? (
                  <div>
                    <Label htmlFor="link">Link</Label>
                    <Input
                      id="link"
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Enter material link"
                      icon={
                        <LinkIcon className="h-5 w-5 text-muted-foreground" />
                      }
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="material">Upload Material</Label>
                    <Input
                      id="material"
                      type="file"
                      onChange={(e) => setMaterial(e.target.files?.[0] || null)}
                      accept=".doc,.docx,.pdf,.ppt,.pptx,.jpg,.jpeg,.png"
                      icon={
                        material ? (
                          <File className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <UploadImg className="h-5 w-5 text-muted-foreground" />
                        )
                      }
                      required
                    />
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" variant="gradient">
                Upload
                <Upload className="ml-2 h-5 w-5" />
              </Button>
            </motion.form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button variant="outline" className="inline-flex items-center">
            Contact Admin
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

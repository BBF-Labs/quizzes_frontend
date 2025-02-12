"use clien";
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Upload, File } from "lucide-react";

const UploadForm = () => {
  const [uploadType, setUploadType] = useState("material");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto max-w-2xl"
      >
        <Card className="bg-g backdrop-blur-sm border-gray-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-bold mb-2">
              Upload Details
            </CardTitle>
            <p className="text-gray-400">
              Contribute to our quiz database and help others learn
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Upload Type Selection */}
            <div className="space-y-3">
              <Label>Upload Type</Label>
              <RadioGroup
                defaultValue="material"
                className="flex gap-6"
                onValueChange={setUploadType}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="link" id="link" />
                  <Label htmlFor="link" className="text-gray-300">
                    Link
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="material" id="material" />
                  <Label htmlFor="material" className="text-gray-300">
                    Material (docs, slides, img)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Course Search */}
            <div className="space-y-3">
              <Label>Search Course</Label>
              <div className="relative">
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Course Selection */}
            <div className="space-y-3">
              <Label>Select Course</Label>
              <Select>
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics201">Physics 201</SelectItem>
                  <SelectItem value="physics202">Physics 202</SelectItem>
                  <SelectItem value="physics203">Physics 203</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title Input */}
            <div className="space-y-3">
              <Label>Title</Label>
              <Input
                placeholder="Enter a title for your material"
                className="bg-gray-800/50 border-gray-700"
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-3">
              <Label>Type</Label>
              <Select>
                <SelectTrigger className="bg-gray-800/50 border-gray-700">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="notes">Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lecture Number */}
            <div className="space-y-3">
              <Label>Lecture Number</Label>
              <Input
                placeholder="Enter lecture number"
                type="number"
                className="bg-gray-800/50 border-gray-700"
              />
            </div>

            {/* File Upload */}
            {uploadType === "material" ? (
              <div className="space-y-3">
                <Label>Upload Material</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 w-full"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                  >
                    <File className="mr-2 h-5 w-5" />
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-400">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            ) : (
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            )}

            {/* Submit Button */}
            <Button
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
              size="lg"
            >
              Upload <Upload className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UploadForm;

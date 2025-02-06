"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UploadMaterialProps {
  onLogout: () => void
}

export default function UploadMaterial({ onLogout }: UploadMaterialProps) {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [materialType, setMaterialType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState("")

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      const data = await response.json()
      setCourses(data)
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse) {
      alert("Please select a course")
      return
    }
    if (!materialType) {
      alert("Please select a material type")
      return
    }
    if (materialType === "file" && !file) {
      alert("Please select a file")
      return
    }
    if (materialType === "link" && !link) {
      alert("Please enter a link")
      return
    }

    const formData = new FormData()
    formData.append("courseId", selectedCourse)
    formData.append("materialType", materialType)
    if (file) formData.append("file", file)
    if (link) formData.append("link", link)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        alert("Material uploaded successfully")
        setSelectedCourse("")
        setMaterialType("")
        setFile(null)
        setLink("")
      } else {
        alert(data.message || "Upload failed")
      }
    } catch (error) {
      alert("Error uploading material")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Material</CardTitle>
        <CardDescription>Share your course materials (PDF, Word, TXT, or a link)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Select onValueChange={setSelectedCourse} value={selectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="materialType">Material Type</Label>
            <Select onValueChange={setMaterialType} value={materialType}>
              <SelectTrigger>
                <SelectValue placeholder="Select material type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file">File (PDF, Word, TXT)</SelectItem>
                <SelectItem value="link">Link to Material</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {materialType === "file" && (
            <div className="space-y-2">
              <Label htmlFor="file">Upload File (Max 10MB)</Label>
              <Input id="file" type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileChange} />
            </div>
          )}
          {materialType === "link" && (
            <div className="space-y-2">
              <Label htmlFor="link">Material Link</Label>
              <Input
                id="link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          )}
          <div className="flex justify-between items-center pt-4">
            <Button type="submit">Upload Material</Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}


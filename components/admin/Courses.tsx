"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNotifications } from "@/hooks/useNotifications"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import api from "@/services/api"

interface Course {
  _id: string
  title: string
  description: string
  code: string
  createdAt: string
}

const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" onClick={() => console.log(row.original)}>
        Edit
      </Button>
    ),
  },
]

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const { showNotification } = useNotifications()
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    code: "",
  })

  const handleCreateCourse = async () => {
    try {
      const response = await api.post("/courses", newCourse)
      setCourses([...courses, response.data])
      showNotification({
        type: "success",
        message: "Course created successfully",
      })
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to create course",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Courses</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Course</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Add a new course to the platform</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateCourse}>Create Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={courses} />
    </div>
  )
}


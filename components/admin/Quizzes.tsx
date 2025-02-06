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
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "@/hooks/useNotifications"
import { DataTable } from "@/components/ui/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import api from "@/services/api"

interface Quiz {
  _id: string
  title: string
  courseId: string
  questionCount: number
  createdAt: string
}

const columns: ColumnDef<Quiz>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "courseId",
    header: "Course",
  },
  {
    accessorKey: "questionCount",
    header: "Questions",
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

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const { showNotification } = useNotifications()
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    courseId: "",
    questions: [],
  })

  const handleCreateQuiz = async () => {
    try {
      const response = await api.post("/quizzes", newQuiz)
      setQuizzes([...quizzes, response.data])
      showNotification({
        type: "success",
        message: "Quiz created successfully",
      })
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to create quiz",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Quiz</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
              <DialogDescription>Add a new quiz to a course</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="course">Course</Label>
                <Select onValueChange={(value) => setNewQuiz({ ...newQuiz, courseId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>{/* Add course options here */}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateQuiz}>Create Quiz</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={quizzes} />
    </div>
  )
}


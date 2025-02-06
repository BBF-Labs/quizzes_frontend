"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/hooks/useNotifications"
import api from "@/services/api"

interface Question {
  _id: string
  content: string
  courseId: string
  status: "pending" | "approved" | "rejected"
  submittedBy: string
  submittedAt: string
}

export default function ModeratePage() {
  const { courseId } = useParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const { showNotification } = useNotifications()

  useEffect(() => {
    fetchUnmoderatedQuestions()
  }, [])

  const fetchUnmoderatedQuestions = async () => {
    try {
      const response = await api.get(`/courses/${courseId}/unmoderated-questions`)
      setQuestions(response.data)
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to fetch questions",
      })
    }
  }

  const handleModerate = async (questionId: string, status: "approved" | "rejected") => {
    try {
      await api.post(`/questions/${questionId}/moderate`, { status })
      setQuestions(questions.filter((q) => q._id !== questionId))
      showNotification({
        type: "success",
        message: `Question ${status}`,
      })
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to moderate question",
      })
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Moderate Questions</h1>
      <div className="grid gap-6">
        {questions.map((question) => (
          <Card key={question._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Question</CardTitle>
                  <CardDescription>
                    Submitted by {question.submittedBy} on {new Date(question.submittedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge>{question.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{question.content}</p>
              <div className="flex space-x-2">
                <Button variant="default" onClick={() => handleModerate(question._id, "approved")}>
                  Approve
                </Button>
                <Button variant="destructive" onClick={() => handleModerate(question._id, "rejected")}>
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


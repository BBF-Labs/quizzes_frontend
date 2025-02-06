"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../store"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import Link from "next/link"

interface QuizProgress {
  quizId: string
  quizTitle: string
  score: number
  completedAt: string
}

const Dashboard = () => {
  const [quizProgress, setQuizProgress] = useState<QuizProgress[]>([])
  const username = useSelector((state: RootState) => state.auth.username)

  useEffect(() => {
    fetchQuizProgress()
  }, [])

  const fetchQuizProgress = async () => {
    try {
      const response = await axios.get("https://bbf-backend.onrender.com/api/user/progress")
      setQuizProgress(response.data)
    } catch (error) {
      console.error("Error fetching quiz progress:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {username}!</h1>
      <h2 className="text-2xl font-semibold mb-4">Your Quiz Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizProgress.map((progress) => (
          <Card key={progress.quizId}>
            <CardHeader>
              <CardTitle>{progress.quizTitle}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress.score} className="mb-2" />
              <p>Score: {progress.score}%</p>
              <p>Completed: {format(new Date(progress.completedAt), "PPP")}</p>
              <Link href={`/quiz/${progress.quizId}`}>
                <Button className="mt-2">Retake Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Dashboard


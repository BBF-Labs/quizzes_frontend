"use client"

import type { Metadata } from "next"
import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/store"
import { setSelectedQuestions } from "@/store/quizSlice"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import QuestionDisplay from "@/components/QuestionDisplay"
import Feedback from "@/components/Feedback"
import { useNotifications } from "@/hooks/useNotifications"
import api from "@/services/api"

interface QuizPageProps {
  params: { quizId: string }
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  // Fetch quiz details from API
  const quiz = await fetch(`https://bbf-backend.onrender.com/api/quizzes/${params.quizId}`).then((res) => res.json())

  return {
    title: `${quiz.title} - BBF Labs Quiz`,
    description: quiz.description,
    openGraph: {
      title: `${quiz.title} - BBF Labs Quiz`,
      description: quiz.description,
      images: [
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=quiz&title=${encodeURIComponent(quiz.title)}&description=${encodeURIComponent(quiz.description)}`,
      ],
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}

const QuizPage = () => {
  const { quizId } = useParams()
  const dispatch = useDispatch()
  const router = useRouter()
  const { showNotification } = useNotifications()
  const [quiz, setQuiz] = useState<any>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const { currentQuestion, userAnswers, selectedQuestions } = useSelector((state: RootState) => state.quiz)
  const username = useSelector((state: RootState) => state.auth.username)

  useEffect(() => {
    fetchQuiz()
  }, [])

  const fetchQuiz = async () => {
    try {
      const response = await api.get(`/quizzes/${quizId}`)
      setQuiz(response.data)
      dispatch(setSelectedQuestions(response.data.questions.map((_: any, index: number) => index)))
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to load quiz. Please try again.",
      })
    }
  }

  const handleSubmit = async () => {
    setShowFeedback(true)
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, {
        answers: userAnswers,
        username,
      })

      showNotification({
        type: "quiz",
        message: `Quiz completed! You scored ${response.data.score}/${selectedQuestions.length}`,
        data: response.data,
      })
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to submit quiz. Please try again.",
      })
    }
  }

  if (!quiz) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {showFeedback ? (
            <Feedback quiz={quiz} />
          ) : (
            <>
              <QuestionDisplay question={quiz.questions[currentQuestion]} />
              <Button onClick={handleSubmit}>Submit</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default QuizPage


"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { setCurrentQuestion, setUserAnswers } from "../../store/quizSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ShareResults from "./ShareResults"

interface Question {
  question: string
  options: string[]
  answer: string
}

interface FeedbackProps {
  questions: Question[]
  userAnswers: string[]
  selectedQuestions: number[]
  quizTitle: string
}

const Feedback = ({ questions, userAnswers, selectedQuestions, quizTitle }: FeedbackProps) => {
  const [score, setScore] = useState(0)
  const dispatch = useDispatch()

  useEffect(() => {
    calculateScore()
  }, [])

  const calculateScore = () => {
    let correctAnswers = 0
    selectedQuestions.forEach((questionIndex, index) => {
      if (userAnswers[index] === questions[questionIndex].answer) {
        correctAnswers++
      }
    })
    setScore(correctAnswers)
  }

  const handleRetake = () => {
    dispatch(setCurrentQuestion(0))
    dispatch(setUserAnswers([]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz Results</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold mb-4">
          Your score: {score} out of {selectedQuestions.length}
        </p>
        {selectedQuestions.map((questionIndex, index) => (
          <div key={index} className="mb-4">
            <p className="font-medium">{questions[questionIndex].question}</p>
            <p className="text-green-600">Correct answer: {questions[questionIndex].answer}</p>
            <p className={userAnswers[index] === questions[questionIndex].answer ? "text-green-600" : "text-red-600"}>
              Your answer: {userAnswers[index] || "Not answered"}
            </p>
          </div>
        ))}
        <div className="flex space-x-4 mt-4">
          <Button onClick={handleRetake}>Retake Quiz</Button>
          <ShareResults quizTitle={quizTitle} score={score} totalQuestions={selectedQuestions.length} />
        </div>
      </CardContent>
    </Card>
  )
}

export default Feedback


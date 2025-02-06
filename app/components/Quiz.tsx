"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../../store"
import { setCurrentQuestion, setUserAnswers, setSelectedQuestions } from "../../store/quizSlice"
import axios from "axios"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QuestionDisplay from "./QuestionDisplay"
import LectureSelection from "./LectureSelection"
import Feedback from "./Feedback"

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [showFeedback, setShowFeedback] = useState(false)
  const { currentQuestion, userAnswers, selectedQuestions } = useSelector((state: RootState) => state.quiz)
  const { isAuthenticated, username } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuestions()
    }
  }, [isAuthenticated])

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("https://bbf-backend.onrender.com/api/quiz/questions")
      setQuestions(response.data)
      dispatch(setSelectedQuestions(response.data.map((_, index) => index)))
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestion] = answer
    dispatch(setUserAnswers(newAnswers))
  }

  const handleNext = () => {
    if (currentQuestion < selectedQuestions.length - 1) {
      dispatch(setCurrentQuestion(currentQuestion + 1))
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      dispatch(setCurrentQuestion(currentQuestion - 1))
    }
  }

  const handleSubmit = () => {
    setShowFeedback(true)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>BBF Labs Quiz</CardTitle>
          <CardDescription>Welcome, {username}!</CardDescription>
        </CardHeader>
        <CardContent>
          {showFeedback ? (
            <Feedback questions={questions} userAnswers={userAnswers} selectedQuestions={selectedQuestions} />
          ) : (
            <>
              <LectureSelection />
              <QuestionDisplay
                question={questions[selectedQuestions[currentQuestion]]}
                userAnswer={userAnswers[currentQuestion]}
                onAnswer={handleAnswer}
              />
              <div className="flex justify-between mt-4">
                <Button onClick={handlePrevious} disabled={currentQuestion === 0}>
                  Previous
                </Button>
                <Button onClick={handleNext} disabled={currentQuestion === selectedQuestions.length - 1}>
                  Next
                </Button>
              </div>
              <Button onClick={handleSubmit} className="w-full mt-4">
                Submit Quiz
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default Quiz


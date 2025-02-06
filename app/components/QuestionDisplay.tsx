"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface Question {
  question: string
  options: string[]
  answer: string
}

interface QuestionDisplayProps {
  question: Question
  userAnswer: string
  onAnswer: (answer: string) => void
}

const QuestionDisplay = ({ question, userAnswer, onAnswer }: QuestionDisplayProps) => {
  const [localAnswer, setLocalAnswer] = useState(userAnswer || "")

  useEffect(() => {
    setLocalAnswer(userAnswer || "")
  }, [userAnswer])

  if (!question) return null

  const handleChange = (value: string) => {
    setLocalAnswer(value)
    onAnswer(value)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{question.question}</h3>
      {question.options.length === 1 ? (
        <Input
          type="text"
          value={localAnswer}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Enter your answer"
        />
      ) : (
        <RadioGroup value={localAnswer} onValueChange={handleChange}>
          {question.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={option[0]} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      )}
    </div>
  )
}

export default QuestionDisplay


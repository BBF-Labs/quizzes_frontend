"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const tutorialSteps = [
  {
    title: "Welcome to BBF Labs Quiz",
    description: "This tutorial will guide you through the main features of our quiz system.",
  },
  {
    title: "Selecting a Quiz",
    description:
      "Browse available quizzes and select one to start. You can see details like the number of questions and time limit.",
  },
  {
    title: "Taking a Quiz",
    description:
      "Answer questions by selecting the correct option or typing your answer. Use the Next and Previous buttons to navigate.",
  },
  {
    title: "Quiz Features",
    description: "Set a timer for your quiz, use hints when available, and report any issues with questions.",
  },
  {
    title: "Submitting and Reviewing",
    description:
      "Submit your quiz to see your score and review correct answers. You can retake quizzes to improve your score.",
  },
  {
    title: "Tracking Progress",
    description: "View your progress on the dashboard, including completed quizzes and scores.",
  },
]

const Tutorial = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsOpen(false)
      setCurrentStep(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Start Tutorial</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tutorialSteps[currentStep].title}</DialogTitle>
          <DialogDescription>{tutorialSteps[currentStep].description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-between mt-4">
          <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={handleNext}>{currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Tutorial


"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"

interface ShareResultsProps {
  quizTitle: string
  score: number
  totalQuestions: number
}

export default function ShareResults({ quizTitle, score, totalQuestions }: ShareResultsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState("")

  const shareImage = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og?type=quiz&title=${encodeURIComponent(quizTitle)}&description=I scored ${score}/${totalQuestions}!`

  const shareText = `I just completed the "${quizTitle}" quiz on BBF Labs and scored ${score}/${totalQuestions}! ${customMessage}`

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareImage)}`
    window.open(url, "_blank")
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareImage)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, "_blank")
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText} ${shareImage}`).then(() => {
      toast.success("Copied to clipboard!")
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Share Results</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Your Quiz Results</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="custom-message">Add a custom message (optional)</Label>
            <Input
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Great quiz! You should try it too!"
            />
          </div>
          <div className="flex space-x-2">
            <Button onClick={shareToTwitter}>Share on Twitter</Button>
            <Button onClick={shareToFacebook}>Share on Facebook</Button>
            <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


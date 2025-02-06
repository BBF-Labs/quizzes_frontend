import { useState } from "react"
import { useDispatch } from "react-redux"
import { setSelectedQuestions, setQuizType } from "../../store/quizSlice"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const lectureRanges = [
  { start: 0, end: 37, name: "Lecture 1: Trivial" },
  { start: 38, end: 64, name: "Lecture 2: Trivial" },
  { start: 65, end: 76, name: "Lecture 3: Trivial" },
  { start: 77, end: 86, name: "Lecture 4: Trivial" },
  { start: 87, end: 101, name: "Lecture 5: Trivial" },
  { start: 102, end: 116, name: "Lecture 6: Trivial" },
  { start: 117, end: 210, name: "Not So Obvious" },
  { start: 211, end: 232, name: "Group Questions" },
]

const LectureSelection = () => {
  const [selectedLectures, setSelectedLectures] = useState<number[]>([])
  const dispatch = useDispatch()

  const handleLectureToggle = (index: number) => {
    setSelectedLectures((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]))
  }

  const handleApply = () => {
    if (selectedLectures.length === 0) {
      alert("Please select at least one lecture.")
      return
    }

    const newSelectedQuestions = selectedLectures.flatMap((index) => {
      const range = lectureRanges[index]
      return Array.from({ length: range.end - range.start + 1 }, (_, i) => range.start + i)
    })

    dispatch(setSelectedQuestions(newSelectedQuestions))
    dispatch(setQuizType("custom"))
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Select Lectures</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Lectures</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {lectureRanges.map((range, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`lecture-${index}`}
                checked={selectedLectures.includes(index)}
                onCheckedChange={() => handleLectureToggle(index)}
              />
              <label htmlFor={`lecture-${index}`}>{range.name}</label>
            </div>
          ))}
        </div>
        <Button onClick={handleApply}>Apply Selection</Button>
      </DialogContent>
    </Dialog>
  )
}

export default LectureSelection


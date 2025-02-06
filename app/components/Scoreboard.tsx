"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ScoreboardEntry {
  username: string
  score: number
  completedAt: string
}

const Scoreboard = ({ quizId }: { quizId: string }) => {
  const [scores, setScores] = useState<ScoreboardEntry[]>([])

  useEffect(() => {
    fetchScoreboard()
  }, []) // Removed quizId from dependency array

  const fetchScoreboard = async () => {
    try {
      const response = await axios.get(`https://bbf-backend.onrender.com/api/quizzes/${quizId}/scoreboard`)
      setScores(response.data)
    } catch (error) {
      console.error("Error fetching scoreboard:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoreboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Completed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((entry, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{entry.username}</TableCell>
                <TableCell>{entry.score}</TableCell>
                <TableCell>{new Date(entry.completedAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default Scoreboard


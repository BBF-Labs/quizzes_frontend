"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNotifications } from "@/hooks/useNotifications"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from "chart.js"
import type { DashboardStats } from "@/types"
import api from "@/services/api"

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, Title, Tooltip, Legend, PointElement)

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const { showNotification } = useNotifications()

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/user/dashboard-stats")
      setStats(response.data)
    } catch (error) {
      showNotification({
        type: "error",
        message: "Failed to fetch dashboard statistics",
      })
    }
  }

  if (!stats) return <div>Loading...</div>

  const scoreDistributionData = {
    labels: stats.scoreDistribution.map((d) => `${d.score}%`),
    datasets: [
      {
        label: "Score Distribution",
        data: stats.scoreDistribution.map((d) => d.count),
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const progressData = {
    labels: stats.recentProgress.map((p) => new Date(p.completedAt).toLocaleDateString()),
    datasets: [
      {
        label: "Recent Scores",
        data: stats.recentProgress.map((p) => p.score[0]),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalQuizzes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.averageScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.completedCourses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quizzes Taken</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.quizzesTaken}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={scoreDistributionData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Line data={progressData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


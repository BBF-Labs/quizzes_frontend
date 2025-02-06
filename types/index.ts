import type { Types } from "mongoose"

export interface IUser extends Document {
  _id: Types.ObjectId
  name?: string
  username: string
  email: string
  password: string
  authKey?: string
  courses?: Types.ObjectId[]
  role: "student" | "admin" | "moderator"
  isBanned: boolean
  accessType?: "quiz" | "course" | "duration" | "default"
  isSubscribed: boolean
  hasFreeAccess?: boolean
  freeAccessCount?: number
  quizCredits?: number
  paymentId?: Types.ObjectId[]
  packageId?: Types.ObjectId[]
  lastLogin?: Date
  isDeleted?: boolean
}

export interface IProgress extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  score: number[]
  courseCode: Types.ObjectId
  quizId: Types.ObjectId
  lastSavedProgress: any[]
  completedAt: Date
}

export interface DashboardStats {
  totalQuizzes: number
  averageScore: number
  completedCourses: number
  quizzesTaken: number
  recentProgress: IProgress[]
  scoreDistribution: { score: number; count: number }[]
}


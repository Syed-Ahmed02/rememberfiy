"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Calendar, TrendingUp, Star, Loader } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { useGetUserQuizzes, useGetQuizzesDueForReview, useGetUserStats, useGetBestAttempt } from "@/lib/convex-client"
import { ConvexQuiz } from "@/lib/convex-client"

interface Quiz {
  id: string
  title: string
  subject: string
  score: number
  totalQuestions: number
  lastReviewDate: Date
  nextReviewDate: Date
  reviewCount: number
  difficulty: "Easy" | "Medium" | "Hard"
}

interface DashboardScreenProps {
  onTakeQuiz: (quizId?: string) => void
  onCreateNewQuiz: () => void
}

export function DashboardScreen({ onTakeQuiz, onCreateNewQuiz }: DashboardScreenProps) {
  const { convexUserId } = useAppContext()
  
  // Fetch data from Convex
  const userQuizzes = useGetUserQuizzes(convexUserId)
  const dueQuizzes = useGetQuizzesDueForReview(convexUserId)
  const userStats = useGetUserStats(convexUserId)

  const getSubjectFromFileType = (fileType: string): string => {
    switch (fileType) {
      case 'pdf':
        return 'PDF Document'
      case 'image':
        return 'Image Content'
      case 'text':
        return 'Text Content'
      default:
        return 'Study Material'
    }
  }

  // Transform Convex quizzes to component format
  const quizzes: Quiz[] = (userQuizzes || []).map((quiz: ConvexQuiz) => ({
    id: quiz._id,
    title: quiz.title,
    subject: getSubjectFromFileType(quiz.fileType),
    score: 0, // Will be calculated from best attempt
    totalQuestions: 0, // Will be calculated from questions
    lastReviewDate: new Date(quiz.lastReviewedAt || quiz.createdAt),
    nextReviewDate: new Date(quiz.nextReviewAt),
    reviewCount: quiz.reviewCount,
    difficulty: quiz.difficulty as "Easy" | "Medium" | "Hard",
  }))

  const getReviewStatus = (nextReviewDate: Date) => {
    const today = new Date()
    const diffTime = nextReviewDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0)
      return { status: "overdue", text: `${Math.abs(diffDays)} days overdue`, color: "bg-red-100 text-red-800" }
    if (diffDays === 0) return { status: "due", text: "Due today", color: "bg-orange-100 text-orange-800" }
    if (diffDays <= 2)
      return {
        status: "soon",
        text: `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
        color: "bg-yellow-100 text-yellow-800",
      }
    return { status: "future", text: `Due in ${diffDays} days`, color: "bg-green-100 text-green-800" }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  // Show loading state
  if (!convexUserId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Learning Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress and review schedule</p>
        </div>
        <Button onClick={onCreateNewQuiz} className="bg-blue-600 hover:bg-blue-700">
          <BookOpen className="w-4 h-4 mr-2" />
          Create New Quiz
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalQuizzes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats?.averageScore || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Due for Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dueQuizzes?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Studied</p>
                <p className="text-2xl font-bold text-gray-900">{userStats?.totalTimeStudied || 0}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Your Quizzes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quizzes.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quizzes Yet</h3>
              <p className="text-gray-600 mb-4">Create your first quiz to start learning!</p>
              <Button onClick={onCreateNewQuiz} className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Create Your First Quiz
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {quizzes.map((quiz) => {
                const reviewStatus = getReviewStatus(quiz.nextReviewDate)
                return (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                          <Badge variant="secondary" className={getDifficultyColor(quiz.difficulty)}>
                            {quiz.difficulty}
                          </Badge>
                          <Badge variant="secondary" className={reviewStatus.color}>
                            {reviewStatus.text}
                          </Badge>
                        </div>

                        <p className="text-gray-600 mb-3">{quiz.subject}</p>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Last: {formatDate(quiz.lastReviewDate)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Next: {formatDate(quiz.nextReviewDate)}</span>
                          </div>
                          <div>
                            <span>Reviews: {quiz.reviewCount}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => onTakeQuiz(quiz.id)}
                        variant={
                          reviewStatus.status === "overdue" || reviewStatus.status === "due" ? "default" : "outline"
                        }
                        className={
                          reviewStatus.status === "overdue" || reviewStatus.status === "due"
                            ? "bg-blue-600 hover:bg-blue-700"
                            : ""
                        }
                      >
                        {reviewStatus.status === "overdue" || reviewStatus.status === "due" ? "Review Now" : "Practice"}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

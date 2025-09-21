"use client"

import { useRouter } from "next/navigation"
import { DashboardScreen } from "@/components/dashboard-screen"

export default function DashboardPage() {
  const router = useRouter()

  const handleTakeQuiz = (quizId?: string) => {
    if (quizId) {
      router.push(`/quiz?id=${quizId}`)
    } else {
      router.push("/quiz")
    }
  }

  const handleCreateNewQuiz = () => {
    router.push("/upload")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DashboardScreen onTakeQuiz={handleTakeQuiz} onCreateNewQuiz={handleCreateNewQuiz} />
    </div>
  )
}

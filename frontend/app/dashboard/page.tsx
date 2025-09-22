"use client"

import { useRouter } from "next/navigation"
import { DashboardScreen } from "@/components/dashboard-screen"
import { SignInButton } from "@clerk/nextjs"
import { UserButton } from "@clerk/nextjs"

import { Authenticated, Unauthenticated } from "convex/react";

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
      <Authenticated>
        <DashboardScreen onTakeQuiz={handleTakeQuiz} onCreateNewQuiz={handleCreateNewQuiz} />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </div>
  )
}

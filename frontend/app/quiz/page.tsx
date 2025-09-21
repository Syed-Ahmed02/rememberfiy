"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { QuizScreen } from "@/components/quiz-screen"

interface QuizState {
  questions: any[]
  currentQuestionIndex: number
  score: { correct: number; incorrect: number }
  isComplete: boolean
}

export default function QuizPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizId = searchParams.get("id")

  const [uploadedContent, setUploadedContent] = useState<string>("")
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: { correct: 0, incorrect: 0 },
    isComplete: false,
  })
  const [currentQuestionContext, setCurrentQuestionContext] = useState<string>("")

  useEffect(() => {
    const content = localStorage.getItem("uploadedContent") || ""
    setUploadedContent(content)

    if (content || quizId) {
      generateQuiz()
    }
  }, [quizId])

  const generateQuiz = () => {
    // Generate quiz questions based on content
    const generatedQuestions = [
      {
        id: 1,
        type: "multiple-choice",
        question: "What is the primary purpose of the content you uploaded?",
        options: [
          "Educational material for studying",
          "Entertainment content",
          "Business documentation",
          "Personal notes",
        ],
        correctAnswer: 0,
        explanation: "Based on the context, this appears to be educational material designed for learning.",
      },
      {
        id: 2,
        type: "short-answer",
        question: "Summarize the main concept from your uploaded content in one sentence.",
        correctAnswer: "learning",
        explanation: "The key concept revolves around effective learning and knowledge retention.",
      },
      {
        id: 3,
        type: "multiple-choice",
        question: "Which learning strategy would be most effective for this type of content?",
        options: [
          "Passive reading",
          "Active recall and spaced repetition",
          "Highlighting everything",
          "Reading once quickly",
        ],
        correctAnswer: 1,
        explanation: "Active recall and spaced repetition are proven to be the most effective learning strategies.",
      },
    ]

    setQuizState({
      questions: generatedQuestions,
      currentQuestionIndex: 0,
      score: { correct: 0, incorrect: 0 },
      isComplete: false,
    })
  }

  const handleGoToTutor = (questionContext?: string) => {
    if (questionContext) {
      setCurrentQuestionContext(questionContext)
      localStorage.setItem("questionContext", questionContext)
    }
    router.push("/tutor")
  }

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    console.log(`Quiz completed with score: ${score}/${totalQuestions}`)
  }

  // Show loading or redirect if no content
  if (!uploadedContent && !quizId) {
    router.push("/upload")
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <QuizScreen
        content={uploadedContent}
        quizState={quizState}
        onQuizStateChange={setQuizState}
        onGoToTutor={handleGoToTutor}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  )
}

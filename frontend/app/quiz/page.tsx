"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { QuizScreen } from "@/components/quiz-screen"
import { useAppContext } from "@/contexts/app-context"
import { apiClient } from "@/lib/api-client"
import { useCreateQuiz, useRecordQuizAttempt, useUpdateQuizReview, useGetQuizWithQuestions } from "@/lib/convex-client"
import { Id } from "@/convex/_generated/dataModel"
import { generateQuizData } from "@/lib/convex-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

// Local interface for quiz screen compatibility
interface Question {
  id: number
  type: "multiple-choice" | "short-answer"
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

interface LocalQuizState {
  questions: Question[]
  currentQuestionIndex: number
  score: { correct: number; incorrect: number }
  isComplete: boolean
}

export default function QuizPage() {
  const componentId = Math.random().toString(36).substr(2, 9)
  console.log(`QuizPage component rendered: ${componentId}`)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const quizId = searchParams.get("id")

  const { 
    uploadState, 
    quizState, 
    setQuizState, 
    convexUserId, 
    isLoading, 
    setIsLoading, 
    error, 
    setError,
    setCurrentQuestionContext 
  } = useAppContext()

  const createQuiz = useCreateQuiz()
  const recordQuizAttempt = useRecordQuizAttempt()
  const updateQuizReview = useUpdateQuizReview()
  const existingQuiz = useGetQuizWithQuestions(quizId as any)

  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [quizGenerated, setQuizGenerated] = useState(false)
  const [localQuizState, setLocalQuizState] = useState<LocalQuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: { correct: 0, incorrect: 0 },
    isComplete: false,
  })
  
  const hasGeneratedRef = useRef(false)
  const currentContentRef = useRef<string>("")

  const generateQuiz = useCallback(async () => {
    if (!uploadState.content || !convexUserId || hasGeneratedRef.current) return

    // Check if we've already generated for this content
    if (currentContentRef.current === uploadState.content) {
      console.log('Already generated quiz for this content, skipping...')
      return
    }

    console.log('generateQuiz called - setting isGeneratingQuiz to true')
    hasGeneratedRef.current = true
    currentContentRef.current = uploadState.content
    setIsGeneratingQuiz(true)
    setError(null)

    try {
      // Generate quiz using backend API
      console.log('Calling backend API for quiz generation...')
      const response = await apiClient.generateQuiz(uploadState.content, 'Medium')
      console.log('Quiz generation response:', response)

      if (response.success && response.quiz) {
        console.log('Quiz generated successfully, creating in Convex...')
        // Convert backend quiz format to local quiz format
        const localQuestions: Question[] = response.quiz.questions.map((q: any, index: number) => ({
          id: index + 1,
          type: q.type as "multiple-choice" | "short-answer",
          question: q.question,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
        }))

        // Create quiz in Convex
        const quizData = generateQuizData(response.quiz, uploadState.content, uploadState.fileType, uploadState.fileName)
        console.log('Quiz data for Convex:', quizData)
        console.log('First question correct answer:', quizData.questions[0]?.correctAnswer, typeof quizData.questions[0]?.correctAnswer)
        
        let convexQuizId = null
        try {
          convexQuizId = await createQuiz({
            userId: convexUserId,
            ...quizData,
          })
          console.log('Successfully created quiz in Convex:', convexQuizId)
        } catch (convexError) {
          console.error('Convex creation failed, proceeding without persistence:', convexError)
          // Generate a temporary ID so the quiz can still work
          convexQuizId = `temp_${Date.now()}`
        }

        // Update local quiz state for UI
        setLocalQuizState({
          questions: localQuestions,
          currentQuestionIndex: 0,
          score: { correct: 0, incorrect: 0 },
          isComplete: false,
        })

        // Update app quiz state for persistence
        setQuizState({
          quizId: convexQuizId,
          questions: response.quiz.questions,
          currentQuestionIndex: 0,
          score: { correct: 0, incorrect: 0 },
          isComplete: false,
          answers: [],
          startTime: Date.now(),
        })

        console.log('Setting quizGenerated to true')
        setQuizGenerated(true)
      } else {
        setError(response.message || "Failed to generate quiz")
      }
    } catch (err) {
      console.error("Quiz generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate quiz")
      // Don't reset hasGeneratedRef on Convex errors to prevent loops
      // Only reset if it's an API error, not a Convex validation error
      const errorMessage = err instanceof Error ? err.message : String(err)
      if (!errorMessage.includes('ArgumentValidationError')) {
        hasGeneratedRef.current = false
        currentContentRef.current = ""
      }
    } finally {
      console.log('generateQuiz completed - setting isGeneratingQuiz to false')
      setIsGeneratingQuiz(false)
    }
  }, [uploadState.content, uploadState.fileType, uploadState.fileName, convexUserId, createQuiz])

  // Reset refs when we navigate away and come back
  useEffect(() => {
    return () => {
      // Cleanup function to reset refs when component unmounts
      hasGeneratedRef.current = false
      currentContentRef.current = ""
    }
  }, [])

  useEffect(() => {
    if (quizId && existingQuiz && !quizGenerated) {
      // Load existing quiz
      const questions: Question[] = existingQuiz.questions.map((q: any, index: number) => ({
        id: index + 1,
        type: q.questionType as "multiple-choice" | "short-answer",
        question: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }))

      setLocalQuizState({
        questions,
        currentQuestionIndex: 0,
        score: { correct: 0, incorrect: 0 },
        isComplete: false,
      })

      setQuizState({
        quizId: existingQuiz._id,
        questions: existingQuiz.questions.map((q: any) => ({
          question: q.questionText,
          type: q.questionType,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation,
        })),
        currentQuestionIndex: 0,
        score: { correct: 0, incorrect: 0 },
        isComplete: false,
        answers: [],
        startTime: Date.now(),
      })
      setQuizGenerated(true)
    }
  }, [quizId, existingQuiz, quizGenerated])

  // Separate useEffect for generating new quiz
  useEffect(() => {
    console.log(`Quiz useEffect triggered [${componentId}]:`, {
      hasContent: !!uploadState.content,
      quizGenerated,
      isGeneratingQuiz,
      quizId,
      convexUserId,
      contentLength: uploadState.content?.length || 0,
      hasGeneratedRef: hasGeneratedRef.current
    })
    
    // More restrictive conditions to prevent multiple calls
    const shouldGenerate = uploadState.content && 
                          uploadState.content.length > 10 && // Ensure we have meaningful content
                          !quizGenerated && 
                          !isGeneratingQuiz && 
                          !quizId && 
                          convexUserId && 
                          !hasGeneratedRef.current
    
    if (shouldGenerate) {
      console.log('About to generate quiz...')
      generateQuiz()
    }
  }, [uploadState.content, quizGenerated, isGeneratingQuiz, quizId, convexUserId, generateQuiz])

  const handleGoToTutor = (questionContext?: string) => {
    if (questionContext) {
      setCurrentQuestionContext(questionContext)
      localStorage.setItem("questionContext", questionContext)
    }
    router.push("/tutor")
  }

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!convexUserId || !quizState.quizId) return

    // Skip Convex operations for temporary quiz IDs
    if (typeof quizState.quizId === 'string' && quizState.quizId.startsWith('temp_')) {
      console.log('Skipping Convex operations for temporary quiz ID')
      return
    }

    try {
      // Record quiz attempt
      const timeTaken = quizState.startTime ? (Date.now() - quizState.startTime) / 1000 : undefined
      
      await recordQuizAttempt({
        quizId: quizState.quizId as Id<'quizzes'>,
        userId: convexUserId,
        score,
        totalQuestions,
        answers: quizState.answers,
        timeTaken,
      })

      // Update quiz review schedule
      await updateQuizReview({
        quizId: quizState.quizId as Id<'quizzes'>,
        score,
        totalQuestions,
      })

      console.log(`Quiz completed with score: ${score}/${totalQuestions}`)
    } catch (err) {
      console.error("Error saving quiz completion:", err)
    }
  }

  // Show loading if generating quiz
  if (isGeneratingQuiz) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-center">Generating Your Quiz</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Our AI is creating personalized questions based on your content...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error if quiz generation failed
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Quiz Generation Failed</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => router.push("/upload")}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Back to Upload
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Redirect if no content and no quiz ID
  if (!uploadState.content && !quizId) {
    router.push("/upload")
    return null
  }

  // Don't render quiz screen until quiz is generated
  if (!quizGenerated || !localQuizState.questions.length) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <QuizScreen
        content={uploadState.content}
        quizState={localQuizState}
        onQuizStateChange={setLocalQuizState}
        onGoToTutor={handleGoToTutor}
        onQuizComplete={handleQuizComplete}
      />
    </div>
  )
}

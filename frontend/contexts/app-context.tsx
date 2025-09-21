"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Id } from "../convex/_generated/dataModel"
import { useGetOrCreateUser, useGetUserByClerkId } from "../lib/convex-client"

export interface QuizQuestion {
  question: string
  type: string
  options?: string[]
  correct_answer: string
  explanation: string
}

export interface QuizState {
  quizId?: Id<'quizzes'> | string // Allow string for temporary IDs
  questions: QuizQuestion[]
  currentQuestionIndex: number
  score: { correct: number; incorrect: number }
  isComplete: boolean
  answers: any[]
  startTime?: number
}

export interface UploadState {
  content: string
  summary?: string
  fileType: string
  fileName?: string
  filePath?: string
}

interface AppContextType {
  // User state
  convexUserId?: Id<'users'>
  
  // Upload state
  uploadState: UploadState
  setUploadState: (state: UploadState) => void
  
  // Quiz state
  quizState: QuizState
  setQuizState: (state: QuizState) => void
  
  // Tutor state
  currentQuestionContext: string
  setCurrentQuestionContext: (context: string) => void
  
  // Loading states
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Error handling
  error: string | null
  setError: (error: string | null) => void
  
  // Utility functions
  resetQuiz: () => void
  resetUpload: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const getOrCreateUser = useGetOrCreateUser()
  const convexUser = useGetUserByClerkId(user?.id)
  
  // State management
  const [convexUserId, setConvexUserId] = useState<Id<'users'> | undefined>()
  const [uploadState, setUploadState] = useState<UploadState>({
    content: "",
    fileType: "text"
  })
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: { correct: 0, incorrect: 0 },
    isComplete: false,
    answers: [],
  })
  const [currentQuestionContext, setCurrentQuestionContext] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Get or create user in Convex when clerk user loads
  useEffect(() => {
    const initializeUser = async () => {
      if (isLoaded && user && !convexUser) {
        try {
          const userId = await getOrCreateUser({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.fullName || undefined,
          })
          setConvexUserId(userId)
        } catch (err) {
          console.error('Failed to initialize user:', err)
          setError('Failed to initialize user')
        }
      }
    }

    initializeUser()
  }, [isLoaded, user, convexUser, getOrCreateUser])

  // Set convex user ID when user data is available
  useEffect(() => {
    if (convexUser) {
      setConvexUserId(convexUser._id)
    }
  }, [convexUser])

  // Utility functions
  const resetQuiz = () => {
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      score: { correct: 0, incorrect: 0 },
      isComplete: false,
      answers: [],
    })
    setCurrentQuestionContext("")
  }

  const resetUpload = () => {
    setUploadState({
      content: "",
      fileType: "text"
    })
    setError(null)
  }

  return (
    <AppContext.Provider
      value={{
        convexUserId,
        uploadState,
        setUploadState,
        quizState,
        setQuizState,
        currentQuestionContext,
        setCurrentQuestionContext,
        isLoading,
        setIsLoading,
        error,
        setError,
        resetQuiz,
        resetUpload,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

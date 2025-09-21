"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface QuizState {
  questions: any[]
  currentQuestionIndex: number
  score: { correct: number; incorrect: number }
  isComplete: boolean
}

interface AppContextType {
  uploadedContent: string
  setUploadedContent: (content: string) => void
  quizState: QuizState
  setQuizState: (state: QuizState) => void
  currentQuestionContext: string
  setCurrentQuestionContext: (context: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [uploadedContent, setUploadedContent] = useState<string>("")
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: { correct: 0, incorrect: 0 },
    isComplete: false,
  })
  const [currentQuestionContext, setCurrentQuestionContext] = useState<string>("")

  return (
    <AppContext.Provider
      value={{
        uploadedContent,
        setUploadedContent,
        quizState,
        setQuizState,
        currentQuestionContext,
        setCurrentQuestionContext,
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

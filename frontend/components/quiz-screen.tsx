"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, XCircle, MessageCircle, Calendar, Trophy, TrendingUp } from "lucide-react"

interface Question {
  id: number
  type: "multiple-choice" | "short-answer"
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation?: string
}

interface QuizState {
  questions: Question[]
  currentQuestionIndex: number
  score: { correct: number; incorrect: number }
  isComplete: boolean
}

interface QuizScreenProps {
  content: string
  quizState: QuizState
  onQuizStateChange: (state: QuizState) => void
  onGoToTutor: (questionContext?: string) => void
  onQuizComplete?: (score: number, totalQuestions: number) => void
}

export function QuizScreen({ content, quizState, onQuizStateChange, onGoToTutor, onQuizComplete }: QuizScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null)
  const [shortAnswer, setShortAnswer] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(quizState.questions.length).fill(false),
  )

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
  const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100

  const handleAnswerSubmit = () => {
    const userAnswer = currentQuestion.type === "multiple-choice" ? selectedAnswer : shortAnswer.toLowerCase()
    
    // Debug logging
    if (currentQuestion.type === "multiple-choice") {
      console.log('Quiz Debug:', {
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        correctAnswerType: typeof currentQuestion.correctAnswer,
        correctAnswerAsNumber: Number(currentQuestion.correctAnswer),
        options: currentQuestion.options
      })
    }
    
    const isCorrect =
      currentQuestion.type === "multiple-choice"
        ? selectedAnswer === Number(currentQuestion.correctAnswer)
        : typeof currentQuestion.correctAnswer === "string" &&
          shortAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase())

    setShowResult(true)

    const newScore = isCorrect
      ? { ...quizState.score, correct: quizState.score.correct + 1 }
      : { ...quizState.score, incorrect: quizState.score.incorrect + 1 }

    onQuizStateChange({
      ...quizState,
      score: newScore,
    })

    const newAnsweredQuestions = [...answeredQuestions]
    newAnsweredQuestions[quizState.currentQuestionIndex] = true
    setAnsweredQuestions(newAnsweredQuestions)
  }

  const handleNextQuestion = () => {
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      onQuizStateChange({
        ...quizState,
        currentQuestionIndex: quizState.currentQuestionIndex + 1,
      })
      setSelectedAnswer(null)
      setShortAnswer("")
      setShowResult(false)
    } else {
      const updatedState = {
        ...quizState,
        isComplete: true,
      }
      onQuizStateChange(updatedState)

      const totalQuestions = quizState.questions.length
      const correctAnswers = quizState.score.correct + (showResult && isLastQuestionCorrect() ? 1 : 0)
      onQuizComplete?.(correctAnswers, totalQuestions)
    }
  }

  const isLastQuestionCorrect = () => {
    const userAnswer = currentQuestion.type === "multiple-choice" ? selectedAnswer : shortAnswer.toLowerCase()
    return currentQuestion.type === "multiple-choice"
      ? userAnswer === currentQuestion.correctAnswer
      : typeof currentQuestion.correctAnswer === "string" &&
          shortAnswer.toLowerCase().includes(currentQuestion.correctAnswer.toLowerCase())
  }

  const calculateNextReviewDate = (score: number, totalQuestions: number) => {
    const percentage = (score / totalQuestions) * 100
    const today = new Date()
    let daysToAdd = 1 // Default: review tomorrow

    if (percentage >= 90)
      daysToAdd = 7 // 1 week
    else if (percentage >= 80)
      daysToAdd = 3 // 3 days
    else if (percentage >= 70) daysToAdd = 2 // 2 days

    const nextReview = new Date(today)
    nextReview.setDate(today.getDate() + daysToAdd)
    return nextReview
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent work! You've mastered this material."
    if (score >= 80) return "Great job! You have a solid understanding."
    if (score >= 70) return "Good effort! A bit more review will help."
    return "Keep practicing! Review the material and try again."
  }

  if (quizState.isComplete) {
    const totalQuestions = quizState.questions.length
    const correctAnswers = quizState.score.correct
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const nextReviewDate = calculateNextReviewDate(correctAnswers, totalQuestions)

    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Trophy className="w-12 h-12 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">Quiz Complete!</CardTitle>
            <p className="text-gray-600">Here's how you performed</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <div className={`text-6xl font-bold ${getScoreColor(percentage)}`}>{percentage}%</div>
                <p className="text-lg text-gray-600">
                  {correctAnswers} out of {totalQuestions} correct
                </p>
                <p className="text-gray-700 font-medium">{getScoreMessage(percentage)}</p>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Correct</span>
                </div>
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Incorrect</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{quizState.score.incorrect}</div>
              </div>
            </div>

            {/* Next Review Date */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Recommended Next Review</span>
              </div>
              <p className="text-blue-700">
                {nextReviewDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Based on your {percentage}% score, we recommend reviewing this material in{" "}
                {Math.ceil((nextReviewDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} day(s)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                <TrendingUp className="w-4 h-4 mr-2" />
                Take Again
              </Button>
              <Button onClick={() => onGoToTutor()} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-2" />
                Study with Tutor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-900">
                Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  {quizState.score.correct}
                </div>
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  {quizState.score.incorrect}
                </div>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 leading-relaxed">{currentQuestion.question}</h3>

            {currentQuestion.type === "multiple-choice" ? (
              <div className="space-y-3">
                {currentQuestion.options?.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full text-left justify-start p-4 h-auto whitespace-normal ${
                      showResult
                        ? index === Number(currentQuestion.correctAnswer)
                          ? "bg-green-100 border-green-500 text-green-800"
                          : selectedAnswer === index && index !== Number(currentQuestion.correctAnswer)
                            ? "bg-red-100 border-red-500 text-red-800"
                            : ""
                        : selectedAnswer === index
                          ? "bg-blue-100 border-blue-500"
                          : "hover:bg-gray-50"
                    }`}
                    onClick={() => !showResult && setSelectedAnswer(index)}
                    disabled={showResult}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  placeholder="Type your answer here..."
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                  disabled={showResult}
                  className="text-base p-4"
                />
              </div>
            )}
          </div>

          {showResult && currentQuestion.explanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm">
                <strong>Explanation:</strong> {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            {!showResult ? (
              <Button
                onClick={handleAnswerSubmit}
                disabled={currentQuestion.type === "multiple-choice" ? selectedAnswer === null : !shortAnswer.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Submit Answer
              </Button>
            ) : (
              <>
                <Button onClick={handleNextQuestion} className="flex-1">
                  {quizState.currentQuestionIndex < quizState.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onGoToTutor(currentQuestion.question)}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <MessageCircle className="w-4 h-4" />
                  Go to Tutor
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

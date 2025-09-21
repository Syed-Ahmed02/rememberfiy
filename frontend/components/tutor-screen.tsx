"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User, Loader } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"
import { apiClient } from "@/lib/api-client"
import { useRecordTutorSession } from "@/lib/convex-client"

interface Message {
  id: number
  content: string
  sender: "user" | "tutor"
  timestamp: Date
}

interface TutorScreenProps {
  questionContext?: string
  uploadedContent?: string
}

export function TutorScreen({ questionContext, uploadedContent }: TutorScreenProps) {
  const { 
    convexUserId, 
    quizState, 
    currentQuestionContext, 
    setCurrentQuestionContext,
    isLoading,
    setIsLoading,
    error,
    setError 
  } = useAppContext()
  
  const recordTutorSession = useRecordTutorSession()
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content:
        "Hello! I'm your AI tutor. I'm here to help you understand the concepts from your study material using the Socratic method. What would you like to explore or clarify?",
      sender: "tutor",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)
  const [attemptCount, setAttemptCount] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (questionContext && messages.length === 1) {
      const contextMessage: Message = {
        id: 2,
        content: `I see you're working on this question: "${questionContext}". Let's explore this together. What aspects of this question would you like to discuss?`,
        sender: "tutor",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, contextMessage])
    }
  }, [questionContext])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGeneratingResponse) return

    const userMessage: Message = {
      id: messages.length + 1,
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputMessage
    setInputMessage("")
    setIsGeneratingResponse(true)
    setError(null)

    try {
      // Use the question context from props or app context
      const questionToUse = questionContext || currentQuestionContext || "General learning question"
      
      // Get AI tutor response
      const response = await apiClient.getSocraticResponse(
        questionToUse,
        currentInput,
        attemptCount
      )

      if (response.success && response.response) {
        const tutorMessage: Message = {
          id: messages.length + 2,
          content: response.response,
          sender: "tutor",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, tutorMessage])

        // Record tutor session in Convex
        if (convexUserId) {
          // Only pass quizId if it's a valid Convex ID (not a string)
          const validQuizId = typeof quizState.quizId === 'string' ? undefined : quizState.quizId
          
          await recordTutorSession({
            userId: convexUserId,
            quizId: validQuizId,
            questionText: questionToUse,
            userAnswer: currentInput,
            tutorResponse: response.response,
            isCorrect: response.isCorrect,
          })
        }

        setAttemptCount(prev => prev + 1)
      } else {
        // Fallback to simulated response
        const fallbackResponse = generateFallbackResponse(currentInput)
        const tutorMessage: Message = {
          id: messages.length + 2,
          content: fallbackResponse,
          sender: "tutor",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, tutorMessage])
      }
    } catch (err) {
      console.error("Tutor response error:", err)
      // Show fallback response on error
      const fallbackResponse = generateFallbackResponse(currentInput)
      const tutorMessage: Message = {
        id: messages.length + 2,
        content: fallbackResponse,
        sender: "tutor",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, tutorMessage])
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  const generateFallbackResponse = (userInput: string): string => {
    const responses = [
      "That's an interesting point! Can you tell me what led you to that conclusion?",
      "I see you're thinking about this. What do you think would happen if we approached it differently?",
      "Good observation! How does this connect to what you learned earlier in your material?",
      "Let me ask you this: What evidence from your study material supports that idea?",
      "That's a thoughtful response. Can you break that down into smaller parts for me?",
      "Interesting! What questions does this raise for you about the topic?",
      "I can see you're engaging with the material. What patterns do you notice here?",
      "That's a good start. How might you explain this concept to someone who's never heard of it before?",
      "Based on your uploaded content, what connections can you make to this idea?",
      "What would you say is the most important takeaway from this discussion so far?",
    ]

    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-4xl space-y-4">
        {/* Current Question Context */}
        {questionContext && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-900">Current Question Context</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800">{questionContext}</p>
            </CardContent>
          </Card>
        )}

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-600" />
              AI Tutor - Socratic Learning
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === "tutor" && <Bot className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />}
                      {message.sender === "user" && <User className="w-4 h-4 mt-0.5 text-blue-200 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.sender === "user" ? "text-blue-200" : "text-gray-500"}`}>
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isGeneratingResponse && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-lg px-4 py-3 bg-gray-100 text-gray-900">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-gray-600 flex-shrink-0" />
                      <Loader className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Tutor is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex gap-2 pt-4 border-t">
              <Input
                placeholder="Ask a question or share your thoughts..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isGeneratingResponse}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGeneratingResponse}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGeneratingResponse ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

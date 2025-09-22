"use client"

import { useState, useEffect } from "react"
import { TutorScreen } from "@/components/tutor-screen"
import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle } from "lucide-react"

export default function TutorPage() {
  const [questionContext, setQuestionContext] = useState<string>("")
  const [uploadedContent, setUploadedContent] = useState<string>("")

  useEffect(() => {
    const context = localStorage.getItem("questionContext") || ""
    const content = localStorage.getItem("uploadedContent") || ""

    setQuestionContext(context)
    setUploadedContent(content)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Authenticated>
        <TutorScreen questionContext={questionContext} uploadedContent={uploadedContent} />
      </Authenticated>
      <Unauthenticated>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Sign in to access AI tutor</CardTitle>
              <CardDescription>
                Create an account or sign in to get personalized help from our AI tutor based on your quiz performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <SignInButton mode="modal">
                <Button size="lg" className="w-full">
                  Sign In to Continue
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>
      </Unauthenticated>
    </div>
  )
}

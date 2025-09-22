"use client"
import { UploadScreen } from "@/components/upload-screen"
import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload } from "lucide-react"

export default function UploadPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Authenticated>
        <UploadScreen />
      </Authenticated>
      <Unauthenticated>
        <div className="flex justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Sign in to upload content</CardTitle>
              <CardDescription>
                Create an account or sign in to start uploading content and generating personalized quizzes.
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

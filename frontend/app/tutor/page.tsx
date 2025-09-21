"use client"

import { useState, useEffect } from "react"
import { TutorScreen } from "@/components/tutor-screen"

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
      <TutorScreen questionContext={questionContext} uploadedContent={uploadedContent} />
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, BookOpen, LayoutDashboard, Sparkles, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export function UploadScreen() {
  const router = useRouter()
  const [textContent, setTextContent] = useState("")
  const [hasContent, setHasContent] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleContentUploaded = (content: string) => {
    localStorage.setItem("uploadedContent", content)
    localStorage.setItem("uploadTimestamp", Date.now().toString())

    // Trigger storage event for same-tab updates
    window.dispatchEvent(new Event("focus"))
  }

  const handleTextSubmit = async () => {
    if (textContent.trim()) {
      setIsProcessing(true)
      handleContentUploaded(textContent)

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate AI summary
      const summary = generateAISummary(textContent)
      setAiSummary(summary)
      setHasContent(true)
      setIsProcessing(false)
      setShowActions(true)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setIsProcessing(true)
      // Simulate PDF processing
      const simulatedContent = `PDF Content: ${file.name}\n\nThis is simulated content from the uploaded PDF file. In a real implementation, you would use a PDF parsing library to extract the actual text content.`
      handleContentUploaded(simulatedContent)

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate AI summary
      const summary = generateAISummary(simulatedContent)
      setAiSummary(summary)
      setHasContent(true)
      setIsProcessing(false)
      setShowActions(true)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setIsProcessing(true)
      // Simulate image OCR processing
      const simulatedContent = `Image Content: ${file.name}\n\nThis is simulated text extracted from the uploaded image using OCR technology. In a real implementation, you would use an OCR service like Google Vision API or Tesseract to extract actual text from images, diagrams, and handwritten notes.`
      handleContentUploaded(simulatedContent)

      // Simulate AI processing
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Generate AI summary
      const summary = generateAISummary(simulatedContent)
      setAiSummary(summary)
      setHasContent(true)
      setIsProcessing(false)
      setShowActions(true)
    }
  }

  const generateAISummary = (content: string): string => {
    // Simulate AI summary generation
    const summaries = [
      "This content covers fundamental concepts in machine learning, including supervised and unsupervised learning algorithms, neural networks, and practical applications in data science.",
      "The material discusses key principles of software engineering, focusing on design patterns, code architecture, testing methodologies, and best practices for scalable applications.",
      "This text explores advanced topics in data structures and algorithms, covering time complexity analysis, graph algorithms, dynamic programming, and optimization techniques.",
      "The content provides an overview of modern web development, including frontend frameworks, backend architecture, database design, and deployment strategies.",
    ]
    return summaries[Math.floor(Math.random() * summaries.length)]
  }

  const onViewDashboard = () => {
    router.push("/dashboard")
  }

  const onTakeQuiz = () => {
    router.push("/quiz")
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">Upload Your Study Material</CardTitle>
          <p className="text-gray-600">Choose how you'd like to add your content</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasContent && !isProcessing && (
            <>
              {/* PDF Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Upload PDF</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Drag and drop your PDF here, or click to browse</p>
                  <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" id="pdf-upload" />
                  <label htmlFor="pdf-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Upload Image</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload images with text, diagrams, or handwritten notes</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              {/* Text Input Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Or Paste Text Directly</h3>
                <Textarea
                  placeholder="Paste your notes or content here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />
                <Button onClick={handleTextSubmit} disabled={!textContent.trim()} className="w-full">
                  Add Text Content
                </Button>
              </div>
            </>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing your content...</h3>
              <p className="text-gray-600">Our AI is analyzing and summarizing your material</p>
            </div>
          )}

          {showActions && aiSummary && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-900">AI Summary</h3>
                </div>
                <p className="text-blue-800 leading-relaxed">{aiSummary}</p>
              </div>

              <div className="flex gap-4">
                <Button onClick={onViewDashboard} variant="outline" className="flex-1 h-12 text-base bg-transparent">
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  View Dashboard
                </Button>
                <Button onClick={onTakeQuiz} className="flex-1 h-12 text-base bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Take Quiz
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

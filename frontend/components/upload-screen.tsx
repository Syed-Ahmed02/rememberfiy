"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, BookOpen, LayoutDashboard, Sparkles, ImageIcon, AlertCircle, Volume2, VolumeX } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/contexts/app-context"
import { apiClient } from "@/lib/api-client"

export function UploadScreen() {
  const router = useRouter()
  const { 
    uploadState, 
    setUploadState, 
    isLoading, 
    setIsLoading, 
    error, 
    setError,
    resetUpload 
  } = useAppContext()
  
  const [textContent, setTextContent] = useState("")
  const [showActions, setShowActions] = useState(false)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Upload text to backend
      const response = await apiClient.uploadText(textContent)
      
      if (response.success) {
        // Update app state
        setUploadState({
          content: response.content || textContent,
          summary: response.summary,
          fileType: "text",
        })
        
        // Store in localStorage for backwards compatibility
        localStorage.setItem("uploadedContent", response.content || textContent)
        localStorage.setItem("uploadTimestamp", Date.now().toString())
        window.dispatchEvent(new Event("focus"))
        
        setShowActions(true)
      } else {
        setError(response.message || "Failed to process text")
      }
    } catch (err) {
      console.error("Text upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to process text")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== "application/pdf") return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Upload PDF to backend
      const response = await apiClient.uploadFile(file)
      
      if (response.success) {
        // Update app state
        setUploadState({
          content: response.content || "",
          summary: response.summary,
          fileType: "pdf",
          fileName: file.name,
          filePath: response.file_path,
        })
        
        // Store in localStorage for backwards compatibility
        localStorage.setItem("uploadedContent", response.content || "")
        localStorage.setItem("uploadTimestamp", Date.now().toString())
        window.dispatchEvent(new Event("focus"))
        
        setShowActions(true)
      } else {
        setError(response.message || "Failed to process PDF")
      }
    } catch (err) {
      console.error("PDF upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to process PDF")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith("image/")) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Upload image to backend
      const response = await apiClient.uploadImage(file)
      
      if (response.success) {
        // Update app state
        setUploadState({
          content: response.content || "",
          summary: response.summary,
          fileType: "image",
          fileName: file.name,
          filePath: response.file_path,
        })
        
        // Store in localStorage for backwards compatibility
        localStorage.setItem("uploadedContent", response.content || "")
        localStorage.setItem("uploadTimestamp", Date.now().toString())
        window.dispatchEvent(new Event("focus"))
        
        setShowActions(true)
      } else {
        setError(response.message || "Failed to process image")
      }
    } catch (err) {
      console.error("Image upload error:", err)
      setError(err instanceof Error ? err.message : "Failed to process image")
    } finally {
      setIsLoading(false)
    }
  }

  const hasContent = uploadState.content.length > 0
  const aiSummary = uploadState.summary

  const onViewDashboard = () => {
    router.push("/dashboard")
  }

  const onTakeQuiz = () => {
    router.push("/quiz")
  }

  const handleTextToSpeech = async () => {
    if (!aiSummary) return
    
    setIsGeneratingAudio(true)
    setError(null)
    
    try {
      const response = await apiClient.generateTextToSpeech(aiSummary)
      
      if (response.success && response.audio_url) {
        setAudioUrl(response.audio_url)
        // Auto-play the generated audio
        playAudio(response.audio_url)
      } else {
        setError(response.message || "Failed to generate audio")
      }
    } catch (err) {
      console.error("Text-to-speech error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate audio")
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  const playAudio = (url: string) => {
    const audio = new Audio(url)
    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => setIsPlaying(false)
    audio.onerror = () => {
      setIsPlaying(false)
      setError("Failed to play audio")
    }
    audio.play().catch(err => {
      console.error("Audio play error:", err)
      setError("Failed to play audio")
      setIsPlaying(false)
    })
  }

  const toggleAudio = () => {
    if (audioUrl) {
      if (isPlaying) {
        // Find and pause the audio
        const audioElements = document.getElementsByTagName('audio')
        Array.from(audioElements).forEach(audio => {
          if (!audio.paused) {
            audio.pause()
            setIsPlaying(false)
          }
        })
      } else {
        playAudio(audioUrl)
      }
    } else {
      handleTextToSpeech()
    }
  }

  return (
    <div className="flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gray-900">Upload Your Study Material</CardTitle>
          <p className="text-gray-600">Choose how you'd like to add your content</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-semibold text-red-900">Error</h3>
              </div>
              <p className="text-red-800 mt-1">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetUpload}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}
          
          {!hasContent && !isLoading && !error && (
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

          {isLoading && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing your content...</h3>
              <p className="text-gray-600">Our AI is analyzing and summarizing your material</p>
            </div>
          )}

          {showActions && aiSummary && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-blue-900">AI Summary</h3>
                  </div>
                  <Button
                    onClick={toggleAudio}
                    disabled={isGeneratingAudio}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-blue-100"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : isPlaying ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Stop Audio
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" />
                        Listen
                      </>
                    )}
                  </Button>
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

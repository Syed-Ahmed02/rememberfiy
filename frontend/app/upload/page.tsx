"use client"
import { useRouter } from "next/navigation"
import { UploadScreen } from "@/components/upload-screen"

export default function UploadPage() {
  const router = useRouter()

  const handleContentUploaded = (content: string) => {
    localStorage.setItem("uploadedContent", content)
    localStorage.setItem("uploadTimestamp", Date.now().toString())
  }

  const handleViewDashboard = () => {
    router.push("/dashboard")
  }

  const handleTakeQuiz = () => {
    router.push("/quiz")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <UploadScreen
        onContentUploaded={handleContentUploaded}
        onViewDashboard={handleViewDashboard}
        onTakeQuiz={handleTakeQuiz}
      />
    </div>
  )
}

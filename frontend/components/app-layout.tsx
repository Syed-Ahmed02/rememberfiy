"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, BookOpen, MessageCircle, LayoutDashboard } from "lucide-react"
import { useAppContext } from "@/contexts/app-context"

const screens = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { id: "upload", label: "Upload", icon: Upload, path: "/upload" },
  { id: "quiz", label: "Quiz", icon: BookOpen, path: "/quiz" },
  { id: "tutor", label: "Tutor", icon: MessageCircle, path: "/tutor" },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { uploadedContent, quizState } = useAppContext()

  const handleScreenChange = (path: string) => {
    if (path === "/quiz" && !uploadedContent && !quizState.questions.length) {
      // Don't allow quiz access without content
      return
    }
    router.push(path)
  }

  const getCurrentScreen = () => {
    return screens.find(screen => screen.path === pathname)?.id || "dashboard"
  }

  const currentScreen = getCurrentScreen()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Remberify</h1>

            {/* Tab Navigation */}
            <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {screens.map(({ id, label, icon: Icon, path }) => (
                <Button
                  key={id}
                  variant={currentScreen === id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleScreenChange(path)}
                  disabled={id === "quiz" && !uploadedContent && !quizState.questions.length}
                  className={`flex items-center gap-2 ${
                    currentScreen === id
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-gray-700 hover:text-gray-900"
                  } ${id === "quiz" && !uploadedContent && !quizState.questions.length ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}

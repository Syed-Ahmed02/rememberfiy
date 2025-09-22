"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, BookOpen, MessageCircle, LayoutDashboard } from "lucide-react"
import { SignInButton, UserButton } from "@clerk/nextjs"
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/quiz", label: "Quiz", icon: BookOpen },
  { href: "/tutor", label: "Tutor", icon: MessageCircle },
]

export function Navigation() {
  const pathname = usePathname()
  const [hasContent, setHasContent] = useState(false)

  useEffect(() => {
    const checkContent = () => {
      const content = localStorage.getItem("uploadedContent")
      setHasContent(!!content)
    }

    checkContent()

    // Listen for storage changes to update state
    const handleStorageChange = () => {
      checkContent()
    }

    window.addEventListener("storage", handleStorageChange)
    // Also check on focus in case localStorage was updated in same tab
    window.addEventListener("focus", checkContent)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("focus", checkContent)
    }
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Authenticated>
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-gray-900">Remberify</h1>
            </Link>
          </Authenticated>
          <Unauthenticated>
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">Remberify</h1>
            </Link>
          </Unauthenticated>
          <AuthLoading>
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">Remberify</h1>
            </Link>
          </AuthLoading>

          <div className="flex items-center gap-4">
            <Authenticated>
              <nav className="flex space-x-2 bg-gray-100 rounded-lg p-2">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const isQuizDisabled = href === "/quiz" && !hasContent

                  return (
                    <Button
                      key={href}
                      variant={pathname === href ? "default" : "ghost"}
                      size="default"
                      asChild={!isQuizDisabled}
                      disabled={isQuizDisabled}
                      className={`flex items-center gap-2 px-4 py-2 ${
                        pathname === href ? "bg-blue-600 text-white hover:bg-blue-700" : "text-gray-700 hover:text-gray-900"
                      } ${isQuizDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isQuizDisabled ? (
                        <span>
                          <Icon className="w-4 h-4" />
                          {label}
                        </span>
                      ) : (
                        <Link href={href}>
                          <Icon className="w-4 h-4" />
                          {label}
                        </Link>
                      )}
                    </Button>
                  )
                })}
              </nav>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </Authenticated>
            <Unauthenticated>
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">
                    Get Started
                  </Button>
                </SignInButton>
              </div>
            </Unauthenticated>
            <AuthLoading>
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
            </AuthLoading>
          </div>
        </div>
      </div>
    </header>
  )
}

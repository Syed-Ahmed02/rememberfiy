import type React from "react"
import type { Metadata } from "next"
import {Geist,Geist_Mono} from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { AppProvider } from '@/contexts/app-context'
import "./globals.css"
import { Navigation } from "@/components/navigation"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Remberify - AI Learning Assistant",
  description: "Upload content and create personalized quizzes with AI",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}>
        <Navigation />
        <main>
          <ClerkProvider>
            <ConvexClientProvider>
              <AppProvider>
                {children}
              </AppProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </main>
      </body>
    </html>
  )
}

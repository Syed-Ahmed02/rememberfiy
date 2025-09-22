"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Clock, Target, TrendingUp, Users, Zap } from "lucide-react"
import { Authenticated, Unauthenticated } from "convex/react"
import { SignInButton } from "@clerk/nextjs"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8">
              <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                <Zap className="mr-2 h-4 w-4" />
                Powered by Spaced Repetition
              </Badge>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              Unlock Your Memory Potential
            </h1>
            <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
              Stop forgetting important things. Remberify uses scientifically-proven spaced repetition to help you
              remember what matters most, from study materials to life's crucial details.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Authenticated>
                <Button asChild size="lg" className="px-8 py-3">
                  <Link href="/upload">Start Remembering</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </Authenticated>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button size="lg" className="px-8 py-3">
                    Get Started Free
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </SignInButton>
              </Unauthenticated>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24">
          <div className="relative">
            <img
              src="/brain-with-memory-symbols-and-learning-connections.jpg"
              alt="Memory enhancement visualization"
              className="mx-auto rounded-xl shadow-2xl ring-1 ring-border"
            />
            <div className="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Science-Backed Memory Enhancement
            </h2>
            <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
              Our spaced repetition algorithm adapts to your learning patterns, ensuring optimal retention with minimal
              effort.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Spaced Repetition</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Review information at scientifically optimized intervals to maximize long-term retention and
                    minimize study time.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Personalized Learning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    AI adapts to your learning speed and difficulty preferences, creating a customized experience that
                    works for you.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Progress Tracking</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Monitor your memory improvement with detailed analytics and insights into your learning patterns and
                    retention rates.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple. Effective. Proven.
            </h2>
            <p className="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
              Get started in minutes and see results in days.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  1
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Upload Content</h3>
                <p className="mt-2 text-muted-foreground">
                  Add PDFs, text, or images containing the information you want to remember.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  2
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">AI Creates Quizzes</h3>
                <p className="mt-2 text-muted-foreground">
                  Our AI automatically generates personalized quizzes from your content.
                </p>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                  3
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Review & Remember</h3>
                <p className="mt-2 text-muted-foreground">
                  Practice with spaced repetition to lock information into long-term memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
        

      {/* CTA Section */}
      <section className="bg-primary py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Never Forget Again?
            </h2>
            <p className="mt-6 text-pretty text-lg leading-8 text-primary-foreground/80">
              Join thousands of learners who have transformed their memory with Remberify.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Authenticated>
                <Button size="lg" variant="secondary" asChild className="px-8 py-3">
                  <Link href="/upload">Continue Learning</Link>
                </Button>
              </Authenticated>
              <Unauthenticated>
                <SignInButton mode="modal">
                  <Button size="lg" variant="secondary" className="px-8 py-3">
                    Get Started Free
                  </Button>
                </SignInButton>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">Remberify</span>
            </div>
            <p className="text-muted-foreground">Unlock your memory potential with science-backed spaced repetition.</p>
            <div className="mt-8 text-sm text-muted-foreground">© 2024 Remberify. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

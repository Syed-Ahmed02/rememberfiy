import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  quizzes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    fileType: v.string(), // "pdf", "image", "text"
    fileName: v.optional(v.string()),
    createdAt: v.number(),
    lastReviewedAt: v.optional(v.number()),
    nextReviewAt: v.number(),
    reviewCount: v.number(),
    difficulty: v.string(), // "Easy", "Medium", "Hard"
  }).index("by_user", ["userId"])
    .index("by_next_review", ["nextReviewAt"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    questionText: v.string(),
    questionType: v.string(), // "multiple-choice", "short-answer"
    options: v.optional(v.array(v.string())),
    correctAnswer: v.string(),
    explanation: v.string(),
    orderIndex: v.number(),
  }).index("by_quiz", ["quizId"]),

  quizAttempts: defineTable({
    quizId: v.id("quizzes"),
    userId: v.id("users"),
    score: v.number(),
    totalQuestions: v.number(),
    completedAt: v.number(),
    answers: v.array(v.any()),
    timeTaken: v.optional(v.number()), // in seconds
  }).index("by_quiz", ["quizId"])
    .index("by_user", ["userId"])
    .index("by_user_and_quiz", ["userId", "quizId"]),

  tutorSessions: defineTable({
    userId: v.id("users"),
    quizId: v.optional(v.id("quizzes")),
    questionText: v.string(),
    userAnswer: v.string(),
    tutorResponse: v.string(),
    createdAt: v.number(),
    isCorrect: v.optional(v.boolean()),
  }).index("by_user", ["userId"])
    .index("by_quiz", ["quizId"]),
});

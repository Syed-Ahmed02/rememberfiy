import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record a tutor session
export const recordTutorSession = mutation({
  args: {
    userId: v.id("users"),
    quizId: v.optional(v.id("quizzes")),
    questionText: v.string(),
    userAnswer: v.string(),
    tutorResponse: v.string(),
    isCorrect: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("tutorSessions", {
      userId: args.userId,
      quizId: args.quizId,
      questionText: args.questionText,
      userAnswer: args.userAnswer,
      tutorResponse: args.tutorResponse,
      createdAt: Date.now(),
      isCorrect: args.isCorrect,
    });

    return sessionId;
  },
});

// Get tutor sessions for a user
export const getUserTutorSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tutorSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by creation date (newest first)
    return sessions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get tutor sessions for a specific quiz
export const getQuizTutorSessions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tutorSessions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    // Sort by creation date (newest first)
    return sessions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get recent tutor sessions (last 10)
export const getRecentTutorSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tutorSessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by creation date (newest first) and take first 10
    return sessions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  },
});

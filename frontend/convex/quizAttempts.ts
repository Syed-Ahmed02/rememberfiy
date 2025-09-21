import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Record a quiz attempt
export const recordQuizAttempt = mutation({
  args: {
    quizId: v.id("quizzes"),
    userId: v.id("users"),
    score: v.number(),
    totalQuestions: v.number(),
    answers: v.array(v.any()),
    timeTaken: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const attemptId = await ctx.db.insert("quizAttempts", {
      quizId: args.quizId,
      userId: args.userId,
      score: args.score,
      totalQuestions: args.totalQuestions,
      completedAt: Date.now(),
      answers: args.answers,
      timeTaken: args.timeTaken,
    });

    return attemptId;
  },
});

// Get all attempts for a quiz
export const getQuizAttempts = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();
  },
});

// Get all attempts for a user
export const getUserAttempts = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by completion date (newest first)
    return attempts.sort((a, b) => b.completedAt - a.completedAt);
  },
});

// Get user's best attempt for a specific quiz
export const getBestAttempt = query({
  args: { 
    userId: v.id("users"),
    quizId: v.id("quizzes") 
  },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user_and_quiz", (q) => 
        q.eq("userId", args.userId).eq("quizId", args.quizId)
      )
      .collect();

    if (attempts.length === 0) return null;

    // Return attempt with highest score
    return attempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  },
});

// Get user statistics
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    if (attempts.length === 0) {
      return {
        totalQuizzes: 0,
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        totalTimeStudied: 0,
      };
    }

    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const scores = attempts.map(a => a.score / a.totalQuestions);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const totalTimeStudied = attempts
      .filter(a => a.timeTaken)
      .reduce((sum, a) => sum + (a.timeTaken || 0), 0);

    return {
      totalQuizzes: quizzes.length,
      totalAttempts: attempts.length,
      averageScore: Math.round(averageScore * 100),
      bestScore: Math.round(bestScore * 100),
      totalTimeStudied: Math.round(totalTimeStudied / 60), // Convert to minutes
    };
  },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new quiz
export const createQuiz = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    summary: v.optional(v.string()),
    fileType: v.string(),
    fileName: v.optional(v.string()),
    difficulty: v.string(),
    questions: v.array(v.object({
      questionText: v.string(),
      questionType: v.string(),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.string(),
      explanation: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nextReviewAt = now + (24 * 60 * 60 * 1000); // 1 day from now

    // Create the quiz
    const quizId = await ctx.db.insert("quizzes", {
      userId: args.userId,
      title: args.title,
      content: args.content,
      summary: args.summary,
      fileType: args.fileType,
      fileName: args.fileName,
      createdAt: now,
      nextReviewAt,
      reviewCount: 0,
      difficulty: args.difficulty,
    });

    // Create the questions
    for (let i = 0; i < args.questions.length; i++) {
      const question = args.questions[i];
      await ctx.db.insert("questions", {
        quizId,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        orderIndex: i,
      });
    }

    return quizId;
  },
});

// Get quiz by ID with questions
export const getQuizWithQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) return null;

    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    // Sort questions by order index
    questions.sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      ...quiz,
      questions,
    };
  },
});

// Get all quizzes for a user
export const getUserQuizzes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const quizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Sort by creation date (newest first)
    return quizzes.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get quizzes due for review
export const getQuizzesDueForReview = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const allQuizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter quizzes due for review
    return allQuizzes.filter(quiz => quiz.nextReviewAt <= now);
  },
});

// Update quiz review schedule
export const updateQuizReview = mutation({
  args: {
    quizId: v.id("quizzes"),
    score: v.number(),
    totalQuestions: v.number(),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    const performance = args.score / args.totalQuestions;
    let reviewInterval: number;

    // Spaced repetition algorithm
    if (performance >= 0.9) {
      reviewInterval = Math.pow(2, quiz.reviewCount + 1) * 24 * 60 * 60 * 1000; // 2^n days
    } else if (performance >= 0.7) {
      reviewInterval = Math.pow(1.5, quiz.reviewCount + 1) * 24 * 60 * 60 * 1000; // 1.5^n days
    } else {
      reviewInterval = 24 * 60 * 60 * 1000; // 1 day (reset)
    }

    const now = Date.now();
    await ctx.db.patch(args.quizId, {
      lastReviewedAt: now,
      nextReviewAt: now + reviewInterval,
      reviewCount: quiz.reviewCount + 1,
    });

    return { nextReviewAt: now + reviewInterval };
  },
});

// Delete a quiz and its questions
export const deleteQuiz = mutation({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    // Delete all questions first
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    for (const question of questions) {
      await ctx.db.delete(question._id);
    }

    // Delete quiz attempts
    const attempts = await ctx.db
      .query("quizAttempts")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    for (const attempt of attempts) {
      await ctx.db.delete(attempt._id);
    }

    // Delete the quiz
    await ctx.db.delete(args.quizId);
  },
});

'use client';

import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

// Custom hooks for Convex operations
export const useConvexUser = () => {
  const { isAuthenticated } = useConvexAuth();
  return { isAuthenticated };
};

// User hooks
export const useGetOrCreateUser = () => {
  return useMutation(api.users.getOrCreateUser);
};

export const useGetUserByClerkId = (clerkId?: string) => {
  return useQuery(api.users.getUserByClerkId, clerkId ? { clerkId } : 'skip');
};

// Quiz hooks
export const useCreateQuiz = () => {
  return useMutation(api.quizzes.createQuiz);
};

export const useGetQuizWithQuestions = (quizId?: Id<'quizzes'>) => {
  return useQuery(api.quizzes.getQuizWithQuestions, quizId ? { quizId } : 'skip');
};

export const useGetUserQuizzes = (userId?: Id<'users'>) => {
  return useQuery(api.quizzes.getUserQuizzes, userId ? { userId } : 'skip');
};

export const useGetQuizzesDueForReview = (userId?: Id<'users'>) => {
  return useQuery(api.quizzes.getQuizzesDueForReview, userId ? { userId } : 'skip');
};

export const useUpdateQuizReview = () => {
  return useMutation(api.quizzes.updateQuizReview);
};

export const useDeleteQuiz = () => {
  return useMutation(api.quizzes.deleteQuiz);
};

// Quiz attempt hooks
export const useRecordQuizAttempt = () => {
  return useMutation(api.quizAttempts.recordQuizAttempt);
};

export const useGetUserAttempts = (userId?: Id<'users'>) => {
  return useQuery(api.quizAttempts.getUserAttempts, userId ? { userId } : 'skip');
};

export const useGetBestAttempt = (userId?: Id<'users'>, quizId?: Id<'quizzes'>) => {
  return useQuery(
    api.quizAttempts.getBestAttempt, 
    userId && quizId ? { userId, quizId } : 'skip'
  );
};

export const useGetUserStats = (userId?: Id<'users'>) => {
  return useQuery(api.quizAttempts.getUserStats, userId ? { userId } : 'skip');
};

// Tutor session hooks
export const useRecordTutorSession = () => {
  return useMutation(api.tutorSessions.recordTutorSession);
};

export const useGetUserTutorSessions = (userId?: Id<'users'>) => {
  return useQuery(api.tutorSessions.getUserTutorSessions, userId ? { userId } : 'skip');
};

export const useGetRecentTutorSessions = (userId?: Id<'users'>) => {
  return useQuery(api.tutorSessions.getRecentTutorSessions, userId ? { userId } : 'skip');
};

// Helper functions
export const generateQuizData = (backendQuiz: any, content: string, fileType: string, fileName?: string) => {
  return {
    title: backendQuiz.title || 'Generated Quiz',
    content,
    fileType,
    fileName,
    difficulty: 'Medium', // Default difficulty
    questions: backendQuiz.questions.map((q: any, index: number) => ({
      questionText: q.question,
      questionType: q.type,
      options: q.options,
      correctAnswer: String(q.correct_answer), // Convert to string for Convex compatibility
      explanation: q.explanation,
    })),
  };
};

// Type exports for better TypeScript support
export type ConvexQuiz = {
  _id: Id<'quizzes'>;
  userId: Id<'users'>;
  title: string;
  content: string;
  summary?: string;
  fileType: string;
  fileName?: string;
  createdAt: number;
  lastReviewedAt?: number;
  nextReviewAt: number;
  reviewCount: number;
  difficulty: string;
};

export type ConvexQuestion = {
  _id: Id<'questions'>;
  quizId: Id<'quizzes'>;
  questionText: string;
  questionType: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
};

export type ConvexQuizWithQuestions = ConvexQuiz & {
  questions: ConvexQuestion[];
};

export type ConvexUser = {
  _id: Id<'users'>;
  clerkId: string;
  email: string;
  name?: string;
  createdAt: number;
  updatedAt: number;
};

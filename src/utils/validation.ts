import { z } from "zod";
import { APP_CONSTANTS } from "../config";

/**
 * Schema for chat message request body.
 * Validates message length and optional session UUID.
 */
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(APP_CONSTANTS.MAX_CHAT_MESSAGE_LENGTH, `Message too long (max ${APP_CONSTANTS.MAX_CHAT_MESSAGE_LENGTH} chars)`)
    .transform((s) => s.trim()),
  sessionId: z.string().uuid().optional(),
});

/**
 * Schema for quiz answer submission.
 * Validates question ID, selected option index, and time taken.
 */
export const quizSubmissionSchema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).max(3),
  timeTaken: z.number().int().min(0).max(300_000),
});

/**
 * Schema for paginated list requests.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * Schema for election phase ID path parameter.
 */
export const phaseIdSchema = z.object({
  id: z.string().min(1).max(50),
});

/**
 * Schema for quiz start request with optional filters.
 */
export const quizFilterSchema = z.object({
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z.string().min(1).max(50).optional(),
  count: z.coerce.number().int().min(1).max(20).default(10),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

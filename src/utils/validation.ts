import { z } from "zod";
import { APP_CONSTANTS } from "../config";

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(APP_CONSTANTS.MAX_CHAT_MESSAGE_LENGTH, `Message too long (max ${APP_CONSTANTS.MAX_CHAT_MESSAGE_LENGTH} chars)`)
    .transform((s) => s.trim()),
  sessionId: z.string().uuid().optional(),
});

export const quizSubmissionSchema = z.object({
  questionId: z.string().min(1),
  selectedIndex: z.number().int().min(0).max(3),
  timeTaken: z.number().int().min(0).max(300_000),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const phaseIdSchema = z.object({
  id: z.string().min(1).max(50),
});

export const quizFilterSchema = z.object({
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  category: z.string().min(1).max(50).optional(),
  count: z.coerce.number().int().min(1).max(20).default(10),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type QuizSubmissionInput = z.infer<typeof quizSubmissionSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;

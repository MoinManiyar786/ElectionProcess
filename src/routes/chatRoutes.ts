import { Router, Request, Response } from "express";
import { sendMessage, createSession, getSession } from "../services/aiService";
import { chatMessageSchema } from "../utils/validation";
import { ApiResponse, ChatSession } from "../types";
import { createApiRateLimiter } from "../middleware/security";
import { logger } from "../utils/logger";

const router = Router();

router.use(createApiRateLimiter());

router.post(
  "/message",
  async (
    req: Request,
    res: Response<ApiResponse<{ response: string; sessionId: string }>>,
  ) => {
    try {
      const parsed = chatMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMessages = parsed.error.errors.map((e) => e.message).join(", ");
        res.status(400).json({
          success: false,
          error: errorMessages,
          timestamp: Date.now(),
        });
        return;
      }

      const { message, sessionId } = parsed.data;
      const result = await sendMessage(sessionId, message);

      res.json({
        success: true,
        data: result,
        timestamp: Date.now(),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error("Chat message error", { error: errorMessage });
      res.status(500).json({
        success: false,
        error: errorMessage,
        timestamp: Date.now(),
      });
    }
  },
);

router.post(
  "/session",
  (_req: Request, res: Response<ApiResponse<{ sessionId: string }>>) => {
    try {
      const session = createSession();
      res.status(201).json({
        success: true,
        data: { sessionId: session.id },
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Session creation error", { error });
      res.status(500).json({
        success: false,
        error: "Failed to create chat session",
        timestamp: Date.now(),
      });
    }
  },
);

router.get(
  "/session/:sessionId",
  (req: Request, res: Response<ApiResponse<ChatSession>>) => {
    try {
      const sessionId = req.params["sessionId"] as string;
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: "Session ID is required",
          timestamp: Date.now(),
        });
        return;
      }

      const session = getSession(sessionId);
      if (!session) {
        res.status(404).json({
          success: false,
          error: "Session not found or expired",
          timestamp: Date.now(),
        });
        return;
      }

      res.json({
        success: true,
        data: session,
        timestamp: Date.now(),
      });
    } catch (error) {
      logger.error("Session fetch error", { error });
      res.status(500).json({
        success: false,
        error: "Failed to fetch session",
        timestamp: Date.now(),
      });
    }
  },
);

export default router;

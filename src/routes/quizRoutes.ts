import { Router, Request, Response } from "express";
import {
  createQuizSession,
  submitAnswer,
  getQuizResults,
  getQuizSession,
  getAvailableCategories,
  getAvailableDifficulties,
} from "../services/quizService";
import { quizSubmissionSchema, quizFilterSchema } from "../utils/validation";
import { logger } from "../utils/logger";

const router = Router();

router.post("/start", (req: Request, res: Response) => {
  try {
    const parsed = quizFilterSchema.safeParse(req.body);
    const filters: any = parsed.success ? parsed.data : {};

    const session = createQuizSession({
      difficulty: filters.difficulty,
      category: filters.category,
      count: filters.count,
    });

    const questionsWithoutAnswers = session.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
      category: q.category,
    }));

    res.status(201).json({
      success: true,
      data: {
        sessionId: session.id,
        questions: questionsWithoutAnswers,
        totalQuestions: session.totalQuestions,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Quiz start error", { error: errorMessage });
    res.status(500).json({
      success: false,
      error: errorMessage,
      timestamp: Date.now(),
    });
  }
});

router.post("/submit/:sessionId", (req: Request, res: Response) => {
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

    const parsed = quizSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map((e) => e.message).join(", ");
      res.status(400).json({
        success: false,
        error: errorMessages,
        timestamp: Date.now(),
      });
      return;
    }

    const { questionId, selectedIndex, timeTaken } = parsed.data;
    const result = submitAnswer(sessionId, questionId, selectedIndex, timeTaken);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = errorMessage.includes("not found") ? 404 : 400;
    logger.error("Quiz submit error", { error: errorMessage });
    res.status(status).json({
      success: false,
      error: errorMessage,
      timestamp: Date.now(),
    });
  }
});

router.get("/results/:sessionId", (req: Request, res: Response) => {
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

    const results = getQuizResults(sessionId);

    res.json({
      success: true,
      data: results,
      timestamp: Date.now(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("Quiz results error", { error: errorMessage });
    res.status(errorMessage.includes("not found") ? 404 : 500).json({
      success: false,
      error: errorMessage,
      timestamp: Date.now(),
    });
  }
});

router.get("/session/:sessionId", (req: Request, res: Response) => {
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

    const session = getQuizSession(sessionId);
    if (!session) {
      res.status(404).json({
        success: false,
        error: "Quiz session not found",
        timestamp: Date.now(),
      });
      return;
    }

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        totalQuestions: session.totalQuestions,
        answeredQuestions: session.results.length,
        score: session.score,
        completed: !!session.completedAt,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Quiz session error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to fetch quiz session",
      timestamp: Date.now(),
    });
  }
});

router.get("/categories", (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      categories: getAvailableCategories(),
      difficulties: getAvailableDifficulties(),
    },
    timestamp: Date.now(),
  });
});

export default router;

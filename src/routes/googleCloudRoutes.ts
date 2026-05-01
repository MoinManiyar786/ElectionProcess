import { Router, Request, Response } from "express";
import {
  synthesizeSpeech,
  translateText,
  detectLanguage,
  analyzeSentiment,
  analyzeEntities,
  getSupportedLanguages,
  listVoices,
} from "../services/googleCloudService";
import { logger } from "../utils/logger";
import { z } from "zod";

const router = Router();

const ttsSchema = z.object({
  text: z.string().min(1).max(5000),
  languageCode: z.string().optional(),
  voiceName: z.string().optional(),
  ssmlGender: z.enum(["MALE", "FEMALE", "NEUTRAL"]).optional(),
  speakingRate: z.number().min(0.25).max(4.0).optional(),
  pitch: z.number().min(-20).max(20).optional(),
});

const translateSchema = z.object({
  text: z.string().min(1).max(5000),
  targetLanguage: z.string().min(2).max(10),
  sourceLanguage: z.string().min(2).max(10).optional(),
});

const analyzeSchema = z.object({
  text: z.string().min(1).max(5000),
});

/** POST /api/google/tts — Synthesize speech from text */
router.post("/tts", async (req: Request, res: Response) => {
  try {
    const parsed = ttsSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      res.status(400).json({ success: false, error: errors, timestamp: Date.now() });
      return;
    }

    const result = await synthesizeSpeech(parsed.data);

    res.json({
      success: true,
      data: {
        audioContent: result.audioContent,
        contentType: result.contentType,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "TTS synthesis failed";
    logger.error("TTS route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

/** POST /api/google/translate — Translate text */
router.post("/translate", async (req: Request, res: Response) => {
  try {
    const parsed = translateSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      res.status(400).json({ success: false, error: errors, timestamp: Date.now() });
      return;
    }

    const result = await translateText(parsed.data);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Translation failed";
    logger.error("Translation route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

/** POST /api/google/detect-language — Detect text language */
router.post("/detect-language", async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      res.status(400).json({ success: false, error: errors, timestamp: Date.now() });
      return;
    }

    const result = await detectLanguage(parsed.data.text);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Language detection failed";
    logger.error("Language detection route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

/** POST /api/google/analyze-sentiment — Analyze text sentiment */
router.post("/analyze-sentiment", async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      res.status(400).json({ success: false, error: errors, timestamp: Date.now() });
      return;
    }

    const result = await analyzeSentiment(parsed.data.text);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sentiment analysis failed";
    logger.error("Sentiment analysis route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

/** POST /api/google/analyze-entities — Extract entities from text */
router.post("/analyze-entities", async (req: Request, res: Response) => {
  try {
    const parsed = analyzeSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map((e) => e.message).join(", ");
      res.status(400).json({ success: false, error: errors, timestamp: Date.now() });
      return;
    }

    const result = await analyzeEntities(parsed.data.text);

    res.json({
      success: true,
      data: result,
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Entity analysis failed";
    logger.error("Entity analysis route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

/** GET /api/google/languages — Get supported translation languages */
router.get("/languages", async (_req: Request, res: Response) => {
  try {
    const languages = await getSupportedLanguages();
    res.json({
      success: true,
      data: languages,
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get languages";
    logger.error("Get languages route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

/** GET /api/google/voices — List available TTS voices */
router.get("/voices", async (req: Request, res: Response) => {
  try {
    const languageCode = req.query["languageCode"] as string | undefined;
    const voices = await listVoices(languageCode);
    res.json({
      success: true,
      data: voices,
      timestamp: Date.now(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list voices";
    logger.error("List voices route error", { error: message });
    res.status(500).json({ success: false, error: message, timestamp: Date.now() });
  }
});

export default router;

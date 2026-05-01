import request from "supertest";
import { createApp } from "@/app";
import express from "express";

// Mock the Google Cloud service
jest.mock("@/services/googleCloudService", () => ({
  synthesizeSpeech: jest.fn().mockResolvedValue({
    audioContent: "base64audio",
    contentType: "audio/mpeg",
  }),
  translateText: jest.fn().mockResolvedValue({
    translatedText: "Hola mundo",
    detectedSourceLanguage: "en",
  }),
  detectLanguage: jest.fn().mockResolvedValue({
    language: "en",
    confidence: 0.98,
  }),
  analyzeSentiment: jest.fn().mockResolvedValue({
    score: 0.5,
    magnitude: 0.7,
    sentences: [{ text: "Elections are great!", sentiment: { score: 0.5, magnitude: 0.7 } }],
  }),
  analyzeEntities: jest.fn().mockResolvedValue({
    entities: [{ name: "Electoral College", type: "ORGANIZATION", salience: 0.8 }],
  }),
  getSupportedLanguages: jest.fn().mockResolvedValue([
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
  ]),
  listVoices: jest.fn().mockResolvedValue([
    { name: "en-US-Neural2-C", languageCodes: ["en-US"], ssmlGender: "FEMALE" },
  ]),
}));

jest.mock("@/config", () => ({
  getConfig: () => ({
    GOOGLE_AI_API_KEY: "test-key",
    GOOGLE_CLOUD_API_KEY: "test-cloud-key",
    PORT: 3000,
    NODE_ENV: "test",
    RATE_LIMIT_WINDOW_MS: 900000,
    RATE_LIMIT_MAX_REQUESTS: 100,
    LOG_LEVEL: "info",
  }),
  APP_CONSTANTS: {
    MAX_CHAT_MESSAGE_LENGTH: 1000,
    MAX_CHAT_HISTORY: 50,
    SESSION_EXPIRY_MS: 86400000,
    AI_MODEL: "gemini-2.0-flash",
    AI_MAX_TOKENS: 2048,
    AI_TEMPERATURE: 0.7,
    CACHE_TTL_MS: 300000,
  },
}));

describe("Google Cloud API Routes", () => {
  let app: express.Application;

  beforeAll(() => {
    app = createApp();
  });

  describe("POST /api/google/tts", () => {
    it("should synthesize speech from valid text", async () => {
      const res = await request(app)
        .post("/api/google/tts")
        .send({ text: "Hello world" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.audioContent).toBe("base64audio");
      expect(res.body.data.contentType).toBe("audio/mpeg");
    });

    it("should reject empty text", async () => {
      const res = await request(app)
        .post("/api/google/tts")
        .send({ text: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should accept optional voice parameters", async () => {
      const res = await request(app)
        .post("/api/google/tts")
        .send({
          text: "Hello",
          languageCode: "es-ES",
          ssmlGender: "MALE",
          speakingRate: 1.5,
          pitch: 2,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should reject invalid speaking rate", async () => {
      const res = await request(app)
        .post("/api/google/tts")
        .send({ text: "Hello", speakingRate: 10 });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/google/translate", () => {
    it("should translate text successfully", async () => {
      const res = await request(app)
        .post("/api/google/translate")
        .send({ text: "Hello world", targetLanguage: "es" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.translatedText).toBe("Hola mundo");
    });

    it("should reject missing target language", async () => {
      const res = await request(app)
        .post("/api/google/translate")
        .send({ text: "Hello" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject empty text", async () => {
      const res = await request(app)
        .post("/api/google/translate")
        .send({ text: "", targetLanguage: "es" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/google/detect-language", () => {
    it("should detect language successfully", async () => {
      const res = await request(app)
        .post("/api/google/detect-language")
        .send({ text: "Hello world" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.language).toBe("en");
      expect(res.body.data.confidence).toBe(0.98);
    });

    it("should reject empty text", async () => {
      const res = await request(app)
        .post("/api/google/detect-language")
        .send({ text: "" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/google/analyze-sentiment", () => {
    it("should analyze sentiment successfully", async () => {
      const res = await request(app)
        .post("/api/google/analyze-sentiment")
        .send({ text: "Elections are great!" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBe(0.5);
      expect(res.body.data.magnitude).toBe(0.7);
      expect(res.body.data.sentences).toHaveLength(1);
    });

    it("should reject empty text", async () => {
      const res = await request(app)
        .post("/api/google/analyze-sentiment")
        .send({ text: "" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/google/analyze-entities", () => {
    it("should extract entities successfully", async () => {
      const res = await request(app)
        .post("/api/google/analyze-entities")
        .send({ text: "The Electoral College determines the president" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.entities).toHaveLength(1);
      expect(res.body.data.entities[0].name).toBe("Electoral College");
    });

    it("should reject empty text", async () => {
      const res = await request(app)
        .post("/api/google/analyze-entities")
        .send({ text: "" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/google/languages", () => {
    it("should return supported languages", async () => {
      const res = await request(app).get("/api/google/languages");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].code).toBe("en");
    });
  });

  describe("GET /api/google/voices", () => {
    it("should list available voices", async () => {
      const res = await request(app).get("/api/google/voices");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("en-US-Neural2-C");
    });

    it("should accept languageCode query param", async () => {
      const res = await request(app).get("/api/google/voices?languageCode=en-US");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

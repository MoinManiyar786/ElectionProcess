import {
  synthesizeSpeech,
  translateText,
  detectLanguage,
  analyzeSentiment,
  analyzeEntities,
  getSupportedLanguages,
  listVoices,
} from "@/services/googleCloudService";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

// Mock config
jest.mock("@/config", () => ({
  getConfig: () => ({
    GOOGLE_AI_API_KEY: "test-ai-key",
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

jest.mock("@/utils/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe("Google Cloud Service", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe("synthesizeSpeech", () => {
    it("should synthesize text to speech successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioContent: "base64AudioContent" }),
      });

      const result = await synthesizeSpeech({ text: "Hello world" });

      expect(result.audioContent).toBe("base64AudioContent");
      expect(result.contentType).toBe("audio/mpeg");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("texttospeech.googleapis.com"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      await expect(synthesizeSpeech({ text: "test" })).rejects.toThrow(
        "Text-to-Speech API failed: 403"
      );
    });

    it("should use default voice settings", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioContent: "audio" }),
      });

      await synthesizeSpeech({ text: "test" });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.voice.languageCode).toBe("en-US");
      expect(callBody.voice.ssmlGender).toBe("FEMALE");
      expect(callBody.audioConfig.audioEncoding).toBe("MP3");
    });

    it("should use custom voice settings", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioContent: "audio" }),
      });

      await synthesizeSpeech({
        text: "Hola",
        languageCode: "es-ES",
        ssmlGender: "MALE",
        speakingRate: 1.2,
        pitch: 2,
      });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.voice.languageCode).toBe("es-ES");
      expect(callBody.voice.ssmlGender).toBe("MALE");
      expect(callBody.audioConfig.speakingRate).toBe(1.2);
      expect(callBody.audioConfig.pitch).toBe(2);
    });

    it("should truncate text to 5000 characters", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioContent: "audio" }),
      });

      const longText = "a".repeat(6000);
      await synthesizeSpeech({ text: longText });

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.input.text.length).toBe(5000);
    });
  });

  describe("translateText", () => {
    it("should translate text successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            translations: [{ translatedText: "Hola", detectedSourceLanguage: "en" }],
          },
        }),
      });

      const result = await translateText({ text: "Hello", targetLanguage: "es" });

      expect(result.translatedText).toBe("Hola");
      expect(result.detectedSourceLanguage).toBe("en");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      await expect(
        translateText({ text: "test", targetLanguage: "xx" })
      ).rejects.toThrow("Translation API failed: 400");
    });

    it("should include source language when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { translations: [{ translatedText: "Bonjour" }] },
        }),
      });

      await translateText({ text: "Hello", targetLanguage: "fr", sourceLanguage: "en" });

      const calledUrl = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain("source=en");
    });
  });

  describe("detectLanguage", () => {
    it("should detect language successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { detections: [[{ language: "en", confidence: 0.99 }]] },
        }),
      });

      const result = await detectLanguage("Hello world");

      expect(result.language).toBe("en");
      expect(result.confidence).toBe(0.99);
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => "Server Error",
      });

      await expect(detectLanguage("test")).rejects.toThrow("Language detection failed: 500");
    });
  });

  describe("analyzeSentiment", () => {
    it("should analyze sentiment successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documentSentiment: { score: 0.8, magnitude: 0.9 },
          sentences: [
            {
              text: { content: "I love elections!" },
              sentiment: { score: 0.8, magnitude: 0.9 },
            },
          ],
        }),
      });

      const result = await analyzeSentiment("I love elections!");

      expect(result.score).toBe(0.8);
      expect(result.magnitude).toBe(0.9);
      expect(result.sentences).toHaveLength(1);
      expect(result.sentences[0]!.text).toBe("I love elections!");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () => "Forbidden",
      });

      await expect(analyzeSentiment("test")).rejects.toThrow("Sentiment analysis failed: 403");
    });

    it("should handle empty sentences array", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          documentSentiment: { score: 0, magnitude: 0 },
          sentences: [],
        }),
      });

      const result = await analyzeSentiment(".");
      expect(result.sentences).toHaveLength(0);
    });
  });

  describe("analyzeEntities", () => {
    it("should analyze entities successfully", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entities: [
            { name: "Electoral College", type: "OTHER", salience: 0.9 },
            { name: "United States", type: "LOCATION", salience: 0.3 },
          ],
        }),
      });

      const result = await analyzeEntities("The Electoral College in the United States");

      expect(result.entities).toHaveLength(2);
      expect(result.entities[0]!.name).toBe("Electoral College");
      expect(result.entities[0]!.type).toBe("OTHER");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => "Rate limited",
      });

      await expect(analyzeEntities("test")).rejects.toThrow("Entity analysis failed: 429");
    });
  });

  describe("getSupportedLanguages", () => {
    it("should return supported languages", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            languages: [
              { language: "en", name: "English" },
              { language: "es", name: "Spanish" },
            ],
          },
        }),
      });

      const result = await getSupportedLanguages();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ code: "en", name: "English" });
      expect(result[1]).toEqual({ code: "es", name: "Spanish" });
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getSupportedLanguages()).rejects.toThrow(
        "Failed to get supported languages: 500"
      );
    });
  });

  describe("listVoices", () => {
    it("should list available voices", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          voices: [
            { name: "en-US-Neural2-C", languageCodes: ["en-US"], ssmlGender: "FEMALE" },
          ],
        }),
      });

      const result = await listVoices("en-US");

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe("en-US-Neural2-C");
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(listVoices()).rejects.toThrow("Failed to list voices: 500");
    });

    it("should include languageCode param when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ voices: [] }),
      });

      await listVoices("es-ES");

      expect(mockFetch.mock.calls[0][0]).toContain("languageCode=es-ES");
    });
  });
});

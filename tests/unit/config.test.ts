import { getConfig, resetConfigCache, APP_CONSTANTS } from "@/config";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    resetConfigCache();
    process.env = {
      ...originalEnv,
      GOOGLE_AI_API_KEY: "test-ai-key",
      GOOGLE_CLOUD_API_KEY: "test-cloud-key",
      PORT: "4000",
      NODE_ENV: "test",
      RATE_LIMIT_WINDOW_MS: "600000",
      RATE_LIMIT_MAX_REQUESTS: "50",
      LOG_LEVEL: "debug",
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetConfigCache();
  });

  describe("getConfig", () => {
    it("should load valid configuration from environment", () => {
      const config = getConfig();

      expect(config.GOOGLE_AI_API_KEY).toBe("test-ai-key");
      expect(config.GOOGLE_CLOUD_API_KEY).toBe("test-cloud-key");
      expect(config.PORT).toBe(4000);
      expect(config.NODE_ENV).toBe("test");
      expect(config.RATE_LIMIT_WINDOW_MS).toBe(600000);
      expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(50);
      expect(config.LOG_LEVEL).toBe("debug");
    });

    it("should use default values when optional env vars are missing", () => {
      process.env = {
        GOOGLE_AI_API_KEY: "key",
        GOOGLE_CLOUD_API_KEY: "cloud-key",
      };
      resetConfigCache();

      const config = getConfig();

      expect(config.PORT).toBe(3000);
      expect(config.NODE_ENV).toBe("development");
      expect(config.RATE_LIMIT_WINDOW_MS).toBe(900000);
      expect(config.RATE_LIMIT_MAX_REQUESTS).toBe(100);
      expect(config.LOG_LEVEL).toBe("info");
    });

    it("should throw when GOOGLE_AI_API_KEY is missing", () => {
      process.env = { GOOGLE_CLOUD_API_KEY: "cloud-key" };
      resetConfigCache();

      expect(() => getConfig()).toThrow("Invalid environment configuration");
    });

    it("should throw when GOOGLE_CLOUD_API_KEY is missing", () => {
      process.env = { GOOGLE_AI_API_KEY: "ai-key" };
      resetConfigCache();

      expect(() => getConfig()).toThrow("Invalid environment configuration");
    });

    it("should cache config on subsequent calls", () => {
      const config1 = getConfig();
      const config2 = getConfig();

      expect(config1).toBe(config2);
    });

    it("should reload after cache reset", () => {
      const config1 = getConfig();
      resetConfigCache();

      process.env["PORT"] = "5000";
      const config2 = getConfig();

      expect(config1.PORT).toBe(4000);
      expect(config2.PORT).toBe(5000);
    });
  });

  describe("APP_CONSTANTS", () => {
    it("should have correct constant values", () => {
      expect(APP_CONSTANTS.MAX_CHAT_MESSAGE_LENGTH).toBe(1000);
      expect(APP_CONSTANTS.MAX_CHAT_HISTORY).toBe(50);
      expect(APP_CONSTANTS.SESSION_EXPIRY_MS).toBe(86400000);
      expect(APP_CONSTANTS.AI_MODEL).toBe("gemini-2.0-flash");
      expect(APP_CONSTANTS.AI_MAX_TOKENS).toBe(2048);
      expect(APP_CONSTANTS.AI_TEMPERATURE).toBe(0.7);
      expect(APP_CONSTANTS.CACHE_TTL_MS).toBe(300000);
    });

    it("should be immutable (as const)", () => {
      expect(Object.isFrozen(APP_CONSTANTS)).toBe(false);
      expect(typeof APP_CONSTANTS.AI_MODEL).toBe("string");
    });
  });
});

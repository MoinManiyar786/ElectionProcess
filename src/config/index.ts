import { z } from "zod";

const envSchema = z.object({
  GOOGLE_AI_API_KEY: z.string().min(1, "Google AI API key is required"),
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
});

export type AppConfig = z.infer<typeof envSchema>;

function loadConfig(): AppConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const missing = Object.entries(formatted)
      .filter(([key]) => key !== "_errors")
      .map(([key, val]) => {
        const errors = val as { _errors?: string[] };
        return `  ${key}: ${errors._errors?.join(", ") ?? "invalid"}`;
      })
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${missing}`);
  }

  return result.data;
}

let cachedConfig: AppConfig | null = null;

export function getConfig(): AppConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

export function resetConfigCache(): void {
  cachedConfig = null;
}

export const APP_CONSTANTS = {
  MAX_CHAT_MESSAGE_LENGTH: 1000,
  MAX_CHAT_HISTORY: 50,
  SESSION_EXPIRY_MS: 24 * 60 * 60 * 1000,
  AI_MODEL: "gemini-1.5-flash",
  AI_MAX_TOKENS: 2048,
  AI_TEMPERATURE: 0.7,
  CACHE_TTL_MS: 5 * 60 * 1000,
} as const;

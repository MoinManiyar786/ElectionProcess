import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

/**
 * Configure Helmet for secure HTTP headers including a strict CSP.
 */
export function createHelmetMiddleware(): ReturnType<typeof helmet> {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'", "data:", "blob:"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xContentTypeOptions: true,
    xFrameOptions: { action: "deny" },
  });
}

/**
 * Configure CORS: open in development, restricted in production.
 */
export function createCorsMiddleware(): ReturnType<typeof cors> {
  return cors({
    origin: process.env["NODE_ENV"] === "production" ? false : true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400,
  });
}

/**
 * Create a global rate limiter to prevent abuse.
 */
export function createRateLimiter(windowMs: number, max: number): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "Too many requests. Please try again later.",
      timestamp: Date.now(),
    },
    handler: (_req: Request, res: Response) => {
      logger.warn("Rate limit exceeded", { ip: _req.ip });
      res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
        timestamp: Date.now(),
      });
    },
  });
}

/**
 * Create a stricter rate limiter specifically for AI chat endpoints.
 */
export function createApiRateLimiter(): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs: 60_000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: "AI chat rate limit exceeded. Please wait before sending more messages.",
      timestamp: Date.now(),
    },
  });
}

/**
 * Log incoming requests with method, URL, status, and duration.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent"),
    });
  });
  next();
}

/**
 * Global error handler — hides stack traces in production.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  res.status(500).json({
    success: false,
    error: process.env["NODE_ENV"] === "production"
      ? "An unexpected error occurred"
      : err.message,
    timestamp: Date.now(),
  });
}

/**
 * Handle 404 for unmatched API routes.
 */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "Resource not found",
    timestamp: Date.now(),
  });
}

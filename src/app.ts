import express from "express";
import compression from "compression";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {
  createHelmetMiddleware,
  createCorsMiddleware,
  createRateLimiter,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from "./middleware/security";
import electionRoutes from "./routes/electionRoutes";
import chatRoutes from "./routes/chatRoutes";
import quizRoutes from "./routes/quizRoutes";
import googleCloudRoutes from "./routes/googleCloudRoutes";

/**
 * Create and configure the Express application with all middleware and routes.
 * Separated from server.ts to allow testing without starting a listener.
 */
export function createApp(): express.Application {
  const app = express();

  app.disable("x-powered-by");

  const windowMs = Number(process.env["RATE_LIMIT_WINDOW_MS"]) || 900_000;
  const maxRequests = Number(process.env["RATE_LIMIT_MAX_REQUESTS"]) || 100;

  app.use((_req, res, next) => {
    res.setHeader("X-Request-Id", uuidv4());
    next();
  });

  app.use(createHelmetMiddleware());
  app.use(createCorsMiddleware());
  app.use(compression());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ extended: false, limit: "10kb" }));
  app.use(createRateLimiter(windowMs, maxRequests));

  if (process.env["NODE_ENV"] !== "test") {
    app.use(requestLogger);
  }

  app.use(express.static(path.join(__dirname, "..", "public"), {
    maxAge: "1d",
    etag: true,
    lastModified: true,
  }));

  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: Date.now(),
        version: "1.0.0",
      },
      timestamp: Date.now(),
    });
  });

  app.use("/api/election", electionRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/quiz", quizRoutes);
  app.use("/api/google", googleCloudRoutes);

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      next();
      return;
    }
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
  });

  app.use("/api/*", notFoundHandler);
  app.use(errorHandler);

  return app;
}

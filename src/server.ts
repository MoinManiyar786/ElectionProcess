import "dotenv/config";
import { createApp } from "./app";
import { getConfig } from "./config";
import { logger } from "./utils/logger";
import { cleanupExpiredSessions } from "./services/aiService";

/**
 * Initialize and start the Express server with graceful shutdown support.
 * Loads configuration, creates the app, and registers process signal handlers.
 */
function startServer(): void {
  try {
    const config = getConfig();
    const app = createApp();

    const server = app.listen(config.PORT, () => {
      logger.info(`Election Education Assistant running on port ${config.PORT}`, {
        environment: config.NODE_ENV,
        port: config.PORT,
      });
    });

    const cleanupInterval = setInterval(() => {
      const cleaned = cleanupExpiredSessions();
      if (cleaned > 0) {
        logger.debug(`Cleaned up ${cleaned} expired chat sessions`);
      }
    }, 300_000);

    const shutdown = (signal: string): void => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      clearInterval(cleanupInterval);
      server.close(() => {
        logger.info("Server closed");
        process.exit(0);
      });

      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled Promise Rejection", { reason });
    });

    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception", { error: error.message, stack: error.stack });
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
}

startServer();

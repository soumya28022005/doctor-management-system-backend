import app from "./app.js";
import { env } from "./config/env.config.js";
import logger from "./config/logger.config.js";
import prisma from "./config/db.config.js";
import redis from "./config/redis.config.js";

const startServer = async () => {
  try {
    // Test DB connection
    await prisma.$connect();
    logger.info("✅ PostgreSQL (Supabase) connected via Prisma");

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        redis.disconnect();
        logger.info("Server shut down complete.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error({ error }, "❌ Failed to start server");
    process.exit(1);
  }
};

startServer();
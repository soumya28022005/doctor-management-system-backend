import { Server } from "socket.io";
import logger from "./logger.config.js";

let io;

export const initSocket = (httpServer, corsOrigin) => {
  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Client joins a room specific to a doctor's queue to receive live updates
    socket.on("joinQueue", (doctorId) => {
      socket.join(`queue:${doctorId}`);
      logger.info(`Socket ${socket.id} joined queue:${doctorId}`);
    });

    socket.on("leaveQueue", (doctorId) => {
      socket.leave(`queue:${doctorId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call initSocket first.");
  }
  return io;
};
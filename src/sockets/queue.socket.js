import { getIO } from "../config/socket.config.js";

// Broadcast the latest queue state to everyone watching this doctor's queue
export const emitQueueUpdate = (doctorId, queueData) => {
  const io = getIO();
  io.to(`queue:${doctorId}`).emit("queueUpdate", queueData);
};
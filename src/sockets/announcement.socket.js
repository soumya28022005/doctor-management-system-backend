import { getIO } from "../config/socket.config.js";
import logger from "../config/logger.config.js";

// Broadcast to everyone platform-wide (Listens to "new_announcement" on frontend)
export const emitGlobalAnnouncement = (announcement) => {
  try {
    const io = getIO();
    io.emit("new_announcement", announcement);
    logger.info(`📢 Global announcement broadcasted: ${announcement.title}`);
  } catch (error) {
    logger.error("Socket error emitting global announcement:", error);
  }
};

// Broadcast only to clients watching a specific clinic
export const emitClinicAnnouncement = (clinicId, announcement) => {
  try {
    const io = getIO();
    io.to(`clinic:${clinicId}`).emit("new_announcement", announcement);
    logger.info(`📢 Clinic announcement broadcasted to clinic:${clinicId}`);
  } catch (error) {
    logger.error("Socket error emitting clinic announcement:", error);
  }
};
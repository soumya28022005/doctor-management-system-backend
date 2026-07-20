import { getIO } from "../config/socket.config.js";

// Broadcast to everyone platform-wide (used for Admin's global announcements)
export const emitGlobalAnnouncement = (announcement) => {
  const io = getIO();
  io.emit("announcement", announcement);
};

// Broadcast only to clients watching a specific clinic's announcements
export const emitClinicAnnouncement = (clinicId, announcement) => {
  const io = getIO();
  io.to(`clinic:${clinicId}`).emit("announcement", announcement);
};
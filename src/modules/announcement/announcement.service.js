import ApiError from "../../utils/apiError.js";
import {
  createAnnouncement,
  findActiveAnnouncementsForClinic,
  findAllPlatformAnnouncements,
  findAnnouncementById,
  deactivateAnnouncement,
} from "./announcement.repository.js";
import { findClinicByUserId } from "../clinic/clinic.repository.js";
import { findDoctorById } from "../clinic/clinic.repository.js";
import { emitGlobalAnnouncement, emitClinicAnnouncement } from "../../sockets/announcement.socket.js";

export const publishPlatformAnnouncement = async (adminUserId, { type, title, message }) => {
  const announcement = await createAnnouncement({
    type,
    title,
    message,
    createdByUserId: adminUserId,
    clinicId: null,
    doctorId: null,
  });

  emitGlobalAnnouncement(announcement);
  return announcement;
};

export const publishClinicAnnouncement = async (clinicUserId, { type, title, message, doctorId }) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  if (doctorId) {
    const doctor = await findDoctorById(doctorId);
    if (!doctor || doctor.clinicId !== clinic.id) {
      throw new ApiError(400, "Doctor does not belong to your clinic");
    }
  }

  const announcement = await createAnnouncement({
    type,
    title,
    message,
    createdByUserId: clinicUserId,
    clinicId: clinic.id,
    doctorId: doctorId || null,
  });

  emitClinicAnnouncement(clinic.id, announcement);
  return announcement;
};

export const listForClinic = async (clinicId, { page, limit }) => {
  return findActiveAnnouncementsForClinic({ clinicId, page, limit });
};

export const listAllPlatform = async ({ page, limit }) => {
  return findAllPlatformAnnouncements({ page, limit });
};

export const deactivate = async (announcementId, requestingUser) => {
  const announcement = await findAnnouncementById(announcementId);
  if (!announcement) throw new ApiError(404, "Announcement not found");

  if (requestingUser.role === "CLINIC") {
    const clinic = await findClinicByUserId(requestingUser.id);
    if (!clinic || announcement.clinicId !== clinic.id) {
      throw new ApiError(403, "You can only deactivate your own clinic's announcements");
    }
  }

  return deactivateAnnouncement(announcementId);
};
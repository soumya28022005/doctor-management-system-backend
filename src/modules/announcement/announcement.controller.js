import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import * as announcementService from "./announcement.service.js";
import {
  createAnnouncementSchema,
  listAnnouncementsQuerySchema,
} from "./announcement.validation.js";

// IMPORT THE SOCKET HELPERS HERE
import { 
  emitGlobalAnnouncement, 
  emitClinicAnnouncement 
} from "../../sockets/announcement.socket.js";

export const publishPlatformAnnouncement = asyncHandler(async (req, res) => {
  const data = createAnnouncementSchema.parse(req.body);
  const announcement = await announcementService.publishPlatformAnnouncement(req.user.id, data);
  
  // TRIGGER SOCKET BROADCAST
  emitGlobalAnnouncement(announcement);

  res.status(201).json(new ApiResponse(true, "Announcement published", { announcement }));
});

export const publishClinicAnnouncement = asyncHandler(async (req, res) => {
  const data = createAnnouncementSchema.parse(req.body);
  const announcement = await announcementService.publishClinicAnnouncement(req.user.id, data);
  
  // TRIGGER SOCKET BROADCAST
  emitClinicAnnouncement(req.user.clinicId || req.params.clinicId, announcement);

  res.status(201).json(new ApiResponse(true, "Announcement published", { announcement }));
});

export const listForClinic = asyncHandler(async (req, res) => {
  const query = listAnnouncementsQuerySchema.parse(req.query);
  const announcements = await announcementService.listForClinic(req.params.clinicId, query);
  res.status(200).json(new ApiResponse(true, "Announcements fetched", { announcements }));
});

export const listAllPlatform = asyncHandler(async (req, res) => {
  const query = listAnnouncementsQuerySchema.parse(req.query);
  const announcements = await announcementService.listAllPlatform(query);
  res.status(200).json(new ApiResponse(true, "Announcements fetched", { announcements }));
});

export const deactivate = asyncHandler(async (req, res) => {
  const announcement = await announcementService.deactivate(req.params.announcementId, req.user);
  res.status(200).json(new ApiResponse(true, "Announcement deactivated", { announcement }));
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.id);
  res.status(200).json(new ApiResponse(true, "Announcement permanently deleted", null));
});

export const updatePlatformAnnouncement = asyncHandler(async (req, res) => {
  const updatedData = await announcementService.updatePlatformAnnouncement(req.params.id, req.body);
  res.status(200).json(new ApiResponse(true, "Announcement updated", { announcement: updatedData }));
});

export const listAllAdmin = asyncHandler(async (req, res) => {
  const announcements = await announcementService.listAllForAdmin();
  res.status(200).json(new ApiResponse(true, "Admin announcements fetched", { announcements }));
});
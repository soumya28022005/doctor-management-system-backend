import { Router } from "express";
import * as announcementController from "./announcement.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

// Admin/Super Admin — platform-wide announcements
router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.publishPlatformAnnouncement
);
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.listAllPlatform
);

// Clinic — clinic-specific announcements (optionally tied to a doctor)
router.post(
  "/clinic",
  authMiddleware,
  roleMiddleware("CLINIC"),
  announcementController.publishClinicAnnouncement
);

// Any logged-in user (e.g. patient) can view a specific clinic's active announcements
router.get("/clinic/:clinicId", authMiddleware, announcementController.listForClinic);

// Deactivate — Clinic (their own) or Admin (any)
router.patch(
  "/:announcementId/deactivate",
  authMiddleware,
  roleMiddleware("CLINIC", "SUPER_ADMIN", "ADMIN"),
  announcementController.deactivate
);

export default router;
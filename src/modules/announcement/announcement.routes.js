import { Router } from "express";
import * as announcementController from "./announcement.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: 📢 Global Broadcasting & Platform-Wide Notice System
 */

// ============================================================================
// 1. GLOBAL / PUBLIC ROUTES (For all authenticated users)
// ============================================================================

/**
 * @swagger
 * /announcements/global:
 *   get:
 *     summary: Get active platform announcements (All Users)
 *     description: Fetches active platform announcements for any authenticated user (Doctor, Patient, Clinic, etc.). Excludes paused/deactivated announcements.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Active announcements fetched successfully }
 */
router.get(
  "/global",
  announcementController.listAllPlatform
);


// ============================================================================
// 2. ADMIN MANAGEMENT ROUTES (Super Admin & Admin Only)
// ============================================================================

/**
 * @swagger
 * /announcements/admin:
 *   get:
 *     summary: (Admin) List all platform announcements
 *     description: Retrieves a complete list of all platform announcements, including both active and paused notices, for admin management.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: All announcements fetched successfully }
 */
router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.listAllAdmin // Note: Make sure this uses the listAllAdmin controller to show paused ones too!
);

/**
 * @swagger
 * /announcements/admin:
 *   post:
 *     summary: (Admin) Publish a new platform-wide announcement
 *     description: Creates and instantly broadcasts high-priority alerts to all active users via Socket.io.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, message]
 *             properties:
 *               type: { type: string, enum: [DOCTOR_ABSENT, CLINIC_CLOSED, HOLIDAY, EMERGENCY, MAINTENANCE, GENERAL] }
 *               title: { type: string, example: "System Maintenance" }
 *               message: { type: string, example: "The platform will be down for 15 minutes." }
 *     responses:
 *       201: { description: Announcement successfully published and broadcasted }
 */
router.post(
  "/admin",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.publishPlatformAnnouncement
);

/**
 * @swagger
 * /announcements/admin/{id}:
 *   patch:
 *     summary: (Admin) Edit/Update an existing announcement
 *     description: Updates the title or message of an existing announcement.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: The unique ID of the announcement to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               message: { type: string }
 *     responses:
 *       200: { description: Announcement updated successfully }
 *       404: { description: Announcement not found }
 */
router.patch(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.updatePlatformAnnouncement
);


// ============================================================================
// 3. CLINIC MANAGEMENT ROUTES
// ============================================================================

/**
 * @swagger
 * /announcements/clinic:
 *   post:
 *     summary: (Clinic) Publish a clinic-specific announcement
 *     description: Creates an announcement specific to a clinic, optionally tied to a particular doctor.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, title, message]
 *             properties:
 *               type: { type: string, enum: [DOCTOR_ABSENT, CLINIC_CLOSED, HOLIDAY, EMERGENCY, MAINTENANCE, GENERAL] }
 *               title: { type: string }
 *               message: { type: string }
 *               doctorId: { type: string, format: uuid, description: "Optional UUID of the specific doctor" }
 *     responses:
 *       201: { description: Clinic announcement published }
 *       400: { description: Doctor does not belong to the clinic }
 */
router.post(
  "/clinic",
  authMiddleware,
  roleMiddleware("CLINIC"),
  announcementController.publishClinicAnnouncement
);

/**
 * @swagger
 * /announcements/clinic/{clinicId}:
 *   get:
 *     summary: View active announcements for a specific clinic
 *     description: Retrieves all active announcements belonging to a specific clinic (including global platform ones).
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Clinic announcements fetched successfully }
 */
router.get(
  "/clinic/:clinicId",
  authMiddleware,
  announcementController.listForClinic
);


// ============================================================================
// 4. ACTION ROUTES (Pause & Delete)
// ============================================================================

/**
 * @swagger
 * /announcements/{announcementId}/deactivate:
 *   patch:
 *     summary: Pause/Deactivate an announcement
 *     description: Hides the announcement from the public view without deleting it from the database. Clinics can only deactivate their own; Admins can deactivate any.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: announcementId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Announcement paused/deactivated successfully }
 *       403: { description: Unauthorized to deactivate this announcement }
 */
router.patch(
  "/:announcementId/deactivate",
  authMiddleware,
  roleMiddleware("CLINIC", "SUPER_ADMIN", "ADMIN"),
  announcementController.deactivate
);

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: (Admin) Permanently delete an announcement
 *     description: Completely removes an announcement from the database. This action cannot be undone.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Announcement permanently deleted }
 *       404: { description: Announcement not found }
 */
router.delete(
  "/:id", 
  authMiddleware, 
  roleMiddleware("SUPER_ADMIN", "ADMIN"),
  announcementController.deleteAnnouncement
);

export default router;
import { Router } from "express";
import * as queueController from "./queue.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("RECEPTIONIST", "CLINIC", "SUPER_ADMIN", "ADMIN"));

// 🟢 FIX: Added :scheduleId to all routes to support multiple sessions per day
router.get("/:doctorId/:clinicId/:date/:scheduleId", queueController.getQueueStatus);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/next", queueController.next);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/previous", queueController.previous);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/skip", queueController.skip);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/recall", queueController.recall);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/pause", queueController.pause);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/resume", queueController.resume);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/close", queueController.close);
router.patch("/:doctorId/:clinicId/:date/:scheduleId/reopen", queueController.reopen);
router.post("/:doctorId/:clinicId/:date/:scheduleId/emergency", queueController.emergency);

export default router;
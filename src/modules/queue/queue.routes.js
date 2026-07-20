import { Router } from "express";
import * as queueController from "./queue.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("RECEPTIONIST", "CLINIC", "SUPER_ADMIN", "ADMIN"));

router.get("/:doctorId/:date", queueController.getQueueStatus);
router.patch("/:doctorId/:date/next", queueController.next);
router.patch("/:doctorId/:date/previous", queueController.previous);
router.patch("/:doctorId/:date/skip", queueController.skip);
router.patch("/:doctorId/:date/recall", queueController.recall);
router.patch("/:doctorId/:date/pause", queueController.pause);
router.patch("/:doctorId/:date/resume", queueController.resume);
router.patch("/:doctorId/:date/close", queueController.close);
router.patch("/:doctorId/:date/reopen", queueController.reopen);
router.post("/:doctorId/:date/emergency", queueController.emergency);

export default router;
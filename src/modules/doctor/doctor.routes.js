import { Router } from "express";
import * as doctorController from "./doctor.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/search", authMiddleware, doctorController.searchByName);

// Clinic sends a request to a doctor; views requests it has sent
router.post(
  "/requests",
  authMiddleware,
  roleMiddleware("CLINIC"),
  doctorController.sendRequestToDoctor
);
router.get(
  "/requests/sent",
  authMiddleware,
  roleMiddleware("CLINIC"),
  doctorController.getMySentRequests
);

// Doctor views requests received, and accepts/rejects
router.get(
  "/requests/received",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorController.getMyReceivedRequests
);
router.patch(
  "/requests/:associationId/respond",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  doctorController.respondToClinicRequest
);

router.patch(
  "/associations/:associationId/cancel",
  authMiddleware,
  roleMiddleware("DOCTOR", "CLINIC"),
  doctorController.cancelAssociation
);

router.post(
  "/profile-photo",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  upload.single("photo"),
  doctorController.uploadProfilePhoto
);

export default router;
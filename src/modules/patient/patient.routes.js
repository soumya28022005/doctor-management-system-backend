import { Router } from "express";
import * as patientController from "./patient.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/search",
  authMiddleware,
  roleMiddleware("RECEPTIONIST", "CLINIC"),
  patientController.searchPatient
);
router.post(
  "/guest",
  authMiddleware,
  roleMiddleware("RECEPTIONIST", "CLINIC"),
  patientController.createGuestPatient
);

router.get("/me", authMiddleware, roleMiddleware("PATIENT"), patientController.getMyProfile);
router.patch("/me", authMiddleware, roleMiddleware("PATIENT"), patientController.updateMyProfile);

export default router;
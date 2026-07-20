import { Router } from "express";
import * as appointmentController from "./appointment.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

// Public-ish search (any logged-in user can search doctors)
router.get("/doctors/search", authMiddleware, appointmentController.searchDoctors);

// Patient books for themselves
router.post(
  "/book/online",
  authMiddleware,
  roleMiddleware("PATIENT"),
  appointmentController.bookOnline
);

// Receptionist/Clinic books for walk-in/phone/existing patient
router.post(
  "/book/reception",
  authMiddleware,
  roleMiddleware("RECEPTIONIST", "CLINIC"),
  appointmentController.bookReception
);

router.get(
  "/me",
  authMiddleware,
  roleMiddleware("PATIENT"),
  appointmentController.getMyAppointments
);

export default router;
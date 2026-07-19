import { Router } from "express";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import * as clinicController from "../clinic/clinic.controller.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("RECEPTIONIST"));

router.get("/my-doctors", clinicController.getMyAssignedDoctors);

export default router;
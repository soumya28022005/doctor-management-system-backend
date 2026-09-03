import { Router } from "express";
import * as specializationController from "./specialization.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

// Public / Authenticated route to populate frontend dropdowns
router.get("/", specializationController.getSpecializations);

// Super Admin only routes for managing specializations
router.post(
  "/",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  specializationController.createSpecialization
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("SUPER_ADMIN"),
  specializationController.updateSpecialization
);

export default router;
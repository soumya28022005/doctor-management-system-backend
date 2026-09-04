import { Router } from "express";
import * as specializationController from "./specialization.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";
import upload from "../../middlewares/upload.middleware.js";

const router = Router();

// Public route for homepage
router.get("/", specializationController.getAllSpecializations);

// Secure Admin route for adding new categories with image
router.post(
  "/", 
  authMiddleware, 
  roleMiddleware("SUPER_ADMIN", "ADMIN"), 
  upload.single("icon"), 
  specializationController.createSpecialization
);

export default router;
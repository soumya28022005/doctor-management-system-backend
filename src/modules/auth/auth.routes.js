import { Router } from "express";
import * as authController from "./auth.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimiter.middleware.js";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authController.refresh);
router.post("/forgot-password", otpLimiter, authController.forgotPassword);
router.post("/reset-password", otpLimiter, authController.resetPassword);

router.post("/logout", authMiddleware, authController.logout);
router.get("/me", authMiddleware, authController.getMe);

export default router;
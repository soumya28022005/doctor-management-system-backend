import { Router } from "express";
import * as adminController from "./admin.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("SUPER_ADMIN", "ADMIN"));

router.get("/stats", adminController.getStats);

router.get("/clinics", adminController.listClinics);
router.patch("/clinics/:clinicId/approve", adminController.approveClinic);
router.patch("/clinics/:clinicId/revoke", adminController.revokeClinicApproval);

router.get("/doctors/unverified", adminController.listUnverifiedDoctors);
router.patch("/doctors/:doctorId/verify", adminController.verifyDoctor);

router.get("/users", adminController.listUsers);
router.patch("/users/:userId/status", adminController.toggleUserStatus);

router.get("/settings", adminController.getSettings);
router.patch("/settings", adminController.updateSettings);

export default router;
import { Router } from "express";
import * as clinicController from "./clinic.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import roleMiddleware from "../../middlewares/role.middleware.js";

const router = Router();

router.use(authMiddleware, roleMiddleware("CLINIC"));

router.get("/profile", clinicController.getMyProfile);
router.patch("/profile", clinicController.updateMyProfile);

router.post("/doctors", clinicController.addDoctor);
router.get("/doctors", clinicController.listDoctors);

router.post("/receptionists", clinicController.addReceptionist);
router.get("/receptionists", clinicController.listReceptionists);

router.post("/receptionists/assign-doctors", clinicController.assignDoctorsToReceptionist);
router.patch("/staff/change-password", clinicController.changeStaffPassword);

export default router;
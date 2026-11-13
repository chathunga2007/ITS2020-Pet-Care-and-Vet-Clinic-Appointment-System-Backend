import { Router } from "express";
import { createDoctor, getAllDoctors, updateDoctor, deleteDoctor } from "../controllers/doctor.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { UserRole } from "../models/user.model";

const router = Router();

// Public / Authenticated users can view doctors list
router.get("/", getAllDoctors);

// Admin-only management routes
router.post("/", authenticate, authorize(UserRole.ADMIN), createDoctor);
router.put("/:id", authenticate, authorize(UserRole.ADMIN), updateDoctor);
router.delete("/:id", authenticate, authorize(UserRole.ADMIN), deleteDoctor);

export default router;
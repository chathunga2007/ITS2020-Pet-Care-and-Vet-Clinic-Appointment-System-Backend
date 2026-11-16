import { Router } from "express";
import {
    createAppointment,
    getMyAppointments,
    getAllAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    getDoctorBookedSlots
} from "../controllers/appointment.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { UserRole } from "../models/user.model";

const router = Router();

router.get("/booked-slots", getDoctorBookedSlots);
router.post("/", authenticate, createAppointment);
router.get("/my-appointments", authenticate, getMyAppointments);
router.put("/:id/status", authenticate, updateAppointmentStatus);
router.put("/:id/cancel", authenticate, cancelAppointment);

// Admin-only route
router.get("/all", authenticate, authorize(UserRole.ADMIN), getAllAppointments);

export default router;
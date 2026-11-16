import { Router } from "express";
import { setDoctorSchedule, getDoctorSchedules } from "../controllers/doctor-schedule.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, setDoctorSchedule);
router.get("/:doctorId", getDoctorSchedules);

export const doctorScheduleRouter = router;
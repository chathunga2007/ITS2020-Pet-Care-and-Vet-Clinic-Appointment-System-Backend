import express, { type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/auth.routers";
import petRoutes from "./routes/pet.routers";
import doctorRoutes from "./routes/doctor.routers";
import appointmentRoutes from "./routes/appointment.routers";
import { doctorScheduleRouter } from "./routes/doctor-schedule.routers";
import serviceRoutes from "./routes/service.routers";
import { aiRouter } from "./routes/ai.routers";

const PORT = process.env.PORT || 3000;
const URL = process.env.MONGO_LOCAL_URL || process.env.MONGO_URI || "";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/", (req: Request, res: Response) => {
  res.send("Pet Care & Vet Clinic API is Running!");
});

// Auth Routes Mount
app.use("/api/auth", authRoutes);

// Pet Routers
app.use("/api/pets", petRoutes);

// Doctor Routers
app.use("/api/doctors", doctorRoutes);

// Appoinment Routers
app.use("/api/appointments", appointmentRoutes);

// Doctor Schedules Routers
app.use("/api/doctor-schedules", doctorScheduleRouter);

// Service Routers
app.use("/api/services", serviceRoutes);

// AI Bot Routers Chat
app.use("/api/ai", aiRouter);

mongoose
  .connect(URL)
  .then(() => {
    console.log("DB Connected!");
  })
  .catch((err) => {
    console.error("DB Fail: ", err);
  });

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
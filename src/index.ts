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

let isConnected = false;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const db = await mongoose.connect(URL, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("DB Connected!");
  } catch (error) {
    console.error("DB Connection Fail: ", error);
    throw error;
  }
}

app.use(async (req: Request, res: Response, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

app.get("/", async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStatusMap = ["Disconnected", "Connected", "Connecting", "Disconnecting"];
    const currentStatus = dbStatusMap[dbState] || "Unknown";

    res.status(200).json({
      success: true,
      message: "Pet Care & Vet Clinic API is Running!",
      databaseStatus: currentStatus,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "API running, but database check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Auth Routes Mount
app.use("/api/auth", authRoutes);

// Pet Routers
app.use("/api/pets", petRoutes);

// Doctor Routers
app.use("/api/doctors", doctorRoutes);

// Appointment Routers
app.use("/api/appointments", appointmentRoutes);

// Doctor Schedules Routers
app.use("/api/doctor-schedules", doctorScheduleRouter);

// Service Routers
app.use("/api/services", serviceRoutes);

// AI Bot Routers Chat
app.use("/api/ai", aiRouter);

if (process.env.NODE_ENV !== "production") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

export default app;
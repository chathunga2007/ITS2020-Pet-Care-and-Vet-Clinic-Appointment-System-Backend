import express, { type Request, type Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/auth.routers";
import petRoutes from "./routes/pet.routers";

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

mongoose
  .connect(URL)
  .then(() => {
    console.log("DB Connected!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Fail: ", err);
  });
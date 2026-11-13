import { Document, model, Schema } from "mongoose";

export interface IDoctor extends Document {
  name: string;
  specialization: string;
  phone: string;
  email: string;
  workingHours: string;
  imageURL: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    workingHours: { type: String, required: true },
    imageURL: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    },
  },
  { timestamps: true }
);

export const DoctorModel = model<IDoctor>("doctors", doctorSchema);
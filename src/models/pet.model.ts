import { Document, model, Schema, Types } from "mongoose";

export interface IPet extends Document {
  name: string;
  type: string;
  breed: string;
  age: number;
  gender: "MALE" | "FEMALE";
  owner: Types.ObjectId;
  medicalHistory?: string;
  imageURL: string;
  status: "ACTIVE" | "DELETED";
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IPet>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE"],
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true
    },
    medicalHistory: { type: String, default: "" },
    imageURL: { type: String, default: "" },
    status: {
      type: String,
      enum: ["ACTIVE", "DELETED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

export const PetModel = model<IPet>("pets", petSchema);
import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
}

const serviceSchema = new Schema<IService>({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    durationMinutes: { type: Number, default: 30 }
}, { timestamps: true });

export const ServiceModel = mongoose.model<IService>("Service", serviceSchema);
import { Document, model, Schema, Types } from "mongoose";

export interface IAppointment extends Document {
    user: Types.ObjectId;
    pet: Types.ObjectId;
    doctor: Types.ObjectId;
    appointmentDate: Date;
    time: string;
    reason: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    createdAt: Date;
    updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        user: { type: Schema.Types.ObjectId, ref: "users", required: true },
        pet: { type: Schema.Types.ObjectId, ref: "pets", required: true },
        doctor: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
        appointmentDate: { type: Date, required: true },
        time: { type: String, required: true },
        reason: { type: String, required: true },
        status: {
            type: String,
            enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"],
            default: "PENDING"
        },
    },
    { timestamps: true }
);

export const AppointmentModel = model<IAppointment>("appointments", appointmentSchema);
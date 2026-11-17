import { Schema, model, Document, Types } from "mongoose";

export interface IDoctorSchedule extends Document {
    doctorId: Types.ObjectId;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    isAvailable: boolean;
}

const doctorScheduleSchema = new Schema<IDoctorSchedule>(
    {
        doctorId: { type: Schema.Types.ObjectId, ref: "doctors", required: true },
        dayOfWeek: {
            type: String,
            required: true,
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        slotDurationMinutes: { type: Number, default: 30 },
        isAvailable: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const DoctorScheduleModel = model<IDoctorSchedule>("DoctorSchedule", doctorScheduleSchema);
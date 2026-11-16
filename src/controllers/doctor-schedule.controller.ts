import { Request, Response } from "express";
import { DoctorScheduleModel } from "../models/doctor-schedule.model";

// Set Doctors Schedule
export const setDoctorSchedule = async (req: Request, res: Response) => {
    try {
        const { doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes } = req.body;

        if (!doctorId || !dayOfWeek || !startTime || !endTime) {
            return res.status(400).json({ message: "All required fields must be provided!" });
        }

        let schedule = await DoctorScheduleModel.findOne({ doctorId, dayOfWeek });

        if (schedule) {
            schedule.startTime = startTime;
            schedule.endTime = endTime;
            schedule.slotDurationMinutes = slotDurationMinutes || 30;
            await schedule.save();
            return res.status(200).json({ message: "Doctor schedule updated successfully!", data: schedule });
        }

        schedule = new DoctorScheduleModel({
            doctorId,
            dayOfWeek,
            startTime,
            endTime,
            slotDurationMinutes: slotDurationMinutes || 30,
        });

        await schedule.save();
        return res.status(201).json({ message: "Doctor schedule created successfully!", data: schedule });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to set doctor schedule!" });
    }
};

// Get Doctors Schedules
export const getDoctorSchedules = async (req: Request, res: Response) => {
    try {
        const { doctorId } = req.params;
        const schedules = await DoctorScheduleModel.find({ doctorId });
        return res.status(200).json({ data: schedules });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Failed to fetch doctor schedules!" });
    }
};
import { Response } from "express";
import { AppointmentModel } from "../models/appointment.model";
import { AuthRequest } from "../middleware/auth";
import { UserModel } from "../models/user.model";
import { PetModel } from "../models/pet.model";
import { DoctorModel } from "../models/doctor.model";
import { DoctorScheduleModel } from "../models/doctor-schedule.model";
import { sendAppointmentEmail } from "../services/email.service";

// Create Appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { petId, doctorId, appointmentDate, time, reason } = req.body;

    if (!petId || !doctorId || !appointmentDate || !time) {
      return res.status(400).json({
        message: "All required fields (petId, doctorId, appointmentDate, time) must be provided!"
      });
    }

    const dateObj = new Date(appointmentDate);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[dateObj.getDay()];

    const schedule = await DoctorScheduleModel.findOne({ doctorId, dayOfWeek, isAvailable: true });
    if (schedule) {
      if (time < schedule.startTime || time > schedule.endTime) {
        return res.status(400).json({
          message: `Doctor is not available at this time. Working hours on ${dayOfWeek} are from ${schedule.startTime} to ${schedule.endTime}.`
        });
      }
    }

    const newAppointment = new AppointmentModel({
      user: req.user.sub,
      pet: petId,
      doctor: doctorId,
      appointmentDate,
      time,
      reason,
      status: "PENDING",
    });

    await newAppointment.save();

    const user = await UserModel.findById(req.user.sub);
    const pet = await PetModel.findById(petId);
    const doctor = await DoctorModel.findById(doctorId);

    if (user && user.email) {
      await sendAppointmentEmail(user.email, {
        petName: pet ? pet.name : "Your Pet",
        doctorName: doctor ? doctor.name : "Doctor",
        date: new Date(appointmentDate).toISOString().split('T')[0],
        time: time,
        status: "PENDING (Created)"
      });
    }

    return res.status(201).json({
      message: "Appointment booked successfully & notification email sent!",
      data: newAppointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to book appointment!" });
  }
};

// Get My Appointments
export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const appointments = await AppointmentModel.find({ user: req.user.sub })
      .populate("pet", "name type breed gender")
      .populate("doctor", "name specialization workingHours");

    return res.status(200).json({
      message: "OK",
      data: appointments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch appointments!" });
  }
};

// Get All Appointments
export const getAllAppointments = async (_req: AuthRequest, res: Response) => {
  try {
    const appointments = await AppointmentModel.find()
      .populate("user", "name email phone")
      .populate("pet", "name type breed")
      .populate("doctor", "name specialization");

    return res.status(200).json({
      message: "OK",
      data: appointments,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch all appointments!" });
  }
};

// Update Appointment Status
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { id } = req.params;
    const { status } = req.body;

    const appointment = await AppointmentModel.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found!" });
    }

    appointment.status = status;
    await appointment.save();

    const user = await UserModel.findById(appointment.user);
    const pet = await PetModel.findById(appointment.pet);
    const doctor = await DoctorModel.findById(appointment.doctor);

    if (user && user.email) {
      const formattedDate = appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
        : "N/A";

      await sendAppointmentEmail(user.email, {
        petName: pet ? pet.name : "Your Pet",
        doctorName: doctor ? doctor.name : "Doctor",
        date: formattedDate,
        time: (appointment as any).time || "Not specified",
        status: status
      });
    }

    return res.status(200).json({
      message: "Appointment status updated successfully & email sent!",
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update appointment status!" });
  }
};

// Cancel Appointment
export const cancelAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { id } = req.params;
    const appointment = await AppointmentModel.findById(id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found!" });
    }

    if (appointment.user.toString() !== req.user.sub) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own appointments!" });
    }

    if (appointment.status === "COMPLETED" || appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}!`
      });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    const user = await UserModel.findById(appointment.user);
    const pet = await PetModel.findById(appointment.pet);
    const doctor = await DoctorModel.findById(appointment.doctor);

    if (user && user.email) {
      const formattedDate = appointment.appointmentDate
        ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
        : "N/A";

      await sendAppointmentEmail(user.email, {
        petName: pet ? pet.name : "Your Pet",
        doctorName: doctor ? doctor.name : "Doctor",
        date: formattedDate,
        time: (appointment as any).time || "Not specified",
        status: "CANCELLED"
      });
    }

    return res.status(200).json({
      message: "Appointment cancelled successfully & email sent!",
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to cancel appointment!" });
  }
};
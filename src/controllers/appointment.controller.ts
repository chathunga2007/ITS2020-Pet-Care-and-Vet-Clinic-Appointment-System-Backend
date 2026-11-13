import { Response } from "express";
import { AppointmentModel } from "../models/appointment.model";
import { AuthRequest } from "../middleware/auth";

// Save Pet
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { petId, doctorId, appointmentDate, reason } = req.body;

    const newAppointment = new AppointmentModel({
      user: req.user.sub,
      pet: petId,
      doctor: doctorId,
      appointmentDate,
      reason,
      status: "PENDING",
    });

    await newAppointment.save();
    return res.status(201).json({
      message: "Appointment booked successfully!",
      data: newAppointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to book appointment!" });
  }
};

// Get Appoinment
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

// Get All Appoinmnents
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

// Update Appoinmnets
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

    return res.status(200).json({
      message: "Appointment status updated successfully!",
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update appointment status!" });
  }
};

// Delete Appoinment
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

    return res.status(200).json({
      message: "Appointment cancelled successfully!",
      data: appointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to cancel appointment!" });
  }
};
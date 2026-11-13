import { Response } from "express";
import { AppointmentModel } from "../models/appointment.model";
import { AuthRequest } from "../middleware/auth";

// 1. CREATE APPOINTMENT (User booking an appointment for their pet)
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

// 2. GET USER APPOINTMENTS (Logged-in user ge witharak appointments)
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

// 3. GET ALL APPOINTMENTS (Admin-only: Clinic eke okkoma appointments)
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

// 4. UPDATE APPOINTMENT STATUS (Confirm, Complete, or Cancel)
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { id } = req.params;
    const { status } = req.body; // PENDING, CONFIRMED, COMPLETED, CANCELLED

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

// 5. CANCEL APPOINTMENT (User kenekta thanage appointment eka cancel kirima)
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

    // Check if the logged-in user owns this appointment
    if (appointment.user.toString() !== req.user.sub) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own appointments!" });
    }

    // Already completed or cancelled nam change karanna ba
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
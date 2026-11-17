import { Request, Response } from "express";
import { AppointmentModel } from "../models/appointment.model";
import { AuthRequest } from "../middleware/auth";
import { UserModel } from "../models/user.model";
import { PetModel } from "../models/pet.model";
import { DoctorModel } from "../models/doctor.model";
import { DoctorScheduleModel } from "../models/doctor-schedule.model";
import { ServiceModel } from "../models/service.model";
import { sendAppointmentEmail } from "../services/email.service";

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Create Appointment
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { petId, doctorId, serviceId, service, appointmentDate, time, reason } = req.body;

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
      const apptMins = timeToMinutes(time);
      const startMins = timeToMinutes(schedule.startTime);
      const endMins = timeToMinutes(schedule.endTime);

      if (apptMins < startMins || apptMins > endMins) {
        return res.status(400).json({
          message: `Doctor is not available at this time. Working hours on ${dayOfWeek} are from ${schedule.startTime} to ${schedule.endTime}.`
        });
      }
    }

    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const conflictingAppointment = await AppointmentModel.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      time: time.trim(),
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        message: `Doctor already has an active appointment booked at ${time} on this date. Please choose another time slot!`
      });
    }

    const newAppointment = new AppointmentModel({
      user: req.user.sub,
      pet: petId,
      doctor: doctorId,
      service: serviceId || service || null,
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
      try {
        await sendAppointmentEmail(user.email, {
          petName: pet ? pet.name : "Your Pet",
          doctorName: doctor ? doctor.name : "Doctor",
          date: new Date(appointmentDate).toISOString().split('T')[0],
          time: time,
          status: "PENDING (Created)"
        });
      } catch (mailErr) {
        console.warn("Appointment notification email could not be sent:", mailErr);
      }
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
      .populate("doctor", "name specialization workingHours")
      .populate("service", "name description price durationMinutes");

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
      .populate("doctor", "name specialization")
      .populate("service", "name description price durationMinutes");

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

// Get Booked Slots for Doctor on a specific date
export const getDoctorBookedSlots = async (req: Request, res: Response) => {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) {
      return res.status(400).json({ message: "doctorId and date query parameters are required!" });
    }

    const startOfDay = new Date(date as string);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date as string);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await AppointmentModel.find({
      doctor: doctorId as any,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["PENDING", "CONFIRMED"] },
    }).select("time");

    const bookedSlots = appointments.map((a: any) => a.time);
    return res.status(200).json({ data: bookedSlots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch booked slots!" });
  }
};
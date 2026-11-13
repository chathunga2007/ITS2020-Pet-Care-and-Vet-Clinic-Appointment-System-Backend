import { Request, Response } from "express";
import { DoctorModel } from "../models/doctor.model";

// 1. ADD DOCTOR (Admin only)
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, specialization, phone, email, workingHours } = req.body;

    const extDoctor = await DoctorModel.findOne({ email });
    if (extDoctor) {
      return res.status(400).json({ message: "Doctor with this email already exists!" });
    }

    const newDoctor = new DoctorModel({
      name,
      specialization,
      phone,
      email,
      workingHours,
      status: "ACTIVE",
    });

    await newDoctor.save();
    return res.status(201).json({
      message: "Doctor added successfully!",
      data: newDoctor,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to add doctor!" });
  }
};

// 2. GET ALL DOCTORS (Public / Users & Admins lata balanna puluwan)
export const getAllDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await DoctorModel.find({ status: "ACTIVE" });
    return res.status(200).json({
      message: "OK",
      data: doctors,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch doctors!" });
  }
};

// 3. UPDATE DOCTOR (Admin only)
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, specialization, phone, email, workingHours, status } = req.body;

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      id,
      { name, specialization, phone, email, workingHours, status },
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    return res.status(200).json({
      message: "Doctor updated successfully!",
      data: updatedDoctor,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update doctor!" });
  }
};

// 4. DELETE DOCTOR (Admin only - Soft delete or Hard delete)
export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedDoctor = await DoctorModel.findByIdAndUpdate(
      id,
      { status: "INACTIVE" },
      { new: true }
    );

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    return res.status(200).json({
      message: "Doctor deactivated successfully!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete doctor!" });
  }
};
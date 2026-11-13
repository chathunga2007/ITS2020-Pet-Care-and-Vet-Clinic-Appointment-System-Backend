import { Request, Response } from "express";
import { DoctorModel } from "../models/doctor.model";
import { uploadImage } from "../services/upload.service";

// Save Doctor
export const createDoctor = async (req: Request, res: Response) => {
  try {
    const { name, specialization, phone, email, workingHours } = req.body;

    const extDoctor = await DoctorModel.findOne({ email });
    if (extDoctor) {
      return res.status(400).json({ message: "Doctor with this email already exists!" });
    }

    const imageURL = req.file ? await uploadImage(req.file, "doctors") : "";

    const newDoctor = new DoctorModel({
      name,
      specialization,
      phone,
      email,
      workingHours,
      imageURL,
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

// Get All Doctors
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

// Update Doctor
export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, specialization, phone, email, workingHours, status } = req.body;

    const doctor = await DoctorModel.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found!" });
    }

    let imageURL = doctor.imageURL;
    if (req.file) {
      imageURL = await uploadImage(req.file, "doctors");
    }

    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      id,
      { name, specialization, phone, email, workingHours, status, imageURL },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Doctor updated successfully!",
      data: updatedDoctor,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update doctor!" });
  }
};

// Delete Doctor
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
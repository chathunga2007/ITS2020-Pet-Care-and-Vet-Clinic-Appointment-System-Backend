import { Response } from "express";
import { PetModel } from "../models/pet.model";
import { AuthRequest } from "../middleware/auth";

// 1. ADD NEW PET
export const createPet = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { name, type, breed, age, gender, medicalHistory } = req.body;

    const newPet = new PetModel({
      name,
      type,
      breed,
      age,
      gender,
      owner: req.user.sub,
      medicalHistory: medicalHistory || "",
      status: "ACTIVE",
    });

    await newPet.save();
    return res.status(201).json({
      message: "Pet registered successfully!",
      data: newPet,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to register pet!" });
  }
};

// 2. GET MY PETS (Active pets witharak pennayi)
export const getMyPets = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const pets = await PetModel.find({ owner: req.user.sub, status: { $ne: "DELETED" } });
    return res.status(200).json({
      message: "OK",
      data: pets,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch pets!" });
  }
};

// 3. GET ALL PETS (Admin-only: Deleted nathi okkoma pets la)
export const getAllPets = async (_req: AuthRequest, res: Response) => {
  try {
    const pets = await PetModel.find({ status: { $ne: "DELETED" } }).populate("owner", "name email phone");
    return res.status(200).json({
      message: "OK",
      data: pets,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch all pets!" });
  }
};

// 4. UPDATE PET
export const updatePet = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { id } = req.params;
    const { name, type, breed, age, gender, medicalHistory } = req.body;

    const pet = await PetModel.findById(id);
    if (!pet || pet.status === "DELETED") {
      return res.status(404).json({ message: "Pet not found!" });
    }

    const isOwner = pet.owner.toString() === req.user.sub;
    const isAdmin = req.user.roles.includes("ADMIN");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only update your own pets!" });
    }

    const updatedPet = await PetModel.findByIdAndUpdate(
      id,
      { name, type, breed, age, gender, medicalHistory },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Pet updated successfully!",
      data: updatedPet,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update pet!" });
  }
};

// 5. SOFT DELETE PET (Status eka DELETED bawata path kirima)
export const deletePet = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized!" });
    }

    const { id } = req.params;
    const pet = await PetModel.findById(id);

    if (!pet || pet.status === "DELETED") {
      return res.status(404).json({ message: "Pet not found!" });
    }

    const isOwner = pet.owner.toString() === req.user.sub;
    const isAdmin = req.user.roles.includes("ADMIN");

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own pets!" });
    }

    // Hard delete wenuwata status eka DELETED karanawa
    const deletedPet = await PetModel.findByIdAndUpdate(
      id,
      { status: "DELETED" },
      { new: true }
    );

    return res.status(200).json({
      message: "Pet deleted successfully!",
      data: deletedPet,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete pet!" });
  }
};
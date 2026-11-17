import { Request, Response } from "express";
import { ServiceModel } from "../models/service.model";

// Create a new service
export const createService = async (req: Request, res: Response) => {
    try {
        const { name, description, price, durationMinutes } = req.body;
        if (!name || price === undefined) {
            return res.status(400).json({ success: false, message: "Name and price are required!" });
        }

        const newService = await ServiceModel.create({
            name: name.trim(),
            description: description?.trim() || "",
            price: Number(price),
            durationMinutes: durationMinutes ? Number(durationMinutes) : 30
        });

        return res.status(201).json({
            success: true,
            message: "Service created successfully!",
            data: newService
        });
    } catch (error: any) {
        console.error("Create Service Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Get all services
export const getAllServices = async (req: Request, res: Response) => {
    try {
        const services = await ServiceModel.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            data: services
        });
    } catch (error: any) {
        console.error("Get Services Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Update an existing service
export const updateService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, price, durationMinutes } = req.body;

        const updatedService = await ServiceModel.findByIdAndUpdate(
            id,
            {
                name: name ? name.trim() : undefined,
                description: description !== undefined ? description.trim() : undefined,
                price: price !== undefined ? Number(price) : undefined,
                durationMinutes: durationMinutes !== undefined ? Number(durationMinutes) : undefined,
            },
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return res.status(404).json({ success: false, message: "Service not found!" });
        }

        return res.status(200).json({
            success: true,
            message: "Service updated successfully!",
            data: updatedService,
        });
    } catch (error: any) {
        console.error("Update Service Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// Delete a service
export const deleteService = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await ServiceModel.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Service not found!" });
        }

        return res.status(200).json({
            success: true,
            message: "Service deleted successfully!",
            data: deleted,
        });
    } catch (error: any) {
        console.error("Delete Service Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
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
            name,
            description,
            price,
            durationMinutes
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
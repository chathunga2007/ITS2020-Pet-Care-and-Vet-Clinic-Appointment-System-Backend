import { Request, Response } from "express";
import { askVetAiBot } from "../services/ai.service";
import { DoctorModel } from "../models/doctor.model";
import { ServiceModel } from "../models/service.model";

export const chatWithAiBot = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required!" });
        }

        const [doctors, services] = await Promise.all([
            DoctorModel.find().select("name specialization workingHours"),
            ServiceModel.find().select("name description price durationMinutes")
        ]);

        let clinicContext = "=== DOCTORS ===\n";
        if (doctors && doctors.length > 0) {
            clinicContext += doctors.map((doc: any, i: number) =>
                `${i + 1}. Dr. ${doc.name} | Specialization: ${doc.specialization} | Working Hours: ${doc.workingHours || "N/A"}`
            ).join("\n");
        } else {
            clinicContext += "No doctors currently registered in the database.\n";
        }

        clinicContext += "\n\n=== CLINIC SERVICES ===\n";
        if (services && services.length > 0) {
            clinicContext += services.map((srv: any, i: number) =>
                `${i + 1}. Service: ${srv.name} | Description: ${srv.description || "N/A"} | Price: LKR ${srv.price} | Duration: ${srv.durationMinutes} mins`
            ).join("\n");
        } else {
            clinicContext += "No services currently registered in the database.\n";
        }

        const aiResponse = await askVetAiBot(message, clinicContext);

        return res.status(200).json({
            success: true,
            reply: aiResponse
        });
    } catch (error: any) {
        console.error("AI Controller Error:", error);
        return res.status(500).json({
            success: false,
            error: error?.message || "Internal Server Error in AI bot!"
        });
    }
};
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in environment variables!");
}

const ai = new GoogleGenAI({ apiKey });

export const askVetAiBot = async (userPrompt: string, clinicContext: string) => {
    try {
        const fullPrompt = `System Instruction: You are an intelligent and helpful AI assistant for the "Pet Care & Vet Clinic Appointment System". 
    Your ONLY job is to answer questions related to veterinary clinic services, available doctors, working schedules, pet care, and appointment bookings based STRICTLY on the provided database context.
    
    CRITICAL RULE FOR DATA: When the user asks about doctors, services, schedules, or clinic details, you MUST use ONLY the real-time database records provided below. Do NOT make up fake information!
    
    [LIVE DATABASE CONTEXT]:
    ${clinicContext}

    CRITICAL RULE FOR UNRELATED QUESTIONS: If a user asks about anything unrelated to this veterinary clinic, pets, or appointments (such as coding, math, history, movies), you MUST strictly reply with:
    "Sorry, I can only assist you with questions related to Pet Care & Vet Clinic services, appointments, and pet health!"
    
    User Question: ${userPrompt}`;

        const res = await ai.models.generateContent({
            model: "gemini-3.5-flash-lite",
            contents: fullPrompt,
            config: {
                maxOutputTokens: 500
            }
        });

        return res.text || "Sorry, I couldn't generate a response.";
    } catch (err: any) {
        console.error("Gemini SDK Error Details:", err?.message || err);
        throw new Error("Failed to get response from AI Bot!");
    }
};
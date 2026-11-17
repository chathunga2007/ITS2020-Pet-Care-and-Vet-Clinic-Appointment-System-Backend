import { Router } from "express";
import { chatWithAiBot } from "../controllers/ai.controller";

const router = Router();

router.post("/chat", chatWithAiBot);

export const aiRouter = router;
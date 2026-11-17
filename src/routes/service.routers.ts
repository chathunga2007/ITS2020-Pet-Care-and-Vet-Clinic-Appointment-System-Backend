import { Router } from "express";
import { createService, getAllServices } from "../controllers/service.controller";

const router = Router();

router.post("/create", createService);
router.get("/", getAllServices);

export const serviceRouter = router;
export default router;
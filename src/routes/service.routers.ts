import { Router } from "express";
import {
  createService,
  getAllServices,
  updateService,
  deleteService,
} from "../controllers/service.controller";

const router = Router();

router.post("/", createService);
router.post("/create", createService);
router.get("/", getAllServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export const serviceRouter = router;
export default router;
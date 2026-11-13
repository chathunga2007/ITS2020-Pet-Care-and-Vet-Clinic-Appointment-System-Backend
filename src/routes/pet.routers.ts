import { Router } from "express";
import { createPet, getMyPets, getAllPets, updatePet, deletePet } from "../controllers/pet.controller";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/role";
import { UserRole } from "../models/user.model";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/", authenticate, upload.single("image"), createPet);
router.get("/my-pets", authenticate, getMyPets);
router.put("/:id", authenticate, upload.single("image"), updatePet);
router.delete("/:id", authenticate, deletePet);

router.get("/all", authenticate, authorize(UserRole.ADMIN), getAllPets);

export default router;
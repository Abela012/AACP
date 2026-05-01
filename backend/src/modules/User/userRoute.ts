import express from "express";
import {
  getCurrentUser,
  syncUser,
  updateUserProfile,
  uploadProfilePicture,
} from "./userController";
import { requireAuth } from "@clerk/express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.put("/profile", requireAuth(), updateUserProfile);

router.post(
  "/profile/picture",
  requireAuth(),
  upload.single("image"),
  uploadProfilePicture
);
router.get("/user", requireAuth(), getCurrentUser);

router.post("/sync", syncUser);

export default router;

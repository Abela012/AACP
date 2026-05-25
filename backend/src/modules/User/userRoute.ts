import express from "express";
import {
  getCurrentUser,
  syncUser,
  updateUserProfile,
  submitProfileForReview,
  uploadProfilePicture,
  getUserById,
  uploadFile,
  toggleSavedOpportunity,
  getSavedOpportunities,
  toggleSavedCreator,
  getSavedCreators,
  completeAdvertiserProfile,
  getAdvertiserProfile,
  syncTikTokMetrics,
  getMyTrustScore,
} from "./userController";
import { requireAuth } from "../../middlewares/auth.middleware";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile fields (firstName, lastName, username, profilePicture, location, profileData). System-controlled fields like role, status, email are ignored.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               username:
 *                 type: string
 *                 example: john_doe
 *                 description: "3-20 chars: lowercase letters, numbers, underscore only"
 *               profilePicture:
 *                 type: string
 *               location:
 *                 type: string
 *                 example: Addis Ababa
 *               profileData:
 *                 type: object
 *                 description: Merged with existing profileData (not overwritten)
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid username format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Username already taken
 *       500:
 *         description: Internal server error
 */
router.put("/profile", requireAuth, updateUserProfile);

/**
 * @swagger
 * /api/v1/users/submit:
 *   post:
 *     summary: Submit profile for admin review
 *     description: Updates profile fields and sets user status to 'pending' for admin approval. Used during onboarding flow.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *               location:
 *                 type: string
 *               profileData:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile submitted for review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/submit", requireAuth, submitProfileForReview);

/**
 * @swagger
 * /api/v1/users/profile/picture:
 *   post:
 *     summary: Upload profile or cover image
 *     description: Uploads an image to Cloudinary and updates the user's profilePicture or coverImage field. Use `?type=cover` for cover images.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [profile, cover]
 *         description: "Set to 'cover' to update cover image, default is profile picture"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Upload failed
 */
router.post(
  "/profile/picture",
  requireAuth,
  upload.single("image"),
  uploadProfilePicture,
);

router.post("/upload", requireAuth, upload.single("file"), uploadFile);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current authenticated user
 *     description: Returns the full profile of the currently authenticated user based on their Clerk session.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/me", requireAuth, getCurrentUser);

/**
 * @swagger
 * /api/v1/users/sync:
 *   post:
 *     summary: Sync user from Clerk to database
 *     description: Creates or retrieves the local database user record based on the Clerk authentication. Used during first login to seed the MongoDB user document from Clerk data.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User already exists in database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: User already exists
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: User created Successfully
 *       400:
 *         description: User has no email address
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Failed to sync user
 */
router.post("/sync", syncUser);
router.get("/saved-opportunities", requireAuth, getSavedOpportunities);
router.post("/toggle-save", requireAuth, toggleSavedOpportunity);
router.post("/toggle-creator", requireAuth, toggleSavedCreator);
router.get("/saved-creators", requireAuth, getSavedCreators);

// TikTok-First Advertiser Profile Endpoints
router.post(
  "/advertiser/profile/complete",
  requireAuth,
  completeAdvertiserProfile,
);
router.get("/advertiser/profile", requireAuth, getAdvertiserProfile);
router.post("/advertiser/profile/sync-tiktok", requireAuth, syncTikTokMetrics);

router.get("/trust-score", requireAuth, getMyTrustScore);

router.get("/:id", requireAuth, getUserById);

export default router;

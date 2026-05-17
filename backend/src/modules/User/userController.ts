import User from "../../database/models/User";
import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import cloudinary from "../../config/cloudinary";
import * as walletService from '../wallet/wallet.service';
import { getPlatformSettings } from '../platform/platformSettings.service';
import { mergeProfileData } from '../../utils/profileDataMerge';
import { mergeAdvertiserProfileOnSubmit } from '../../utils/advertiserProfileSync';
import { validateBusinessProfileSubmit } from './businessProfile.validation';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadProfilePicture = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    // Upload using stream instead of dataURI for better reliability
    const uploadFromBuffer = (buffer: Buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "aacp/uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result: any = await uploadFromBuffer(req.file.buffer);
    let type = 'profilePicture';
    if (req.query.type === 'cover') type = 'coverImage';
    if (req.query.type === 'license') type = 'tradeLicenseUrl';
    if (req.query.type === 'id_verification') type = 'idVerificationUrl';

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { [type]: result.secure_url } },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      user,
    });
  } catch (error: any) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

export const uploadFile = async (
  req: MulterRequest,
  res: Response
): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  try {
    const uploadFromBuffer = (buffer: Buffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "aacp/uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };

    const result: any = await uploadFromBuffer(req.file.buffer);
    res.status(200).json({
      message: "File uploaded successfully",
      url: result.secure_url,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};


export const updateUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {

  const ALLOWED_FIELDS = [
    "firstName",
    "lastName",
    "username",
    "profilePicture",
    "coverImage",
    "bio",
    "location",
    "tradeLicenseUrl",
    "idVerificationUrl",
    "socialProfiles",
    "profileData"
  ];

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find user
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updates: any = {};

    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.username) {
      const usernameRegex = /^[a-z0-9_]{3,20}$/;

      const username = updates.username.toLowerCase().trim();

      if (!usernameRegex.test(username)) {
        res.status(400).json({
          message:
            "Invalid username. Use 3-20 chars: lowercase letters, numbers, underscore only.",
        });
        return
      }

      const existing = await User.findOne({
        username,
        _id: { $ne: user._id },
      });

      if (existing) {
        res.status(409).json({ message: "Username already taken" });
        return
      }
    }

    if (updates.profileData && typeof updates.profileData === "object") {
      updates.profileData = mergeProfileData(
        (user.profileData || {}) as Record<string, unknown>,
        updates.profileData as Record<string, unknown>
      );
    }

    const forbiddenFields = [
      "role",
      "status",
      "email",
      "clerkId",
      "totalPosts",
      "lastLogin",
      "createdAt",
      "updatedAt",
    ];

    for (const field of forbiddenFields) {
      delete updates[field];
    }

    user.set(updates);
    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete (userResponse as any).__v;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userResponse,
    });
    return
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Internal server error" });
    return
  }
};

export const submitProfileForReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  const ALLOWED_FIELDS = [
    "firstName",
    "lastName",
    "username",
    "profilePicture",
    "bio",
    "location",
    "tradeLicenseUrl",
    "idVerificationUrl",
    "socialProfiles",
    "profileData",
  ];

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isAlreadyApproved = user.status === "active" || user.status === "approved";
    const updates: Record<string, unknown> = {};

    const applyAdvertiserProfileMerge = () => {
      if (user.role !== "advertiser") return null;
      return mergeAdvertiserProfileOnSubmit({
        profileData: (req.body.profileData ?? updates.profileData ?? user.profileData) as Record<string, unknown>,
        socialProfiles: req.body.socialProfiles ?? updates.socialProfiles,
        bio: req.body.bio ?? updates.bio,
        location: req.body.location ?? updates.location,
      });
    };

    if (isAlreadyApproved) {
      const rootUpdates: Record<string, unknown> = {};
      for (const key of ALLOWED_FIELDS) {
        if (key !== "profileData" && key !== "socialProfiles" && req.body[key] !== undefined) {
          rootUpdates[key] = req.body[key];
        }
      }
      if (Object.keys(rootUpdates).length > 0) {
        user.pendingUpdates = {
          ...(user.pendingUpdates || {}),
          ...rootUpdates,
        };
      }

      const mergedAdv = applyAdvertiserProfileMerge();
      if (mergedAdv) {
        user.pendingProfileData = mergeProfileData(
          mergeProfileData(
            (user.profileData || {}) as Record<string, unknown>,
            (user.pendingProfileData || {}) as Record<string, unknown>
          ),
          mergedAdv.profileData
        );
        if (mergedAdv.socialProfiles?.length) {
          user.socialProfiles = mergedAdv.socialProfiles as typeof user.socialProfiles;
          user.markModified("socialProfiles");
        }
      } else if (req.body.profileData && typeof req.body.profileData === "object") {
        user.pendingProfileData = mergeProfileData(
          mergeProfileData(
            (user.profileData || {}) as Record<string, unknown>,
            (user.pendingProfileData || {}) as Record<string, unknown>
          ),
          req.body.profileData as Record<string, unknown>
        );
      }

      user.markModified("pendingUpdates");
      user.markModified("pendingProfileData");
    } else {
      if (user.role === "business_owner") {
        const validation = validateBusinessProfileSubmit(req.body as Record<string, unknown>);
        if (!validation.valid) {
          res.status(400).json({ message: validation.message });
          return;
        }
      }

      updates.status = "pending";

      for (const key of ALLOWED_FIELDS) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      const mergedAdv = applyAdvertiserProfileMerge();
      if (mergedAdv) {
        updates.pendingProfileData = mergeProfileData(
          mergeProfileData(
            (user.profileData || {}) as Record<string, unknown>,
            (user.pendingProfileData || {}) as Record<string, unknown>
          ),
          mergedAdv.profileData
        );
        updates.socialProfiles = mergedAdv.socialProfiles;
        delete updates.profileData;
      } else if (updates.profileData && typeof updates.profileData === "object") {
        updates.pendingProfileData = mergeProfileData(
          mergeProfileData(
            (user.profileData || {}) as Record<string, unknown>,
            (user.pendingProfileData || {}) as Record<string, unknown>
          ),
          updates.profileData as Record<string, unknown>
        );
        delete updates.profileData;
      }

      user.set(updates);
    }
    const updatedUser = await user.save();
    const userResponse = updatedUser.toObject();
    delete (userResponse as any).__v;

    // Notify admins
    const io = (req.app as any).io;
    if (io) {
      io.to('admins').emit('notification:new', {
        type: 'system',
        title: 'Profile Pending Approval',
        message: `User ${user.firstName} ${user.lastName} has submitted profile updates for review.`,
        createdAt: new Date().toISOString()
      });
    }

    res.status(200).json({
      message: "Profile submitted for review successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Submit profile error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.status(200).json({ user });
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const syncUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = getAuth(req);

  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // check if user already exists in db
  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser) {
    res
      .status(200)
      .json({ user: existingUser, message: "User already exists" });
    return;
  }
  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      res.status(400).json({ message: "User has no email address" });
      return;
    }

    // --- Handle case where email already exists with a different clerkId ---
    // (common in dev when Clerk sessions reset or user re-registered)
    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
      console.log(`[syncUser] Email ${email} exists with different clerkId. Updating clerkId.`);
      userByEmail.clerkId = userId;
      await userByEmail.save();
      res.status(200).json({ user: userByEmail, message: "User re-linked" });
      return;
    }

    let baseUsername = email.split("@")[0].toLowerCase().trim();
    // sanitize: replace non-allowed chars with underscore
    baseUsername = baseUsername.replace(/[^a-z0-9_]/g, "_");
    let username = baseUsername;
    let counter = 0;

    while (await User.findOne({ username })) {
      counter++;
      username = `${baseUsername}_${counter}`;
    }

    const platformSettings = await getPlatformSettings();
    if (platformSettings.allowPublicSignup === false) {
      res.status(403).json({ message: "New account registration is temporarily disabled." });
      return;
    }

    // Only allow public-facing roles via sync endpoint
    // Admin and super_admin roles must be assigned manually by an admin
    const ALLOWED_SELF_ASSIGN_ROLES = ['business_owner', 'advertiser'];
    const requestedRole = req.body?.role;
    const resolvedRole = (requestedRole && ALLOWED_SELF_ASSIGN_ROLES.includes(requestedRole))
      ? requestedRole
      : 'advertiser';

    const userData = {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username: username,
      profilePicture: clerkUser.imageUrl || "",
      role: resolvedRole,
    };

    console.log("Attempting to create user with data:", userData);

    try {
      const user = await User.create(userData);
      console.log("User successfully created in MongoDB:", user._id);

      const startingCoins = Math.max(0, Math.round(platformSettings.newUserStartingCoins ?? 1000));
      // Credit starting coins to allow them to post campaigns immediately
      try {
        if (startingCoins > 0) {
          await walletService.creditCoins({
            userId: user._id.toString(),
            amount: startingCoins,
            description: 'Initial balance for new account',
          });
        }
        console.log(`[syncUser] Credited ${startingCoins} starting coins to ${user.email}`);
      } catch (walletError) {
        console.error(`[syncUser] Failed to credit coins for ${user.email}:`, walletError);
        // Don't fail the whole user creation if wallet credit fails
      }

      res.status(201).json({ user, message: "User created Successfully" });
    } catch (createError: any) {
      if (createError.code === 11000) {
        // Last-resort fallback: find by either clerkId or email
        const existing = await User.findOne({
          $or: [{ clerkId: userId }, { email }]
        });
        if (existing && existing.clerkId !== userId) {
          existing.clerkId = userId;
          await existing.save();
        }
        res.status(200).json({ user: existing, message: "User already exists" });
        return;
      }
      throw createError;
    }
  } catch (error: any) {
    console.error("Error syncing user for userId:", userId);
    console.error("Error details:", error);
    res
      .status(500)
      .json({ message: "Failed to sync user", error: error.message });
  }
};

export const toggleSavedOpportunity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { opportunityId } = req.body;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!opportunityId) {
      res.status(400).json({ message: "Opportunity ID is required" });
      return;
    }

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isSaved = user.savedOpportunities.some(id => id.toString() === opportunityId.toString());

    if (isSaved) {
      // Unsave
      user.savedOpportunities = user.savedOpportunities.filter(
        (id) => id.toString() !== opportunityId.toString()
      );
    } else {
      // Save
      user.savedOpportunities.push(opportunityId);
    }

    await user.save();

    res.status(200).json({
      message: isSaved ? "Opportunity removed from saved" : "Opportunity saved successfully",
      isSaved: !isSaved,
      savedOpportunities: user.savedOpportunities
    });
  } catch (error: any) {
    console.error("Toggle saved opportunity error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSavedOpportunities = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId: userId }).populate('savedOpportunities');

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      savedOpportunities: user.savedOpportunities
    });
  } catch (error: any) {
    console.error("Get saved opportunities error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleSavedCreator = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    const { creatorId } = req.body;

    if (!userId || !creatorId) {
      res.status(400).json({ message: "User ID and Creator ID are required" });
      return;
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isSaved = user.savedCreators.some(id => id.toString() === creatorId.toString());

    if (isSaved) {
      user.savedCreators = user.savedCreators.filter(id => id.toString() !== creatorId.toString());
    } else {
      user.savedCreators.push(creatorId);
    }

    await user.save();
    res.status(200).json({
      message: isSaved ? "Creator removed from bookmarks" : "Creator bookmarked successfully",
      isSaved: !isSaved,
      savedCreators: user.savedCreators
    });
  } catch (error: any) {
    console.error("Toggle saved creator error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getSavedCreators = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await User.findOne({ clerkId: userId }).populate('savedCreators');
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      savedCreators: user.savedCreators
    });
  } catch (error: any) {
    console.error("Get saved creators error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

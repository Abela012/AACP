import User from "../../database/models/User";
import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import cloudinary from "../../config/cloudinary";
import * as walletService from '../wallet/wallet.service';

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
            folder: "aacp/images",
            resource_type: "image",
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
    "location",
    "tradeLicenseUrl",
    "idVerificationUrl",
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

    // 🧠 Safely merge profileData (avoid overwriting entire object)
    if (updates.profileData && typeof updates.profileData === "object") {
      updates.profileData = {
        ...(user.profileData || {}),
        ...updates.profileData,
      };
    }

    // 🚫 Strictly remove system-controlled fields (extra safety layer)
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

    // 🧾 Update user safely
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true, // 🔥 important: ensures schema rules still apply
      }
    ).select("-__v");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
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
    "location",
    "tradeLicenseUrl",
    "idVerificationUrl",
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

    const updates: any = {};

    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Force status to pending for review
    updates.status = "pending";

    // 🧠 Safely merge profileData into pendingProfileData
    if (updates.profileData && typeof updates.profileData === "object") {
      updates.pendingProfileData = {
        ...(user.profileData || {}),
        ...(user.pendingProfileData || {}),
        ...updates.profileData,
      };
      delete updates.profileData;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    res.status(200).json({
      message: "Profile submitted for review successfully",
      user: updatedUser,
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

      // Credit starting coins to allow them to post campaigns immediately
      try {
        await walletService.creditCoins({
          userId: user._id.toString(),
          amount: 500,
          description: 'Initial balance for new account',
        });
        console.log(`[syncUser] Credited 500 starting coins to ${user.email}`);
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

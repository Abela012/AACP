import User from "../../database/models/User";
import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import cloudinary from "../../config/cloudinary";

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
            folder: "et-pulse/avatars",
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
    const type = req.query.type === 'cover' ? 'coverImage' : 'profilePicture';
 
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
  const { userId } = getAuth(req);
  const { firstName, lastName, profileData, status, profilePicture, coverImage } = req.body;

  const updateFields: any = {};
  if (firstName !== undefined) updateFields.firstName = firstName;
  if (lastName !== undefined) updateFields.lastName = lastName;
  if (profileData !== undefined) updateFields.profileData = profileData;
  if (status !== undefined) updateFields.status = status;
  if (profilePicture !== undefined) updateFields.profilePicture = profilePicture;
  if (coverImage !== undefined) updateFields.coverImage = coverImage;

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    { $set: updateFields },
    {
      new: true,
    }
  );
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.status(200).json({ user });
};

export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);

  const user = await User.findOne({ clerkId: userId });
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

    let username = clerkUser.emailAddresses[0].emailAddress.split("@")[0];
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
    }

    const userData = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0].emailAddress,
      firstName: clerkUser.firstName || "",
      lastName: clerkUser.lastName || "",
      username: username,
      profilePicture: clerkUser.imageUrl || "",
      role: req.body.role || (clerkUser.publicMetadata.role as string) || 'advertiser',
    };

    console.log("Attempting to create user with data:", userData);

    try {
      const user = await User.create(userData);
      console.log("User successfully created in MongoDB:", user._id);
      res.status(201).json({ user, message: "User created Successfully" });
    } catch (createError: any) {
      if (createError.code === 11000) {
        const existing = await User.findOne({ clerkId: userId });
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

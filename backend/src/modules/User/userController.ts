import User from "../../database/models/User";
import { Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import cloudinary from "../../config/cloudinary";
import * as walletService from '../wallet/wallet.service';
import { getPlatformSettings } from '../platform/platformSettings.service';
import { mergeProfileData } from '../../utils/profileDataMerge';
import { mergeAdvertiserProfileOnSubmit } from '../../utils/advertiserProfileSync';
import AdvertiserProfile from "../../database/models/AdvertiserProfile";
import BusinessOwner from "../../database/models/businessOwner";
import Opportunity from "../../database/models/Opportunity";
import { validateBusinessProfileSubmit } from './businessProfile.validation';
import { hasRequiredBusinessFieldChanges } from './businessProfileChanges';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export async function enrichUserWithProfile(user: any) {
  if (!user) return user;
  const userObj = typeof user.toObject === 'function' ? user.toObject() : JSON.parse(JSON.stringify(user));

  if (userObj.role === 'advertiser') {
    const advertiserProfile = await AdvertiserProfile.findOne({ userId: userObj._id }).lean();
    if (advertiserProfile) {
      const connectedAccounts = {
        tiktok: { connected: false, verified: false },
        instagram: { connected: false, verified: false },
        facebook: { connected: false, verified: false }
      };
      if (advertiserProfile.socialProfiles) {
        for (const sp of advertiserProfile.socialProfiles) {
          const plat = sp.platform.toLowerCase();
          if (plat === 'tiktok' || plat === 'instagram' || plat === 'facebook') {
            connectedAccounts[plat as 'tiktok' | 'instagram' | 'facebook'] = {
              connected: true,
              verified: sp.verified,
              username: sp.username,
              displayName: sp.username,
              followers: sp.followers,
              engagementRate: sp.engagementRate
            } as any;
          }
        }
      }
      userObj.connectedAccounts = connectedAccounts;
      userObj.profileCompleted = advertiserProfile.profileCompleted || userObj.profileCompleted || false;
      userObj.niche = advertiserProfile.niche || userObj.niche || "";
      userObj.contentTypes = advertiserProfile.contentFormats || userObj.contentTypes || [];
      userObj.targetAudience = advertiserProfile.targetAudience || userObj.targetAudience || { ageRange: "", gender: "", interests: [] };
      userObj.experienceLevel = advertiserProfile.experienceLevel || userObj.experienceLevel || "";
      userObj.profileData = advertiserProfile.profileData || userObj.profileData || {};
    }
  } else if (userObj.role === 'business_owner') {
    const businessProfile = await BusinessOwner.findOne({ userId: userObj._id }).lean();
    if (businessProfile) {
      userObj.businessName = businessProfile.businessName || userObj.businessName || "";
      userObj.location = businessProfile.location || userObj.location || "";
      userObj.bio = businessProfile.bio || userObj.bio || "";
      userObj.tradeLicenseUrl = businessProfile.tradeLicenseUrl || userObj.tradeLicenseUrl || "";
      userObj.idVerificationUrl = businessProfile.idVerificationUrl || userObj.idVerificationUrl || "";
      userObj.profileData = businessProfile.profileData || userObj.profileData || {};
    }
  }
  return userObj;
}

export async function syncBusinessOwnerProfile(user: any) {
  if (!user || user.role !== 'business_owner') return;

  let businessProfile = await BusinessOwner.findOne({ userId: user._id });
  if (!businessProfile) {
    businessProfile = new BusinessOwner({ userId: user._id });
  }

  // Extract from user fields
  const pData = user.profileData || {};
  const pendingPData = user.pendingProfileData || {};

  // Map to BusinessOwner fields
  businessProfile.businessName = pData.businessName ?? pendingPData.businessName ?? user.businessName ?? businessProfile.businessName;
  businessProfile.businessEmail = pData.businessEmail ?? pendingPData.businessEmail ?? user.businessEmail ?? businessProfile.businessEmail;
  businessProfile.phoneNumber = pData.phone ?? pendingPData.phone ?? pData.phoneNumber ?? pendingPData.phoneNumber ?? user.phoneNumber ?? user.phone ?? businessProfile.phoneNumber;
  businessProfile.website = pData.websiteUrl ?? pendingPData.websiteUrl ?? pData.website ?? pendingPData.website ?? user.websiteUrl ?? user.website ?? businessProfile.website;
  businessProfile.industry = pData.businessCategory ?? pendingPData.businessCategory ?? pData.industry ?? pendingPData.industry ?? user.industry ?? businessProfile.industry;
  businessProfile.companySize = pData.companySize ?? pendingPData.companySize ?? user.companySize ?? businessProfile.companySize;
  businessProfile.location = pData.businessLocation ?? pendingPData.businessLocation ?? user.location ?? businessProfile.location;
  businessProfile.bio = pData.brandDescription ?? pendingPData.brandDescription ?? user.bio ?? businessProfile.bio;
  businessProfile.tradeLicenseUrl = pData.tradeLicenseUrl ?? pendingPData.tradeLicenseUrl ?? user.tradeLicenseUrl ?? businessProfile.tradeLicenseUrl;
  businessProfile.idVerificationUrl = pData.idVerificationUrl ?? pendingPData.idVerificationUrl ?? user.idVerificationUrl ?? businessProfile.idVerificationUrl;

  // Sync structural objects
  businessProfile.profileData = user.profileData || businessProfile.profileData;
  businessProfile.pendingProfileData = user.pendingProfileData || businessProfile.pendingProfileData;
  businessProfile.pendingUpdates = user.pendingUpdates || businessProfile.pendingUpdates;

  // Save the BusinessOwner profile
  await businessProfile.save();
}

export async function syncAdminProfile(user: any) {
  // AdminProfile collection was removed by request
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
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

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

    if (type === 'tradeLicenseUrl' || type === 'idVerificationUrl') {
      await BusinessOwner.findOneAndUpdate(
        { userId: user._id },
        { $set: { [type]: result.secure_url } },
        { new: true, upsert: true }
      );
    } else {
      user.set(type, result.secure_url);
      await user.save();
    }

    const enriched = await enrichUserWithProfile(user);

    res.status(200).json({
      message: "File uploaded successfully",
      user: enriched,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
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
            resource_type: "raw",
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
    "about",
    "location",
    "tradeLicenseUrl",
    "idVerificationUrl",
    "socialProfiles",
    "profileData"
  ];

  try {
    // Get user from custom auth middleware
    let user = (req as any).user;

    // Fallback to Clerk if not set
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    }

    const updates: any = {};

    for (const key of ALLOWED_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Auto-synchronize bio and about
    if (updates.bio !== undefined) {
      updates.about = updates.bio;
    } else if (updates.about !== undefined) {
      updates.bio = updates.about;
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
    if (updatedUser.role === 'business_owner') {
      await syncBusinessOwnerProfile(updatedUser);
    } else if (updatedUser.role === 'admin' || updatedUser.role === 'super_admin') {
      await syncAdminProfile(updatedUser);
    }
    const enrichedUser = await enrichUserWithProfile(updatedUser);

    res.status(200).json({
      message: "Profile updated successfully",
      user: enrichedUser,
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
    // Get user from custom auth middleware
    let user = (req as any).user;

    // Fallback to Clerk if not set
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    }

    if (user.role === "advertiser") {
      // 🚀 Auto-approve: set status to active and verified, bypass admin review
      user.status = "active";
      user.isVerified = true;

      for (const key of ALLOWED_FIELDS) {
        if (req.body[key] !== undefined) {
          (user as any)[key] = req.body[key];
        }
      }

      const applyAdvertiserProfileMerge = () => {
        return mergeAdvertiserProfileOnSubmit({
          profileData: (req.body.profileData ?? user.profileData) as Record<string, unknown>,
          socialProfiles: req.body.socialProfiles ?? user.socialProfiles,
          bio: req.body.bio ?? user.bio,
          location: req.body.location ?? user.location,
        });
      };

      const mergedAdv = applyAdvertiserProfileMerge();
      if (mergedAdv) {
        user.profileData = mergeProfileData(
          (user.profileData || {}) as Record<string, unknown>,
          mergedAdv.profileData
        );
        user.socialProfiles = mergedAdv.socialProfiles as any;
      } else if (req.body.profileData && typeof req.body.profileData === "object") {
        user.profileData = mergeProfileData(
          (user.profileData || {}) as Record<string, unknown>,
          req.body.profileData as Record<string, unknown>
        );
      }

      // Clear any pending updates/profileData since it's applied directly
      user.pendingProfileData = null;
      user.pendingUpdates = null;

      // Sync/Create AdvertiserProfile document directly (for AI/recommendations)
      let advertiserProfile = await AdvertiserProfile.findOne({ userId: user._id });
      if (!advertiserProfile) {
        advertiserProfile = new AdvertiserProfile({ userId: user._id });
      }

      // Sync fields
      advertiserProfile.niche = (req.body.niche ?? advertiserProfile.niche ?? (user.profileData as any)?.niche);
      advertiserProfile.experienceLevel = (req.body.experienceLevel ?? advertiserProfile.experienceLevel ?? (user.profileData as any)?.experienceLevel);
      advertiserProfile.contentFormats = (req.body.contentTypes ?? advertiserProfile.contentFormats ?? (user.profileData as any)?.contentTypes);
      advertiserProfile.targetAudience = (req.body.targetAudience ?? advertiserProfile.targetAudience ?? (user.profileData as any)?.targetAudience);
      advertiserProfile.phoneNumber = user.phoneNumber;
      advertiserProfile.bio = user.bio;
      advertiserProfile.location = user.location;

      // Determine if at least one social media account is connected
      let hasConnected = false;
      if (user.connectedAccounts) {
        hasConnected = ['tiktok', 'instagram', 'facebook'].some(
          p => user.connectedAccounts[p] && user.connectedAccounts[p].connected && user.connectedAccounts[p].verified
        );
      } else if (user.socialProfiles && user.socialProfiles.length > 0) {
        hasConnected = user.socialProfiles.some((p: any) => p.verified);
      }

      if (hasConnected) {
        advertiserProfile.profileCompleted = true;
        advertiserProfile.profileCompletedAt = new Date();
        user.profileCompleted = true;
      }

      advertiserProfile.profileData = user.profileData;
      advertiserProfile.socialProfiles = user.socialProfiles as any;
      advertiserProfile.pendingProfileData = null;
      advertiserProfile.pendingUpdates = null;

      advertiserProfile.markModified('socialProfiles');
      advertiserProfile.markModified('profileData');
      advertiserProfile.markModified('targetAudience');
      advertiserProfile.markModified('pendingProfileData');
      advertiserProfile.markModified('pendingUpdates');
      await advertiserProfile.save();

      const updatedUser = await user.save();
      const userResponse = updatedUser.toObject();
      delete (userResponse as any).__v;

      res.status(200).json({
        message: "Profile updated and approved successfully",
        user: userResponse,
        appliedDirectly: true
      });
      return;
    }

    const hasVerifiedSocial =
      (user.socialProfiles && user.socialProfiles.some((p: any) => p.platform?.toLowerCase() === "tiktok" && p.verified)) ||
      (req.body.socialProfiles && req.body.socialProfiles.some((p: any) => p.platform?.toLowerCase() === "tiktok" && p.verified));

    const isAutomaticallyVerified = user.role === "advertiser" && hasVerifiedSocial;
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

    if (isAutomaticallyVerified && !isAlreadyApproved) {
      // 🚀 Auto-verify: set status to active and save directly to profileData (bypass pending)
      updates.status = "active";

      for (const key of ALLOWED_FIELDS) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      const mergedAdv = applyAdvertiserProfileMerge();
      if (mergedAdv) {
        updates.profileData = mergeProfileData(
          (user.profileData || {}) as Record<string, unknown>,
          mergedAdv.profileData
        );
        updates.socialProfiles = mergedAdv.socialProfiles;
      } else if (updates.profileData && typeof updates.profileData === "object") {
        updates.profileData = mergeProfileData(
          (user.profileData || {}) as Record<string, unknown>,
          updates.profileData as Record<string, unknown>
        );
      }
      user.set(updates);
    } else if (isAlreadyApproved) {
      if (user.role === "business_owner") {
        const validation = validateBusinessProfileSubmit({
          ...req.body,
          profileData: req.body.profileData,
        });
        if (!validation.valid) {
          res.status(400).json({ message: validation.message });
          return;
        }

        const needsReview = hasRequiredBusinessFieldChanges(user, req.body);

        if (!needsReview) {
          for (const key of ALLOWED_FIELDS) {
            if (key !== "profileData" && req.body[key] !== undefined) {
              (user as any)[key] = req.body[key];
            }
          }

          if (req.body.profileData && typeof req.body.profileData === "object") {
            user.profileData = mergeProfileData(
              (user.profileData || {}) as Record<string, unknown>,
              req.body.profileData as Record<string, unknown>
            );
            user.markModified("profileData");
          }

          const updatedUser = await user.save();
          const userResponse = updatedUser.toObject();
          delete (userResponse as any).__v;

          // Sync directly to BusinessOwner
          await syncBusinessOwnerProfile(updatedUser);

          res.status(200).json({
            message: "Profile updated successfully",
            user: userResponse,
            appliedDirectly: true,
          });
          return;
        }
      }

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

      if (user.role === "business_owner") {
        let businessProfile = await BusinessOwner.findOne({ userId: user._id });
        if (!businessProfile) {
          businessProfile = new BusinessOwner({ userId: user._id });
        }
        businessProfile.pendingUpdates = {
          ...(businessProfile.pendingUpdates || {}),
          ...rootUpdates,
        };
        if (req.body.profileData && typeof req.body.profileData === "object") {
          businessProfile.pendingProfileData = mergeProfileData(
            mergeProfileData(
              (businessProfile.profileData || {}) as Record<string, unknown>,
              (businessProfile.pendingProfileData || {}) as Record<string, unknown>
            ),
            req.body.profileData as Record<string, unknown>
          );
        }
        await businessProfile.save();
      }
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

      if (user.role === "business_owner") {
        let businessProfile = await BusinessOwner.findOne({ userId: user._id });
        if (!businessProfile) {
          businessProfile = new BusinessOwner({ userId: user._id });
        }
        const bpUpdates = { ...req.body };
        delete bpUpdates.profileData;
        businessProfile.pendingUpdates = {
          ...(businessProfile.pendingUpdates || {}),
          ...bpUpdates,
        };
        if (req.body.profileData && typeof req.body.profileData === "object") {
          businessProfile.pendingProfileData = mergeProfileData(
            mergeProfileData(
              (businessProfile.profileData || {}) as Record<string, unknown>,
              (businessProfile.pendingProfileData || {}) as Record<string, unknown>
            ),
            req.body.profileData as Record<string, unknown>
          );
        }
        await businessProfile.save();
      }
    }
    const updatedUser = await user.save();
    if (updatedUser.role === 'business_owner') {
      await syncBusinessOwnerProfile(updatedUser);
    }
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
  let user = (req as any).user;
  if (!user) {
    // Fallback in case route wasn't protected by middleware
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    user = await User.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
  }

  const enriched = await enrichUserWithProfile(user);
  res.status(200).json({ user: enriched });
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const enriched = await enrichUserWithProfile(user);
    res.status(200).json({ user: enriched });
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
    const enriched = await enrichUserWithProfile(existingUser);
    res
      .status(200)
      .json({ user: enriched, message: "User already exists" });
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
      if (userByEmail.role === 'business_owner') {
        await syncBusinessOwnerProfile(userByEmail);
      } else if (userByEmail.role === 'admin' || userByEmail.role === 'super_admin') {
        await syncAdminProfile(userByEmail);
      }
      const enriched = await enrichUserWithProfile(userByEmail);
      res.status(200).json({ user: enriched, message: "User re-linked" });
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

    // Only allow public-facing roles via self-assign sync endpoint
    // Admin and super_admin roles must be assigned via Clerk metadata or by an admin
    const ALLOWED_SELF_ASSIGN_ROLES = ['business_owner', 'advertiser'];
    const clerkRole = clerkUser.publicMetadata?.role as string;
    const requestedRole = req.body?.role;
    const resolvedRole = (clerkRole && ['super_admin', 'admin', 'business_owner', 'advertiser'].includes(clerkRole))
      ? clerkRole
      : (requestedRole && ALLOWED_SELF_ASSIGN_ROLES.includes(requestedRole))
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
      if (user.role === 'business_owner') {
        await syncBusinessOwnerProfile(user);
      } else if (user.role === 'admin' || user.role === 'super_admin') {
        await syncAdminProfile(user);
      }

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

      const enriched = await enrichUserWithProfile(user);
      res.status(201).json({ user: enriched, message: "User created Successfully" });
    } catch (createError: any) {
      if (createError.code === 11000) {
        // Last-resort fallback: find by either clerkId or email
        const existing = await User.findOne({
          $or: [{ clerkId: userId }, { email }]
        });
        if (existing && existing.clerkId !== userId) {
          existing.clerkId = userId;
          await existing.save();
          if (existing.role === 'business_owner') {
            await syncBusinessOwnerProfile(existing);
          } else if (existing.role === 'admin' || existing.role === 'super_admin') {
            await syncAdminProfile(existing);
          }
        }
        const enriched = await enrichUserWithProfile(existing);
        res.status(200).json({ user: enriched, message: "User already exists" });
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
    const { opportunityId } = req.body;
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    }

    if (user.role !== "advertiser") {
      res.status(403).json({ message: "Only advertisers can save opportunities" });
      return;
    }

    if (!opportunityId) {
      res.status(400).json({ message: "Opportunity ID is required" });
      return;
    }

    let advertiserProfile = await AdvertiserProfile.findOne({ userId: user._id });
    if (!advertiserProfile) {
      advertiserProfile = new AdvertiserProfile({ userId: user._id });
    }

    if (!advertiserProfile.savedOpportunities) {
      advertiserProfile.savedOpportunities = [];
    }

    const isSaved = advertiserProfile.savedOpportunities.some((id: any) => id.toString() === opportunityId.toString());

    if (isSaved) {
      // Unsave
      advertiserProfile.savedOpportunities = advertiserProfile.savedOpportunities.filter(
        (id) => id.toString() !== opportunityId.toString()
      );
    } else {
      // Save
      advertiserProfile.savedOpportunities.push(opportunityId);
    }

    await advertiserProfile.save();

    res.status(200).json({
      message: isSaved ? "Opportunity removed from saved" : "Opportunity saved successfully",
      isSaved: !isSaved,
      savedOpportunities: advertiserProfile.savedOpportunities
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
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    }

    if (user.role !== "advertiser") {
      res.status(200).json({ savedOpportunities: [] });
      return;
    }

    const advertiserProfile = await AdvertiserProfile.findOne({ userId: user._id }).populate('savedOpportunities');
    const saved = advertiserProfile?.savedOpportunities || [];

    res.status(200).json({
      savedOpportunities: saved
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
    const { creatorId } = req.body;
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    }

    if (!creatorId) {
      res.status(400).json({ message: "Creator ID is required" });
      return;
    }

    if (!user.savedCreators) {
      user.savedCreators = [];
    }

    const isSaved = user.savedCreators.some((id: any) => id.toString() === creatorId.toString());

    if (isSaved) {
      user.savedCreators = user.savedCreators.filter((id: any) => id.toString() !== creatorId.toString());
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
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId }).populate('savedCreators');
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
    } else {
      // Need to populate
      await user.populate('savedCreators');
    }

    res.status(200).json({
      savedCreators: user.savedCreators || []
    });
  } catch (error: any) {
    console.error("Get saved creators error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const completeAdvertiserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
    }

    const {
      niche,
      experienceLevel,
      contentFormats,
      targetAudience,
      rateExpectations,
      previousBrands,
      portfolioLinks,
      additionalNotes
    } = req.body;

    user.profileInfo = {
      niche,
      experienceLevel,
      contentFormats,
      targetAudience,
      rateExpectations,
      previousBrands,
      portfolioLinks,
      additionalNotes
    };

    user.status = 'active';
    user.isVerified = true;
    user.markModified('profileInfo');

    await user.save();

    res.status(200).json({
      success: true,
      message: "Advertiser profile completed successfully",
      user
    });
  } catch (error: any) {
    console.error("[AdvertiserProfile] Complete error:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

export const getAdvertiserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

import { ApifyClient } from 'apify-client';

export const syncTikTokMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    let user = (req as any).user;
    if (!user) {
      const { userId } = getAuth(req);
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      user = await User.findOne({ clerkId: userId });
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }
    }

    const username = user.tiktokUsername || user.username;
    if (!username) {
      res.status(400).json({ success: false, message: "No TikTok username connected to this account" });
      return;
    }

    const apifyToken = process.env.APIFY_TOKEN;
    if (!apifyToken) {
      res.status(500).json({ success: false, message: "APIFY_TOKEN not configured on server" });
      return;
    }

    const client = new ApifyClient({ token: apifyToken });
    const run = await client.actor('clockworks/free-tiktok-scraper').call({
      profiles: [username.replace(/^@/, '')],
      scrapePosts: false,
      scrapeComments: false
    });

    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: "TikTok profile not found or private." });
      return;
    }

    const userData = items[0] as any;
    const followers = userData?.authorMeta?.fans || userData?.followers || 0;
    const following = userData?.authorMeta?.following || 0;
    const totalLikes = userData?.authorMeta?.heart || userData?.likes || 0;
    const totalPosts = userData?.authorMeta?.video || userData?.videos || 0;
    const avgViews = userData?.avgViews || 0;
    const avgLikes = userData?.avgLikes || 0;
    const avgComments = userData?.avgComments || 0;
    const engagementRate = followers > 0 ? parseFloat((((avgLikes + avgComments) / followers) * 100).toFixed(2)) : 0;

    user.tiktokProfile = {
      displayName: userData?.authorMeta?.nickName || user.tiktokProfile?.displayName || username,
      bio: userData?.authorMeta?.bio || user.tiktokProfile?.bio || '',
      profilePicture: userData?.authorMeta?.avatar || user.tiktokProfile?.profilePicture || '',
      verifiedBadge: userData?.authorMeta?.verified || false,
      metrics: {
        followers,
        following,
        totalLikes,
        totalPosts,
        avgViews,
        avgLikes,
        avgComments,
        engagementRate
      },
      lastSynced: new Date()
    };
    user.lastVerifiedAt = new Date();
    user.nextVerificationRequiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Sync socialProfiles for legacy support as well
    if (user.socialProfiles && user.socialProfiles.length > 0) {
      user.socialProfiles = user.socialProfiles.map((p: any) => {
        if (p.platform?.toLowerCase() === 'tiktok') {
          return {
            ...p,
            followers,
            following,
            verified: userData?.authorMeta?.verified || false,
            tiktokAnalytics: {
              ...p.tiktokAnalytics,
              followers,
              following,
              totalLikes,
              avgViews,
              avgLikes,
              avgComments
            }
          };
        }
        return p;
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "TikTok metrics synced successfully",
      metrics: user.tiktokProfile.metrics,
      user
    });
  } catch (error: any) {
    console.error("[TikTokSync] Error:", error);
    res.status(500).json({ success: false, message: "Failed to sync TikTok metrics", error: error.message });
  }
};

import User from '../../src/database/models/User';
import Wallet from '../../src/database/models/Wallet';
import Opportunity from '../../src/database/models/Opportunity';
import BusinessOwner from '../../src/database/models/businessOwner';
import AdvertiserProfile from '../../src/database/models/AdvertiserProfile';
import PlatformSettings from '../../src/database/models/PlatformSettings';
import mongoose from 'mongoose';

let userCounter = 0;

export async function seedPlatformSettings() {
  await PlatformSettings.findOneAndUpdate(
    {},
    { maintenanceMode: false },
    { upsert: true, new: true }
  );
}

export async function createTestUser(
  overrides: Partial<{
    role: 'business_owner' | 'advertiser' | 'admin' | 'super_admin';
    status: string;
    email: string;
    clerkId: string;
  }> = {}
) {
  userCounter += 1;
  const n = userCounter;
  const role = overrides.role ?? 'advertiser';
  const clerkId = overrides.clerkId ?? `clerk_test_${role}_${n}`;

  const user = await User.create({
    clerkId,
    email: overrides.email ?? `user${n}@aacp-test.local`,
    username: `testuser${n}`,
    firstName: 'Test',
    lastName: `User${n}`,
    role,
    status: overrides.status ?? 'approved',
    isVerified: true,
  });

  return user;
}

export async function createWalletForUser(
  userId: mongoose.Types.ObjectId | string,
  totalCoins = 100,
  lockedCoins = 0
) {
  return Wallet.create({
    user: userId,
    totalCoins,
    lockedCoins,
  });
}

export async function createBusinessOwnerProfile(
  userId: mongoose.Types.ObjectId | string,
  profileData: Record<string, unknown> = {}
) {
  return BusinessOwner.create({
    userId,
    location: 'Addis Ababa',
    profileData: {
      preferredNiches: ['fashion', 'lifestyle'],
      preferredPlatform: ['instagram', 'tiktok'],
      industry: 'Retail',
      ...profileData,
    },
  });
}

export async function createAdvertiserProfile(
  userId: mongoose.Types.ObjectId | string,
  profileData: Record<string, unknown> = {}
) {
  return AdvertiserProfile.create({
    userId,
    location: 'Addis Ababa',
    profileData: {
      niches: ['fashion', 'beauty'],
      platforms: ['instagram'],
      followers: 50000,
      engagementRate: 4.5,
      ...profileData,
    },
    averageRating: 4.2,
    totalReviews: 10,
  });
}

export async function createOpenOpportunity(
  businessOwnerId: mongoose.Types.ObjectId | string,
  overrides: Partial<Record<string, unknown>> = {}
) {
  return Opportunity.create({
    businessOwner: businessOwnerId,
    title: 'Summer Brand Campaign',
    description: 'Looking for creators to promote our summer collection with authentic content.',
    category: 'fashion',
    platforms: ['instagram', 'tiktok'],
    deliverables: ['1 reel', '2 stories'],
    budget: { amount: 5000, currency: 'ETB' },
    requirements: {
      minFollowers: 1000,
      preferredNiches: ['fashion', 'lifestyle'],
      location: 'Addis Ababa',
    },
    status: 'open',
    coinsRequired: 50,
    maxApplicants: 20,
    tags: ['summer'],
    viewsCount: 0,
    ...overrides,
  });
}

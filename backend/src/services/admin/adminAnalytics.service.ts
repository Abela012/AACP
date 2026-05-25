import User from "../../database/models/User";
import AuditLog from "../../database/models/AuditLog";
import Message from "../../database/models/Message";
import Conversation from "../../database/models/Conversation";
import Collaboration from "../../database/models/Collaboration";
import Review from "../../database/models/Review";
import Application from "../../database/models/Application";
import AdvertiserProfile from "../../database/models/AdvertiserProfile";
import Analytics from "../../database/models/Analytics";

/**
 * Admin Analytics Service
 * Provides real backend data for admin dashboard, efficiency metrics, and trust scores
 */

export interface EfficiencyPulseMetrics {
  verificationRate: number;
  responseTime: number; // average minutes
  actionsLoggedThisMonth: number;
  platformHealth: number; // 0-100
}

export interface TrustScoreData {
  userId: string;
  trustScore: number; // 0-100
  breakdown: {
    verificationScore: number;
    reliabilityScore: number;
    performanceScore: number;
    engagementScore: number;
  };
  lastUpdated: Date;
}

/**
 * Calculate efficiency pulse metrics for admin dashboard
 * Real data: verification rate, response time, actions logged
 */
export const getEfficiencyPulseMetrics =
  async (): Promise<EfficiencyPulseMetrics> => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // 1. Verification Rate
      const [totalUsers, verifiedUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true, emailVerified: true }),
      ]);
      const verificationRate =
        totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0;

      // 2. Average Response Time
      // Calculate time delta between messages in conversations (both directions)
      const messageDeltas = await Message.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        { $sort: { conversation: 1, createdAt: 1 } },
        {
          $group: {
            _id: "$conversation",
            messages: {
              $push: {
                sender: "$sender",
                createdAt: "$createdAt",
              },
            },
          },
        },
      ]);

      let totalResponseTime = 0;
      let responseCount = 0;

      messageDeltas.forEach((conv: any) => {
        const messages = conv.messages;
        for (let i = 1; i < messages.length; i++) {
          if (messages[i].sender !== messages[i - 1].sender) {
            const delta =
              (messages[i].createdAt - messages[i - 1].createdAt) / (1000 * 60);
            totalResponseTime += delta;
            responseCount++;
          }
        }
      });

      const responseTime =
        responseCount > 0 ? totalResponseTime / responseCount : 0;

      // 3. Actions Logged This Month
      const actionsLoggedThisMonth = await AuditLog.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      // 4. Platform Health Score (0-100)
      // Based on verification rate, active collaborations, and support ticket resolution
      const activeCollaborations = await Collaboration.countDocuments({
        status: { $in: ["active", "in_review"] },
      });
      const completedCollaborations = await Collaboration.countDocuments({
        status: "completed",
      });
      const totalCollaborations =
        activeCollaborations + completedCollaborations;
      const collaborationCompletionRate =
        totalCollaborations > 0
          ? (completedCollaborations / totalCollaborations) * 100
          : 0;

      // Platform health: avg of verification rate + collaboration completion rate
      const platformHealth =
        (verificationRate + collaborationCompletionRate) / 2;

      return {
        verificationRate: Math.round(verificationRate),
        responseTime: Math.round(responseTime * 100) / 100,
        actionsLoggedThisMonth,
        platformHealth: Math.round(platformHealth),
      };
    } catch (error) {
      console.error("Error calculating efficiency pulse metrics:", error);
      return {
        verificationRate: 0,
        responseTime: 0,
        actionsLoggedThisMonth: 0,
        platformHealth: 0,
      };
    }
  };

/**
 * Calculate comprehensive Trust Score for a user
 * Based on: verification, reliability, performance, engagement
 */
export const calculateTrustScore = async (
  userId: string,
): Promise<TrustScoreData> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // 1. Verification Score (0-25 points)
    const verificationScore = user.isVerified && user.emailVerified ? 25 : 0;

    // 2. Reliability Score (0-25 points)
    // Based on collaboration completion rate
    const userCollaborations = await Collaboration.find({
      $or: [{ businessOwner: userId }, { advertiser: userId }],
    });

    const completedCount = userCollaborations.filter(
      (c) => c.status === "completed",
    ).length;
    const reliabilityScore =
      userCollaborations.length > 0
        ? (completedCount / userCollaborations.length) * 25
        : 0;

    // 3. Performance Score (0-25 points)
    // Based on average rating and engagement
    const reviews = await Review.find({ targetUserId: userId });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    const performanceScore = (averageRating / 5) * 25;

    // 4. Engagement Score (0-25 points)
    // Based on activity: messages sent, applications submitted/received
    const messageCount = await Message.countDocuments({ sender: userId });
    const applications = await Application.countDocuments({
      advertiser: userId,
    });
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = await AuditLog.countDocuments({
      "targetUser.userId": userId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Normalize to 0-25 scale (assuming 100+ interactions = full score)
    const totalInteractions = messageCount + applications + recentActivity;
    const engagementScore = Math.min((totalInteractions / 100) * 25, 25);

    // Total Trust Score (0-100)
    const trustScore =
      verificationScore + reliabilityScore + performanceScore + engagementScore;

    return {
      userId,
      trustScore: Math.round(trustScore),
      breakdown: {
        verificationScore: Math.round(verificationScore),
        reliabilityScore: Math.round(reliabilityScore),
        performanceScore: Math.round(performanceScore),
        engagementScore: Math.round(engagementScore),
      },
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("Error calculating trust score:", error);
    throw error;
  }
};

/**
 * Get reach and engagement metrics for applicants
 * Used for "Reach vs Engagement" graph
 */
export interface ApplicantMetrics {
  advertiserId: string;
  advertiserName: string;
  profilePicture?: string;
  reach: number;
  engagement: number;
  engagementRate: number;
  followers: number;
}

export const getApplicantMetrics = async (
  limit: number = 6,
): Promise<ApplicantMetrics[]> => {
  try {
    // Get advertiser profiles populated with user data
    const advertiserProfiles = await AdvertiserProfile.find()
      .populate<{
        userId: {
          _id: any;
          firstName?: string;
          lastName?: string;
          username?: string;
          profilePicture?: string;
        };
      }>("userId", "firstName lastName username profilePicture")
      .lean();

    // Sort by total followers across all social profiles (descending)
    advertiserProfiles.sort((a, b) => {
      const aFollowers = (a.socialProfiles || []).reduce(
        (sum: number, sp: any) => sum + (sp.followers || 0),
        0,
      );
      const bFollowers = (b.socialProfiles || []).reduce(
        (sum: number, sp: any) => sum + (sp.followers || 0),
        0,
      );
      return bFollowers - aFollowers;
    });

    const metrics: ApplicantMetrics[] = [];

    for (const advertiser of advertiserProfiles.slice(0, limit)) {
      const user = advertiser.userId as any;
      const advertiserName = user
        ? `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.username ||
          "Unknown"
        : "Unknown";
      const profilePicture = user?.profilePicture;

      // Sum followers and engagement rate from all social profiles
      const socialProfiles = advertiser.socialProfiles || [];
      const totalFollowers = socialProfiles.reduce(
        (sum: number, sp: any) => sum + (sp.followers || 0),
        0,
      );
      const avgEngagementRate =
        socialProfiles.length > 0
          ? socialProfiles.reduce(
              (sum: number, sp: any) => sum + (sp.engagementRate || 0),
              0,
            ) / socialProfiles.length
          : 0;

      // Try real analytics data first (views = reach, likes+comments = engagement)
      const analyticsData = await Analytics.find({
        submittedBy: user?._id || advertiser.userId,
        status: "completed",
      }).lean();

      let reach: number;
      let engagement: number;

      if (analyticsData.length > 0) {
        reach = analyticsData.reduce(
          (sum: number, a: any) => sum + (a.metrics?.views || 0),
          0,
        );
        engagement = analyticsData.reduce(
          (sum: number, a: any) =>
            sum + (a.metrics?.likes || 0) + (a.metrics?.comments || 0),
          0,
        );
      } else {
        // Fall back to follower-based estimates
        reach = totalFollowers;
        engagement = Math.floor(totalFollowers * (avgEngagementRate / 100));
      }

      metrics.push({
        advertiserId: (user?._id || advertiser.userId).toString(),
        advertiserName,
        profilePicture,
        reach,
        engagement,
        engagementRate: Math.round(avgEngagementRate * 100) / 100,
        followers: totalFollowers,
      });
    }

    return metrics;
  } catch (error) {
    console.error("Error getting applicant metrics:", error);
    return [];
  }
};

/**
 * Get profitability and ROI metrics for applicants
 * Based on collaboration performance and campaign effectiveness
 */
export interface ProfitabilityMetrics {
  advertiserId: string;
  advertiserName: string;
  collaborationCount: number;
  completedCollaborations: number;
  averageEngagement: number;
  estimatedROI: number; // percentage
  profitability: string; // "High", "Medium", "Low"
}

export const getProfitabilityMetrics = async (
  limit: number = 8,
): Promise<ProfitabilityMetrics[]> => {
  try {
    // Aggregate collaborations per advertiser (field is "advertiser", not "applicantId")
    const collaborations = await Collaboration.aggregate([
      {
        $group: {
          _id: "$advertiser",
          totalCount: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          avgProgress: { $avg: "$overallProgress" },
        },
      },
      { $match: { _id: { $ne: null } } },
      { $sort: { completedCount: -1, totalCount: -1 } },
      { $limit: limit },
    ]);

    const metrics: ProfitabilityMetrics[] = [];

    for (const collab of collaborations) {
      if (!collab._id) continue;

      const user = await User.findById(collab._id)
        .select("firstName lastName username")
        .lean();
      if (!user) continue;

      const advertiserName =
        `${(user as any).firstName || ""} ${(user as any).lastName || ""}`.trim() ||
        (user as any).username ||
        "Unknown";

      const completionRate =
        collab.totalCount > 0
          ? (collab.completedCount / collab.totalCount) * 100
          : 0;
      const avgEngagement = collab.avgProgress || 0;
      const estimatedROI = Math.round(
        completionRate * 0.7 + avgEngagement * 0.3,
      );

      metrics.push({
        advertiserId: collab._id.toString(),
        advertiserName,
        collaborationCount: collab.totalCount,
        completedCollaborations: collab.completedCount,
        averageEngagement: Math.round(avgEngagement),
        estimatedROI,
        profitability:
          estimatedROI > 60 ? "High" : estimatedROI > 30 ? "Medium" : "Low",
      });
    }

    return metrics;
  } catch (error) {
    console.error("Error getting profitability metrics:", error);
    return [];
  }
};

import { Request, Response } from "express";
import * as collaborationService from "./collaborations.service";
import { success, error } from "../../utils/response";

/**
 * Collaboration Controller
 * Owner: Backend Developer 2
 * Handles HTTP requests for collaborations
 */

/**
 * @desc    Create collaboration when an application is accepted
 * @route   POST /api/v1/collaborations/start
 * @access  Private (Business Owner only)
 */
export const startCollaboration = async (req: Request, res: Response) => {
  try {
    const { applicationId } = req.body;
    const collaboration = await collaborationService.startCollaboration(
      applicationId,
      req.user?._id?.toString() as string,
    );

    return success(
      res,
      "Collaboration started successfully",
      collaboration,
      201,
    );
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @desc    Mark collaboration as completed
 * @route   PUT /api/v1/collaborations/:id/complete
 * @access  Private (Business Owner only)
 */
export const completeCollaboration = async (req: Request, res: Response) => {
  try {
    const collaboration = await collaborationService.completeCollaboration(
      req.params.id as string,
      req.user?._id?.toString() as string,
    );

    return success(res, "Collaboration completed successfully", collaboration);
  } catch (err: any) {
    return error(res, err.message, 403);
  }
};

/**
 * @desc    Get all collaborations related to a user
 * @route   GET /api/v1/collaborations/user/:userId
 * @access  Private
 */
export const getCollaborationsByUser = async (req: Request, res: Response) => {
  try {
    const userId =
      req.params.userId === "me"
        ? (req.user?._id?.toString() as string)
        : req.params.userId;
    const collaborations =
      await collaborationService.getCollaborationsByUser(userId);

    return success(
      res,
      "Collaborations retrieved successfully",
      collaborations,
    );
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

/**
 * @desc    Get collaboration details
 * @route   GET /api/v1/collaborations/:id
 * @access  Private
 */
export const getCollaborationById = async (req: Request, res: Response) => {
  try {
    const collaboration = await collaborationService.getCollaborationById(
      req.params.id as string,
    );

    return success(
      res,
      "Collaboration details retrieved successfully",
      collaboration,
    );
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

/**
 * @desc    Add task to collaboration
 * @route   POST /api/v1/collaborations/:id/tasks
 */
export const addTask = async (req: Request, res: Response) => {
  try {
    const collaboration = await collaborationService.addTask(
      req.params.id,
      req.body,
      req.user?._id?.toString() as string,
    );
    return success(res, "Task added successfully", collaboration);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @desc    Update task status
 * @route   PUT /api/v1/collaborations/:id/tasks/:taskId
 */
export const updateTask = async (req: Request, res: Response) => {
  try {
    const collaboration = await collaborationService.updateTaskStatus(
      req.params.id,
      req.params.taskId,
      req.body.status,
      req.user?._id?.toString() as string,
    );
    return success(res, "Task updated successfully", collaboration);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @desc    Submit deliverable
 * @route   POST /api/v1/collaborations/:id/deliverables
 */
export const submitDeliverable = async (req: Request, res: Response) => {
  try {
    let deliverableData = { ...req.body };

    console.log("[Deliverable] req.body:", req.body);
    console.log(
      "[Deliverable] req.file:",
      req.file
        ? `${req.file.originalname} (${req.file.mimetype}, ${req.file.size} bytes)`
        : "NO FILE",
    );

    // Require a file for submission
    if (!req.file) {
      return error(res, "A file is required to submit a deliverable", 400);
    }

    // Upload to Cloudinary — use explicit resource_type to ensure correct handling
    const cloudinary = (await import("../../config/cloudinary")).default;
    const isVideo = req.file.mimetype.startsWith("video/");
    const isImage = req.file.mimetype.startsWith("image/");
    const resourceType = isVideo ? "video" : isImage ? "image" : "raw";

    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "aacp/deliverables",
          resource_type: resourceType,
          // Generate a thumbnail for videos
          ...(isVideo && {
            eager: [{ format: "jpg", transformation: [{ start_offset: "0" }] }],
          }),
        },
        (err: any, result: any) => {
          if (err) {
            console.error("[Deliverable] Cloudinary error:", err);
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
      stream.end(req.file!.buffer);
    });

    const result = (await uploadPromise) as any;
    console.log(
      "[Deliverable] Cloudinary URL:",
      result.secure_url,
      "| type:",
      result.resource_type,
    );

    deliverableData.fileUrl = result.secure_url;
    deliverableData.fileName = req.file.originalname;
    deliverableData.fileType = req.file.mimetype; // e.g. "video/mp4"
    deliverableData.thumbnailUrl =
      result.eager?.[0]?.secure_url || result.secure_url;

    const collaboration = await collaborationService.addDeliverable(
      req.params.id,
      deliverableData,
      req.user?._id?.toString() as string,
    );
    return success(res, "Deliverable submitted successfully", collaboration);
  } catch (err: any) {
    console.error("[Deliverable] Error:", err.message);
    return error(res, err.message, 400);
  }
};

/**
 * @desc    Review deliverable
 * @route   PUT /api/v1/collaborations/:id/deliverables/:submissionId/review
 */
export const reviewDeliverable = async (req: Request, res: Response) => {
  try {
    const { status, feedback } = req.body;
    const collaboration = await collaborationService.updateDeliverableStatus(
      req.params.id,
      req.params.submissionId,
      status,
      feedback,
      req.user?._id?.toString() as string,
    );
    return success(res, "Deliverable reviewed successfully", collaboration);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

/**
 * @desc    Report partner in a collaboration (sent to admin as a Dispute)
 * @route   POST /api/v1/collaborations/:id/report
 * @access  Private (advertiser or business owner in the collaboration)
 */
export const reportPartner = async (req: Request, res: Response) => {
  try {
    const report = await collaborationService.reportPartner(
      req.params.id,
      req.user?._id?.toString() as string,
      req.body,
    );
    return success(res, "Report submitted successfully", report, 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

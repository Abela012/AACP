import { Request, Response } from 'express';
import { runMarketingAnalysis } from './marketing-analysis.service';
import { success, error } from '../../utils/response';

/**
 * Marketing Analysis Controller
 * Handles HTTP request/response for profitability analysis of campaign applicants
 */

/**
 * @desc    Get marketing profitability analysis for an opportunity's applicants
 * @route   GET /api/v1/marketing-analysis/:opportunityId
 * @access  Private (Business Owner)
 */
export const getMarketingAnalysis = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return error(res, 'User not authenticated', 401);
        }

        const { opportunityId } = req.params;
        if (!opportunityId) {
            return error(res, 'Opportunity ID is required', 400);
        }

        // Optional query params for customization
        const conversionRate = req.query.conversionRate
            ? parseFloat(req.query.conversionRate as string)
            : undefined;
        const avgProductPrice = req.query.avgProductPrice
            ? parseFloat(req.query.avgProductPrice as string)
            : undefined;

        const data = await runMarketingAnalysis(
            opportunityId,
            conversionRate,
            avgProductPrice
        );

        return success(res, 'Marketing analysis generated', data);
    } catch (err: any) {
        const statusCode = err.message.includes('not found') ? 404 : 500;
        return error(res, err.message || 'Failed to generate marketing analysis', statusCode);
    }
};

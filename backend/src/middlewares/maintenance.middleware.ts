import { Request, Response, NextFunction } from 'express';
import { getPlatformSettings } from '../modules/platform/platformSettings.service';

/**
 * When maintenance mode is on, block API usage except health checks, payments webhooks,
 * and admin / super-admin routes (so staff can disable maintenance).
 */
export const maintenanceGate = async (req: Request, res: Response, next: NextFunction) => {
    const path = req.path || '';
    const allowed =
        path.startsWith('/payments') ||
        path.startsWith('/admin') ||
        path.startsWith('/super-admin');
    if (allowed) return next();

    try {
        const settings = await getPlatformSettings();
        if (!settings.maintenanceMode) return next();
        return res.status(503).json({
            success: false,
            maintenance: true,
            message: 'The platform is temporarily under maintenance. Please try again shortly.',
        });
    } catch {
        return next();
    }
};

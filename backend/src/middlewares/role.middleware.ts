import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return error(
                res,
                `User role ${req.user?.role || 'Guest'} is not authorized to access this route`,
                403
            );
        }
        next();
    };
};

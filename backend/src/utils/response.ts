import { Response } from 'express';

/**
 * Standard API Response Utility
 */
export const success = (res: Response, message: string, data: any = {}, statusCode: number = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

export const error = (res: Response, message: string, statusCode: number = 500, errors: any = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};

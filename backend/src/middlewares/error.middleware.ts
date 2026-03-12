import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { error } from '../utils/response';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.stack);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate field value entered';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    }

    error(res, message, statusCode);
};

export default errorHandler;

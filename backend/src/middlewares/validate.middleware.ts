import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { error } from '../utils/response';

/**
 * Handle validation results from express-validator
 */
const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return error(
            res,
            'Validation failed',
            400,
            errors.array().map((err: any) => ({ field: err.path, message: err.msg }))
        );
    }
    next();
};

export default validate;

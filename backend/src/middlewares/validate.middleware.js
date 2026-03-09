const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Handle validation results from express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return error(
            res,
            'Validation failed',
            400,
            errors.array().map(err => ({ field: err.path, message: err.msg }))
        );
    }
    next();
};

module.exports = validate;

const { body } = require('express-validator');

/**
 * Validation rules for creating an Opportunity
 */
exports.createOpportunityValidator = [
    body('title')
        .notEmpty().withMessage('Title is required')
        .trim()
        .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20 }).withMessage('Description must be at least 20 characters long'),

    body('budget.amount')
        .notEmpty().withMessage('Budget amount is required')
        .isNumeric().withMessage('Budget amount must be a number')
        .custom(value => value > 0).withMessage('Budget must be greater than 0'),

    body('category')
        .notEmpty().withMessage('Category is required'),

    body('deadline')
        .optional()
        .isISO8601().withMessage('Invalid date format for deadline')
        .custom(value => {
            if (new Date(value) <= new Date()) {
                throw new Error('Deadline must be a future date');
            }
            return true;
        })
];

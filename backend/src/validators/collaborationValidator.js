const { body } = require('express-validator');
const Application = require('../database/models/Application');

/**
 * Validation rules for starting a Collaboration
 */
exports.startCollaborationValidator = [
    body('applicationId')
        .notEmpty().withMessage('Application ID is required')
        .isMongoId().withMessage('Invalid Application ID')
        .custom(async (value) => {
            const application = await Application.findById(value);
            if (!application) {
                throw new Error('Application not found');
            }
            if (application.status !== 'accepted') {
                throw new Error('Collaboration can only be started from an accepted application');
            }
            return true;
        })
];

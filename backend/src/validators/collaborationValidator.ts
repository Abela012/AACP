import { body } from 'express-validator';
import Application from '../database/models/Application';

/**
 * Validation rules for starting a Collaboration
 */
export const startCollaborationValidator = [
    body('applicationId')
        .notEmpty().withMessage('Application ID is required')
        .isMongoId().withMessage('Invalid Application ID')
        .custom(async (value: string) => {
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

import { Router } from 'express';
import {
    getSocials,
    createSocial,
    deleteSocial
} from '../controllers/socials.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';
import { body, param } from 'express-validator';

const router = Router();

// Get all socials (paginated, public)
router.get(
    '/getall',
    getSocials
);

// Create a new social post (authenticated member, with file upload)
router.post(
    '/create',
    authMiddleware.verifyToken,
    authMiddleware.isMember,
    uploadFile('files'), // expects field name 'files' for uploads
    validate([
        body('userId').notEmpty().withMessage('User ID is required'),
        body('content').notEmpty().withMessage('Content is required')
    ]),
    createSocial
);

// Delete a social post (authenticated member or admin)
router.delete(
    '/:id/delete',
    authMiddleware.verifyToken,
    validate([
        param('id').isMongoId().withMessage('Invalid social post ID')
    ]),
    deleteSocial
);

export default router;
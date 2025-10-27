import { Router } from 'express';
import {
    sendContact,
    getAllContacts,
    getContactById,
    markContactAsResolved,
    deleteContact
} from '../controllers/contact.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { body } from 'express-validator';

const router = Router();

// Apply rate limiter to contact form submission
router.post(
    '/send',
    validate([
        body('name')
            .notEmpty()
            .withMessage('Name is required'),
        body('phone')
            .notEmpty()
            .withMessage('Phone number is required'),
        body('lpuID')
            .notEmpty()
            .withMessage('LPU ID is required'),
        body('email')
            .isEmail()
            .withMessage('Invalid email format'),
        body('subject')
            .notEmpty()
            .withMessage('Subject is required'),
        body('message')
            .notEmpty()
            .withMessage('Message is required')
    ]),
    sendContact
);

// Admin routes (protected)
router.get(
    '/getall',
    authMiddleware.verifyToken,
    getAllContacts
);

router.get(
    '/:id',
    authMiddleware.verifyToken,
    getContactById
);

router.patch(
    '/:id/resolve',
    authMiddleware.verifyToken,
    markContactAsResolved
);

router.delete(
    '/:id',
    authMiddleware.verifyToken,
    deleteContact
);

export default router;
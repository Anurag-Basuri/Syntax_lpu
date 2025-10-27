import { Router } from 'express';
import {
    createTicket,
    getTicketById,
    updateTicketStatus,
    getTicketsByEvent,
    deleteTicket,
    checkEmailAvailability,
    ticketForQR,
    updateStatusForQR
} from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { body, param } from 'express-validator';

const router = Router();

// Check email availability for an event (public)
router.post(
    '/check-email',
    validate([
        body('email').isEmail().withMessage('Valid email is required'),
        body('eventId').optional().isString().withMessage('Event ID must be a string'),
        body('lpuId').optional().isNumeric().withMessage('LPU ID must be numeric')
    ]),
    checkEmailAvailability
);

// Create a new ticket
router.post(
    '/create',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        body('fullName').notEmpty().withMessage('Full name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('phone').notEmpty().withMessage('Phone number is required'),
        body('lpuId').notEmpty().withMessage('LPU ID is required'),
        body('eventId').isMongoId().withMessage('Valid event ID is required'),
        body('eventName').notEmpty().withMessage('Event name is required'),
        body('gender').notEmpty().withMessage('Gender is required'),
        body('hosteler').notEmpty().withMessage('Hosteler status is required'),
        body('course').notEmpty().withMessage('Course name is required'),
    ]),
    createTicket
);

// Get ticket by ID (members)
router.get(
    '/check/:ticketId',
    authMiddleware.verifyToken,
    ticketForQR
);

// Update ticket status for QR code (members)
router.patch(
    '/check/:ticketId/status',
    authMiddleware.verifyToken,
    validate([
        body('isUsed').optional().isBoolean().withMessage('isUsed must be a boolean'),
    ]),
    updateStatusForQR
);

// Get ticket by ID (protected, member or admin)
router.get(
    '/:ticketId',
    authMiddleware.verifyToken,
    validate([
        param('ticketId').isMongoId().withMessage('Invalid ticket ID')
    ]),
    getTicketById
);

// Update ticket status (admin only)
router.patch(
    '/:ticketId/status',
    authMiddleware.verifyToken,
    validate([
        param('ticketId').isMongoId().withMessage('Invalid ticket ID'),
    ]),
    updateTicketStatus
);

// Get all tickets for an event
router.get(
    '/event/:eventId',
    authMiddleware.verifyToken,
    validate([
        param('eventId').isMongoId().withMessage('Invalid event ID')
    ]),
    getTicketsByEvent
);

// Delete a ticket (admin only)
router.delete(
    '/:ticketId',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        param('ticketId').isMongoId().withMessage('Invalid ticket ID')
    ]),
    deleteTicket
);

export default router;
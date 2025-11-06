import { Router } from 'express';
import {
	createTicket,
	getTicketById,
	updateTicketStatus,
	getTicketsByEvent,
	deleteTicket,
	checkAvailability,
} from '../controllers/ticket.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { body, param } from 'express-validator';

const router = Router();
const { protect, authorize } = authMiddleware;

// --- Public Routes ---

// Create a new ticket (event registration)
router.post(
	'/register',
	validate([
		body('eventId').isMongoId().withMessage('A valid event ID is required'),
		body('fullName').notEmpty().trim().withMessage('Full name is required'),
		body('email').isEmail().normalizeEmail().withMessage('A valid email is required'),
		body('phone').notEmpty().withMessage('Phone number is required'),
		body('lpuId').notEmpty().trim().withMessage('LPU ID is required'),
		body('gender').notEmpty().withMessage('Gender is required'),
		body('course').notEmpty().trim().withMessage('Course is required'),
		body('hosteler').isBoolean().withMessage('Hosteler status must be true or false'),
		body('hostel')
			.if(body('hosteler').equals('true'))
			.notEmpty()
			.withMessage('Hostel name is required for hostelers'),
	]),
	createTicket
);

// Check availability of email or LPU ID for an event
router.post(
	'/check-availability',
	validate([
		body('eventId').isMongoId().withMessage('A valid event ID is required'),
		body('email').optional().isEmail().normalizeEmail(),
		body('lpuId').optional().notEmpty(),
	]),
	checkAvailability
);

// Get a ticket by its ticketId
router.get(
	'/:ticketId',
	validate([param('ticketId').notEmpty().withMessage('Ticket ID is required')]),
	getTicketById
);

// --- Admin-Only Routes ---

// Get tickets with filtering, sorting, and pagination
router.get('/', protect, authorize('admin'), getTicketsByEvent);

// Update ticket status
router.patch(
	'/:ticketId/status',
	protect,
	authorize('admin'),
	validate([
		param('ticketId').notEmpty().withMessage('Ticket ID is required'),
		body('status')
			.isIn(['active', 'used', 'cancelled'])
			.withMessage("Status must be one of: 'active', 'used', 'cancelled'"),
	]),
	updateTicketStatus
);

// Delete a ticket
router.delete(
	'/:ticketId',
	protect,
	authorize('admin'),
	validate([param('ticketId').notEmpty().withMessage('Ticket ID is required')]),
	deleteTicket
);

export default router;

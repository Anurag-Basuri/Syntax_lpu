import { Router } from 'express';
import {
	createEvent,
	getAllEvents,
	getEventById,
	updateEventDetails,
	deleteEvent,
	addEventPoster,
	removeEventPoster,
	getEventStats,
	getEventRegistrations,
} from '../controllers/event.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';
import { body, param } from 'express-validator';
import normalizeEventPayload from '../middlewares/normalizeEvent.middleware.js';
import { registerForEvent } from '../controllers/ticket.controller.js';

const router = Router();
const { protect, authorize } = authMiddleware;

//================================================================================
// --- Public Routes ---
//================================================================================

// Get all events with filtering, sorting, and pagination
router.get('/', getAllEvents);

// Get a single event by its ID
router.get(
	'/:id',
	validate([param('id').isMongoId().withMessage('Invalid event ID')]),
	getEventById
);

// Register (internal) - public
router.post(
	'/:id/register',
	validate([
		param('id').isMongoId().withMessage('Invalid event ID'),
		body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
		body('email').isEmail().withMessage('Valid email is required'),
		body('phone').notEmpty().withMessage('Phone is required'),
		body('lpuId').notEmpty().withMessage('LPU ID is required'),
		body('gender')
			.isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
			.withMessage('Invalid gender'),
		body('course').notEmpty().withMessage('Course is required'),
		body('hosteler').optional().isBoolean(),
		body('hostel')
			.optional()
			.if(body('hosteler').equals('true'))
			.notEmpty()
			.withMessage('Hostel is required for hosteler attendees'),
	]),
	registerForEvent
);

//================================================================================
// --- Admin-Only Routes ---
//================================================================================

router.use(protect, authorize('admin'));

// --- Analytics & Reports ---
router.get('/admin/statistics', getEventStats);

router.get(
	'/:id/registrations',
	validate([param('id').isMongoId().withMessage('Invalid event ID')]),
	getEventRegistrations
);

// --- Core Event Management ---
router.post(
	'/',
	uploadFile('posters'), // Handles multiple poster uploads via the custom middleware
	normalizeEventPayload, // normalize frontend aliases before validation
	validate([
		body('title').notEmpty().trim().withMessage('Title is required'),
		body('description').notEmpty().trim().withMessage('Description is required'),
		body('eventDate')
			.notEmpty()
			.withMessage('Event date is required')
			.bail()
			.isISO8601()
			.withMessage('Event date must be a valid ISO-8601 date/time'),
		body('venue').notEmpty().trim().withMessage('Venue is required'),
		body('category').notEmpty().trim().withMessage('Category is required'),
		body('tags').optional().isArray().withMessage('Tags must be an array'),
		body('totalSpots').optional().isInt({ min: 0 }).toInt(),
		body('ticketPrice').optional().isFloat({ min: 0 }).toFloat(),
		body('registration.mode')
			.optional()
			.isIn(['internal', 'external', 'none'])
			.withMessage('Invalid registration.mode'),
		body('registration.externalUrl')
			.optional()
			.isURL()
			.withMessage('registration.externalUrl must be a valid URL'),
	]),
	createEvent
);

router.patch(
	'/:id/details',
	normalizeEventPayload, // map date/location aliases before validation
	validate([
		param('id').isMongoId().withMessage('Invalid event ID'),
		body('eventDate').optional().isISO8601().withMessage('Invalid date format'),
		body('venue').optional().trim(),
		body('title').optional().trim().isLength({ min: 1 }),
		body('description').optional().trim().isLength({ min: 1 }),
		body('category').optional().trim(),
		body('tags').optional().isArray(),
		body('status')
			.optional()
			.isIn(['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed']),
	]),
	updateEventDetails
);

router.delete(
	'/:id',
	validate([param('id').isMongoId().withMessage('Invalid event ID')]),
	deleteEvent
);

// --- Poster Management ---
router.post(
	'/:id/posters',
	uploadFile('poster'), // Handles a single poster upload
	validate([param('id').isMongoId().withMessage('Invalid event ID')]),
	addEventPoster
);

router.delete(
	'/:id/posters/:publicId',
	validate([
		param('id').isMongoId().withMessage('Invalid event ID'),
		param('publicId').notEmpty().withMessage('Poster public ID is required'),
	]),
	removeEventPoster
);

export default router;

import { Router } from "express";
import {
    createEvent,
    updateEvent,
    getAllEvents,
    getEventById,
    deleteEvent,
    getUpcomingEvent
} from '../controllers/event.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';
import { body, param } from 'express-validator';

const router = Router();

// Create Event
router.post(
    '/create',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('date').notEmpty().withMessage('Date is required').isISO8601().withMessage('Date must be valid'),
        body('venue').notEmpty().withMessage('Venue is required'),
    ]),
    createEvent
);

// Get Upcoming Events
router.get(
    '/upcoming-event',
    getUpcomingEvent
);

// Update Event
router.put(
    '/:id/update',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    uploadFile('posters'),
    updateEvent
);

// Get All Events (optionally filter by status)
router.get(
    '/getall',
    getAllEvents
);

// Get Event By ID
router.get(
    '/by-id/:id',
    validate([
        param('id').isMongoId().withMessage('Invalid event ID')
    ]),
    getEventById
);

// Delete Event
router.delete(
    '/:id/delete',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        param('id').isMongoId().withMessage('Invalid event ID')
    ]),
    deleteEvent
);

export default router;
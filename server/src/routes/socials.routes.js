import { Router } from 'express';
import {
	createPost,
	getAllPosts,
	getPostById,
	deletePost,
} from '../controllers/socials.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';
import { body, param } from 'express-validator';

const router = Router();
const { protect, authorize } = authMiddleware;

// --- Public Routes ---

// Apply 'protect' middleware to routes that require authentication
router.get('/', getAllPosts);

// Get a single post by ID
router.get('/:id', validate([param('id').isMongoId().withMessage('Invalid post ID')]), getPostById);

// --- Admin-Only Routes ---

// Create a new post
router.post(
	'/',
	protect,
	authorize('admin'),
	uploadFile('media'), // Expects a field named 'media'
	validate([
		// Title/content are optional here (controller enforces at least one of title/content/files).
		body('title')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 1, max: 200 })
			.withMessage('Title must be 1-200 characters'),
		body('content')
			.optional()
			.isString()
			.trim()
			.isLength({ min: 1, max: 5000 })
			.withMessage('Content must be 1-5000 characters'),
		body('status').optional().isIn(['published', 'draft']),
	]),
	createPost
);

// Delete a post by ID
router.delete(
	'/:id',
	protect,
	authorize('admin'),
	validate([param('id').isMongoId().withMessage('Invalid post ID')]),
	deletePost
);

export default router;

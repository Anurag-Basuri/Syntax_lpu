import { Router } from "express";
import {
    registerMember,
    loginMember,
    logoutMember,
    resetPassword,
    updateProfile,
    updateMemberByAdmin,
    uploadProfilePicture,
    uploadResume,
    getCurrentMember,
    getLeaders,
    sendResetPasswordEmail,
    getAllMembers,
    banMember,
    removeMember,
    unbanMember
} from '../controllers/member.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validator.middleware.js';
import { uploadFile } from '../middlewares/multer.middleware.js';
import { body, param } from 'express-validator';

const router = Router();

// Get all members
router.get(
    '/getall',
    getAllMembers
);

// Get Leaders
router.get(
    '/getleaders',
    getLeaders
);

// Register Member
router.post(
    '/register',
    validate([
        body('fullname').notEmpty().withMessage('Full name is required'),
        body('LpuId').notEmpty().withMessage('LPU ID is required'),
        body('department').notEmpty().withMessage('Department is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ]),
    registerMember
);

// Login Member
router.post(
    '/login',
    validate([
        body('password').notEmpty().withMessage('Password is required')
    ]),
    loginMember
);

// Logout Member
router.post(
    '/logout',
    authMiddleware.verifyToken,
    authMiddleware.isMember,
    logoutMember
);

// Reset Password
router.post(
    '/reset-password',
    validate([
        body('LpuId').notEmpty().withMessage('LPU ID is required'),
        body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    ]),
    resetPassword
);

// Update Profile
router.put(
    '/:id/update',
    authMiddleware.verifyToken,
    authMiddleware.isMember,
    validate([
        param('id').isMongoId().withMessage('Invalid member ID'),
        body('email').optional().isEmail().withMessage('Invalid email format'),
        body('phone').optional().isString().withMessage('Invalid phone number format'),
        body('program').optional().isString().withMessage('Invalid program format'),
        body('year').optional().isInt({ min: 1, max: 5 }).withMessage('Invalid year format'),
        body('skills').optional().isArray({ max: 15 }).withMessage('Skills must be an array with a maximum of 15 items'),
        body('hosteler').optional().isBoolean().withMessage('Invalid hosteler format'),
        body('hostel').optional().isString().withMessage('Invalid hostel format'),
        body('socialLinks.*.platform')
            .if(body('socialLinks').exists())
            .notEmpty().withMessage('Platform is required')
            .isString().withMessage('Platform must be a string'),
        body('socialLinks.*.url')
            .if(body('socialLinks').exists())
            .notEmpty().withMessage('URL is required')
            .isString().withMessage('URL must be a string')
            .matches(/^https?:\/\/.*$/).withMessage('Invalid URL format'),
        body('bio').optional().isString().withMessage('Invalid bio format')
    ]),
    updateProfile
);

// Update Member by Admin
router.put(
    '/:id/admin',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        param('id').isMongoId().withMessage('Invalid member ID')
    ]),
    updateMemberByAdmin
);

// Upload Profile Picture
router.post(
    '/:id/profile-picture',
    authMiddleware.verifyToken,
    authMiddleware.isMember,
    uploadFile('profilePicture'),
    validate([
        param('id').isMongoId().withMessage('Invalid member ID')
    ]),
    uploadProfilePicture
);

// Upload Resume
router.post(
    '/:id/resume',
    authMiddleware.verifyToken,
    authMiddleware.isMember,
    uploadFile('resume'),
    validate([
        param('id').isMongoId().withMessage('Invalid member ID')
    ]),
    uploadResume
);

// Get Current Member
router.get(
    '/me',
    authMiddleware.verifyToken,
    authMiddleware.isMember,
    getCurrentMember
);

// Send Password Reset Email
router.post(
    '/send-reset-email',
    validate([
        body('email').notEmpty().withMessage('Email is required')
    ]),
    sendResetPasswordEmail
);

// Ban Member (admin only)
router.put(
    '/:id/ban',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        param('id').isMongoId().withMessage('Invalid member ID'),
        body('reason').notEmpty().withMessage('Ban reason is required'),
        body('reviewTime').optional().isISO8601().withMessage('Review time must be a valid date')
    ]),
    banMember
);

// Remove Member (admin only)
router.put(
    '/:id/remove',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        param('id').isMongoId().withMessage('Invalid member ID'),
        body('reason').notEmpty().withMessage('Remove reason is required'),
        body('reviewTime').optional().isISO8601().withMessage('Review time must be a valid date')
    ]),
    removeMember
);

// Unban Member (admin only)
router.put(
    '/:id/unban',
    authMiddleware.verifyToken,
    authMiddleware.isAdmin,
    validate([
        param('id').isMongoId().withMessage('Invalid member ID')
    ]),
    unbanMember
);

export default router;
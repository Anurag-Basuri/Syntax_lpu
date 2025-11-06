import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Member from '../models/member.model.js';
import Admin from '../models/admin.model.js';

// Middleware to protect routes and ensure the user is authenticated
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Extract token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        throw ApiError.Unauthorized('No token provided. Please log in.');
    }

    // 2. Verify the token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw ApiError.Unauthorized('Your session has expired. Please log in again.');
        }
        throw ApiError.Unauthorized('Invalid token. Please log in again.');
    }

    // 3. Check if user still exists and is active
    let currentUser;
    if (decoded.role === 'admin') {
        currentUser = await Admin.findById(decoded.id);
    } else if (decoded.role === 'member') {
        currentUser = await Member.findById(decoded.id);

        // For members, check if their status is active
        if (currentUser && currentUser.status !== 'active') {
            throw ApiError.Forbidden(
                `Your account is currently ${currentUser.status}. Access denied.`
            );
        }
    }

    if (!currentUser) {
        throw ApiError.Unauthorized(
            'The user belonging to this token no longer exists.'
        );
    }

    // 4. Grant access and attach user to the request
    req.user = currentUser;
    next();
});

// Middleware to authorize based on user roles
const authorize = (...roles) => {
    return (req, res, next) => {
        // The 'protect' middleware must run first to attach req.user
        if (!req.user) {
            throw ApiError.InternalServerError(
                'User object not found. Ensure `protect` middleware runs before `authorize`.'
            );
        }

        const userRoles = [req.user.role, ...(req.user.designation || [])].filter(Boolean);

        const hasAccess = roles.some((role) => userRoles.includes(role));

        if (!hasAccess) {
            throw ApiError.Forbidden(
                `Access denied. You need one of the following roles: ${roles.join(', ')}`
            );
        }

        next();
    };
};

export const authMiddleware = {
    protect,
    authorize,
};

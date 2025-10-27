import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Member from '../models/member.model.js';
import Admin from '../models/admin.model.js';

const verifyToken = asyncHandler(async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new ApiError(401, 'Unauthorized: Token not provided');
	}

	const token = authHeader.split(' ')[1];

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		req.user = decoded; // Contains id and role
		next();
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			throw new ApiError(401, 'Token expired');
		} else {
			throw new ApiError(403, 'Invalid token');
		}
	}
});

const isAdmin = asyncHandler(async (req, res, next) => {
	const admin = await Admin.findById(req.user.id);
	if (!admin) {
		throw new ApiError(403, 'Access denied: Admins only');
	}
	req.admin = admin;
	next();
});

const isMember = asyncHandler(async (req, res, next) => {
    const member = await Member.findById(req.user.id);
    if (!member) {
        throw new ApiError(403, 'Access denied: Members only');
    }
    req.member = member;
    next();
});

export const authMiddleware = {
	verifyToken,
	isAdmin,
	isMember,
};

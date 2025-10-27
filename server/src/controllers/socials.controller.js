import Social from '../models/socials.model.js';
import { ApiError } from '../utils/ApiError.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadFile, deleteFile } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Get all socials with pagination
const getSocials = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const options = {
        page: Number(page),
        limit: Number(limit),
        sort: { createdAt: -1 },
        populate: { path: 'userId', select: 'fullname profilePicture' }
    };

    try {
        const socials = await Social.getPaginatedSocials(page, limit);
        return res
            .status(200)
            .json(
                ApiResponse.success(
                    200,
                    'Social posts fetched successfully',
                    socials
                )
            );
    } catch (error) {
        throw new ApiError.internal('Failed to fetch social posts', [error.message]);
    }
});

// Create a new social post
const createSocial = asyncHandler(async (req, res) => {
	const { userId, content } = req.body;
	const files = req.files;

	if (!userId || !content) {
		throw ApiError.badRequest('User ID and content are required');
	}

	if (!files || files.length === 0) {
		throw ApiError.badRequest('At least one file is required');
	}

	if (files.length > 5) {
		throw ApiError.badRequest('You can upload a maximum of 5 files');
	}

	const cloudinaryUploads = await Promise.all(files.map(file => uploadFile(file)));

	const images = cloudinaryUploads
		.filter(file => file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
		.map(file => ({
			url: file.url,
			publicId: file.public_id,
		}));

	const videos = cloudinaryUploads
		.filter(file => file.url.match(/\.(mp4|webm|ogg)$/i))
		.map(file => ({
			url: file.url,
			publicId: file.public_id,
		}));

	const social = new Social({
		userId: mongoose.Types.ObjectId(userId),
		content,
		images,
		videos,
	});

	await social.save();

	return res
		.status(201)
		.json(
            ApiResponse.success(
                201,
                'Social post created successfully',
                social
            )
        );
});

// Delete a social post
const deleteSocial = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!id || !mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.badRequest('Valid social post ID is required');
	}

	const social = await Social.findById(id);
	if (!social) {
		throw ApiError.notFound('Social post not found');
	}

	const allFiles = [
		...(social.images || []),
		...(social.videos || []),
	];

	await Promise.all(allFiles.map(async file => {
		if (file.publicId) {
			await deleteFile(file.publicId);
		}
	}));

	await social.deleteOne();

	return res
		.status(200)
		.json(
            ApiResponse.success('Social post deleted successfully')
        );
});

export {
    getSocials,
    createSocial,
    deleteSocial
}

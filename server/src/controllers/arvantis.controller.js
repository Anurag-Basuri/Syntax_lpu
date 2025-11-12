import Arvantis from '../models/arvantis.model.js';
import Event from '../models/event.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { uploadFile, deleteFile, deleteFiles } from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import { Parser } from 'json2csv';

// --- Helper Function to find a fest by slug or year ---
const findFestBySlugOrYear = async (identifier, populate = false) => {
	// if identifier looks like a 4-digit year, treat it as year (number)
	const isYear = /^\d{4}$/.test(String(identifier));
	const query = isYear ? { year: parseInt(identifier, 10) } : { slug: identifier };
	let festQuery = Arvantis.findOne(query);

	if (populate) {
		// populate minimal event fields that match the Event model
		festQuery = festQuery.populate({
			path: 'events',
			select: 'title eventDate category',
		});
	}

	const fest = await festQuery;
	if (!fest) {
		throw new ApiError.NotFound(`Fest with identifier '${identifier}' not found.`);
	}
	return fest;
};

// --- Frontend-Specific Controllers ---

// Get landing page data: current or most recent fest
const getLandingPageData = asyncHandler(async (req, res) => {
	const currentYear = new Date().getFullYear();
	let fest;

	// 1. Try to find the current year's fest if it's upcoming or ongoing
	fest = await Arvantis.findOne({
		year: currentYear,
		status: { $in: ['upcoming', 'ongoing'] },
	}).select('name year slug description status poster gallery');

	// 2. If not found, find the most recent 'completed' fest
	if (!fest) {
		fest = await Arvantis.findOne({ status: 'completed' })
			.sort({ year: -1 })
			.select('name year slug description status poster gallery');
	}

	if (!fest) {
		return ApiResponse.success(res, null, 'No active or past fest data available.');
	}

	return ApiResponse.success(res, fest, 'Landing page data retrieved successfully.');
});

// --- Core Fest Management ---

// Create a new Arvantis fest
const createFest = asyncHandler(async (req, res) => {
	const { name, year, description, startDate, endDate, status } = req.body;

	const existingFest = await Arvantis.findOne({ year });
	if (existingFest) {
		throw new ApiError.Conflict(`A fest for the year ${year} already exists.`);
	}

	const fest = await Arvantis.create({ name, year, description, startDate, endDate, status });
	return ApiResponse.success(res, fest, 'Fest created successfully', 201);
});

// Get all fests with pagination
const getAllFests = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, sortBy = 'year', sortOrder = 'desc' } = req.query;
	const options = {
		page: parseInt(page, 10),
		limit: parseInt(limit, 10),
		sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
		lean: true,
	};

	const aggregate = Arvantis.aggregate([
		{ $project: { name: 1, year: 1, slug: 1, status: 1, startDate: 1, endDate: 1 } },
	]);
	const fests = await Arvantis.aggregatePaginate(aggregate, options);

	return ApiResponse.paginated(res, fests.docs, fests, 'Fests retrieved successfully');
});

// Get fest details by slug or year
const getFestDetails = asyncHandler(async (req, res) => {
	const fest = await findFestBySlugOrYear(req.params.identifier, true);
	return ApiResponse.success(res, fest, 'Fest details retrieved successfully');
});

// Update fest details
const updateFestDetails = asyncHandler(async (req, res) => {
	const fest = await findFestBySlugOrYear(req.params.identifier);
	Object.assign(fest, req.body);
	await fest.save({ validateBeforeSave: true });
	return ApiResponse.success(res, fest, 'Fest details updated successfully');
});

// Delete a fest and all associated media
const deleteFest = asyncHandler(async (req, res) => {
	const fest = await findFestBySlugOrYear(req.params.identifier);

	// Collect all media publicIds for deletion (Cloudinary expects public_id)
	const mediaToDelete = [];
	if (fest.poster?.publicId) {
		mediaToDelete.push({
			public_id: fest.poster.publicId,
			resource_type: fest.poster.resource_type || 'image',
		});
	}
	(fest.gallery || []).forEach((item) => {
		if (item?.publicId) {
			mediaToDelete.push({
				public_id: item.publicId,
				resource_type: item.resource_type || 'image',
			});
		}
	});
	(fest.partners || []).forEach((p) => {
		if (p.logo?.publicId) {
			mediaToDelete.push({
				public_id: p.logo.publicId,
				resource_type: p.logo.resource_type || 'image',
			});
		}
	});

	// Delete all associated media from Cloudinary (ignore errors inside deleteFiles)
	if (mediaToDelete.length > 0) {
		await deleteFiles(mediaToDelete);
	}

	await Arvantis.findByIdAndDelete(fest._id);
	return ApiResponse.success(
		res,
		null,
		'Fest and all associated media deleted successfully',
		204
	);
});

// --- Partner Management ---

// Add a new partner (sponsor or collaborator) to a fest
const addPartner = asyncHandler(async (req, res) => {
	const { name, website, tier } = req.body;
	const fest = await findFestBySlugOrYear(req.params.identifier);

	if (!req.file) throw new ApiError.BadRequest('Partner logo is required.');

	const logoFile = await uploadFile(req.file, { folder: `arvantis/${fest.year}/partners` });
	const newPartner = {
		name,
		website,
		tier,
		logo: {
			url: logoFile.url,
			publicId: logoFile.publicId,
			resource_type: logoFile.resource_type,
		},
	};

	fest.partners.push(newPartner);
	await fest.save();
	return ApiResponse.success(res, fest.partners, 'Partner added successfully', 201);
});

// Remove a partner from a fest
const removePartner = asyncHandler(async (req, res) => {
	const { identifier, partnerName } = req.params;
	const fest = await findFestBySlugOrYear(identifier);

	const partnerIndex = fest.partners.findIndex((p) => p.name === partnerName);
	if (partnerIndex === -1) {
		throw new ApiError.NotFound(`Partner '${partnerName}' not found.`);
	}

	const [removedPartner] = fest.partners.splice(partnerIndex, 1);
	if (removedPartner.logo?.publicId) {
		await deleteFile({
			public_id: removedPartner.logo.publicId,
			resource_type: removedPartner.logo.resource_type || 'image',
		});
	}
	await fest.save();

	return ApiResponse.success(res, null, 'Partner removed successfully');
});

// --- Event Linking ---

// Link an event to a fest
const linkEventToFest = asyncHandler(async (req, res) => {
	const { eventId } = req.body;
	const fest = await findFestBySlugOrYear(req.params.identifier);

	if (!mongoose.isValidObjectId(eventId) || !(await Event.findById(eventId))) {
		throw new ApiError.NotFound('Event not found with the provided ID.');
	}
	// avoid duplicates (compare string ids)
	if ((fest.events || []).some((e) => String(e) === String(eventId))) {
		throw new ApiError.Conflict('This event is already linked to the fest.');
	}

	fest.events.push(eventId);
	await fest.save();
	return ApiResponse.success(res, fest.events, 'Event linked successfully');
});

// Unlink an event from a fest
const unlinkEventFromFest = asyncHandler(async (req, res) => {
	const { identifier, eventId } = req.params;
	const fest = await findFestBySlugOrYear(identifier);
	fest.events.pull(eventId);
	await fest.save();
	return ApiResponse.success(res, fest.events, 'Event unlinked successfully');
});

// --- Media Management (Poster & Gallery) ---

// Update fest poster
const updateFestPoster = asyncHandler(async (req, res) => {
	const fest = await findFestBySlugOrYear(req.params.identifier);
	if (!req.file) throw new ApiError.BadRequest('Poster file is required.');

	// remove previous poster if present
	if (fest.poster?.publicId) {
		await deleteFile({
			public_id: fest.poster.publicId,
			resource_type: fest.poster.resource_type || 'image',
		});
	}

	const posterFile = await uploadFile(req.file, { folder: `arvantis/${fest.year}` });
	fest.poster = {
		url: posterFile.url,
		publicId: posterFile.publicId,
		resource_type: posterFile.resource_type,
	};
	await fest.save();

	return ApiResponse.success(res, fest.poster, 'Fest poster updated successfully');
});

// Add media items to the gallery
const addGalleryMedia = asyncHandler(async (req, res) => {
	const fest = await findFestBySlugOrYear(req.params.identifier);
	if (!req.files?.length) throw new ApiError.BadRequest('At least one media file is required.');

	const uploadPromises = req.files.map((file) =>
		uploadFile(file, { folder: `arvantis/${fest.year}/gallery` })
	);
	const uploadedFiles = await Promise.all(uploadPromises);

	const newMediaItems = uploadedFiles.map((file) => ({
		url: file.url,
		publicId: file.publicId,
		resource_type: file.resource_type,
	}));

	fest.gallery.push(...newMediaItems);
	await fest.save();
	return ApiResponse.success(res, fest.gallery, 'Gallery media added successfully', 201);
});

// Remove a media item from the gallery
const removeGalleryMedia = asyncHandler(async (req, res) => {
	const { identifier, publicId } = req.params;
	const fest = await findFestBySlugOrYear(identifier);

	const mediaIndex = fest.gallery.findIndex((item) => item.publicId === publicId);
	if (mediaIndex === -1) throw new ApiError.NotFound('Media item not found in the gallery.');

	const [mediaItem] = fest.gallery.splice(mediaIndex, 1);
	await deleteFile({ public_id: mediaItem.publicId, resource_type: mediaItem.resource_type });
	await fest.save();

	return ApiResponse.success(res, null, 'Gallery media removed successfully');
});

// --- Data Export & Analytics ---

// Export all fests data as CSV
const exportFestsCSV = asyncHandler(async (req, res) => {
	const fests = await Arvantis.find().sort({ year: -1 }).lean();
	if (fests.length === 0) throw new ApiError.NotFound('No fest data to export.');

	const fields = [
		{ label: 'Year', value: 'year' },
		{ label: 'Name', value: 'name' },
		{ label: 'Status', value: 'status' },
		{ label: 'Start Date', value: 'startDate' },
		{ label: 'End Date', value: 'endDate' },
		{ label: 'Events Count', value: (row) => row.events?.length || 0 },
		{ label: 'Partners Count', value: (row) => row.partners?.length || 0 },
	];
	const json2csvParser = new Parser({ fields });
	const csv = json2csvParser.parse(fests);

	res.header('Content-Type', 'text/csv');
	res.attachment(`arvantis-fests-export-${new Date().toISOString()}.csv`);
	res.send(csv);
});

// Get high-level statistics about all fests
const getFestStatistics = asyncHandler(async (req, res) => {
	const stats = await Arvantis.aggregate([
		{
			$facet: {
				totalFests: [{ $count: 'count' }],
				statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
				totalPartners: [
					{ $project: { partnerCount: { $size: '$partners' } } },
					{ $group: { _id: null, total: { $sum: '$partnerCount' } } },
				],
				totalEvents: [
					{ $project: { eventCount: { $size: '$events' } } },
					{ $group: { _id: null, total: { $sum: '$eventCount' } } },
				],
			},
		},
		{
			$project: {
				totalFests: { $arrayElemAt: ['$totalFests.count', 0] },
				statusCounts: '$statusCounts',
				totalPartners: { $arrayElemAt: ['$totalPartners.total', 0] },
				totalEvents: { $arrayElemAt: ['$totalEvents.total', 0] },
			},
		},
	]);

	const formattedStats = {
		totalFests: stats[0].totalFests || 0,
		totalPartners: stats[0].totalPartners || 0,
		totalEvents: stats[0].totalEvents || 0,
		statusCounts: (stats[0].statusCounts || []).reduce((acc, curr) => {
			acc[curr._id] = curr.count;
			return acc;
		}, {}),
	};

	return ApiResponse.success(res, formattedStats, 'Fest statistics retrieved successfully.');
});

// Get year-over-year analytics data
const getFestAnalytics = asyncHandler(async (req, res) => {
	const analytics = await Arvantis.aggregate([
		{ $sort: { year: 1 } },
		{
			$project: {
				_id: 0,
				year: '$year',
				eventCount: { $size: '$events' },
				partnerCount: { $size: '$partners' },
				sponsorCount: {
					$size: {
						$filter: {
							input: '$partners',
							as: 'p',
							cond: { $eq: ['$$p.tier', 'sponsor'] }, // best-effort mapping
						},
					},
				},
				collaboratorCount: {
					$size: {
						$filter: {
							input: '$partners',
							as: 'p',
							cond: { $eq: ['$$p.tier', 'collaborator'] },
						},
					},
				},
			},
		},
	]);

	return ApiResponse.success(res, analytics, 'Fest analytics retrieved successfully.');
});

// Generate a detailed report for a single fest
const generateFestReport = asyncHandler(async (req, res) => {
	const fest = await findFestBySlugOrYear(req.params.identifier, true);
	// Keep report minimal but useful
	const report = {
		festDetails: {
			name: fest.name,
			year: fest.year,
			status: fest.status,
			startDate: fest.startDate,
			endDate: fest.endDate,
			location: fest.location || null,
		},
		events: fest.events,
		partners: fest.partners.map((p) => ({ name: p.name, tier: p.tier, website: p.website })),
	};
	return ApiResponse.success(res, report, 'Fest report generated successfully.');
});

export {
	getLandingPageData,
	createFest,
	getAllFests,
	getFestDetails,
	updateFestDetails,
	deleteFest,
	addPartner,
	removePartner,
	linkEventToFest,
	unlinkEventFromFest,
	updateFestPoster,
	addGalleryMedia,
	removeGalleryMedia,
	exportFestsCSV,
	getFestStatistics,
	getFestAnalytics,
	generateFestReport,
};

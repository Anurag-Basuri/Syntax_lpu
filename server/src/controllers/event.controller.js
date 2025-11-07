import Event from '../models/event.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadFile, deleteFile, deleteFiles } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Helper to find an event by its ID
const findEventById = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, 'Invalid event ID format.');
	}
	const event = await Event.findById(id);
	if (!event) {
		throw new ApiError(404, 'Event not found.');
	}
	return event;
};

// Create a new event
const createEvent = asyncHandler(async (req, res) => {
	const {
		title,
		description,
		eventDate,
		venue,
		organizer,
		category,
		tags,
		totalSpots,
		ticketPrice,
		registrationOpenDate,
		registrationCloseDate,
	} = req.body;

	if (!req.files || req.files.length === 0) {
		throw new ApiError(400, 'At least one event poster is required.');
	}

	const posterUploadPromises = req.files.map((file) =>
		uploadFile(file, { folder: 'events/posters' })
	);
	const uploadedPosters = await Promise.all(posterUploadPromises);

	const newEvent = await Event.create({
		title,
		description,
		eventDate: new Date(eventDate),
		venue,
		organizer,
		category,
		posters: uploadedPosters,
		tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
		totalSpots,
		ticketPrice,
		registrationOpenDate: registrationOpenDate ? new Date(registrationOpenDate) : null,
		registrationCloseDate: registrationCloseDate ? new Date(registrationCloseDate) : null,
	});

	return ApiResponse.success(res, newEvent, 'Event created successfully', 201);
});

// Get all events with filtering, sorting, and pagination
const getAllEvents = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		status,
		search,
		period, // 'upcoming', 'past'
		sortBy = 'eventDate',
		sortOrder = 'asc',
	} = req.query;

	const pipeline = [];
	const matchStage = {};
	const now = new Date();

	if (search) matchStage.$text = { $search: search.trim() };
	if (status) matchStage.status = status;
	if (period === 'upcoming') matchStage.eventDate = { $gte: now };
	if (period === 'past') matchStage.eventDate = { $lt: now };

	if (Object.keys(matchStage).length > 0) {
		pipeline.push({ $match: matchStage });
	}

	// Add a field for the count of registered users instead of populating
	pipeline.push({
		$addFields: {
			registeredUsersCount: { $size: '$registeredUsers' },
		},
	});

	// Project the final fields to send in the response
	pipeline.push({
		$project: {
			title: 1,
			eventDate: 1,
			venue: 1,
			category: 1,
			status: 1,
			ticketPrice: 1,
			posters: { $slice: ['$posters', 1] }, // Only get the first poster for list view
			registeredUsersCount: 1,
		},
	});

	const aggregate = Event.aggregate(pipeline);
	const options = {
		page: parseInt(page, 10),
		limit: parseInt(limit, 10),
		sort: { [sortBy]: sortOrder === 'asc' ? 1 : 1 },
		lean: true,
	};

	const events = await Event.aggregatePaginate(aggregate, options);
	return ApiResponse.paginated(res, events.docs, events, 'Events retrieved successfully');
});

// Get a single event by ID
const getEventById = asyncHandler(async (req, res) => {
	const event = await findEventById(req.params.id);
	await event.populate('registeredUsers', 'fullname email LpuId');
	return ApiResponse.success(res, event, 'Event retrieved successfully');
});

// Update an existing event's details
const updateEventDetails = asyncHandler(async (req, res) => {
	const event = await findEventById(req.params.id);
	Object.assign(event, req.body);
	const updatedEvent = await event.save();
	return ApiResponse.success(res, updatedEvent, 'Event details updated successfully');
});

// Delete an event
const deleteEvent = asyncHandler(async (req, res) => {
	const event = await findEventById(req.params.id);

	if (event.posters && event.posters.length > 0) {
		const mediaToDelete = event.posters.map((p) => ({
			public_id: p.publicId,
			resource_type: p.resource_type,
		}));
		await deleteFiles(mediaToDelete);
	}

	await Event.findByIdAndDelete(req.params.id);
	return ApiResponse.success(res, null, 'Event deleted successfully', 204);
});

// --- Poster Management ---

// Add a new poster to an event
const addEventPoster = asyncHandler(async (req, res) => {
	const event = await findEventById(req.params.id);
	if (!req.file) throw new ApiError(400, 'Poster file is required.');

	const poster = await uploadFile(req.file, { folder: 'events/posters' });
	event.posters.push(poster);
	await event.save();

	return ApiResponse.success(res, event.posters, 'Poster added successfully', 201);
});

// Remove a poster from an event by its publicId
const removeEventPoster = asyncHandler(async (req, res) => {
	const { id, publicId } = req.params;
	const event = await findEventById(id);

	const posterIndex = event.posters.findIndex((p) => p.publicId === publicId);
	if (posterIndex === -1) throw new ApiError(404, 'Poster not found on this event.');

	const [removedPoster] = event.posters.splice(posterIndex, 1);
	await deleteFile({
		public_id: removedPoster.publicId,
		resource_type: removedPoster.resource_type,
	});
	await event.save();

	return ApiResponse.success(res, null, 'Poster removed successfully');
});

// --- Analytics & Registrations ---

// Get statistics about all events
const getEventStats = asyncHandler(async (req, res) => {
	const stats = await Event.aggregate([
		{
			$facet: {
				byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
				totalRegistrations: [
					{ $group: { _id: null, total: { $sum: { $size: '$registeredUsers' } } } },
				],
				totalEvents: [{ $count: 'count' }],
			},
		},
		{
			$project: {
				totalEvents: { $ifNull: [{ $arrayElemAt: ['$totalEvents.count', 0] }, 0] },
				totalRegistrations: {
					$ifNull: [{ $arrayElemAt: ['$totalRegistrations.total', 0] }, 0],
				},
				statusCounts: {
					$arrayToObject: {
						$map: {
							input: '$byStatus',
							as: 'status',
							in: { k: '$$status._id', v: '$$status.count' },
						},
					},
				},
			},
		},
	]);

	return ApiResponse.success(res, stats[0], 'Event statistics retrieved successfully.');
});

// Get a list of all users registered for a specific event
const getEventRegistrations = asyncHandler(async (req, res) => {
	const event = await findEventById(req.params.id);
	await event.populate({
		path: 'registeredUsers',
		select: 'fullname email LpuId department',
	});

	return ApiResponse.success(
		res,
		event.registeredUsers,
		'Successfully retrieved event registrations.'
	);
});

export {
	createEvent,
	getAllEvents,
	getEventById,
	updateEventDetails,
	deleteEvent,
	addEventPoster,
	removeEventPoster,
	getEventStats,
	getEventRegistrations,
};

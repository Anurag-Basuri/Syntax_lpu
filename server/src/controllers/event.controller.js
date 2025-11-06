import Event from '../models/event.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadFile, deleteFile } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Helper to parse and combine date and time into a single Date object
const parseEventDate = (date, time) => {
	if (!date || !time) {
		throw ApiError.BadRequest('Both date and time are required to set the event date.');
	}
	const eventDateTime = new Date(`${date}T${time}`);
	if (isNaN(eventDateTime.getTime())) {
		throw ApiError.BadRequest(
			'Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time.'
		);
	}
	return eventDateTime;
};

// Create a new event
const createEvent = asyncHandler(async (req, res) => {
	const {
		title,
		description,
		date, // YYYY-MM-DD
		time, // HH:MM (24-hour format)
		venue,
		organizer,
		category,
		tags,
		totalSpots,
		ticketPrice,
		registrationOpenDate,
		registrationCloseDate,
	} = req.body;

	// --- Validation ---
	const requiredFields = { title, description, date, time, venue, organizer, category };
	const missingFields = Object.entries(requiredFields)
		.filter(([_, value]) => !value)
		.map(([key]) => key);

	if (missingFields.length > 0) {
		throw ApiError.BadRequest(`Missing required fields: ${missingFields.join(', ')}`);
	}

	if (!req.files || req.files.length === 0) {
		throw ApiError.BadRequest('At least one event poster is required.');
	}

	// The uploadFile utility now handles local file deletion, so no need for manual fs.unlinkSync
	const posterUploadPromises = req.files.map((file) => uploadFile(file));
	const uploadedPosters = await Promise.all(posterUploadPromises);

	// --- Data Preparation ---
	const eventDate = parseEventDate(date, time);
	const tagsArray = tags ? tags.split(',').map((tag) => tag.trim()) : [];

	// --- Database Creation ---
	const newEvent = await Event.create({
		title,
		description,
		eventDate,
		venue,
		organizer,
		category,
		posters: uploadedPosters, // Already in { url, publicId } format
		tags: tagsArray,
		totalSpots: totalSpots ? parseInt(totalSpots, 10) : 0,
		ticketPrice: ticketPrice ? parseFloat(ticketPrice) : 0,
		// --- NEW: Set registration dates ---
		registrationOpenDate: registrationOpenDate ? new Date(registrationOpenDate) : null,
		registrationCloseDate: registrationCloseDate ? new Date(registrationCloseDate) : null,
	});

	return ApiResponse.success(res, { event: newEvent }, 'Event created successfully', 201);
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

	const filter = {};
	const now = new Date();

	// Text search using the index on the model
	if (search) {
		filter.$text = { $search: search.trim() };
	}

	// Filter by status
	if (status && ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'].includes(status)) {
		filter.status = status;
	}

	// Filter by period (upcoming/past)
	if (period === 'upcoming') {
		filter.eventDate = { $gte: now };
	} else if (period === 'past') {
		filter.eventDate = { $lt: now };
	}

	const pageNum = parseInt(page, 10);
	const limitNum = parseInt(limit, 10);

	const sortDirection = sortOrder === 'desc' ? -1 : 1;
	const allowedSortFields = ['eventDate', 'createdAt', 'title', 'status'];
	const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'eventDate';

	const options = {
		page: pageNum,
		limit: limitNum,
		sort: { [sortField]: sortDirection },
		lean: true,
		populate: 'registeredUsers', // Optionally populate registered users
	};

	const events = await Event.paginate(filter, options);

	return ApiResponse.paginated(
		res,
		events.docs,
		{
			totalDocs: events.totalDocs,
			totalPages: events.totalPages,
			currentPage: events.page,
			limit: events.limit,
			hasNextPage: events.hasNextPage,
			hasPrevPage: events.hasPrevPage,
		},
		'Events retrieved successfully'
	);
});

// Get a single event by ID
const getEventById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.BadRequest('Invalid event ID format');
	}

	const event = await Event.findById(id).populate('registeredUsers', 'name email'); // Populate with user details
	if (!event) {
		throw ApiError.NotFound('Event not found');
	}

	return ApiResponse.success(res, { event }, 'Event retrieved successfully');
});

// Update an existing event
const updateEvent = asyncHandler(async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.BadRequest('Invalid event ID format');
	}

	const {
		title,
		description,
		date,
		time,
		venue,
		organizer,
		category,
		tags,
		totalSpots,
		ticketPrice,
		status,
		registrationOpenDate,
		registrationCloseDate,
	} = req.body;

	const event = await Event.findById(id);
	if (!event) {
		throw ApiError.NotFound('Event not found');
	}

	// --- Handle Poster Updates ---
	if (req.files && req.files.length > 0) {
		// Delete old posters from Cloudinary
		const deletePromises = event.posters.map((poster) =>
			deleteFile({ public_id: poster.publicId, resource_type: 'image' })
		);
		await Promise.all(deletePromises);

		// Upload new posters
		const uploadPromises = req.files.map((file) => uploadFile(file));
		event.posters = await Promise.all(uploadPromises);
	}

	// --- Update Fields ---
	if (title) event.title = title;
	if (description) event.description = description;
	if (venue) event.venue = venue;
	if (organizer) event.organizer = organizer;
	if (category) event.category = category;
	if (status) event.status = status;
	if (tags) event.tags = tags.split(',').map((tag) => tag.trim());
	if (totalSpots) event.totalSpots = parseInt(totalSpots, 10);
	if (ticketPrice) event.ticketPrice = parseFloat(ticketPrice);
	if (date && time) event.eventDate = parseEventDate(date, time);
	if (registrationOpenDate) event.registrationOpenDate = new Date(registrationOpenDate);
	if (registrationCloseDate) event.registrationCloseDate = new Date(registrationCloseDate);

	const updatedEvent = await event.save();

	return ApiResponse.success(res, { event: updatedEvent }, 'Event updated successfully');
});

// Delete an event
const deleteEvent = asyncHandler(async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.BadRequest('Invalid event ID format');
	}

	const event = await Event.findById(id);
	if (!event) {
		throw ApiError.NotFound('Event not found');
	}

	// Delete posters from Cloudinary
	if (event.posters && event.posters.length > 0) {
		const deletePromises = event.posters.map((poster) =>
			deleteFile({ public_id: poster.publicId, resource_type: 'image' })
		);
		await Promise.all(deletePromises);
	}

	await Event.findByIdAndDelete(id);

	return ApiResponse.success(res, null, 'Event deleted successfully');
});

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
				totalEvents: { $arrayElemAt: ['$totalEvents.count', 0] },
				totalRegistrations: { $arrayElemAt: ['$totalRegistrations.total', 0] },
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

	const formattedStats = {
		totalEvents: stats[0]?.totalEvents || 0,
		totalRegistrations: stats[0]?.totalRegistrations || 0,
		...stats[0]?.statusCounts,
	};

	return ApiResponse.success(
		res,
		{ stats: formattedStats },
		'Event statistics retrieved successfully.'
	);
});

// Get a list of all users registered for a specific event
const getEventRegistrations = asyncHandler(async (req, res) => {
	const { id: eventId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(eventId)) {
		throw ApiError.BadRequest('Invalid event ID format');
	}

	const event = await Event.findById(eventId).populate({
		path: 'registeredUsers',
		select: 'fullname email LpuId department', // Select fields you want to show
	});

	if (!event) {
		throw ApiError.NotFound('Event not found');
	}

	return ApiResponse.success(
		res,
		{ registrations: event.registeredUsers },
		'Successfully retrieved event registrations.'
	);
});

export {
	createEvent,
	getAllEvents,
	getEventById,
	updateEvent,
	deleteEvent,
	getEventStats,
	getEventRegistrations,
};

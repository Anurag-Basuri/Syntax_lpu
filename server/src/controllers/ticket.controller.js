import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTicketQR } from '../services/qrcode.service.js';
import { sendRegistrationEmail } from '../services/email.service.js';
import { deleteFile } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Create a new ticket (event registration)
const createTicket = asyncHandler(async (req, res) => {
	const { eventId, fullName, email, phone, lpuId, gender, course, hosteler, hostel } = req.body;

	// 1. Find the event and validate its status
	const event = await Event.findById(eventId);
	if (!event) {
		throw ApiError.NotFound('The specified event does not exist.');
	}

	// If event uses external registration, instruct client to redirect
	if (event.registration?.mode === 'external') {
		throw ApiError.BadRequest(
			'This event uses an external registration flow. Redirect the user to the external URL.',
			{ externalUrl: event.registration.externalUrl }
		);
	}

	// Use model virtual to check if registration is open
	if (event.registrationStatus !== 'OPEN') {
		throw ApiError.BadRequest(
			`Registration is currently not open. Status: ${event.registrationStatus}`
		);
	}

	// Start a transaction to avoid race conditions (overbooking)
	const session = await mongoose.startSession();
	let ticket;
	try {
		await session.withTransaction(async () => {
			// Re-load the event inside the transaction for a fresh view
			const ev = await Event.findById(eventId).session(session);
			if (!ev) throw ApiError.NotFound('Event not found during registration.');

			// Check capacity (treat 0 as unlimited)
			const effectiveCap = ev.effectiveCapacity || 0;
			if (effectiveCap > 0) {
				// count currently registered (tickets stored in registeredUsers array)
				const currentCount = Array.isArray(ev.registeredUsers)
					? ev.registeredUsers.length
					: 0;
				if (currentCount >= effectiveCap) {
					throw ApiError.BadRequest('Event is full.');
				}
			}

			// Build ticket
			ticket = new Ticket({
				eventId,
				eventName: ev.title,
				fullName,
				email,
				phone,
				lpuId,
				gender,
				course,
				hosteler,
				hostel: hosteler ? hostel : undefined,
			});

			// Save ticket within transaction
			await ticket.save({ session });

			// Add ticket._id to the event.registeredUsers to reflect occupancy.
			// Note: schema historically held Member ids; using ticket ids here is intentional to track tickets.
			await Event.findByIdAndUpdate(
				eventId,
				{ $addToSet: { registeredUsers: ticket._id } },
				{ session }
			);
		});
	} catch (err) {
		// translate duplicate key into friendly message if thrown by mongoose
		if (err && err.code === 11000) {
			throw ApiError.Conflict(
				'You have already registered for this event with this Email or LPU ID.'
			);
		}
		// rethrow ApiError or other errors
		throw err;
	} finally {
		session.endSession();
	}

	// Post-create side effects (QR + email) — run outside transaction
	try {
		const qrCode = await generateTicketQR(ticket.ticketId);
		ticket.qrCode = { url: qrCode.url, publicId: qrCode.public_id };
		await ticket.save();
		await sendRegistrationEmail({
			to: ticket.email,
			name: ticket.fullName,
			eventName: ticket.eventName,
			eventDate: (await Event.findById(eventId)).eventDate,
			qrUrl: ticket.qrCode.url,
		});
		ticket.emailStatus = 'sent';
	} catch (sideEffectError) {
		console.error('Post-creation error (QR/Email):', sideEffectError.message);
		ticket.emailStatus = 'failed';
		await ticket.save();
	}

	return ApiResponse.success(
		res,
		{ ticket },
		'Registration successful! Your ticket will be sent to your email.',
		201
	);
});

// Get a ticket by its ticketId
const getTicketById = asyncHandler(async (req, res) => {
	const { ticketId } = req.params;
	const ticket = await Ticket.findOne({ ticketId }).populate('eventId', 'title eventDate venue');

	if (!ticket) {
		throw ApiError.NotFound('Ticket not found.');
	}

	return ApiResponse.success(res, { ticket }, 'Ticket retrieved successfully.');
});

// Get tickets with filtering, sorting, and pagination
const getTicketsByEvent = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, eventId, status } = req.query;

	const filter = {};
	if (eventId) {
		// ensure correct ObjectId type for aggregate matching
		try {
			filter.eventId = new mongoose.Types.ObjectId(eventId);
		} catch (e) {
			// invalid id -> force no results
			filter.eventId = null;
		}
	}
	if (status) filter.status = status;

	const options = {
		page: parseInt(page, 10),
		limit: parseInt(limit, 10),
		sort: { createdAt: -1 },
		populate: { path: 'eventId', select: 'title' },
	};

	// Build an aggregate pipeline and use the aggregate-paginate plugin (aggregatePaginate)
	const aggregate = Ticket.aggregate();
	if (Object.keys(filter).length) {
		aggregate.match(filter);
	}
	if (options.sort) {
		aggregate.sort(options.sort);
	}

	// Use aggregatePaginate provided by mongoose-aggregate-paginate-v2
	const tickets = await Ticket.aggregatePaginate(aggregate, options);

	// Return paginated response (structure stays the same as before)
	return ApiResponse.paginated(res, tickets.docs, tickets, 'Tickets retrieved successfully.');
});

// Helper: find ticket by either ticketId (business id) or _id (mongo)
const findTicketByIdentifier = async (identifier) => {
	if (!identifier) return null;
	// try as ObjectId first
	if (mongoose.isValidObjectId(identifier)) {
		const byId = await Ticket.findById(identifier);
		if (byId) return byId;
	}
	// fallback to business ticketId
	return await Ticket.findOne({ ticketId: identifier });
};

// Update ticket status
const updateTicketStatus = asyncHandler(async (req, res) => {
	const { ticketId: identifier } = req.params;
	const { status } = req.body; // Expecting 'active', 'used', or 'cancelled'

	// Validate status server-side as extra safety
	if (!['active', 'used', 'cancelled'].includes(status)) {
		throw ApiError.BadRequest("Status must be one of: 'active', 'used', 'cancelled'");
	}

	// Find ticket by _id or ticketId and update
	let ticket = null;
	if (mongoose.isValidObjectId(identifier)) {
		ticket = await Ticket.findOneAndUpdate(
			{ _id: identifier },
			{ status },
			{ new: true, runValidators: true }
		);
	}
	if (!ticket) {
		ticket = await Ticket.findOneAndUpdate(
			{ ticketId: identifier },
			{ status },
			{ new: true, runValidators: true }
		);
	}

	if (!ticket) {
		throw ApiError.NotFound('Ticket not found.');
	}

	return ApiResponse.success(res, { ticket }, 'Ticket status updated successfully.');
});

// Delete a ticket
const deleteTicket = asyncHandler(async (req, res) => {
	const { ticketId: identifier } = req.params;

	// Try delete by _id first, then by ticketId
	let ticket = null;
	if (mongoose.isValidObjectId(identifier)) {
		ticket = await Ticket.findByIdAndDelete(identifier);
	}
	if (!ticket) {
		ticket = await Ticket.findOneAndDelete({ ticketId: identifier });
	}

	if (!ticket) {
		throw ApiError.NotFound('Ticket not found.');
	}

	// Remove ticket from the event's registration list
	await Event.findByIdAndUpdate(ticket.eventId, { $pull: { registeredUsers: ticket._id } });

	// Delete QR code from Cloudinary if it exists
	if (ticket.qrCode?.publicId) {
		await deleteFile({ public_id: ticket.qrCode.publicId, resource_type: 'image' });
	}

	return ApiResponse.success(res, null, 'Ticket deleted successfully.');
});

// Check availability of email or LPU ID for an event
const checkAvailability = asyncHandler(async (req, res) => {
	const { email, lpuId, eventId } = req.body;

	if (!eventId) {
		throw ApiError.BadRequest('Event ID is required.');
	}

	const orConditions = [];
	if (email) orConditions.push({ email: email.toLowerCase().trim() });
	if (lpuId) orConditions.push({ lpuId });

	if (orConditions.length === 0) {
		throw ApiError.BadRequest('Either email or LPU ID is required.');
	}

	const existingTicket = await Ticket.findOne({ eventId, $or: orConditions });

	if (existingTicket) {
		throw ApiError.Conflict('This Email or LPU ID is already registered for this event.');
	}

	return ApiResponse.success(res, { available: true }, 'Available for registration.');
});

export {
	createTicket,
	getTicketById,
	updateTicketStatus,
	getTicketsByEvent,
	deleteTicket,
	checkAvailability,
};

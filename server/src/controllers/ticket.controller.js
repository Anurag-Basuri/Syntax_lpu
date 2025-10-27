import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateTicketQR } from '../services/qrcode.service.js';
import { sendRegistrationEmail } from '../services/email.service.js';
import { v4 as uuidv4 } from 'uuid';
import { deleteFile } from '../utils/cloudinary.js';

// Create a new ticket
const createTicket = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        phone,
        lpuId,
        eventId,
        eventName,
        gender,
        hosteler,
        hostel,
        course,
        club,
    } = req.body;

    if (
        !fullName ||
        !email ||
        !phone ||
        !lpuId ||
        !eventId ||
        !eventName ||
        !gender ||
        typeof hosteler !== 'boolean' ||
        !course
    ) {
        throw new ApiError(400, 'All fields are required');
    }

    // Check if ticket already exists
	let ticket = await Ticket.findOne({ email, eventId });
    if (ticket) {
        throw new ApiError(409, 'A ticket with this email already exists for this event');
    }

    // Create ticket and QR
    ticket = new Ticket({
        ticketId: uuidv4(),
        fullName,
        email,
        lpuId,
        phone,
        gender,
        hosteler,
        hostel,
        course,
        eventId,
        eventName,
        isUsed: false,
        isCancelled: false,
        club,
    });
    await ticket.save();

    // Add ticket to event registrations
    try {
        await Event.findByIdAndUpdate(
            eventId,
            { $addToSet: { registrations: ticket._id } },
            { new: true }
        );
    } catch (eventUpdateErr) {
        console.error('Failed to add ticket to event registrations:', eventUpdateErr);
    }

    let qrCode;
    try {
        qrCode = await generateTicketQR(ticket.ticketId);
        if (!qrCode || !qrCode.url || !qrCode.public_id) {
            throw new Error('Invalid QR code generated');
        }
        ticket.qrCode = {
            url: qrCode.url,
            publicId: qrCode.public_id,
        };
        await ticket.save();
    } catch (qrErr) {
        console.error('QR code generation failed:', qrErr);
        await Ticket.findByIdAndDelete(ticket._id).catch((delErr) =>
            console.error('Failed to delete ticket after QR error:', delErr)
        );
        if (qrCode?.public_id && qrCode.url) {
            await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' }).catch((delErr) =>
                console.error('Failed to delete QR image after QR error:', delErr)
            );
        }
        throw new ApiError(500, 'Failed to generate QR code for the ticket');
    }

    try {
        await sendRegistrationEmail({
            to: email,
            name: fullName,
            eventName,
            eventDate: '22nd August 2025',
            eventTime: '5:00 PM',
            qrUrl: qrCode.url,
        });
    } catch (emailErr) {
        console.error('Failed to send registration email:', emailErr);
        // Instead of deleting the ticket, mark it as emailFailed for admin review
        ticket.emailFailed = true;
        await ticket.save().catch((saveErr) =>
            console.error('Failed to mark ticket as emailFailed:', saveErr)
        );
        if (qrCode?.public_id && qrCode.url) {
            await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' }).catch((delErr) =>
                console.error('Failed to delete QR image after email error:', delErr)
            );
        }
        throw new ApiError(
            500,
            'Ticket created but failed to send registration email. Please contact support.',
            ticket
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                ticket,
                'Ticket created successfully'
            )
        );
});

// Get ticket by ID
const getTicketById = asyncHandler(async (req, res) => {
	const ticketId = req.params.ticketId || req.body.ticketId;

	const ticket = await Ticket.findById(ticketId);
	if (!ticket) {
		throw new ApiError(404, 'Ticket not found');
	}

	return res.status(200).json(new ApiResponse(200, ticket, 'Ticket retrieved successfully'));
});

// Update ticket status (used/cancelled)
const updateTicketStatus = asyncHandler(async (req, res) => {
	const { ticketId } = req.params;
	const { isUsed } = req.body;

	if (isUsed === undefined) {
		throw new ApiError(400, 'At least one status field must be provided');
	}

	const ticket = await Ticket.findById(ticketId);
	if (!ticket) {
		throw new ApiError(404, 'Ticket not found');
	}

	if (isUsed !== undefined) ticket.isUsed = isUsed;

	await ticket.save();

	return res.status(200).json(new ApiResponse(200, ticket, 'Ticket status updated successfully'));
});

// Get all tickets for an event
const getTicketsByEvent = asyncHandler(async (req, res) => {
	const { eventId } = req.params;

	if (!eventId) {
		throw new ApiError(400, 'Event ID is required');
	}

	const tickets = await Ticket.find({ eventId }).sort({ createdAt: -1 });

	if (!tickets.length) {
		throw new ApiError(404, 'No tickets found for this event');
	}

	return res.status(200).json(new ApiResponse(200, tickets, 'Tickets retrieved successfully'));
});

// Delete a ticket
const deleteTicket = asyncHandler(async (req, res) => {
	const { ticketId } = req.params;

	const ticket = await Ticket.findByIdAndDelete(ticketId);
	if (!ticket) {
		throw new ApiError(404, 'Ticket not found or already deleted');
	}

	return res.status(200).json(new ApiResponse(200, null, 'Ticket deleted successfully'));
});

// Check email and LPU ID availability for an event
const checkEmailAvailability = asyncHandler(async (req, res) => {
	const { email, eventId = '68859a199ec482166f0e8523', lpuId } = req.body;

	const trimmedEmail = email.toLowerCase().trim();

	// Check if email already exists for this event
	const existingTicketByEmail = await Ticket.findOne({
		email: trimmedEmail,
		eventId: eventId,
	});

	if (existingTicketByEmail) {
		throw new ApiError(
			409,
			'A ticket has already been purchased with this email address for this event'
		);
	}

	// Also check LPU ID if provided
	if (lpuId) {
		const existingTicketByLpu = await Ticket.findOne({
			lpuId: typeof lpuId === 'string' ? lpuId.trim() : lpuId,
			eventId: eventId,
		});

		if (existingTicketByLpu) {
			throw new ApiError(
				409,
				'A ticket has already been purchased with this LPU ID for this event'
			);
		}
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ available: true, email: trimmedEmail, eventId: eventId },
				'Email and LPU ID are available for registration'
			)
		);
});

const ticketForQR = asyncHandler(async (req, res) => {
    const ticketId = req.params.ticketId || req.body.ticketId;

    if (!ticketId) {
        throw new ApiError(400, "Ticket ID is required");
    }

    // Try to find by ticketId first, then by _id if not found
    let ticket = await Ticket.findOne({ ticketId });

    if (!ticket) {
        console.log('Ticket not found by ticketId, trying _id:', ticketId);
        // If not found by ticketId, try finding by MongoDB _id
        try {
            ticket = await Ticket.findById(ticketId);
        } catch (error) {
            console.log('Invalid ObjectId format:', error.message);
        }
    }

    if (!ticket) {
        throw new ApiError(404, "Ticket not found");
    }

    // Remove sensitive fields
    const ticketData = ticket.toObject();
    delete ticketData.__v;

    return res
        .status(200)
        .json(new ApiResponse(200, ticketData, "Ticket retrieved successfully"));
});

const updateStatusForQR = asyncHandler(async (req, res) => {
    const ticketId = req.params.ticketId || req.body.ticketId;
    const { isUsed } = req.body;

    if (!ticketId) {
        throw new ApiError(400, "Ticket ID is required");
    }
    if (typeof isUsed !== "boolean") {
        throw new ApiError(400, "isUsed field must be a boolean");
    }

    // Try to find by ticketId first, then by _id if not found
    let ticket = await Ticket.findOne({ ticketId });
    
    if (!ticket) {
        try {
            ticket = await Ticket.findById(ticketId);
        } catch (error) {
            console.log('Invalid ObjectId format:', error.message);
        }
    }

    if (!ticket) {
        console.log('Ticket not found by any method for ID:', ticketId);
        throw new ApiError(404, "Ticket not found");
    }

    // Only update if status is actually changing
    if (ticket.isUsed !== isUsed) {
        ticket.isUsed = isUsed;
        await ticket.save();
        console.log('Ticket status updated successfully');
    } else {
        console.log('Ticket status unchanged, no update needed');
    }

    // Remove sensitive fields
    const ticketData = ticket.toObject();
    delete ticketData.__v;

    return res
        .status(200)
        .json(new ApiResponse(200, ticketData, "Ticket status updated successfully"));
});

export {
	createTicket,
	getTicketById,
	updateTicketStatus,
	getTicketsByEvent,
	deleteTicket,
	checkEmailAvailability,
    ticketForQR,
    updateStatusForQR
};

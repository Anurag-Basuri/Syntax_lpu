import Event from '../models/event.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadFile, deleteFile } from '../utils/cloudinary.js';
import mongoose from 'mongoose';

// Create Event
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, date, time, venue, organizer, sponsor, tags, totalSpots, ticketPrice, moreDetails } = req.body;

    if (!title || !description || !date || !time || !venue) {
        throw new ApiError(400, 'Title, description, date, time, and venue are required');
    }

    // Upload posters and get { url, publicId }
    const posters = req.files ? await Promise.all(req.files.map(file => uploadFile(file))) : [];

    // Delete uploaded files from server after uploading to cloud
    if (req.files) {
        const fs = await import('fs');
        for (const file of req.files) {
            try {
                fs.unlinkSync(file.path);
            } catch (err) {
                console.error('Error deleting file from server:', err);
            }
        }
    }

    const newEvent = await Event.create({
        title,
        description,
        date: new Date(date),
        time,
        venue,
        organizer,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        totalSpots: totalSpots ? parseInt(totalSpots, 10) : 0,
        sponsor: sponsor || 'Not Applicable',
        posters: posters.map(p => ({
            url: p.url,
            publicId: p.publicId
        })),
        ticketPrice: ticketPrice ? parseFloat(ticketPrice) : 0,
        moreDetails
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, newEvent, 'Event created successfully',
            )
        );
});

// Update Event
const updateEvent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, description, date, time, venue, organizer, sponsor, tags, totalSpots, ticketPrice, moreDetails } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid event ID');
    }

    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
        throw new ApiError(404, 'Event not found');
    }

    // Upload new posters and get { url, publicId }
    const newPosters = req.files ? await Promise.all(req.files.map(file => uploadFile(file))) : [];

    // If new posters are uploaded, delete old ones from cloud
    if (newPosters.length > 0 && existingEvent.posters.length > 0) {
        await Promise.all(existingEvent.posters.map(poster => deleteFile({public_id: poster.publicId, resource_type: 'image'})));
    }

    // Delete uploaded files from server after uploading to cloud
    if (req.files) {
        const fs = await import('fs');
        for (const file of req.files) {
            try {
                fs.unlinkSync(file.path);
			} catch (err) {
                console.error('Error deleting file from server:', err);
            }
        }
    }

    const updateFields = {
        ...(title && { title }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(time && { time }),
        ...(venue && { venue }),
        ...(organizer && { organizer }),
        ...(sponsor && { sponsor }),
        ...(ticketPrice && { ticketPrice: parseFloat(ticketPrice) }),
        ...(moreDetails && { moreDetails }),
        ...(tags && { tags: tags.split(',').map(tag => tag.trim()) }),
        ...(totalSpots && { totalSpots: parseInt(totalSpots, 10) }),
        ...(newPosters.length > 0 && { posters: newPosters.map(p => ({
            url: p.url,
            publicId: p.publicId
        })) })
    };

    const updatedEvent = await Event.findByIdAndUpdate(id, updateFields, { new: true });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, updatedEvent, 'Event updated successfully'
            )
        );
});

// Get All Events (with optional status filter)
const getAllEvents = asyncHandler(async (req, res) => {
	const { status } = req.query;
	const filter = status ? { status } : {};

	const events = await Event.find(filter).sort({ date: 1 });

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, events, 'Events fetched successfully'
			)
		);
});

// Get Event By ID
const getEventById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, 'Invalid event ID');
	}

	const event = await Event.findById(id);
	if (!event) {
		throw new ApiError(404, 'Event not found');
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, event, 'Event fetched successfully'
			)
		);
});

// Delete Event (with poster cleanup)
const deleteEvent = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, 'Invalid event ID');
	}

	const event = await Event.findById(id);
	if (!event) {
		throw new ApiError(404, 'Event not found');
	}

	// Delete posters from Cloudinary
	if (event.posters && event.posters.length > 0) {
		await Promise.all(event.posters.map(deleteFile));
	}

	await Event.findByIdAndDelete(id);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, 'Event deleted successfully'
			)
		);
});

// Get Upcoming Event
const getUpcomingEvent = asyncHandler(async (req, res) => {
	const now = new Date();
	const event = await Event.findOne({ date: { $gte: now }, status: { $ne: 'cancelled' } }).sort({ date: 1 });

	return res
		.status(200)
		.json(
			new ApiResponse(
				200, event, 'Upcoming events fetched successfully'
			)
		);
});

export {
	createEvent,
	updateEvent,
	getAllEvents,
	getEventById,
	deleteEvent,
	getUpcomingEvent
};

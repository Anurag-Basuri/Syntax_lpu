import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import { v4 as uuidv4 } from 'uuid';
import { generateTicketQR } from '../services/qrcode.service.js';
import { sendRegistrationEmail } from '../services/email.service.js';
import { deleteFile } from '../utils/cloudinary.js';
import {ApiError} from '../utils/ApiError.js';

const generateAndSendTicket = async ({ fullName, email, LpuId, eventId, eventName }) => {
    if (!fullName || !email || !LpuId || !eventId || !eventName) {
        throw new ApiError(400, 'All fields are required');
    }

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, 'Event not found');
    }

    const existingTicket = await Ticket.findOne({ LpuId, eventId });
    if (existingTicket) {
        throw new ApiError(409, 'You have already registered for this event');
    }

    const ticket = new Ticket({
        ticketId: uuidv4(),
        fullName,
        email,
        LpuId,
        eventId,
        eventName,
        isUsed: false,
        isCancelled: false
    });

    await ticket.save();

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
        await Ticket.findByIdAndDelete(ticket._id);
        if (qrCode?.public_id && qrCode.url) {
            await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' });
        }
        throw new ApiError(500, 'Failed to generate QR code for the ticket');
    }

    try {
        await sendRegistrationEmail({
            to: email,
            name: fullName,
            eventName: event.name,
            eventDate: event.date,
            qrUrl: qrCode.url,
        });
    } catch (emailErr) {
        console.error('Error sending registration email:', emailErr);
        throw new ApiError(500, 'Failed to send registration email');
    }
};

export default generateAndSendTicket;

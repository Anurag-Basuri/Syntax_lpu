import Contact from '../models/contact.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const sendContact = asyncHandler(async (req, res) => {
    const { name, email, phone, lpuID, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !lpuID || !subject || !message) {
        throw ApiError.badRequest('All fields are required');
    }

    // Create a new contact entry
    const contact = await Contact.create({
        name,
        email,
        phone,
        lpuID,
        subject,
        message,
    });

    // Send success response
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                contact,
                'Contact created successfully'
            )
        );
});

const getAllContacts = asyncHandler(async (req, res) => {
    // Parse pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Fetch total count for pagination info
    const totalContacts = await Contact.countDocuments();

    // Fetch paginated contacts, most recent first
    const contacts = await Contact.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Send success response with pagination info
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                docs: contacts, // <-- Use 'docs' for consistency with frontend expectations
                page,
                limit,
                totalDocs: totalContacts,
                totalPages: Math.ceil(totalContacts / limit)
            },
            contacts.length > 0 ? 'Contacts retrieved successfully' : 'No contacts found'
        )
    );
});

const getContactById = asyncHandler(async (req, res) => {
    const contactId = req.params.id;

    // Validate contact ID
    if (!contactId) {
        throw ApiError.badRequest('Contact ID is required');
    }

    // Fetch contact by ID
    const contact = await Contact.findById(contactId);
    if (!contact) {
        throw ApiError.notFound('Contact not found');
    }

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                contact,
                'Contact retrieved successfully'
            )
        );
});

const markContactAsResolved = asyncHandler(async (req, res) => {
    const contactId = req.params.id;

    // Validate contact ID
    if (!contactId) {
        throw ApiError.badRequest('Contact ID is required');
    }

    // Update contact status to resolved
    const contact = await Contact.findByIdAndUpdate(
        contactId,
        { status: 'resolved' },
        { new: true }
    );
    if (!contact) {
        throw ApiError.notFound('Contact not found');
    }

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                contact,
                'Contact marked as resolved'
            )
        );
});

const deleteContact = asyncHandler(async (req, res) => {
    const contactId = req.params.id;

    // Validate contact ID
    if (!contactId) {
        throw ApiError.badRequest('Contact ID is required');
    }

    // Delete contact
    const contact = await Contact.findByIdAndDelete(contactId);
    if (!contact) {
        throw ApiError.notFound('Contact not found');
    }

    // Send success response
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                'Contact deleted successfully'
            )
        );
})

export { sendContact, getAllContacts, getContactById, markContactAsResolved, deleteContact };

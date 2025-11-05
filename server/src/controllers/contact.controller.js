import Contact from '../models/contact.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

// Create a new contact message
const sendContact = asyncHandler(async (req, res) => {
	const { name, email, phone, lpuID, subject, message } = req.body;

	// Detailed validation
	const requiredFields = { name, email, phone, lpuID, subject, message };
	const missingFields = Object.entries(requiredFields)
		.filter(([_, value]) => !value)
		.map(([key]) => key);

	if (missingFields.length > 0) {
		throw ApiError.BadRequest(`Missing required fields: ${missingFields.join(', ')}`, {
			missingFields,
		});
	}

	try {
		const contact = await Contact.create({
			name: name.trim(),
			email: email.toLowerCase().trim(),
			phone,
			lpuID: lpuID.trim(),
			subject: subject.trim(),
			message: message.trim(),
		});

		return ApiResponse.success(
			res,
			{ contact },
			'Your message has been sent successfully!',
			201
		);
	} catch (error) {
		// Handle Mongoose validation errors specifically
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map((err) => err.message);
			throw ApiError.UnprocessableEntity('Validation failed', validationErrors);
		}
		throw error; // Re-throw other errors
	}
});

// Get all contacts with filtering, sorting, and pagination
const getAllContacts = asyncHandler(async (req, res) => {
	const {
		page = 1,
		limit = 10,
		status,
		search,
		sortBy = 'createdAt',
		sortOrder = 'desc',
	} = req.query;

	const filter = {};

	if (status && ['pending', 'resolved', 'closed'].includes(status)) {
		filter.status = status;
	}

	// Use text index for searching
	if (search && search.trim()) {
		filter.$text = { $search: search.trim() };
	}

	const pageNum = parseInt(page, 10);
	const limitNum = parseInt(limit, 10);

	if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
		throw ApiError.BadRequest('Page and limit must be positive integers (limit <= 100).');
	}

	const sortDirection = sortOrder === 'asc' ? 1 : -1;
	const allowedSortFields = ['createdAt', 'name', 'status', 'lpuID'];
	const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

	const options = {
		page: pageNum,
		limit: limitNum,
		sort: { [sortField]: sortDirection },
		lean: true,
	};

	// The model uses mongoose-aggregate-paginate-v2, so we build an aggregate pipeline
	const aggregate = Contact.aggregate(Object.keys(filter).length > 0 ? [{ $match: filter }] : []);
	const contacts = await Contact.aggregatePaginate(aggregate, options);

	return ApiResponse.paginated(
		res,
		contacts.docs,
		{
			totalDocs: contacts.totalDocs,
			totalPages: contacts.totalPages,
			currentPage: contacts.page,
			limit: contacts.limit,
			hasNextPage: contacts.hasNextPage,
			hasPrevPage: contacts.hasPrevPage,
		},
		'Contacts retrieved successfully'
	);
});

// Get a single contact by its ID
const getContactById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.BadRequest('Invalid contact ID format');
	}

	const contact = await Contact.findById(id);
	if (!contact) {
		throw ApiError.NotFound('Contact not found');
	}

	return ApiResponse.success(res, { contact }, 'Contact retrieved successfully');
});

// Update a contact's status
const updateContactStatus = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { status } = req.body;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.BadRequest('Invalid contact ID format');
	}

	const validStatuses = ['pending', 'resolved', 'closed'];
	if (!status || !validStatuses.includes(status)) {
		throw ApiError.BadRequest(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
	}

	const contact = await Contact.findByIdAndUpdate(id, { status }, { new: true });

	if (!contact) {
		throw ApiError.NotFound('Contact not found');
	}

	return ApiResponse.success(res, { contact }, `Contact status updated to ${status}`);
});

// Delete a single contact
const deleteContact = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw ApiError.BadRequest('Invalid contact ID format');
	}

	const deletedContact = await Contact.findByIdAndDelete(id);
	if (!deletedContact) {
		throw ApiError.NotFound('Contact not found');
	}

	return ApiResponse.success(res, { deletedContact }, 'Contact deleted successfully');
});

// Bulk delete contacts
const bulkDeleteContacts = asyncHandler(async (req, res) => {
	const { ids } = req.body;

	if (!Array.isArray(ids) || ids.length === 0) {
		throw ApiError.BadRequest('An array of contact IDs is required.');
	}

	const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
	if (invalidIds.length > 0) {
		throw ApiError.BadRequest('Some contact IDs are invalid', { invalidIds });
	}

	const result = await Contact.deleteMany({ _id: { $in: ids } });

	if (result.deletedCount === 0) {
		throw ApiError.NotFound('No matching contacts found to delete.');
	}

	return ApiResponse.success(
		res,
		{ deletedCount: result.deletedCount },
		`${result.deletedCount} contact(s) deleted successfully`
	);
});

// Get contact statistics
const getContactStats = asyncHandler(async (req, res) => {
	const stats = await Contact.aggregate([
		{
			$group: {
				_id: '$status',
				count: { $sum: 1 },
			},
		},
		{
			$group: {
				_id: null,
				total: { $sum: '$count' },
				countsByStatus: { $push: { status: '$_id', count: '$count' } },
			},
		},
		{
			$project: {
				_id: 0,
				total: 1,
				status: {
					$arrayToObject: {
						$map: {
							input: '$countsByStatus',
							as: 'status',
							in: {
								k: '$$status.status',
								v: '$$status.count',
							},
						},
					},
				},
			},
		},
	]);

	const formattedStats = {
		total: stats[0]?.total || 0,
		pending: stats[0]?.status?.pending || 0,
		resolved: stats[0]?.status?.resolved || 0,
		closed: stats[0]?.status?.closed || 0,
	};

	return ApiResponse.success(res, { stats: formattedStats }, 'Statistics retrieved successfully');
});

export {
	sendContact,
	getAllContacts,
	getContactById,
	updateContactStatus,
	deleteContact,
	bulkDeleteContacts,
	getContactStats,
};

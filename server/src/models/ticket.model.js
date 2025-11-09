import mongoose from 'mongoose';
import validator from 'validator';
import { v4 as uuidv4 } from 'uuid';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const ticketSchema = new mongoose.Schema(
	{
		ticketId: {
			type: String,
			default: () => `TICKET-${uuidv4().slice(0, 8).toUpperCase()}`,
			unique: true,
			required: true,
		},

		// --- Event Information ---
		eventId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Event',
			required: [true, 'Event ID is required'],
		},
		eventName: {
			type: String,
			trim: true,
		},

		// --- Attendee Information ---
		fullName: {
			type: String,
			required: [true, 'Full name is required'],
			trim: true,
			minlength: [2, 'Full name must be at least 2 characters'],
			maxlength: [50, 'Full name cannot exceed 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			trim: true,
			lowercase: true,
			validate: [validator.isEmail, 'Invalid email format'],
		},
		phone: {
			type: String,
			required: [true, 'Phone number is required'],
			trim: true,
			validate: {
				validator: function (v) {
					return /^\d{10}$/.test(v.replace(/^(\+91|0)/, ''));
				},
				message: 'Phone number must be 10 digits.',
			},
		},
		lpuId: {
			type: String, // Changed to String for reliable validation
			required: [true, 'LPU ID is required'],
			trim: true,
			validate: {
				validator: function (v) {
					return /^\d{7,8}$/.test(v); // Allow 7 or 8 digits
				},
				message: 'LPU ID must be 7 or 8 digits',
			},
		},
		gender: {
			type: String,
			required: [true, 'Gender is required'],
			enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
		},
		course: {
			type: String,
			required: [true, 'Course is required'],
			trim: true,
		},
		hosteler: {
			type: Boolean,
			default: false,
		},
		hostel: {
			type: String,
			trim: true,
			// Only required if hosteler is true
			required: function () {
				return this.hosteler === true;
			},
		},

		// --- Ticket Status & Metadata ---
		status: {
			type: String,
			enum: ['active', 'used', 'cancelled'],
			default: 'active',
			required: true,
		},
		qrCode: {
			url: String,
			publicId: String,
		},
		emailStatus: {
			type: String,
			enum: ['sent', 'failed', 'pending'],
			default: 'pending',
		},
		paymentDetails: {
			paymentId: String,
			amount: Number,
			currency: String,
			method: String,
		},
	},
	{
		timestamps: true, // Automatically adds createdAt and updatedAt
	}
);

// --- INDEXES ---

// Create a compound index to ensure a user can only register once per event.
// This is the most critical fix.
ticketSchema.index({ eventId: 1, email: 1 }, { unique: true });
ticketSchema.index({ eventId: 1, lpuId: 1 }, { unique: true });

// Index for querying tickets by status for a specific event
ticketSchema.index({ eventId: 1, status: 1 });

// --- PLUGIN ---
ticketSchema.plugin(mongooseAggregatePaginate);

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;

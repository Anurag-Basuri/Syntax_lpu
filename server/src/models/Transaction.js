import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
	{
		orderId: {
			type: String,
			required: true,
			unique: true,
		},
		user: {
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
				unique: true,
				validate: {
					validator: function (v) {
						return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
					},
					message: 'Email must be a valid email address',
				},
			},
			phone: {
				type: String,
				required: [true, 'Phone number is required'],
				trim: true,
				validate: {
					validator: function (v) {
						// Remove leading 0 or +91 if present
						const normalized = v.replace(/^(\+91|0)/, '');
						return /^\d{10}$/.test(normalized);
					},
					message: 'Phone number must be 10 digits (ignore leading 0 or +91)',
				},
			},
			lpuId: {
				type: Number,
				required: [true, 'LPU ID is required'],
				unique: true,
				validate: {
					validator: function (v) {
						return /^\d{8}$/.test(v);
					},
					message: 'LPU ID must be 8 digits',
				},
			},
			gender: {
				type: String,
				required: [true, 'Gender is required'],
				enum: ['Male', 'Female'],
			},
			hosteler: {
				type: Boolean,
				required: [true, 'Hosteler status is required'],
				default: false,
			},
			hostel: {
				type: String,
				required: function () {
					return this.hosteler; // Only required if hosteler is true
				},
			},
			course: {
				type: String,
				required: [true, 'Course is required'],
			},
			club: {
				type: String
			},
		},
		amount: {
			type: Number,
			required: true,
		},
		status: {
			type: String,
			enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
			default: 'PENDING',
		},
		paymentTime: {
			type: Date,
			default: Date.now,
		},
		failureReason: {
			type: String,
		},
		paymentMethod: {
			type: String,
			enum: ['UPI', 'CARD', 'NET_BANKING', 'WALLET', 'MULTIPLE_OPTIONS'],
			default: 'MULTIPLE_OPTIONS',
		},
		eventId: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

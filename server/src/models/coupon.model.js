import mongoose from 'mongoose';

// Generate a unique 4-character alphanumeric code
async function generateUniqueCouponCode() {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded ambiguous characters
	const maxAttempts = 10;

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		let code = '';
		for (let i = 0; i < 4; i++) {
			code += chars.charAt(Math.floor(Math.random() * chars.length));
		}

		// Check if code exists in database
		const existingCoupon = await mongoose.model('Coupon').findOne({ code });
		if (!existingCoupon) return code;
	}

	throw new Error('Could not generate unique coupon code after 10 attempts');
}

// Generate a random maxUsage between 1 and 50
function generateRandomMaxUsage() {
	return Math.floor(Math.random() * 50) + 1; // 1 to 50 inclusive
}

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			default: generateUniqueCouponCode,
			validate: {
				validator: (v) => /^[A-Z0-9]{4}$/.test(v),
				message: 'Code must be 4-character alphanumeric',
			},
		},
		discount: {
			type: Number,
			required: true,
			min: [5, 'Minimum discount is 5%'],
			max: [100, 'Maximum discount is 100%'],
			validate: {
				validator: (v) => v % 5 === 0,
				message: 'Discount must be a multiple of 5',
			},
		},
		expiryDate: {
			type: Date,
			required: true,
			validate: {
				validator: (v) => v > Date.now(),
				message: 'Expiry date must be in the future',
			},
		},
		maxUsage: {
			type: Number,
			required: true,
			default: generateRandomMaxUsage,
			min: [1, 'Minimum usage limit is 1'],
			max: [50, 'Maximum usage limit is 50'],
		},
		usageCount: {
			type: Number,
			required: true,
			default: 0,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function () {
	return this.maxUsage - this.usageCount;
});

// Virtual for validity status
couponSchema.virtual('isValid').get(function () {
	return this.isActive && this.usageCount < this.maxUsage && this.expiryDate > Date.now();
});

// Pre-save validation
couponSchema.pre('save', function (next) {
	if (this.expiryDate <= Date.now()) {
		this.isActive = false;
	}
	next();
});

// Static method for validation
couponSchema.statics.validateCoupon = async function (code) {
	const coupon = await this.findOne({ code });

	if (!coupon) {
		throw new Error('Coupon not found');
	}

	if (!coupon.isActive) {
		throw new Error('Coupon is inactive');
	}

	if (coupon.usageCount >= coupon.maxUsage) {
		throw new Error('Coupon usage limit reached');
	}

	if (coupon.expiryDate < new Date()) {
		throw new Error('Coupon has expired');
	}

	return coupon;
};

// Method to increment usage
couponSchema.methods.incrementUsage = async function () {
	if (this.usageCount >= this.maxUsage) {
		throw new Error('Coupon usage limit reached');
	}

	this.usageCount += 1;

	if (this.usageCount >= this.maxUsage) {
		this.isActive = false;
	}

	return this.save();
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;

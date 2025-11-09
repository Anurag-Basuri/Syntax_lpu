import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const applySchema = new mongoose.Schema(
	{
		fullName: {
			type: String,
			required: [true, 'Full name is required'],
			trim: true,
			minlength: [2, 'Full name must be at least 2 characters'],
			maxlength: [50, 'Full name cannot exceed 50 characters'],
		},
		LpuId: {
			type: String,
			required: [true, 'LPU ID is required'],
			trim: true,
			unique: true,
			validate: {
				validator: function (v) {
					return /^\d{8}$/.test(v);
				},
				message: 'LPU ID must be 8 digits',
			},
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			trim: true,
			unique: true,
			validate: {
				validator: async (email) => {
					const emailCount = await mongoose.models.Apply.countDocuments({ email });
					return emailCount === 0;
				},
				message: 'Email already exists',
			},
		},
		phone: {
			type: String,
			required: [true, 'Phone number is required'],
			trim: true,
			validate: {
				validator: async (phone) => {
					const phoneCount = await mongoose.models.Apply.countDocuments({ phone });
					return phoneCount === 0;
				},
				message: 'Phone number already exists',
			},
		},
		course: {
			type: String,
			required: [true, 'Course is required'],
		},
		gender: {
			type: String,
			enum: ['male', 'female'],
		},
		domains: {
			type: [String],
			required: [true, 'At least one domain is required'],
			validate: {
				validator: function (v) {
					return v.length > 0;
				},
				message: 'Domains cannot be empty',
			},
		},

		accommodation: {
			type: String,
			lowercase: true,
			enum: ['hostler', 'non-hostler'],
			required: [true, 'Accommodation type is required'],
		},
		previousExperience: {
			type: Boolean,
			default: false,
		},
		anyotherorg: {
			type: Boolean,
			default: false,
		},
		seen: {
			type: Boolean,
			default: false,
		},

		bio: {
			type: String,
			trim: true,
			maxlength: [500, 'Bio cannot exceed 500 characters'],
		},

		status: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
	},
	{
		timestamps: true,
	}
);

applySchema.pre('save', function (next) {
	next();
});

applySchema.plugin(mongooseAggregatePaginate);

const Apply = mongoose.model('Apply', applySchema);
export default Apply;

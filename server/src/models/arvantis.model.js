import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

// --- Sub-schema for Media (Images, Videos) ---
const mediaSchema = new mongoose.Schema(
	{
		url: {
			type: String,
			required: true,
		},
		publicId: {
			type: String,
			required: true,
		},
		resource_type: {
			type: String,
			enum: ['image', 'video'],
			default: 'image',
		},
		caption: {
			type: String,
			trim: true,
		},
	},
	{ _id: false } // No separate _id for sub-documents
);

// --- Sub-schema for Partners (Sponsors, Collaborators) ---
const partnerSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
		},
		logo: mediaSchema, // Use the media schema for the logo
		website: {
			type: String,
			trim: true,
		},
		// e.g., 'Title', 'Gold', 'Community Partner'
		tier: {
			type: String,
			trim: true,
		},
	},
	{ _id: false } // No separate _id for sub-documents
);

// --- Main Arvantis Fest Schema ---
const arvantisSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Fest name is required.'],
			trim: true,
			default: 'Arvantis',
		},
		year: {
			type: Number,
			required: [true, 'Fest year is required.'],
			unique: true, // Ensure only one fest record per year
			index: true,
		},
		slug: {
			type: String,
			unique: true,
			lowercase: true,
		},
		description: {
			type: String,
			required: [true, 'A description for the fest is required.'],
			trim: true,
		},
		startDate: {
			type: Date,
			required: [true, 'Start date is required.'],
		},
		endDate: {
			type: Date,
			required: [true, 'End date is required.'],
		},
		status: {
			type: String,
			enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'postponed'],
			default: 'upcoming',
			index: true,
		},
		events: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Event',
			},
		],
		partners: [partnerSchema], // Unified array for sponsors and collaborators
		poster: mediaSchema, // Main poster for the fest
		gallery: [mediaSchema], // Gallery for event photos and other media
	},
	{
		timestamps: true,
	}
);

// --- MIDDLEWARE (HOOKS) ---

// Before saving, generate a slug and validate dates
arvantisSchema.pre('save', function (next) {
	// Generate slug from name and year if it's new or has been modified
	if (this.isModified('name') || this.isModified('year') || !this.slug) {
		this.slug = `${this.name.toLowerCase().split(' ').join('-')}-${this.year}`;
	}

	// Validate that endDate is not before startDate
	if (this.endDate < this.startDate) {
		return next(new Error('End date cannot be before the start date.'));
	}

	next();
});

// --- INDEXES ---
arvantisSchema.index({ year: -1 });
arvantisSchema.index({ name: 'text', description: 'text' }); // For search functionality

// --- PLUGIN ---
arvantisSchema.plugin(mongooseAggregatePaginate);

const Arvantis = mongoose.model('Arvantis', arvantisSchema);

export default Arvantis;

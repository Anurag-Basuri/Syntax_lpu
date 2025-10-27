import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const adminSchema = new mongoose.Schema(
	{
		adminID: {
			type: String,
			default: () => uuidv4(),
			unique: true,
		},
		fullname: {
			type: String,
			required: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 6,
		},

		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{ timestamps: true }
);

// Hash password before save
adminSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
adminSchema.methods.generateAuthToken = function () {
	return jwt.sign(
		{ id: this._id, adminID: this.adminID },
		process.env.ACCESS_TOKEN_SECRET,
		process.env.ACCESS_TOKEN_EXPIRY ? { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } : {}
	);
};

// Generate refresh token
adminSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{ id: this._id },
		process.env.REFRESH_TOKEN_SECRET,
		process.env.REFRESH_TOKEN_EXPIRY ? { expiresIn: process.env.REFRESH_TOKEN_EXPIRY } : {}
	);
};

// Prevent password from being returned
adminSchema.methods.toJSON = function () {
	const admin = this.toObject();
	delete admin.password;
	return admin;
};

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;

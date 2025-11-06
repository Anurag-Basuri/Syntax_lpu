import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import path from 'path';
import { fileURLToPath } from 'url';

// Enable colors for console output
colors.enable();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let cachedConnection = null;

const connectDB = async () => {
	if (cachedConnection && mongoose.connection.readyState === 1) {
		console.log('✅ Using existing MongoDB connection'.green);
		return cachedConnection;
	}

	try {
		const uri = process.env.MONGODB_URI;

		if (!uri) {
			throw new Error('MongoDB URI is not defined. Check your .env file.');
		}

		console.log('🔌 Connecting to MongoDB...'.cyan);

		const options = {
			bufferCommands: false, // Disable buffering for immediate error feedback
			maxPoolSize: 10, // Default is 100, adjust as needed
			serverSelectionTimeoutMS: 5000, // Fail fast if no server is available
			socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
			family: 4, // Use IPv4, skip trying IPv6
		};

		const conn = await mongoose.connect(uri, options);

		cachedConnection = conn;

		console.log(`✅ MongoDB Connected: ${conn.connection.host}`.green.bold);

		mongoose.connection.on('error', (err) => {
			console.error('❌ MongoDB connection error:'.red, err);
			cachedConnection = null; // Reset cache on connection error
		});

		mongoose.connection.on('disconnected', () => {
			console.log(' MongoDB disconnected.'.yellow);
			cachedConnection = null;
		});

		return conn;
	} catch (error) {
		console.error(`❌ MongoDB connection failed: ${error.message}`.red.bold);
		// Exit process with failure code if initial connection fails
		process.exit(1);
	}
};

// Gracefully close the MongoDB connection
export const closeDB = async () => {
	if (mongoose.connection.readyState === 1) {
		try {
			await mongoose.connection.close();
			console.log('🔒 MongoDB connection closed successfully.'.green);
		} catch (err) {
			console.error('❌ Error during MongoDB disconnection:'.red, err);
		}
	}
};

// Helper to check current DB connection status
export const getConnectionStatus = () => mongoose.connection.readyState;

export default connectDB;

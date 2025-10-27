import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../utils/ApiError.js';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allowed MIME types and their extensions
const ALLOWED_FILE_TYPES = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'application/pdf': 'pdf',
	'application/msword': 'doc',
};

// 5MB max file size
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, file, cb) => {
		const ext = ALLOWED_FILE_TYPES[file.mimetype];
		if (!ext) return cb(new Error('Invalid file type'));
		const uniqueName = `${uuidv4()}.${ext}`;
		cb(null, uniqueName);
	},
});

// File filter
const fileFilter = (req, file, cb) => {
	if (ALLOWED_FILE_TYPES[file.mimetype]) {
		cb(null, true);
	} else {
		cb(new Error('Invalid file type'));
	}
};

// Multer upload instance
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: MAX_FILE_SIZE,
	},
});

// Middleware to handle file upload for a single field
export const uploadFile = (fieldName) => (req, res, next) => {
	upload.single(fieldName)(req, res, (err) => {
		// If an error occurred and a file was uploaded, delete it
		if ((err instanceof multer.MulterError || err) && req.file && req.file.path) {
        	try {
                fs.unlinkSync(req.file.path);
            } catch (deleteErr) {
                console.error('Error deleting file after upload error:', deleteErr);
            }
        }
        if (err instanceof multer.MulterError) {
            return next(new ApiError(400, `Multer error: ${err.message}`));
        } else if (err) {
            return next(new ApiError(400, `File upload error: ${err.message}`));
        }
        // Ensure req.files is always an array for consistency
        req.files = req.file ? [req.file] : [];
        next();
    });
};

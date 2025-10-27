import QRCode from 'qrcode';
import { ApiError } from '../utils/ApiError.js';
import { v4 as uuidv4 } from 'uuid';
import streamifier from 'streamifier';
import { v2 as cloudinary } from 'cloudinary';

export const generateTicketQR = async ( ticketId ) => {
	try {
		// Prepare data to encode in the QR
		const qrData = JSON.stringify({ ticketId });

		const qrBuffer = await QRCode.toBuffer(qrData, { type: 'png' });

		const uploadResult = await new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					folder: 'tickets/qr-codes',
					public_id: `ticket_${uuidv4()}`,
					resource_type: 'image',
				},
				(error, result) => {
					if (error) return reject(error);
					resolve(result);
				}
			);

			streamifier.createReadStream(qrBuffer).pipe(uploadStream);
		});

		return uploadResult;
	} catch (error) {
		console.error('Error generating QR code:', error);
		throw new ApiError(500, 'Failed to generate QR code');
	}
};

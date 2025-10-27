import Transaction from '../models/Transaction.js';
import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import createCashfreeOrder from '../services/cashFree.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateTicketQR } from '../services/qrcode.service.js';
import { sendRegistrationEmail } from '../services/email.service.js';
import { deleteFile } from '../utils/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { config } from 'dotenv';
config();

// Initialize Cashfree payment gateway
const createOrder = asyncHandler(async (req, res) => {
	try {
		console.log('Creating Cashfree order with request body:', req.body);
		const { fullName, email, phone, amount, eventId, lpuId, gender, hosteler, hostel, course, club } =
			req.body;

		// Validate required fields
		const missingFields = [];
		if (!fullName) missingFields.push('fullName');
		if (!email) missingFields.push('email');
		if (!phone) missingFields.push('phone');
		if (!amount) missingFields.push('amount');
		if (!lpuId) missingFields.push('lpuId');
		if (!gender) missingFields.push('gender');
		if (typeof hosteler !== 'boolean') missingFields.push('hosteler');
		if (!course) missingFields.push('course');
		if (missingFields.length > 0) {
			throw new ApiError(
				400,
				`Missing required fields: ${missingFields.join(', ')}`
			);
		}
		if (isNaN(amount) || amount <= 0) {
			throw new ApiError(400, 'Invalid amount');
		}

		// Check for duplicate ticket by email/lpuId for this event
		const eventIdToUse = eventId || '68859a199ec482166f0e8523';
		const existingTicket = await Ticket.findOne({
			eventId: eventIdToUse,
			$or: [{ email: email.trim() }, { lpuId: lpuId.trim() }],
		});
		if (existingTicket) {
			throw new ApiError(
				409,
				'A ticket has already been purchased with this email address or LPU ID for this event'
			);
		}

		// Generate unique order and customer IDs
		const orderId = uuidv4() + '-' + Date.now();
		const customerId = uuidv4();

		// Check for duplicate orderId
		const existingOrder = await Transaction.findOne({ orderId });
		if (existingOrder) {
			throw new ApiError(409, 'Duplicate orderId — try again');
		}

		// Resolve event name for order note
		let resolvedEventName = 'RaveYard 2025';
		const eventDoc = await Event.findById(eventIdToUse);
		if (eventDoc && eventDoc.name) {
			resolvedEventName = eventDoc.name;
		}

		// Prepare Cashfree order payload
		const orderPayload = {
			order_id: orderId,
			order_amount: 400,
			order_currency: 'INR',
			customer_details: {
				customer_id: customerId,
				customer_name: fullName,
				customer_email: email,
				customer_phone: phone,
			},
			order_meta: {
				return_url: `${process.env.CASHFREE_RETURN_URL}?order_id=${orderId}`,
				notify_url: process.env.CASHFREE_NOTIFY_URL,
				payment_methods: 'upi',
			},
			order_note: `${process.env.CASHFREE_BUSINESS_NAME || 'Vibranta'} - ${resolvedEventName} - LPU ID: ${lpuId}`,
			order_expiry_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
		};

		// Create order with Cashfree
		const order = await createCashfreeOrder(orderPayload);

		// Check if order creation was successful
		if (!order || !order.payment_session_id) {
			throw new ApiError(500, 'Failed to create order with Cashfree');
		}

		// Create transaction record
		await Transaction.create({
			orderId: orderId,
			user: { fullName, email, phone, lpuId, gender, hosteler, hostel, course, club },
			amount: Number(amount),
			status: 'PENDING',
			paymentMethod: 'UPI',
			eventId: eventIdToUse,
			eventName: resolvedEventName,
		});

		return res.status(200).json(new ApiResponse(200, order, 'Order created successfully'));
	} catch (error) {
		if (error instanceof ApiError) {
			return res
				.status(error.statusCode)
				.json(new ApiResponse(error.statusCode, null, error.message));
		}
		console.error('Cashfree order error:', error);
		return res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
	}
});

// Verify payment and generate ticket
const verifyPayment = asyncHandler(async (req, res) => {
	try {
		const { order_id } = req.query;

		if (!order_id) throw new ApiError(400, 'Missing order_id');

		// Fetch transaction
		const transaction = await Transaction.findOne({ orderId: order_id });
		if (!transaction) throw new ApiError(404, 'Transaction not found');

		// Use transaction data if not provided in request body
		const fullName = transaction.user?.fullName;
		const email = transaction.user?.email;
		const lpuId = transaction.user?.lpuId;
		const phone = transaction.user?.phone;
		const gender = transaction.user?.gender;
		const hosteler = transaction.user?.hosteler;
		const hostel = transaction.user?.hostel;
		const course = transaction.user?.course;
		const club = transaction.user?.club || '';
		const eventId = transaction.eventId;
		const eventName = transaction.eventName || 'RaveYard 2025';

		// Already completed
		if (transaction.status === 'SUCCESS') {
			// Try to find ticket and QR
			const ticket = await Ticket.findOne({ email, eventId });
			return res
				.status(200)
				.json(new ApiResponse(200, { transaction, ticket }, 'Payment already verified'));
		}

		// Verify with Cashfree
		let cashfreeResponse;
		try {
			const baseURL = process.env.CASHFREE_BASE_URL || 'https://api.cashfree.com';
			const clientId = process.env.CASHFREE_APP_ID;
			const clientSecret = process.env.CASHFREE_SECRET_KEY;

			cashfreeResponse = await axios.get(`${baseURL}/orders/${order_id}`, {
				headers: {
					'x-client-id': clientId,
					'x-client-secret': clientSecret,
					'x-api-version': '2022-09-01',
					'Content-Type': 'application/json',
					accept: 'application/json',
				},
			});
		} catch (err) {
			throw new ApiError(
				502,
				`Failed to verify payment with Cashfree: ${err.response?.data?.message || err.message}`
			);
		}

		const status = cashfreeResponse.data.order_status;

		if (status === 'PAID') {
			transaction.status = 'SUCCESS';
			await transaction.save();

			// Check if ticket already exists
			let ticket = await Ticket.findOne({ email, eventId });
			if (!ticket) {
				// Create ticket and QR
				ticket = new Ticket({
					ticketId: uuidv4(),
					fullName,
					email,
					lpuId,
					phone,
					gender,
					hosteler,
					hostel,
					course,
					eventId,
					eventName,
					isUsed: false,
					isCancelled: false,
					club
				});
				await ticket.save();

				// Add ticket to event registrations
				try {
					await Event.findByIdAndUpdate(
						eventId,
						{ $addToSet: { registrations: ticket._id } },
						{ new: true }
					);
				} catch (eventUpdateErr) {
					console.error('Failed to add ticket to event registrations:', eventUpdateErr);
				}

				let qrCode;
				try {
					qrCode = await generateTicketQR(ticket.ticketId);
					if (!qrCode || !qrCode.url || !qrCode.public_id) {
						throw new Error('Invalid QR code generated');
					}
					ticket.qrCode = {
						url: qrCode.url,
						publicId: qrCode.public_id,
					};
					await ticket.save();
				} catch (qrErr) {
					await Ticket.findByIdAndDelete(ticket._id);
					if (qrCode?.public_id && qrCode.url) {
						await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' });
					}
					throw new ApiError(500, 'Failed to generate QR code for the ticket');
				}

				try {
					await sendRegistrationEmail({
						to: email,
						name: fullName,
						eventName,
						eventDate: '22nd August 2025',
						eventTime: '5:00 PM',
						qrUrl: qrCode.url,
					});
				} catch (emailErr) {
					await Ticket.findByIdAndDelete(ticket._id);
					if (qrCode?.public_id && qrCode.url) {
						await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' });
					}
					throw new ApiError(500, 'Failed to send registration email, ticket deleted');
				}
			}

			return res
				.status(200)
				.json(
					new ApiResponse(
						200,
						{ transaction, ticket },
						'Payment verified and ticket issued'
					)
				);
		} else if (status === 'ACTIVE') {
			return res
				.status(202)
				.json(
					new ApiResponse(202, null, 'Payment is still processing. Try again shortly.')
				);
		} else {
			transaction.status = 'FAILED';
			await transaction.save();
			return res
				.status(400)
				.json(new ApiResponse(400, null, `Payment failed or expired (${status})`));
		}
	} catch (error) {
		if (error instanceof ApiError) {
			return res
				.status(error.statusCode)
				.json(new ApiResponse(error.statusCode, null, error.message));
		}
		console.error('Verify payment error:', error);
		return res.status(500).json(new ApiResponse(500, null, 'Internal server error'));
	}
});

// Webhook handler for Cashfree payment notifications (CRITICAL for production)
const handleWebhook = asyncHandler(async (req, res) => {
	try {
		console.log('Received webhook:', req.body);
		const { order_id, payment_status, payment_amount, order_amount } = req.body;

		if (!order_id) {
			throw new ApiError(400, 'Missing order_id in webhook');
		}

		// Find transaction
		const transaction = await Transaction.findOne({ orderId: order_id });
		if (!transaction) {
			console.log(`Transaction not found for order: ${order_id}`);
			return res.status(200).json({ status: 'ok', message: 'Transaction not found' });
		}

		const { fullName, email, phone, lpuId, gender, hosteler, hostel, course, club } =
			transaction.user;
		const eventId = transaction.eventId || '68859a199ec482166f0e8523';
		const eventName = transaction.eventName || 'RaveYard 2025';

		// Update transaction status based on webhook
		if (payment_status === 'SUCCESS' && Number(payment_amount) === Number(order_amount)) {
			transaction.status = 'SUCCESS';
			transaction.paymentDate = new Date();
			await transaction.save();

			const ticket = new Ticket({
				ticketId: uuidv4(),
				fullName,
				email,
				phone,
				lpuId,
				gender,
				hosteler,
				hostel,
				course,
				eventId,
				eventName,
				isUsed: false,
				isCancelled: false,
				club
			});

			await ticket.save();

			// Add ticket to event registrations
			try {
				await Event.findByIdAndUpdate(
					eventId,
					{ $addToSet: { registrations: ticket._id } },
					{ new: true }
				);
			} catch (eventUpdateErr) {
				console.error('Failed to add ticket to event registrations:', eventUpdateErr);
			}

			let qrCode;
			try {
				qrCode = await generateTicketQR(ticket.ticketId);

				if (!qrCode || !qrCode.url || !qrCode.public_id) {
					throw new Error('Invalid QR code generated');
				}

				ticket.qrCode = {
					url: qrCode.url,
					publicId: qrCode.public_id,
				};

				await ticket.save();
			} catch (qrErr) {
				// Cleanup: remove ticket and QR if QR failed
				await Ticket.findByIdAndDelete(ticket._id);
				if (qrCode?.public_id && qrCode.url) {
					await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' });
				}
				throw new ApiError(500, 'Failed to generate QR code for the ticket');
			}

			try {
				await sendRegistrationEmail({
					to: email,
					name: fullName,
					eventName: eventName,
					eventDate: '22nd August 2025',
					eventTime: '5:00 PM',
					qrUrl: qrCode.url,
				});
			} catch (emailErr) {
				// Cleanup: delete ticket and QR if email fails
				await Ticket.findByIdAndDelete(ticket._id);
				if (qrCode?.public_id && qrCode.url) {
					await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' });
				}
				throw new ApiError(500, 'Failed to send registration email, ticket deleted');
			}
		} else if (payment_status === 'FAILED') {
			transaction.status = 'FAILED';
			await transaction.save();

			console.log(`Payment failed for order: ${order_id}`);
		}

		// Always respond with 200 to acknowledge webhook
		return res.status(200).json({
			status: 'ok',
			message: 'Webhook processed successfully',
		});
	} catch (error) {
		console.error('Webhook processing error:', error);
		// Still return 200 to prevent Cashfree retries
		return res.status(200).json({
			status: 'error',
			message: 'Webhook processing failed',
		});
	}
});

export default { createOrder, verifyPayment, handleWebhook };

import Transaction from '../models/Transaction.js';
import Ticket from '../models/ticket.model.js';
import Event from '../models/event.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateTicketQR } from '../services/qrcode.service.js';
import { sendRegistrationEmail } from '../services/email.service.js';
import { deleteFile } from '../utils/cloudinary.js';
import { v4 as uuidv4 } from 'uuid';
import { createInstamojoOrder } from '../services/instamojo.service.js';
import axios from 'axios';
import { config } from 'dotenv';
config();

const INSTAMOJO_API_KEY = process.env.INSTAMOJO_API_KEY;
const INSTAMOJO_AUTH_TOKEN = process.env.INSTAMOJO_AUTH_TOKEN;
const INSTAMOJO_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://api.instamojo.com/v2'
    : 'https://test.instamojo.com/v2';

// Create Instamojo Order
const createOrder = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, phone, amount, eventId, lpuId, gender, hosteler, hostel, course, club = "" } = req.body;

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
      console.error('Missing required fields:', missingFields);
      throw new ApiError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }
    if (isNaN(amount) || amount <= 0) {
      console.error('Invalid amount:', amount);
      throw new ApiError(400, 'Invalid amount');
    }

    // Check for duplicate ticket by email/lpuId for this event
    const eventIdToUse = eventId || '68859a199ec482166f0e8523';
    const existingTicket = await Ticket.findOne({
      eventId: eventIdToUse,
      $or: [{ email: email.trim() }, { lpuId: lpuId.trim() }],
    });
    if (existingTicket) {
      console.error('Duplicate ticket found for email/lpuId:', email, lpuId, 'event:', eventIdToUse);
      throw new ApiError(
        409,
        'A ticket has already been purchased with this email address or LPU ID for this event'
      );
    }

    // Generate unique order and customer IDs
    const orderId = uuidv4() + '-' + Date.now();

    // Check for duplicate orderId
    const existingOrder = await Transaction.findOne({ orderId });
    if (existingOrder) {
      console.error('Duplicate orderId generated:', orderId);
      throw new ApiError(409, 'Duplicate orderId — try again');
    }

    // Resolve event name for order note
    let resolvedEventName = 'RaveYard 2025';
    let eventDoc;
    try {
      eventDoc = await Event.findById(eventIdToUse);
      if (eventDoc && eventDoc.name) {
        resolvedEventName = eventDoc.name;
      }
    } catch (eventErr) {
      console.error('Error fetching event:', eventIdToUse, eventErr);
    }

    // Prepare Instamojo order payload
    const payload = {
      purpose: `${resolvedEventName} - LPU ID: ${lpuId}`,
      amount,
      buyer_name: fullName,
      email,
      phone,
      send_email: true,
      send_sms: true,
      allow_repeated_payments: false,
      redirect_url: `${process.env.INSTAMOJO_RETURN_URL}?order_id=${orderId}`,
      webhook: process.env.INSTAMOJO_WEBHOOK_URL
    };

    // Create order with Instamojo using the service
    let payment;
    try {
      payment = await createInstamojoOrder(payload);
    } catch (instamojoErr) {
      console.error('Instamojo order creation error:', instamojoErr);
      throw new ApiError(500, `Failed to create Instamojo payment request: ${instamojoErr.message}`);
    }

    if (!payment || !payment.success) {
      console.error('Instamojo did not return a success response:', payment);
      throw new ApiError(500, 'Failed to create Instamojo payment request');
    }

    // Create transaction record
    try {
      await Transaction.create({
        orderId,
        user: { fullName, email, phone, lpuId, gender, hosteler, hostel, course, club },
        amount: Number(amount),
        status: 'PENDING',
        paymentMethod: 'Instamojo',
        eventId: eventIdToUse,
        eventName: resolvedEventName,
      });
    } catch (dbErr) {
      console.error('Error creating transaction record:', dbErr);
      throw new ApiError(500, 'Failed to create transaction record');
    }

    return res.status(200).json(new ApiResponse(200, payment, 'Order created successfully'));
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message));
    }
    console.error('Instamojo order error:', error.stack || error);
    return res.status(500).json(new ApiResponse(500, null, error.message || 'Internal server error'));
  }
});

// Verify payment and generate ticket
const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { order_id, payment_id } = req.query;
    if (!order_id || !payment_id) {
      console.error('Missing order_id or payment_id:', { order_id, payment_id });
      throw new ApiError(400, 'Missing order_id or payment_id');
    }

    // Fetch transaction
    const transaction = await Transaction.findOne({ orderId: order_id });
    if (!transaction) {
      console.error('Transaction not found for orderId:', order_id);
      throw new ApiError(404, 'Transaction not found');
    }

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

    // Verify with Instamojo
    let instamojoResponse;
    try {
      instamojoResponse = await axios.get(`${INSTAMOJO_BASE_URL}/payments/${payment_id}`, {
        headers: {
          'X-Api-Key': INSTAMOJO_API_KEY,
          'X-Auth-Token': INSTAMOJO_AUTH_TOKEN,
        },
      });
    } catch (err) {
      console.error('Error verifying payment with Instamojo:', err.response?.data || err);
      throw new ApiError(
        502,
        `Failed to verify payment with Instamojo: ${err.response?.data?.message || err.message}`
      );
    }

    const payment = instamojoResponse.data;
    const status = payment?.payment?.status;

    if (payment.success && status === 'Credit') {
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
          console.error('QR code generation failed:', qrErr);
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
          console.error('Registration email failed:', emailErr);
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
    } else if (status === 'Failed') {
      transaction.status = 'FAILED';
      await transaction.save();
      console.error('Payment failed or expired:', status, payment);
      return res
        .status(400)
        .json(new ApiResponse(400, null, `Payment failed or expired (${status})`));
    } else {
      console.warn('Payment is still processing:', payment);
      return res
        .status(202)
        .json(
          new ApiResponse(202, null, 'Payment is still processing. Try again shortly.')
        );
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message));
    }
    console.error('Verify payment error:', error.stack || error);
    return res.status(500).json(new ApiResponse(500, null, error.message || 'Internal server error'));
  }
});

// Webhook handler for Instamojo payment notifications
const handleWebhook = asyncHandler(async (req, res) => {
  try {
    console.log('Received Instamojo webhook:', req.body);

    const { payment_id, status, amount, buyer, buyer_email, purpose } = req.body;
    const order_id = req.query.order_id || purpose?.split('LPU ID:')?.[0]?.trim();

    if (!order_id) {
      console.error('Missing order_id in webhook:', req.body);
      throw new ApiError(400, 'Missing order_id in webhook');
    }

    // Find transaction
    const transaction = await Transaction.findOne({ orderId: order_id });
    if (!transaction) {
      console.error(`Transaction not found for order: ${order_id}`);
      return res.status(200).json({ status: 'ok', message: 'Transaction not found' });
    }

    const { fullName, email, phone, lpuId, gender, hosteler, hostel, course, club } =
      transaction.user;
    const eventId = transaction.eventId || '68859a199ec482166f0e8523';
    const eventName = transaction.eventName || 'RaveYard 2025';

    // Update transaction status based on webhook
    if (status === 'Credit') {
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
        console.error('QR code generation failed (webhook):', qrErr);
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
        console.error('Registration email failed (webhook):', emailErr);
        // Cleanup: delete ticket and QR if email fails
        await Ticket.findByIdAndDelete(ticket._id);
        if (qrCode?.public_id && qrCode.url) {
          await deleteFile({ public_id: qrCode.public_id, resource_type: 'image' });
        }
        throw new ApiError(500, 'Failed to send registration email, ticket deleted');
      }
    } else if (status === 'Failed') {
      transaction.status = 'FAILED';
      await transaction.save();
      console.error(`Payment failed for order: ${order_id}`);
    }

    // Always respond with 200 to acknowledge webhook
    return res.status(200).json({
      status: 'ok',
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Webhook processing error:', error.stack || error);
    // Still return 200 to prevent Instamojo retries
    return res.status(200).json({
      status: 'error',
      message: 'Webhook processing failed',
    });
  }
});

export default { createOrder, verifyPayment, handleWebhook };

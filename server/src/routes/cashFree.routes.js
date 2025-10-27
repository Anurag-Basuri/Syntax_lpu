import express from 'express';
import cashFreeController from '../controllers/cashFree.controller.js';

const router = express.Router();

// Create a new Cashfree order
router.post('/create-order', cashFreeController.createOrder);

// Verify payment and generate ticket
router.post('/verify', cashFreeController.verifyPayment);

// Webhook endpoint for Cashfree notifications (CRITICAL for production)
router.post('/webhook', cashFreeController.handleWebhook);

export default router;
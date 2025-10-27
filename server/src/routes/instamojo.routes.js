import express from 'express';
import instamojoController from '../controllers/instamojo.controller.js';

const router = express.Router();

// Create a new Instamojo order
router.post('/create-order', instamojoController.createOrder);

// Verify payment and generate ticket
router.post('/verify', instamojoController.verifyPayment);

// Webhook endpoint for Instamojo notifications
router.post('/webhook', instamojoController.handleWebhook);

export default router;
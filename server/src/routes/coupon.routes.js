import { Router } from 'express';
import {
    createCoupon,
    getAllCoupons,
    getCouponByCode,
    validateCoupon,
    redeemCoupon,
    deleteCoupon
} from '../controllers/coupon.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Get a coupon by code
router.get('/:code', getCouponByCode);

// Validate a coupon (for use)
router.post('/validate', validateCoupon);

// Redeem a coupon (increment usage)
router.post('/redeem', redeemCoupon);

// Admin: Delete a coupon
router.delete('/:code', authMiddleware.verifyToken, deleteCoupon);

// Admin: Create a new coupon
router.post('/create',
    authMiddleware.verifyToken,
    createCoupon);

// Get all coupons (admin or public, adjust middleware as needed)
router.get('/getall',
    authMiddleware.verifyToken,
    getAllCoupons);

export default router;
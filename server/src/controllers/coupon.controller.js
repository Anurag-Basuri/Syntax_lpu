import Coupon from '../models/coupon.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';

// Create a new coupon
const createCoupon = asyncHandler(async (req, res) => {
    const { discount, expiryDate, maxUsage } = req.body;

    // Validate discount
    if (discount % 5 !== 0 || discount < 5 || discount > 100) {
        throw new ApiError(400, 'Discount must be a multiple of 5 between 5% and 100%');
    }

    // Validate expiryDate
    const expiry = new Date(expiryDate);
    if (isNaN(expiry) || expiry <= new Date()) {
        throw new ApiError(400, 'Valid future expiry date is required');
    }

    // Create coupon with validated data
    const coupon = await Coupon.create({
        discount,
        expiryDate: expiry,
        ...(maxUsage !== undefined && { maxUsage })
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                coupon,
                'Coupon created successfully'
            )
        );
});

// Get all coupons
const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res
        .json(
            new ApiResponse(
                200,
                coupons,
                'Coupons retrieved successfully'
            )
        );
});

// Get coupon by code
const getCouponByCode = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    return res
        .json(
            new ApiResponse(
                200,
                coupon,
                'Coupon retrieved successfully'
            )
        );
});

// Validate coupon
const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
        throw new ApiError(400, 'Valid coupon code is required');
    }

    try {
        const coupon = await Coupon.validateCoupon(code.toUpperCase());
        return res.json(new ApiResponse(200, coupon, 'Coupon is valid'));
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});

// Redeem coupon
const redeemCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
        throw new ApiError(400, 'Valid coupon code is required');
    }

    try {
        const coupon = await Coupon.validateCoupon(code.toUpperCase());
        await coupon.incrementUsage();
        return res
            .json(
                new ApiResponse(
                    200,
                    coupon,
                    'Coupon redeemed successfully'
                )
            );
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});

// Delete coupon
const deleteCoupon = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const coupon = await Coupon.findOneAndDelete({ code: code.toUpperCase() });

    if (!coupon) {
        throw new ApiError(404, 'Coupon not found');
    }

    return res
        .json(
            new ApiResponse(
                200,
                coupon,
                'Coupon deleted successfully'
            )
        );
});

export {
    createCoupon,
    getAllCoupons,
    getCouponByCode,
    validateCoupon,
    redeemCoupon,
    deleteCoupon
};
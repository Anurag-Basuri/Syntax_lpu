import Admin from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create Admin
const createAdmin = asyncHandler(async (req, res) => {
    const { fullname, password } = req.body;

    if (!fullname || !password) {
        throw new ApiError(400, "Fullname and password are required");
    }

    const existing = await Admin.findOne({ fullname });
    if (existing) {
        throw new ApiError(409, "Admin with this fullname already exists");
    }

    const admin = await Admin.create({ fullname, password });
    const accessToken = admin.generateAuthToken();
    const refreshToken = admin.generateRefreshToken();

    // Save token in tokens array
    admin.tokens.push({ token: refreshToken });
    await admin.save();

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { admin, accessToken, refreshToken },
                "Admin created successfully"
            )
        );
});

// Login Admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { fullname, password, secret } = req.body;

    if (!fullname || !password || !secret) {
        throw new ApiError(400, "Fullname, password, and secret are required");
    }

    if (secret !== process.env.ADMIN_SECRET) {
        throw new ApiError(403, "Invalid admin secret");
    }

    const admin = await Admin.findOne({ fullname });
    if (!admin || !(await admin.comparePassword(password))) {
        throw new ApiError(401, "Invalid credentials");
    }

    const accessToken = admin.generateAuthToken();
    const refreshToken = admin.generateRefreshToken();

    // Save token in tokens array
    admin.tokens.push({ token: refreshToken });
    await admin.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                admin,
                accessToken,
                refreshToken,
            }, "Login successful")
        );
});

// Logout Admin
const logoutAdmin = asyncHandler(async (req, res) => {
    const admin = req.admin;

    if (!admin) {
        throw new ApiError(401, "Unauthorized");
    }

    // Remove all tokens (logout from all devices)
    admin.tokens = [];
    await admin.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Logout successful")
        );
});

// Get current admin
const currentAdmin = asyncHandler(async (req, res) => {
    const admin = req.admin;
    if (!admin) {
        throw new ApiError(401, "Unauthorized");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { admin },
                "Current admin retrieved successfully"
            )
        );
});

export { createAdmin, loginAdmin, logoutAdmin, currentAdmin };

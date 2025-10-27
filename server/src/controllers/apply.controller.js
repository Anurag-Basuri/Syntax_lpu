import Apply from "../models/apply.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// Create a new application
const applyController = asyncHandler(async (req, res) => {
	console.log("Received application data:", req.body);
	const {
		fullName,
		LpuId,
		email,
		phone,
		course,
		gender,
		domains,
		accommodation,
		previousExperience,
		anyotherorg,
		bio,
	} = req.body;

	if (!fullName || !LpuId || !email || !phone || !course || !domains || !accommodation) {
		throw new ApiError(400, "You left one required field empty");
	}

	const newApplication = await Apply.create({
		fullName,
		LpuId,
		email,
		phone,
		course,
		gender,
		domains,
		accommodation,
		previousExperience,
		anyotherorg,
		bio,
	});
	console.log("New application created:", newApplication);

	return res
		.status(201)
		.json(
            new ApiResponse(
                201,
                "Application created successfully",
                newApplication
            )
        );
});

// Get all applications (with filtering and pagination)
const getAllApplications = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        course,
        startDate,
        endDate,
        search,
        seen, // <-- add seen
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (course) filter.course = course;
    if (seen === 'true') filter.seen = true;
    if (seen === 'false') filter.seen = false;

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
        filter.$or = [
            { fullName: { $regex: search, $options: "i" } },
            { LpuId: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 },
    };

    const applications = await Apply.paginate(filter, options);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                applications,
                "Applications retrieved successfully"
            )
        );
});

// Get single application by ID
const getApplicationById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (!mongoose.Types.ObjectId.isValid(id)) {
		throw new ApiError(400, "Invalid application ID");
	}

	const application = await Apply.findById(id);

	if (!application) {
		throw new ApiError(404, "Application not found");
	}

	return res
		.status(200)
		.json(
            new ApiResponse(
                200,
                application,
                "Application retrieved successfully"
            )
        );
});

// Update status (approve/reject)
const updateApplicationStatus = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { status } = req.body;

	if (!["approved", "rejected", "pending"].includes(status)) {
		throw new ApiError(400, "Invalid status value");
	}

	const updated = await Apply.findByIdAndUpdate(id, { status }, { new: true });

	if (!updated) {
		throw new ApiError(404, "Application not found");
	}

	return res
		.status(200)
		.json(
            new ApiResponse(
                200,
                updated,
                "Status updated successfully"
            )
        );
});

// Delete an application
const deleteApplication = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const deleted = await Apply.findByIdAndDelete(id);

	if (!deleted) {
		throw new ApiError(404, "Application not found");
	}

	return res
		.status(200)
		.json(
            new ApiResponse(
                200,
                deleted,
                "Application deleted successfully"
            )
        );
});

// Mark application as seen
const markApplicationAsSeen = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const updated = await Apply.findByIdAndUpdate(id, { seen: true }, { new: true });
	if (!updated) throw new ApiError(404, "Application not found");

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				updated,
				"Marked as seen"
			)
		);
});

// Export all controller functions
export {
	applyController,
	getAllApplications,
	getApplicationById,
	updateApplicationStatus,
	deleteApplication,
	markApplicationAsSeen
};

import { Router } from "express";
import {
    applyController,
	getAllApplications,
	getApplicationById,
	updateApplicationStatus,
	deleteApplication,
	markApplicationAsSeen
} from "../controllers/apply.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import { body, param } from "express-validator";

const router = Router();

// Submit a new application (public)
router.post(
    "/apply",
    validate([
        body("fullName")
            .notEmpty()
            .withMessage("Full name is required"),
        body("LpuId")
            .notEmpty()
            .withMessage("LPU ID is required")
            .isLength({ min: 8, max: 8 })
            .withMessage("LPU ID must be exactly 8 digits"),
        body("email")
            .isEmail()
            .withMessage("Invalid email format"),
        body("phone")
            .notEmpty()
            .withMessage("Phone number is required"),
        body("course")
            .notEmpty()
            .withMessage("Course is required"),
        body("domains")
            .isArray({ min: 1 })
            .withMessage("At least one domain is required"),
        body("accommodation")
            .notEmpty()
            .withMessage("Accommodation preference is required")
    ]),
    applyController
);

// Get all applications (protected)
router.get(
    "/applications",
    authMiddleware.verifyToken,
    getAllApplications
);

// Get single application by ID (protected)
router.get(
    "/applications/:id",
    authMiddleware.verifyToken,
    validate([
        param("id")
            .isMongoId()
            .withMessage("Invalid application ID")
    ]),
    getApplicationById
);

// Update application status (protected)
router.patch(
    "/applications/:id/status",
    authMiddleware.verifyToken,
    validate([
        param("id")
            .isMongoId()
            .withMessage("Invalid application ID"),
        body("status")
            .isIn(["approved", "rejected", "pending"])
            .withMessage("Invalid status value")
    ]),
    updateApplicationStatus
);

// Mark application as seen (protected)
router.patch(
  "/applications/:id/seen",
  authMiddleware.verifyToken,
  validate([param("id").isMongoId().withMessage("Invalid application ID")]),
  markApplicationAsSeen
);

// Delete an application (protected)
router.delete(
    "/applications/:id/delete",
    authMiddleware.verifyToken,
    validate([
        param("id")
            .isMongoId()
            .withMessage("Invalid application ID")
    ]),
    deleteApplication
);

export default router;
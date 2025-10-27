import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError.js';

export const validate = (validations) => {
	return async (req, res, next) => {
		// Run all validators
		for (let validation of validations) {
			const result = await validation.run(req);
			if (result.errors.length) break;
		}

		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			const extractedErrors = errors.array().map(err => ({
				[err.path]: err.msg,
			}));

			return next(new ApiError(422, 'Validation failed', extractedErrors));
		}

		next();
	};
};

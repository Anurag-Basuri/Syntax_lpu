class ApiError extends Error {
	constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
		super(message);

		// Validate HTTP status code
		if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
			throw new Error(`Invalid HTTP status code: ${statusCode}`);
		}

		this.statusCode = statusCode;
		this.data = null;
		this.message = message;
		this.success = false;
		this.errors = Array.isArray(errors) ? errors : [errors];
		this.timestamp = new Date().toISOString();

		// Stack trace handling
		stack ? (this.stack = stack) : Error.captureStackTrace(this, this.constructor);
	}

	// Static factory methods for common errors
	static badRequest(message = 'Bad Request', errors = []) {
		return new ApiError(400, message, errors);
	}

	static unauthorized(message = 'Unauthorized access') {
		return new ApiError(401, message);
	}

	static forbidden(message = 'Forbidden access') {
		return new ApiError(403, message);
	}

	static notFound(message = 'Resource not found') {
		return new ApiError(404, message);
	}

	static tooManyRequests(message = 'Too many requests') {
		return new ApiError(429, message);
	}

	static internal(message = 'Internal server error') {
		return new ApiError(500, message);
	}

	// Safe serialization for responses
	toJSON() {
		return {
			success: this.success,
			statusCode: this.statusCode,
			message: this.message,
			errors: this.errors,
			timestamp: this.timestamp,
			...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
		};
	}
}

export { ApiError };

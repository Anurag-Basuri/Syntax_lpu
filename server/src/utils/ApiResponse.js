class ApiResponse {
    constructor(statusCode, data = null, message = null, metadata = {}) {
        // Validate statusCode
        if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
            throw new Error('Status code must be a valid HTTP status code (100-599)');
        }

        // Validate metadata
        if (metadata !== null && typeof metadata !== 'object') {
            throw new Error('Metadata must be an object or null');
        }

        this.statusCode = statusCode;
        this.data = data;
        this.message = message || this._getDefaultMessage(statusCode);
        this.success = statusCode >= 200 && statusCode < 300; // More precise success definition
        this.timestamp = new Date().toISOString();
        this.metadata = { ...metadata }; // Clone to prevent external mutations

        // Add response category
        this.category = this._getCategory(statusCode);

        // Freeze the object to prevent accidental mutations
        Object.freeze(this);
    }

    /**
     * Get default message for status code
     * @param {number} statusCode 
     * @returns {string}
     */
    _getDefaultMessage(statusCode) {
        const messages = {
            200: 'OK',
            201: 'Created',
            202: 'Accepted',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            409: 'Conflict',
            422: 'Unprocessable Entity',
            429: 'Too Many Requests',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable',
            504: 'Gateway Timeout'
        };
        return messages[statusCode] || 'Unknown Status';
    }

    /**
     * Get response category based on status code
     * @param {number} statusCode 
     * @returns {string}
     */
    _getCategory(statusCode) {
        if (statusCode >= 100 && statusCode < 200) return 'informational';
        if (statusCode >= 200 && statusCode < 300) return 'success';
        if (statusCode >= 300 && statusCode < 400) return 'redirection';
        if (statusCode >= 400 && statusCode < 500) return 'client_error';
        if (statusCode >= 500 && statusCode < 600) return 'server_error';
        return 'unknown';
    }

    // Status check methods
    isSuccess() {
        return this.success;
    }

    isInformational() {
        return this.statusCode >= 100 && this.statusCode < 200;
    }

    isRedirection() {
        return this.statusCode >= 300 && this.statusCode < 400;
    }

    isClientError() {
        return this.statusCode >= 400 && this.statusCode < 500;
    }

    isServerError() {
        return this.statusCode >= 500 && this.statusCode < 600;
    }

    isError() {
        return this.statusCode >= 400;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message,
            data: this.data,
            success: this.success,
            timestamp: this.timestamp,
            category: this.category,
            metadata: this.metadata
        };
    }

    toString(space = null) {
        return JSON.stringify(this.toJSON(), null, space);
    }

    getStatusText() {
        return this._getDefaultMessage(this.statusCode);
    }

    // Static methods for common responses

    static success(data = null, message = null, statusCode = 200, metadata = {}) {
        return new ApiResponse(statusCode, data, message, metadata);
    }

    static created(data = null, message = null, metadata = {}) {
        return new ApiResponse(201, data, message, metadata);
    }

    static accepted(data = null, message = null, metadata = {}) {
        return new ApiResponse(202, data, message, metadata);
    }

    static noContent(message = null, metadata = {}) {
        return new ApiResponse(204, null, message, metadata);
    }

    static error(message, statusCode = 500, data = null, metadata = {}) {
        return new ApiResponse(statusCode, data, message, metadata);
    }

    static badRequest(message = null, data = null, metadata = {}) {
        return new ApiResponse(400, data, message, metadata);
    }

    static unauthorized(message = null, data = null, metadata = {}) {
        return new ApiResponse(401, data, message, metadata);
    }

    static forbidden(message = null, data = null, metadata = {}) {
        return new ApiResponse(403, data, message, metadata);
    }

    static notFound(message = null, data = null, metadata = {}) {
        return new ApiResponse(404, data, message, metadata);
    }

    static methodNotAllowed(message = null, data = null, metadata = {}) {
        return new ApiResponse(405, data, message, metadata);
    }

    static conflict(message = null, data = null, metadata = {}) {
        return new ApiResponse(409, data, message, metadata);
    }

    static unprocessableEntity(message = null, data = null, metadata = {}) {
        return new ApiResponse(422, data, message, metadata);
    }

    static tooManyRequests(message = null, data = null, metadata = {}) {
        return new ApiResponse(429, data, message, metadata);
    }

    static internalServerError(message = null, data = null, metadata = {}) {
        return new ApiResponse(500, data, message, metadata);
    }

    static serviceUnavailable(message = null, data = null, metadata = {}) {
        return new ApiResponse(503, data, message, metadata);
    }

    static fromError(error, statusCode = 500, metadata = {}) {
        const errorData = {
            name: error.name,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        return new ApiResponse(statusCode, errorData, error.message, metadata);
    }

    static paginated(data, pagination, message = null, metadata = {}) {
        const paginationMetadata = {
            ...metadata,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: Math.ceil(pagination.total / pagination.limit),
                hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
                hasPrev: pagination.page > 1
            }
        };
        return new ApiResponse(200, data, message, paginationMetadata);
    }
}

export { ApiResponse };
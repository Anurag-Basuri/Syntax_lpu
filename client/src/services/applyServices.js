import { apiClient, publicClient } from './api.js';

// ==================================================
// Public Application Services
// ==================================================

// 
export const submitApplication = async (applicationData) => {
	try {
		const response = await publicClient.post('/api/v1/apply', applicationData);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to submit application.');
	}
};

// ==================================================
// Admin-Only Application Services
// ==================================================

/**
 * Fetches statistics about all applications.
 * @returns {Promise<object>} An object containing application statistics.
 */
export const getApplicationStats = async () => {
	try {
		const response = await apiClient.get('/api/v1/apply/stats');
		return response.data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to fetch application stats.');
	}
};

/**
 * Fetches all applications with filtering and pagination.
 * @param {object} params - Query parameters for filtering and pagination (e.g., { page: 1, limit: 10, status: 'pending' }).
 * @returns {Promise<object>} A paginated list of applications.
 */
export const getAllApplications = async (params) => {
	try {
		const response = await apiClient.get('/api/v1/apply', { params });
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to fetch applications.');
	}
};

/**
 * Fetches a single application by its ID.
 * @param {string} id - The ID of the application.
 * @returns {Promise<object>} The application object.
 */
export const getApplicationById = async (id) => {
	try {
		const response = await apiClient.get(`/api/v1/apply/${id}`);
		return response.data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to fetch application details.');
	}
};

/**
 * Updates the status of a single application.
 * @param {string} id - The ID of the application.
 * @param {string} status - The new status ('approved', 'rejected', 'pending').
 * @returns {Promise<object>} The updated application object.
 */
export const updateApplicationStatus = async (id, status) => {
	try {
		const response = await apiClient.patch(`/api/v1/apply/${id}/status`, { status });
		return response.data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to update application status.');
	}
};

/**
 * Marks an application as seen by an admin.
 * @param {string} id - The ID of the application.
 * @returns {Promise<object>} The updated application object.
 */
export const markApplicationAsSeen = async (id) => {
	try {
		const response = await apiClient.patch(`/api/v1/apply/${id}/seen`);
		return response.data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to mark application as seen.');
	}
};

/**
 * Updates the status of multiple applications in bulk.
 * @param {string[]} ids - An array of application IDs.
 * @param {string} status - The new status to apply to all.
 * @returns {Promise<object>} A success message.
 */
export const bulkUpdateApplicationStatus = async (ids, status) => {
	try {
		const response = await apiClient.patch('/api/v1/apply/bulk/status', { ids, status });
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to perform bulk update.');
	}
};

/**
 * Deletes a single application.
 * @param {string} id - The ID of the application to delete.
 * @returns {Promise<object>} A success message.
 */
export const deleteApplication = async (id) => {
	try {
		const response = await apiClient.delete(`/api/v1/apply/${id}`);
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to delete application.');
	}
};

import { apiClient, publicClient } from './api.js';

// ==================================================
// Public Arvantis Services
// ==================================================

/**
 * Fetches data for the main landing page (current or last completed fest).
 * @returns {Promise<object>} The fest data for the landing page.
 */
export const getArvantisLandingData = async () => {
	try {
		const response = await publicClient.get('/api/v1/arvantis/landing');
		return response.data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to fetch landing page data.');
	}
};

/**
 * Fetches a paginated list of all fests.
 * @param {object} params - Query parameters for pagination and sorting.
 * @returns {Promise<object>} A paginated list of fests.
 */
export const getAllFests = async (params) => {
	try {
		const response = await publicClient.get('/api/v1/arvantis', { params });
		return response.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to fetch fests.');
	}
};

/**
 * Fetches full details for a single fest by its slug or year.
 * @param {string} identifier - The fest's slug or year.
 * @returns {Promise<object>} The detailed fest object.
 */
export const getFestDetails = async (identifier) => {
	try {
		const response = await publicClient.get(`/api/v1/arvantis/${identifier}`);
		return response.data.data;
	} catch (error) {
		throw new Error(error.response?.data?.message || 'Failed to fetch fest details.');
	}
};

// ==================================================
// Admin-Only Arvantis Services
// ==================================================

/**
 * Creates a new Arvantis fest record.
 * @param {object} festData - The data for the new fest.
 * @returns {Promise<object>} The newly created fest object.
 */
export const createFest = async (festData) => {
	try {
		const response = await apiClient.post('/api/v1/arvantis', festData);
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to create fest.');
	}
};

/**
 * Updates the core details of a fest.
 * @param {string} identifier - The fest's slug or year.
 * @param {object} updateData - The data to update.
 * @returns {Promise<object>} The updated fest object.
 */
export const updateFestDetails = async (identifier, updateData) => {
	try {
		const response = await apiClient.patch(
			`/api/v1/arvantis/${identifier}/details`,
			updateData
		);
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to update fest details.');
	}
};

/**
 * Deletes a fest and all its associated media.
 * @param {string} identifier - The fest's slug or year.
 * @returns {Promise<object>} A success message.
 */
export const deleteFest = async (identifier) => {
	try {
		const response = await apiClient.delete(`/api/v1/arvantis/${identifier}`);
		return response.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to delete fest.');
	}
};

/**
 * Adds a partner (sponsor/collaborator) to a fest.
 * @param {string} identifier - The fest's slug or year.
 * @param {FormData} formData - FormData containing partner details and the logo file.
 * @returns {Promise<object>} The updated list of partners.
 */
export const addPartner = async (identifier, formData) => {
	try {
		const response = await apiClient.post(`/api/v1/arvantis/${identifier}/partners`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to add partner.');
	}
};

/**
 * Removes a partner from a fest.
 * @param {string} identifier - The fest's slug or year.
 * @param {string} partnerName - The name of the partner to remove.
 * @returns {Promise<object>} A success message.
 */
export const removePartner = async (identifier, partnerName) => {
	try {
		const response = await apiClient.delete(
			`/api/v1/arvantis/${identifier}/partners/${partnerName}`
		);
		return response.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to remove partner.');
	}
};

/**
 * Links an existing event to a fest.
 * @param {string} identifier - The fest's slug or year.
 * @param {string} eventId - The ID of the event to link.
 * @returns {Promise<object>} The updated list of event IDs.
 */
export const linkEventToFest = async (identifier, eventId) => {
	try {
		const response = await apiClient.post(`/api/v1/arvantis/${identifier}/events`, { eventId });
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to link event.');
	}
};

/**
 * Unlinks an event from a fest.
 * @param {string} identifier - The fest's slug or year.
 * @param {string} eventId - The ID of the event to unlink.
 * @returns {Promise<object>} The updated list of event IDs.
 */
export const unlinkEventFromFest = async (identifier, eventId) => {
	try {
		const response = await apiClient.delete(`/api/v1/arvantis/${identifier}/events/${eventId}`);
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to unlink event.');
	}
};

/**
 * Uploads or updates the main fest poster.
 * @param {string} identifier - The fest's slug or year.
 * @param {FormData} formData - FormData containing the poster file.
 * @returns {Promise<object>} The updated poster object.
 */
export const updateFestPoster = async (identifier, formData) => {
	try {
		const response = await apiClient.patch(`/api/v1/arvantis/${identifier}/poster`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to update poster.');
	}
};

/**
 * Adds one or more media items to the fest gallery.
 * @param {string} identifier - The fest's slug or year.
 * @param {FormData} formData - FormData containing one or more media files.
 * @returns {Promise<object>} The updated gallery array.
 */
export const addGalleryMedia = async (identifier, formData) => {
	try {
		const response = await apiClient.post(`/api/v1/arvantis/${identifier}/gallery`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to add gallery media.');
	}
};

/**
 * Removes a media item from the gallery.
 * @param {string} identifier - The fest's slug or year.
 * @param {string} publicId - The public_id of the media to remove.
 * @returns {Promise<object>} A success message.
 */
export const removeGalleryMedia = async (identifier, publicId) => {
	try {
		const response = await apiClient.delete(
			`/api/v1/arvantis/${identifier}/gallery/${publicId}`
		);
		return response.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to remove gallery media.');
	}
};

/**
 * Exports all fest data as a CSV file.
 * @returns {Promise<Blob>} The CSV file blob.
 */
export const exportFestsCSV = async () => {
	try {
		const response = await apiClient.get('/api/v1/arvantis/export/csv', {
			responseType: 'blob', // Important for file downloads
		});
		return response.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to export CSV.');
	}
};

/**
 * Fetches high-level fest analytics.
 * @returns {Promise<object>} The analytics data.
 */
export const getFestAnalytics = async () => {
	try {
		const response = await apiClient.get('/api/v1/arvantis/analytics/overview');
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to fetch analytics.');
	}
};

/**
 * Fetches high-level fest statistics.
 * @returns {Promise<object>} The statistics data.
 */
export const getFestStatistics = async () => {
	try {
		const response = await apiClient.get('/api/v1/arvantis/statistics/overview');
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to fetch statistics.');
	}
};

/**
 * Generates a detailed report for a single fest.
 * @param {string} identifier - The fest's slug or year.
 * @returns {Promise<object>} The fest report data.
 */
export const generateFestReport = async (identifier) => {
	try {
		const response = await apiClient.get(`/api/v1/arvantis/reports/${identifier}`);
		return response.data.data;
	} catch (error) {
		throw new Error(error.message || 'Failed to generate report.');
	}
};

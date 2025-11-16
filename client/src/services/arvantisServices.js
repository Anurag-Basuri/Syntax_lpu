import { apiClient, publicClient } from './api.js';

/**
 * Normalize server pagination responses into a consistent shape:
 * { docs, totalDocs, page, totalPages, limit, hasPrevPage, hasNextPage, prevPage, nextPage }
 */
const normalizePagination = (raw) => {
	const payload = raw?.data ?? raw ?? {};
	// Case: ApiResponse with data array and pagination object
	const data = payload.data ?? payload.docs ?? payload;
	if (Array.isArray(data)) {
		const docs = payload.data || payload.docs || data;
		const pagination = payload.pagination || payload;
		return {
			docs,
			totalDocs: pagination.totalDocs ?? pagination.total ?? docs.length,
			page: pagination.page ?? pagination.currentPage ?? 1,
			totalPages: pagination.totalPages ?? pagination.totalPages ?? 1,
			limit: pagination.limit ?? pagination.perPage ?? docs.length,
			hasPrevPage: !!pagination.hasPrevPage,
			hasNextPage: !!pagination.hasNextPage,
			prevPage: pagination.prevPage ?? null,
			nextPage: pagination.nextPage ?? null,
		};
	}

	// If server returned a single object in data (non-paginated)
	if (payload.data && !Array.isArray(payload.data)) {
		return { docs: [payload.data], totalDocs: 1, page: 1, totalPages: 1, limit: 1 };
	}

	// Fallback: top-level docs
	if (Array.isArray(payload.docs)) {
		return {
			docs: payload.docs,
			totalDocs: payload.totalDocs ?? payload.docs.length,
			page: payload.page ?? 1,
			totalPages: payload.totalPages ?? 1,
			limit: payload.limit ?? payload.docs.length,
			hasPrevPage: !!payload.hasPrevPage,
			hasNextPage: !!payload.hasNextPage,
			prevPage: payload.prevPage ?? null,
			nextPage: payload.nextPage ?? null,
		};
	}

	return { docs: [], totalDocs: 0, page: 1, totalPages: 0, limit: 0 };
};

const extractError = (err, fallback = 'Request failed') =>
	err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;

// -------------------------- Public / Admin selection helper --------------------------
const clientFor = (admin = false) => (admin ? apiClient : publicClient);

// ================================ Public Arvantis Services ================================
export const getArvantisLandingData = async () => {
	try {
		const resp = await publicClient.get('/api/v1/arvantis/landing');
		return resp.data?.data ?? null;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to fetch landing data.'));
	}
};

export const getAllFests = async (params = {}, options = { admin: false }) => {
	try {
		const client = clientFor(options.admin);
		const resp = await client.get('/api/v1/arvantis', { params });
		// normalize possible paginated shapes
		return normalizePagination(resp.data ?? resp);
	} catch (err) {
		throw new Error(extractError(err, 'Failed to fetch fests.'));
	}
};

export const getFestDetails = async (identifier, options = { admin: false }) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		const client = clientFor(options.admin);
		const resp = await client.get(`/api/v1/arvantis/${encodeURIComponent(identifier)}`);
		return resp.data?.data ?? null;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to fetch fest details.'));
	}
};

// ================================ Admin-only Arvantis Services ================================
export const createFest = async (festData) => {
	try {
		const isForm = festData instanceof FormData;
		const resp = isForm
			? await apiClient.post('/api/v1/arvantis', festData)
			: await apiClient.post('/api/v1/arvantis', festData, {
					headers: { 'Content-Type': 'application/json' },
			  });
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to create fest.'));
	}
};

export const updateFestDetails = async (identifier, updateData) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		const isForm = updateData instanceof FormData;
		const resp = isForm
			? await apiClient.patch(
					`/api/v1/arvantis/${encodeURIComponent(identifier)}/update`,
					updateData
			  )
			: await apiClient.patch(
					`/api/v1/arvantis/${encodeURIComponent(identifier)}/update`,
					updateData,
					{ headers: { 'Content-Type': 'application/json' } }
			  );
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to update fest details.'));
	}
};

export const deleteFest = async (identifier) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		const resp = await apiClient.delete(`/api/v1/arvantis/${encodeURIComponent(identifier)}`);
		return resp.status === 204 ? { success: true } : resp.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to delete fest.'));
	}
};

export const addPartner = async (identifier, formData) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		// formData should be FormData with field "logo" or plain object not supported for file
		const resp = await apiClient.post(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/partners`,
			formData
		);
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to add partner.'));
	}
};

export const removePartner = async (identifier, partnerName) => {
	if (!identifier || !partnerName) throw new Error('Identifier and partnerName required.');
	try {
		const resp = await apiClient.delete(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/partners/${encodeURIComponent(
				partnerName
			)}`
		);
		return resp.status === 204 ? { success: true } : resp.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to remove partner.'));
	}
};

export const linkEventToFest = async (identifier, eventId) => {
	if (!identifier || !eventId) throw new Error('Identifier and eventId required.');
	try {
		const resp = await apiClient.post(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/events`,
			{ eventId }
		);
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to link event to fest.'));
	}
};

export const unlinkEventFromFest = async (identifier, eventId) => {
	if (!identifier || !eventId) throw new Error('Identifier and eventId required.');
	try {
		const resp = await apiClient.delete(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/events/${encodeURIComponent(
				eventId
			)}`
		);
		return resp.data?.data ?? { success: true };
	} catch (err) {
		throw new Error(extractError(err, 'Failed to unlink event from fest.'));
	}
};

export const updateFestPoster = async (identifier, formData) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		const resp = await apiClient.patch(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/poster`,
			formData
		);
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to update poster.'));
	}
};

export const addGalleryMedia = async (identifier, formData) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		const resp = await apiClient.post(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/gallery`,
			formData
		);
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to add gallery media.'));
	}
};

export const removeGalleryMedia = async (identifier, publicId) => {
	if (!identifier || !publicId) throw new Error('Identifier and publicId required.');
	try {
		const resp = await apiClient.delete(
			`/api/v1/arvantis/${encodeURIComponent(identifier)}/gallery/${encodeURIComponent(
				publicId
			)}`
		);
		return resp.status === 204 ? { success: true } : resp.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to remove gallery media.'));
	}
};

export const exportFestsCSV = async () => {
	try {
		const resp = await apiClient.get('/api/v1/arvantis/export/csv', { responseType: 'blob' });
		return resp.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to export CSV.'));
	}
};

export const getFestAnalytics = async () => {
	try {
		const resp = await apiClient.get('/api/v1/arvantis/analytics/overview');
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to fetch analytics.'));
	}
};

export const getFestStatistics = async () => {
	try {
		const resp = await apiClient.get('/api/v1/arvantis/statistics/overview');
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to fetch statistics.'));
	}
};

export const generateFestReport = async (identifier) => {
	if (!identifier) throw new Error('Fest identifier is required.');
	try {
		const resp = await apiClient.get(
			`/api/v1/arvantis/reports/${encodeURIComponent(identifier)}`
		);
		return resp.data?.data;
	} catch (err) {
		throw new Error(extractError(err, 'Failed to generate report.'));
	}
};

export default {
	getArvantisLandingData,
	getAllFests,
	getFestDetails,
	createFest,
	updateFestDetails,
	deleteFest,
	addPartner,
	removePartner,
	linkEventToFest,
	unlinkEventFromFest,
	updateFestPoster,
	addGalleryMedia,
	removeGalleryMedia,
	exportFestsCSV,
	getFestAnalytics,
	getFestStatistics,
	generateFestReport,
};

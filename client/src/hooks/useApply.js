import { useState, useCallback } from 'react';
import { apiClient } from '../services/api.js';

// Utility for consistent error parsing
const parseError = (err) => {
	if (err?.response?.data?.message) return err.response.data.message;
	if (err?.response?.data) return JSON.stringify(err.response.data);
	if (err?.message) return err.message;
	return 'Unknown error occurred';
};

// Generic hook for application actions
const useApplicationAction = (actionFn) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const action = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			try {
				return await actionFn(...args);
			} catch (err) {
				setError(parseError(err));
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[actionFn]
	);

	return { action, loading, error };
};

// Get all applications (admin) — now accepts a query object and forwards params
export const useGetAllApplications = () => {
	const actionFn = async (query = {}) => {
		const res = await apiClient.get('api/apply/applications', { params: query });
		return res.data; // backend returns ApiResponse { status, data, message }
	};
	const { action: getAllApplications, loading, error } = useApplicationAction(actionFn);

	return { getAllApplications, loading, error };
};

// Get single application by ID (admin)
export const useGetApplicationById = () => {
	const actionFn = async (id) => {
		const res = await apiClient.get(`api/apply/applications/${id}`);
		return res.data;
	};
	const { action: getApplicationById, loading, error } = useApplicationAction(actionFn);
	return { getApplicationById, loading, error };
};

// Update application status (admin)
export const useUpdateApplicationStatus = () => {
	const actionFn = async (id, status) => {
		const res = await apiClient.patch(`api/apply/applications/${id}/status`, { status });
		return res.data;
	};
	const { action: updateApplicationStatus, loading, error } = useApplicationAction(actionFn);
	return { updateApplicationStatus, loading, error };
};

// Mark application as seen (admin)
export const useMarkApplicationAsSeen = () => {
	const actionFn = async (id) => {
		const res = await apiClient.patch(`api/apply/applications/${id}/seen`, {});
		return res.data;
	};
	const { action: markAsSeen, loading, error } = useApplicationAction(actionFn);
	return { markAsSeen, loading, error };
};

// Delete an application (admin)
export const useDeleteApplication = () => {
	const actionFn = async (id) => {
		const res = await apiClient.delete(`api/apply/applications/${id}/delete`);
		return res.data;
	};
	const { action: deleteApplication, loading, error } = useApplicationAction(actionFn);
	return { deleteApplication, loading, error };
};

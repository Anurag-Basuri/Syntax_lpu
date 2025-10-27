import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

// parse axios errors consistently
const parseError = (err) => {
	if (!err) return 'Unknown error';
	const resp = err.response ?? err;
	if (resp?.data?.message) return resp.data.message;
	if (resp?.data?.error) return resp.data.error;
	if (err.message) return err.message;
	return String(err);
};

// generic request hook that stores last response data
const useRequest = (fn) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	const action = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			try {
				const res = await fn(...args);
				setData(res);
				return res;
			} catch (err) {
				setError(parseError(err));
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[fn]
	);

	const reset = () => {
		setData(null);
		setError(null);
	};

	return { action, data, loading, error, reset };
};

// Get all contacts with support for pagination/search/filters
export const useGetAllContacts = () => {
	const fn = async (params = {}) => {
		const res = await apiClient.get('/api/contact/getall', { params });
		// return full axios payload (ApiResponse wrapper)
		return res.data;
	};

	const { action: getAllContacts, data, loading, error, reset } = useRequest(fn);

	// normalize to convenient shape
	const docs = Array.isArray(data?.data?.docs) ? data.data.docs : [];
	const meta = {
		totalDocs: data?.data?.totalDocs ?? 0,
		totalPages: data?.data?.totalPages ?? 1,
		page: data?.data?.page ?? 1,
		limit: data?.data?.limit ?? 10,
	};

	return { getAllContacts, contacts: docs, meta, loading, error, reset };
};

// Get single contact by id
export const useGetContactById = () => {
	const fn = async (id) => {
		const res = await apiClient.get(`/api/contact/${id}`);
		return res.data;
	};
	const { action: getContactById, data, loading, error, reset } = useRequest(fn);
	return { getContactById, contact: data?.data ?? null, loading, error, reset };
};

// Mark contact as resolved
export const useMarkContactAsResolved = () => {
	const fn = async (id) => {
		const res = await apiClient.patch(`/api/contact/${id}/resolve`);
		return res.data;
	};
	const { action: markAsResolved, data, loading, error, reset } = useRequest(fn);
	return { markAsResolved, updated: data?.data ?? null, loading, error, reset };
};

// Delete contact
export const useDeleteContact = () => {
	const fn = async (id) => {
		const res = await apiClient.delete(`/api/contact/${id}`);
		return res.data;
	};
	const { action: deleteContact, data, loading, error, reset } = useRequest(fn);
	return { deleteContact, deleted: data?.data ?? null, loading, error, reset };
};

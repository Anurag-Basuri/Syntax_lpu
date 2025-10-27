import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';

// Utility for consistent error parsing
const parseError = (err) => {
	if (err?.response?.data?.message) return err.response.data.message;
	if (err?.response?.data?.error) return err.response.data.error;
	if (err?.message) return err.message;
	return 'Unknown error occurred';
};

// Generic hook for ticket actions
const useTicketAction = (actionFn) => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [data, setData] = useState(null);

	const action = useCallback(
		async (...args) => {
			setLoading(true);
			setError(null);
			try {
				const result = await actionFn(...args);
				setData(result);
				return result;
			} catch (err) {
				setError(parseError(err));
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[actionFn]
	);

	const reset = () => {
		setData(null);
		setError(null);
	};

	return { action, data, loading, error, reset };
};

// Create a new ticket
export const useCreateTicket = () => {
	const actionFn = async (ticketData, token) => {
		const res = await apiClient.post('api/tickets/create', ticketData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data.data;
	};
	const { action: createTicket, data: ticket, loading, error, reset } = useTicketAction(actionFn);

	return { createTicket, ticket, loading, error, reset };
};

// Get ticket by ID
export const useGetTicketById = () => {
	const actionFn = async (ticketId, token) => {
		const res = await apiClient.get(`api/tickets/${ticketId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data.data;
	};
	const {
		action: getTicketById,
		data: ticket,
		loading,
		error,
		reset,
	} = useTicketAction(actionFn);

	return { getTicketById, ticket, loading, error, reset };
};

// Update ticket status
export const useUpdateTicketStatus = () => {
	const actionFn = async (ticketId, statusData, token) => {
		const res = await apiClient.put(`api/tickets/${ticketId}/status`, statusData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data.data;
	};
	const {
		action: updateTicketStatus,
		data: ticket,
		loading,
		error,
		reset,
	} = useTicketAction(actionFn);

	return { updateTicketStatus, ticket, loading, error, reset };
};

// Get all tickets for an event
export const useGetTicketsByEvent = () => {
	const actionFn = async (eventId, token) => {
		const res = await apiClient.get(`api/tickets/event/${eventId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data.data;
	};
	const {
		action: getTicketsByEvent,
		data: tickets,
		loading,
		error,
		reset,
	} = useTicketAction(actionFn);

	return { getTicketsByEvent, tickets: tickets || [], loading, error, reset };
};

// Delete a ticket
export const useDeleteTicket = () => {
	const actionFn = async (ticketId, token) => {
		await apiClient.delete(`api/tickets/${ticketId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return true;
	};
	const {
		action: deleteTicket,
		data: success,
		loading,
		error,
		reset,
	} = useTicketAction(actionFn);

	return { deleteTicket, success: !!success, loading, error, reset };
};

// Update a ticket
export const useUpdateTicket = () => {
	const actionFn = async (ticketId, updateData, token) => {
		const res = await apiClient.patch(`api/tickets/${ticketId}/status`, updateData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data.data;
	};
	const { action: updateTicket, data: ticket, loading, error, reset } = useTicketAction(actionFn);

	return { updateTicket, ticket, loading, error, reset };
};

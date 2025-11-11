import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
	getTicketsByEvent as getTicketsByEventService,
	updateTicketStatus as updateTicketStatusService,
	deleteTicket as deleteTicketService,
} from '../services/ticketServices.js';

// Note: This file exposes the compatibility hooks used by the admin TicketsTab:
// - useGetTicketsByEvent -> { getTicketsByEvent(eventId, token), tickets, loading, error, reset }
// - useUpdateTicket -> { updateTicket(ticketId, data, token), loading, error, reset }
// - useDeleteTicket -> { deleteTicket(ticketId, token), loading, error, reset }

// Hook for admins to get tickets for a specific event (imperative fetch)
export const useGetTicketsByEvent = () => {
	const [tickets, setTickets] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const reset = useCallback(() => {
		setError(null);
	}, []);

	// eventId can be a string id; token is optional and forwarded to service if needed
	const getTicketsByEvent = useCallback(
		async (eventId, token) => {
			if (!eventId) {
				setTickets([]);
				return [];
			}
			setLoading(true);
			setError(null);
			try {
				// service expects params object
				const params = { eventId };
				// some services might accept token via headers internally; we just forward token if needed
				const data = await getTicketsByEventService(params, token);
				// service may return different shapes; try common ones
				const payload = data?.data ?? data?.tickets ?? data?.docs ?? data ?? [];
				// normalize to array
				const list = Array.isArray(payload) ? payload : payload?.results ?? [];
				setTickets(list);
				return list;
			} catch (err) {
				const msg = err?.response?.data?.message || err?.message || String(err);
				setError(msg);
				setTickets([]);
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[tickets]
	);

	return {
		getTicketsByEvent,
		tickets,
		loading,
		error,
		reset,
	};
};

// Hook to update a ticket (admin). Exposes updateTicket(ticketId, data, token)
export const useUpdateTicket = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const reset = useCallback(() => {
		setError(null);
	}, []);

	const updateTicket = useCallback(
		async (ticketId, data = {}, token) => {
			if (!ticketId) {
				throw new Error('Missing ticket id');
			}
			setLoading(true);
			setError(null);
			try {
				// If backend expects status value, prefer sending a clear payload.
				// When caller passes { isUsed: boolean }, forward it as { isUsed }.
				// If caller passes { status: '...' } forward as-is.
				if (typeof data === 'object' && 'isUsed' in data) {
					// use updateTicketStatusService which sends { status: <value> }.
					// Some backends accept boolean status; pass boolean directly.
					await updateTicketStatusService(ticketId, { isUsed: !!data.isUsed }, token);
				} else {
					// fallback: send data as status payload
					await updateTicketStatusService(ticketId, data, token);
				}
				toast.success('Ticket updated.');
			} catch (err) {
				const msg = err?.response?.data?.message || err?.message || String(err);
				setError(msg);
				toast.error(msg || 'Failed to update ticket');
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	return { updateTicket, loading, error, reset };
};

// Hook to delete a ticket (admin). Exposes deleteTicket(ticketId, token)
export const useDeleteTicket = () => {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const reset = useCallback(() => {
		setError(null);
	}, []);

	const deleteTicket = useCallback(
		async (ticketId, token) => {
			if (!ticketId) {
				throw new Error('Missing ticket id');
			}
			setLoading(true);
			setError(null);
			try {
				await deleteTicketService(ticketId, token);
				toast.success('Ticket deleted.');
			} catch (err) {
				const msg = err?.response?.data?.message || err?.message || String(err);
				setError(msg);
				toast.error(msg || 'Failed to delete ticket');
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[]
	);

	return { deleteTicket, loading, error, reset };
};

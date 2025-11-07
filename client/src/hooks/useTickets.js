import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	registerForEvent,
	getTicketById,
	getTicketsByEvent,
	updateTicketStatus,
} from '../services/ticketServices.js';

// Hook for the public event registration form
export const useRegisterForEvent = () => {
	return useMutation({
		mutationFn: registerForEvent,
	});
};

// Hook to fetch a single ticket by its public ID (for ticket verification page)
export const useTicket = (ticketId) => {
	return useQuery({
		queryKey: ['ticket', ticketId],
		queryFn: () => getTicketById(ticketId),
		enabled: !!ticketId,
	});
};

// Hook for admins to get all tickets for a specific event
export const useEventTickets = (eventId) => {
	return useQuery({
		queryKey: ['tickets', eventId],
		queryFn: () => getTicketsByEvent({ eventId }),
		enabled: !!eventId,
	});
};

// Hook for admins to update a ticket's status (e.g., mark as 'used')
export const useUpdateTicketStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ ticketId, status }) => updateTicketStatus(ticketId, status),
		onSuccess: (data, variables) => {
			// Refetch the list of tickets for the event
			queryClient.invalidateQueries({ queryKey: ['tickets', data.event] });
		},
	});
};

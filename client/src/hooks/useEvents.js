import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAllEvents,
	getEventById,
	createEvent,
	deleteEvent,
	updateEventDetails,
} from '../services/eventServices.js';

// Hook to fetch a paginated list of all events
export const useEvents = (params) => {
	return useQuery({
		queryKey: ['events', params],
		queryFn: () => getAllEvents(params),
		keepPreviousData: true,
	});
};

// Hook to fetch a single event's details
export const useEvent = (id) => {
	return useQuery({
		queryKey: ['event', id],
		queryFn: () => getEventById(id),
		enabled: !!id,
	});
};

// Hook to manage event mutations (create, update, delete)
export const useManageEvent = () => {
	const queryClient = useQueryClient();

	const { mutate: addEvent, isPending: isCreating } = useMutation({
		mutationFn: createEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
	});

	const { mutate: updateEvent, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, data }) => updateEventDetails(id, data),
		onSuccess: (data, variables) => {
			queryClient.invalidateQueries({ queryKey: ['events'] });
			queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
		},
	});

	const { mutate: removeEvent, isPending: isDeleting } = useMutation({
		mutationFn: deleteEvent,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
	});

	return { addEvent, isCreating, updateEvent, isUpdating, removeEvent, isDeleting };
};

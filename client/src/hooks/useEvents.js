import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAllEvents,
	getEventById,
	createEvent,
	deleteEvent,
	updateEventDetails,
} from '../services/eventServices.js';
import { toast } from 'react-hot-toast';

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
			toast.success('Event created successfully!');
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error('Failed to create event:', error);
		},
	});

	const { mutate: updateEvent, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, data }) => updateEventDetails(id, data),
		onSuccess: (data, { id }) => {
			toast.success('Event updated successfully!');
			queryClient.invalidateQueries({ queryKey: ['events'] });
			queryClient.invalidateQueries({ queryKey: ['event', id] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error('Failed to update event:', error);
		},
	});

	const { mutate: removeEvent, isPending: isDeleting } = useMutation({
		mutationFn: deleteEvent,
		onSuccess: () => {
			toast.success('Event deleted.');
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => {
			toast.error(error.message);
			console.error('Failed to delete event:', error);
		},
	});

	return { addEvent, isCreating, updateEvent, isUpdating, removeEvent, isDeleting };
};

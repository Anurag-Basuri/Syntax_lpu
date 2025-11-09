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
export const useEvents = (params = {}) => {
	const defaultParams = { page: 1, limit: 9, sortBy: 'eventDate', sortOrder: 'desc' };
	const merged = { ...defaultParams, ...params };

	return useQuery({
		queryKey: ['events', merged],
		queryFn: () => getAllEvents(merged),
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});
};

// Hook to fetch a single event's details
export const useEvent = (id) => {
	return useQuery({
		queryKey: ['event', id],
		queryFn: () => getEventById(id),
		enabled: !!id,
		staleTime: 60_000,
	});
};

// Hook to fetch the single next upcoming event
export const useUpcomingEvent = () => {
	return useQuery({
		queryKey: ['upcomingEvent'],
		queryFn: () => getAllEvents({ period: 'upcoming', limit: 1, sortBy: 'eventDate' }),
		select: (data) => data?.docs?.[0],
		staleTime: 60_000,
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
		onError: (error) => toast.error(error.message),
	});

	const { mutate: updateEvent, isPending: isUpdating } = useMutation({
		mutationFn: ({ id, data }) => updateEventDetails(id, data),
		onSuccess: (data, { id }) => {
			toast.success('Event updated successfully!');
			queryClient.invalidateQueries({ queryKey: ['events'] });
			queryClient.invalidateQueries({ queryKey: ['event', id] });
		},
		onError: (error) => toast.error(error.message),
	});

	const { mutate: removeEvent, isPending: isDeleting } = useMutation({
		mutationFn: deleteEvent,
		onSuccess: () => {
			toast.success('Event deleted.');
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (error) => toast.error(error.message),
	});

	return { addEvent, isCreating, updateEvent, isUpdating, removeEvent, isDeleting };
};

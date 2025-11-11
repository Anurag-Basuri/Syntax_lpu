import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	getAllEvents,
	getEventById,
	createEvent as createEventService,
	deleteEvent as deleteEventService,
	updateEventDetails as updateEventService,
} from '../services/eventServices.js';
import { toast } from 'react-hot-toast';

// Hook to fetch a paginated list of all events (kept for callers that need params)
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

// Compatibility helper: simple fetch-all hook used by admin dash & components
export const useGetAllEvents = () => {
	const query = useQuery({
		queryKey: ['events', 'all'],
		queryFn: () => getAllEvents({ limit: 1000, page: 1 }),
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});

	return {
		getAllEvents: query.refetch,
		events: Array.isArray(query.data?.docs)
			? query.data.docs
			: query.data?.events ?? query.data ?? [],
		loading: query.isLoading,
		error: query.error,
	};
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

// Manage event mutations (create / update / delete) with promise-based APIs
export const useCreateEvent = () => {
	const queryClient = useQueryClient();
	const { mutateAsync, isLoading } = useMutation({
		mutationFn: (data) => createEventService(data),
		onSuccess: () => {
			toast.success('Event created successfully!');
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (err) => {
			toast.error(err?.message || 'Failed to create event');
			throw err;
		},
	});

	return { createEvent: mutateAsync, loading: isLoading };
};

export const useUpdateEvent = () => {
	const queryClient = useQueryClient();
	const { mutateAsync, isLoading } = useMutation({
		mutationFn: ({ id, data }) => updateEventService(id, data),
		onSuccess: (_data, variables) => {
			toast.success('Event updated successfully!');
			queryClient.invalidateQueries({ queryKey: ['events'] });
			if (variables?.id) queryClient.invalidateQueries({ queryKey: ['event', variables.id] });
		},
		onError: (err) => {
			toast.error(err?.message || 'Failed to update event');
			throw err;
		},
	});

	// wrapper to match existing component usage: updateEvent(id, data)
	const updateEvent = (id, data) => mutateAsync({ id, data });

	return { updateEvent, loading: isLoading };
};

export const useDeleteEvent = () => {
	const queryClient = useQueryClient();
	const { mutateAsync, isLoading } = useMutation({
		mutationFn: (id) => deleteEventService(id),
		onSuccess: () => {
			toast.success('Event deleted.');
			queryClient.invalidateQueries({ queryKey: ['events'] });
		},
		onError: (err) => {
			toast.error(err?.message || 'Failed to delete event');
			throw err;
		},
	});

	return { deleteEvent: mutateAsync, loading: isLoading };
};

// Backwards-compatible grouping (if some code imports useManageEvent)
export const useManageEvent = () => {
	const create = useCreateEvent();
	const update = useUpdateEvent();
	const remove = useDeleteEvent();

	return {
		addEvent: create.createEvent,
		isCreating: create.loading,
		updateEvent: update.updateEvent,
		isUpdating: update.loading,
		removeEvent: remove.deleteEvent,
		isDeleting: remove.loading,
	};
};

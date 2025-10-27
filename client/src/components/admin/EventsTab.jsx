import { useState, useMemo } from 'react';
import { CalendarDays, Plus, Search, ChevronDown } from 'lucide-react';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useEvents.js';
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import EventModal from './EventModal.jsx';
import EventCard from './EventCard.jsx';

const statusOptions = [
	{ value: 'all', label: 'All Statuses' },
	{ value: 'upcoming', label: 'Upcoming' },
	{ value: 'ongoing', label: 'Ongoing' },
	{ value: 'completed', label: 'Completed' },
];

const EventsTab = ({
	events,
	eventsLoading,
	eventsError,
	token,
	setDashboardError,
	getAllEvents,
}) => {
	const [showCreateEvent, setShowCreateEvent] = useState(false);
	const [showEditEvent, setShowEditEvent] = useState(false);
	const [eventFields, setEventFields] = useState({
		title: '',
		date: '',
		location: '',
		description: '',
		status: 'upcoming',
	});
	const [editEventId, setEditEventId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');

	const { createEvent, loading: createLoading } = useCreateEvent();
	const { updateEvent, loading: updateLoading } = useUpdateEvent();
	const { deleteEvent, loading: deleteLoading } = useDeleteEvent();

	const filteredEvents = useMemo(() => {
		return events
			.filter(
				(event) =>
					event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					event.location?.toLowerCase().includes(searchTerm.toLowerCase())
			)
			.filter((event) => (statusFilter === 'all' ? true : event.status === statusFilter));
	}, [events, searchTerm, statusFilter]);

	const handleCreateEvent = async () => {
		try {
			await createEvent(eventFields);
			setShowCreateEvent(false);
			setEventFields({
				title: '',
				date: '',
				location: '',
				description: '',
				status: 'upcoming',
			});
			await getAllEvents();
		} catch (err) {
			setDashboardError('Create event failed');
		}
	};

	const handleEditEvent = async () => {
		try {
			await updateEvent(editEventId, eventFields);
			setShowEditEvent(false);
			setEditEventId(null);
			setEventFields({
				title: '',
				date: '',
				location: '',
				description: '',
				status: 'upcoming',
			});
			await getAllEvents();
		} catch (err) {
			setDashboardError('Update event failed');
		}
	};

	const handleDeleteEvent = async (id) => {
		if (!window.confirm('Are you sure you want to delete this event?')) return;
		try {
			await deleteEvent(id);
			await getAllEvents();
		} catch (err) {
			setDashboardError('Delete event failed');
		}
	};

	const openEditEventModal = (event) => {
		setEditEventId(event._id);
		setEventFields({
			title: event.title || '',
			date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
			location: event.location || '',
			description: event.description || '',
			status: event.status || 'upcoming',
		});
		setShowEditEvent(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row justify-between gap-4">
				<h2 className="text-xl font-bold text-white">Event Management</h2>
				<div className="flex gap-2">
					<div className="relative w-full md:w-64">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search events..."
							className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div className="relative">
						<select
							className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
						>
							{statusOptions.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
						<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
					</div>
					<button
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition"
						onClick={() => setShowCreateEvent(true)}
					>
						<Plus className="h-5 w-5" />
						Create Event
					</button>
				</div>
			</div>

			<ErrorMessage error={eventsError} />

			{eventsLoading ? (
				<LoadingSpinner />
			) : filteredEvents.length === 0 ? (
				<div className="text-center py-12 bg-gray-700/30 rounded-xl border border-gray-600">
					<CalendarDays className="h-12 w-12 mx-auto text-gray-500" />
					<h3 className="text-xl font-bold text-gray-400 mt-4">No events found</h3>
					<p className="text-gray-500 mt-2">Create your first event to get started</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredEvents.map((event) => (
						<EventCard
							key={event._id}
							event={event}
							onEdit={() => openEditEventModal(event)}
							onDelete={() => handleDeleteEvent(event._id)}
							deleteLoading={deleteLoading}
						/>
					))}
				</div>
			)}

			{/* Create Event Modal */}
			{showCreateEvent && (
				<EventModal
					isEdit={false}
					open={showCreateEvent}
					onClose={() => setShowCreateEvent(false)}
					eventFields={eventFields}
					setEventFields={setEventFields}
					onSubmit={handleCreateEvent}
					loading={createLoading}
				/>
			)}

			{/* Edit Event Modal */}
			{showEditEvent && (
				<EventModal
					isEdit={true}
					open={showEditEvent}
					onClose={() => setShowEditEvent(false)}
					eventFields={eventFields}
					setEventFields={setEventFields}
					onSubmit={handleEditEvent}
					loading={updateLoading}
				/>
			)}
		</div>
	);
};

export default EventsTab;

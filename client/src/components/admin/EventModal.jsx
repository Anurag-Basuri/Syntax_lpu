import { useState, useMemo, useEffect } from 'react';cide-react';
import { CalendarDays, Plus, Search, ChevronDown, AlertCircle } from 'lucide-react';
import { useCreateEvent, useUpdateEvent, useDeleteEvent } from '../../hooks/useEvents.js';g }) => {
import LoadingSpinner from './LoadingSpinner.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import EventModal from './EventModal.jsx';
import EventCard from './EventCard.jsx';
import { useTheme } from '../../hooks/useTheme.js';e }));
	};
const statusOptions = [
	{ value: 'all', label: 'All Statuses' },
	{ value: 'upcoming', label: 'Upcoming' },|| []);
	{ value: 'ongoing', label: 'Ongoing' },osters: files }));
	{ value: 'completed', label: 'Completed' },
];
	return (
const formatApiError = (err) => {-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
	if (!err) return 'Unknown error';l bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
	return (className="flex justify-between items-center p-4 border-b border-gray-700">
		err?.response?.data?.message || err?.response?.data?.error || err?.message || String(err)
	);			{isEdit ? 'Edit Event' : 'Create New Event'}
};			</h3>
					<button
const EventsTab = ({se}
	events = [],me="text-gray-400 hover:text-white rounded-full p-1"
	eventsLoading = false,
	eventsError = null,h-5 w-5" />
	token, // kept for API hooks that may need it later
	setDashboardError,
	getAllEvents,
}) => {v className="p-6">
	const { theme } = useTheme();">
	const isDark = theme === 'dark';
							<label className="block text-sm text-gray-400 mb-1">
	const panelClass = isDark
		? 'bg-gray-800/50 rounded-xl p-4 border border-gray-700'
		: 'bg-white rounded-xl p-4 border border-gray-200';
								<BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
	const [showCreateEvent, setShowCreateEvent] = useState(false);
	const [showEditEvent, setShowEditEvent] = useState(false);
	const [eventFields, setEventFields] = useState({
		title: '',ue={eventFields.title}
		date: '',Change={handleChange}
		location: '',ame="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
		description: '',er="Enter event title"
		status: 'upcoming',
	});			</div>
	const [editEventId, setEditEventId] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');-5">
	const [formError, setFormError] = useState('');
	const [actionError, setActionError] = useState('');0 mb-1">
									Date & Time *
	const { createEvent, loading: createLoading } = useCreateEvent();
	const { updateEvent, loading: updateLoading } = useUpdateEvent();
	const { deleteEvent, loading: deleteLoading } = useDeleteEvent();m -translate-y-1/2 h-4 w-4 text-gray-400" />
									<input
	// keep dashboard-level error in sync
	useEffect(() => {te"
		if (eventsError) {ntFields.date}
			const msg = formatApiError(eventsError);
			setDashboardError?.(msg);pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			setActionError(msg);
		}					</div>
	}, [eventsError, setDashboardError]);

	const totalCount = (events || []).length;
	const upcomingCount = (events || []).filter((e) => e.status === 'upcoming').length;
									Location *
	const filteredEvents = useMemo(() => {
		const q = (searchTerm || '').trim().toLowerCase();
		return (events || [])ame="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
			.filter((event) => {
				if (!q) return true;
				return (me="location"
					(event.title || '').toLowerCase().includes(q) ||
					(event.location || '').toLowerCase().includes(q) ||
					(event.description || '').toLowerCase().includes(q)50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
				);				placeholder="Enter location"
			})				/>
			.filter((event) => (statusFilter === 'all' ? true : event.status === statusFilter));
	}, [events, searchTerm, statusFilter]);
						</div>
	const resetForm = () =>
		setEventFields({
			title: '', className="block text-sm text-gray-400 mb-1">Description</label>
			date: '',area
			location: '',scription"
			description: '',tFields.description}
			status: 'upcoming',leChange}
		});			rows="3"
								className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
	const validateFields = (fields) => {ent..."
		if (!fields.title || fields.title.trim().length < 3) {
			return 'Title is required (min 3 characters).';
		}
		if (!fields.date) {
			return 'Date & time are required.'; text-gray-400 mb-1">Status</label>
		}				<select
		// basic datetime check
		const dt = new Date(fields.date);
		if (Number.isNaN(dt.getTime())) return 'Please provide a valid date & time.';
		if (!fields.location || fields.location.trim().length < 2) {er-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
			return 'Location is required.';
		}					<option value="upcoming">Upcoming</option>
		return '';ion value="ongoing">Ongoing</option>
	};					<option value="completed">Completed</option>
							</select>
	const handleCreateEvent = async () => {
		setFormError('');
		setActionError('');e input (create only or optional for edit) */}
		// ensure eventFields includes posters when creating
		const validation = validateFields(eventFields);Name="block text-sm text-gray-400 mb-1">
		if (validation) {t ? '(optional)' : '*'}
			setFormError(validation);abel>
			return;				<input
		}	type="file"

		// require posters on createe={handleFileChange}
		if (!eventFields.posters || !eventFields.posters.length) {
			setFormError('At least one poster image is required.');
			return;="w-full text-sm text-gray-300 bg-gray-700/50 border border-gray-600 rounded-lg p-2"
		}
ters && eventFields.posters.length > 0 && (
		try { text-xs text-gray-400">
			// Build FormData for multipart upload						{eventFields.posters.map((f, i) => (
			const fd = new FormData();							<div key={i}>{f.name}</div>
			fd.append('title', eventFields.title);									))}
			// name mapping: frontend 'date' -> backend 'eventDate'
			fd.append('eventDate', eventFields.date);
			fd.append('venue', eventFields.location);
			fd.append('description', eventFields.description || '');
			fd.append('organizer', eventFields.organizer || ''); // optional field
			fd.append('category', eventFields.category || 'General');stify-end gap-3 pt-6">
			fd.append('status', eventFields.status || 'upcoming');ton
				type="button"
			// optional numeric fields if providedse}
			if (typeof eventFields.totalSpots !== 'undefined') fd.append('totalSpots', String(eventFields.totalSpots));gray-500 rounded-lg text-white"
			if (typeof eventFields.ticketPrice !== 'undefined') fd.append('ticketPrice', String(eventFields.ticketPrice));
			if (eventFields.tags) fd.append('tags', eventFields.tags);				Cancel
/button>
			// append posters (multiple)
			for (const file of eventFields.posters) {{onSubmit}
				fd.append('posters', file);
			}py-2 rounded-lg text-white ${

			await createEvent(fd);ue-500/50 cursor-not-allowed'
			resetForm();ue-500'
			setShowCreateEvent(false);
			await getAllEvents?.();
		} catch (err) {				{loading
			const msg = formatApiError(err);					? isEdit
			setActionError(msg);									? 'Updating...'
			setDashboardError?.(msg);
		}
	};

	const handleEditEvent = async () => {/button>
		setFormError('');
		setActionError('');
		const validation = validateFields(eventFields);
		if (validation) {
			setFormError(validation);
			return;
		}
		if (!editEventId) {ort default EventModal;
			setActionError('Missing event id to update.');			return;		}		try {			await updateEvent(editEventId, eventFields);			resetForm();			setShowEditEvent(false);			setEditEventId(null);			await getAllEvents?.();		} catch (err) {			const msg = formatApiError(err);			setActionError(msg);			setDashboardError?.(msg);		}	};	const handleDeleteEvent = async (id) => {		setActionError('');		// simple confirm dialog - replace with modal if needed		if (!window.confirm('Delete this event? This action cannot be undone.')) return;		try {			await deleteEvent(id);			await getAllEvents?.();		} catch (err) {			const msg = formatApiError(err);			setActionError(msg);			setDashboardError?.(msg);		}	};	const openEditEventModal = (event) => {		setEditEventId(event._id);		setEventFields({			title: event.title || '',			// convert to local datetime-local input format (yyyy-mm-ddThh:mm)			date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',			location: event.location || '',			description: event.description || '',			status: event.status || 'upcoming',		});		setFormError('');		setActionError('');		setShowEditEvent(true);	};	return (		<div className="space-y-6">			{/* Header */}			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">				<div className="flex items-start gap-4">					<h2 className="text-2xl font-bold text-white flex items-center gap-3">						Event Management						<span className="text-sm text-gray-400 font-medium">({totalCount})</span>					</h2>					<div className="hidden md:flex items-center gap-3 text-sm text-gray-300">						<span className="px-2 py-1 bg-blue-700/20 text-blue-300 rounded-full">							{upcomingCount} upcoming						</span>						<span className="px-2 py-1 bg-gray-700/20 text-gray-300 rounded-full">							{totalCount} total						</span>					</div>				</div>				<div className="flex gap-2 w-full md:w-auto">					<div className="relative w-full md:w-64">						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />						<input							type="text"							placeholder="Search events by title, location or description..."							className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"							value={searchTerm}							onChange={(e) => setSearchTerm(e.target.value)}							aria-label="Search events"						/>					</div>					<div className="relative">						<select							className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"							value={statusFilter}							onChange={(e) => setStatusFilter(e.target.value)}							aria-label="Filter by status"						>							{statusOptions.map((opt) => (								<option key={opt.value} value={opt.value}>									{opt.label}								</option>							))}						</select>						<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />					</div>					<button						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition disabled:opacity-60"						onClick={() => {							resetForm();							setFormError('');							setActionError('');							setShowCreateEvent(true);						}}						disabled={createLoading || updateLoading}						title="Create event"					>						<Plus className="h-5 w-5" />						Create Event					</button>				</div>			</div>			{/* action-level errors */}			{(formError || actionError) && (				<div					className={`${						isDark							? 'bg-red-900/10 border border-red-700 text-red-300'							: 'bg-red-50 border border-red-200 text-red-700'					} rounded-lg p-3 flex items-center gap-3`}				>					<AlertCircle className="h-5 w-5 text-red-400" />					<div className="text-sm">{formError || actionError}</div>				</div>			)}			{/* server error component */}			<ErrorMessage error={eventsError ? formatApiError(eventsError) : null} />			{/* content */}			{eventsLoading ? (				<LoadingSpinner />			) : filteredEvents.length === 0 ? (				<div className={`${panelClass} text-center py-12 rounded-xl`}>					<CalendarDays className="h-12 w-12 mx-auto text-gray-500" />					<h3						className={`${							isDark ? 'text-gray-300' : 'text-gray-700'						} text-xl font-bold mt-4`}					>						No events found					</h3>					<p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mt-2`}>						Create your first event to get started.					</p>					<button						className={`${							isDark								? 'mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white'								: 'mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white'						}`}						onClick={() => {							resetForm();							setShowCreateEvent(true);						}}					>						<Plus className="h-4 w-4" /> Create event					</button>				</div>			) : (				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">					{filteredEvents.map((event) => (						<EventCard							key={event._id}							event={event}							onEdit={() => openEditEventModal(event)}							onDelete={() => handleDeleteEvent(event._id)}							deleteLoading={deleteLoading}							theme={theme}						/>					))}				</div>			)}			{/* Create Event Modal */}			{showCreateEvent && (
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

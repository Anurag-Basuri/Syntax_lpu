import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
	Ticket,
	Download,
	Search,
	ChevronDown,
	Trash2,
	CheckCircle,
	XCircle,
	ArrowUpDown,
	Filter,
	Mail,
	Phone,
	Home,
	Users,
	Calendar,
	Loader2,
	AlertCircle,
	X,
} from 'lucide-react';
import { useGetTicketsByEvent, useUpdateTicket, useDeleteTicket } from '../../hooks/useTickets';
import TicketStats from './TicketStats';

const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	if (Number.isNaN(date.getTime())) return 'N/A';
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const MobileFilterMenu = React.memo(
	({
		isOpen,
		onClose,
		events = [],
		selectedEventId,
		setSelectedEventId,
		sortBy,
		setSortBy,
		handleExportTickets,
		exportLoading,
	}) => {
		if (!isOpen) return null;

		return (
			<div className="fixed inset-0 bg-gray-900/80 z-40 md:hidden" onClick={onClose}>
				<div
					className="absolute right-0 top-0 bottom-0 w-64 bg-gray-800 p-4 shadow-xl"
					onClick={(e) => e.stopPropagation()}
				>
					<div className="flex justify-between items-center mb-6">
						<h3 className="text-lg font-semibold text-white">Filters</h3>
						<button onClick={onClose} className="text-gray-400 hover:text-white">
							<X className="h-5 w-5" />
						</button>
					</div>
					<div className="space-y-4">
						<div>
							<label className="block text-sm text-gray-400 mb-2">Event</label>
							<select
								className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
								value={selectedEventId}
								onChange={(e) => setSelectedEventId(e.target.value)}
							>
								<option value="">Select an event</option>
								{(events || []).map((event) => (
									<option key={event._id} value={event._id}>
										{event.title}
									</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-400 mb-2">Sort By</label>
							<select
								className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
							>
								<option value="newest">Newest First</option>
								<option value="oldest">Oldest First</option>
							</select>
						</div>
						<button
							onClick={handleExportTickets}
							disabled={exportLoading || !selectedEventId}
							className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
								exportLoading || !selectedEventId
									? 'bg-gray-600 cursor-not-allowed'
									: 'bg-cyan-700/80 hover:bg-cyan-600'
							} transition text-white mt-4`}
						>
							{exportLoading ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Download className="h-5 w-5" />
							)}
							{exportLoading ? 'Exporting...' : 'Export CSV'}
						</button>
					</div>
				</div>
			</div>
		);
	}
);

const TicketRow = React.memo(
	({ ticket, onToggleIsUsed, onDeleteTicket, updateLoading, deleteLoading }) => (
		<tr className="hover:bg-gray-750/50 transition">
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
				{ticket.lpuId || 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white max-w-[120px] truncate">
				{ticket.fullName || 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 max-w-[160px] truncate">
				{ticket.email || 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
				{ticket.phone || 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
				{ticket.hostel || 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
				{ticket.club || 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
				{ticket.isUsed ? (
					<span className="flex items-center text-green-400">
						<CheckCircle className="h-4 w-4 mr-1" />
						Yes
					</span>
				) : (
					<span className="flex items-center text-gray-400">
						<XCircle className="h-4 w-4 mr-1" />
						No
					</span>
				)}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-400">
				{ticket.createdAt ? formatDate(ticket.createdAt) : 'N/A'}
			</td>
			<td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
				<button
					onClick={() => onToggleIsUsed(ticket._id, ticket.isUsed)}
					disabled={updateLoading}
					className={`${
						ticket.isUsed
							? 'text-yellow-600 hover:text-yellow-400'
							: 'text-green-700 hover:text-green-500'
					} disabled:opacity-50 flex items-center gap-1`}
					title={ticket.isUsed ? 'Mark as Not Used' : 'Mark as Used'}
				>
					{ticket.isUsed ? (
						<XCircle className="h-4 w-4" />
					) : (
						<CheckCircle className="h-4 w-4" />
					)}
					<span className="hidden lg:inline">
						{ticket.isUsed ? 'Mark Not Used' : 'Mark Used'}
					</span>
				</button>
				<button
					onClick={() => onDeleteTicket(ticket._id)}
					disabled={deleteLoading}
					className="text-red-700 hover:text-red-500 disabled:opacity-50 flex items-center gap-1"
					title="Delete Ticket"
				>
					<Trash2 className="h-4 w-4" />
					<span className="hidden lg:inline">Delete</span>
				</button>
			</td>
		</tr>
	)
);

const TicketCard = React.memo(
	({ ticket, onToggleIsUsed, onDeleteTicket, updateLoading, deleteLoading }) => (
		<div className="md:hidden bg-gray-800 rounded-lg border border-gray-700 p-4">
			<div className="flex justify-between items-start">
				<div>
					<div className="flex items-center gap-2">
						<div className="bg-blue-900/20 p-1 rounded">
							<Ticket className="h-4 w-4 text-blue-400" />
						</div>
						<span className="font-medium text-white">{ticket.lpuId || 'N/A'}</span>
					</div>
					<h3 className="text-lg font-semibold text-white mt-1">{ticket.fullName}</h3>
				</div>
				<div
					className={`text-xs px-2 py-1 rounded-full ${
						ticket.isUsed
							? 'bg-green-900/30 text-green-400'
							: 'bg-gray-700 text-gray-400'
					}`}
				>
					{ticket.isUsed ? 'Used' : 'Not Used'}
				</div>
			</div>
			<div className="mt-4 grid grid-cols-2 gap-3">
				<div className="flex items-center gap-2 text-sm">
					<Mail className="h-4 w-4 text-gray-500" />
					<span className="text-gray-300 truncate">{ticket.email || 'N/A'}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<Phone className="h-4 w-4 text-gray-500" />
					<span className="text-gray-300">{ticket.phone || 'N/A'}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<Home className="h-4 w-4 text-gray-500" />
					<span className="text-gray-300">{ticket.hostel || 'N/A'}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<Users className="h-4 w-4 text-gray-500" />
					<span className="text-gray-300">{ticket.club || 'N/A'}</span>
				</div>
				<div className="flex items-center gap-2 text-sm">
					<Calendar className="h-4 w-4 text-gray-500" />
					<span className="text-gray-300">
						{ticket.createdAt ? formatDate(ticket.createdAt) : 'N/A'}
					</span>
				</div>
			</div>
			<div className="flex justify-between mt-4 pt-3 border-t border-gray-700">
				<button
					onClick={() => onToggleIsUsed(ticket._id, ticket.isUsed)}
					disabled={updateLoading}
					className={`${
						ticket.isUsed
							? 'text-yellow-600 hover:text-yellow-400'
							: 'text-green-700 hover:text-green-500'
					} disabled:opacity-50 flex items-center gap-1 text-sm`}
				>
					{ticket.isUsed ? (
						<XCircle className="h-4 w-4" />
					) : (
						<CheckCircle className="h-4 w-4" />
					)}
					{ticket.isUsed ? 'Mark Not Used' : 'Mark Used'}
				</button>
				<button
					onClick={() => onDeleteTicket(ticket._1d)}
					disabled={deleteLoading}
					className="text-red-700 hover:text-red-500 disabled:opacity-50 flex items-center gap-1 text-sm"
				>
					<Trash2 className="h-4 w-4" />
					Delete
				</button>
			</div>
		</div>
	)
);

const TicketsTab = ({ token, events = [], setDashboardError }) => {
	const [selectedEventId, setSelectedEventId] = useState('');
	const [sortBy, setSortBy] = useState('newest');
	const [searchTerm, setSearchTerm] = useState('');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const {
		getTicketsByEvent,
		tickets,
		loading: ticketsLoading,
		error: ticketsError,
		reset: resetTicketsError,
	} = useGetTicketsByEvent();

	const {
		updateTicket,
		loading: updateLoading,
		error: updateError,
		reset: resetUpdateError,
	} = useUpdateTicket();

	const {
		deleteTicket,
		loading: deleteLoading,
		error: deleteError,
		reset: resetDeleteError,
	} = useDeleteTicket();

	const ticketStats = useMemo(() => {
		const list = tickets || [];
		if (list.length === 0) return null;
		return {
			total: list.length,
			cancelled: list.filter((t) => t.isCancelled).length,
			used: list.filter((t) => t.isUsed).length,
		};
	}, [tickets]);

	// fetch tickets when selected event changes
	useEffect(() => {
		resetTicketsError();
		resetUpdateError();
		resetDeleteError();

		if (!selectedEventId) return;

		// ensure getTicketsByEvent exists
		if (typeof getTicketsByEvent !== 'function') return;

		getTicketsByEvent(selectedEventId, token).catch((err) => {
			const msg = err?.message || 'Failed to load tickets';
			setDashboardError?.(msg);
		});
		// include deps used
	}, [
		selectedEventId,
		token,
		getTicketsByEvent,
		resetTicketsError,
		resetUpdateError,
		resetDeleteError,
		setDashboardError,
	]);

	const handleDeleteTicket = useCallback(
		async (ticketId) => {
			if (!ticketId) return;
			if (!window.confirm('Are you sure you want to delete this ticket?')) return;
			try {
				await deleteTicket(ticketId, token);
				await getTicketsByEvent(selectedEventId, token);
			} catch (err) {
				const msg = err?.message || 'Ticket deletion failed';
				setDashboardError?.(msg);
			}
		},
		[deleteTicket, getTicketsByEvent, selectedEventId, token, setDashboardError]
	);

	const handleToggleIsUsed = useCallback(
		async (ticketId, currentIsUsed) => {
			if (!ticketId) return;
			try {
				await updateTicket(ticketId, { isUsed: !currentIsUsed }, token);
				await getTicketsByEvent(selectedEventId, token);
			} catch (err) {
				const msg = err?.message || 'Ticket update failed';
				setDashboardError?.(msg);
			}
		},
		[updateTicket, getTicketsByEvent, selectedEventId, token, setDashboardError]
	);

	const [exportLoading, setExportLoading] = useState(false);
	const [exportError, setExportError] = useState('');
	const handleExportTickets = useCallback(async () => {
		setExportError('');
		setExportLoading(true);
		try {
			const list = tickets || [];
			if (list.length === 0) {
				setExportError('No tickets to export.');
				return;
			}

			const headers = [
				'Ticket ID',
				'Full Name',
				'Email',
				'Phone',
				'LPU ID',
				'Gender',
				'Hosteler',
				'Hostel',
				'Course',
				'Club',
				'Event ID',
				'Event Name',
				'Is Used',
				'QR Code URL',
				'QR Code Public ID',
				'Is Cancelled',
				'Created At',
				'Email Failed',
			];
			const rows = list.map((t) => [
				t.ticketId || t._id || '',
				t.fullName || '',
				t.email || '',
				t.phone || '',
				t.lpuId || '',
				t.gender || '',
				t.hosteler ? 'Yes' : 'No',
				t.hostel || '',
				t.course || '',
				t.club || '',
				t.eventId || '',
				t.eventName || '',
				t.isUsed ? 'Yes' : 'No',
				t.qrCode?.url || '',
				t.qrCode?.publicId || '',
				t.isCancelled ? 'Yes' : 'No',
				t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
				t.emailFailed ? 'Yes' : 'No',
			]);

			const csvContent = [headers, ...rows]
				.map((row) =>
					row
						.map((cell) =>
							typeof cell === 'string' && cell.includes(',')
								? `"${cell.replace(/"/g, '""')}"`
								: cell
						)
						.join(',')
				)
				.join('\n');

			const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `tickets_${selectedEventId || 'all'}_${new Date()
				.toISOString()
				.slice(0, 10)}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			setExportError('Export failed');
		} finally {
			setExportLoading(false);
		}
	}, [tickets, selectedEventId]);

	const filteredTickets = useMemo(() => {
		const list = tickets || [];
		return list
			.filter((t) => {
				if (!searchTerm) return true;
				const term = searchTerm.toLowerCase();
				return (
					String(t.lpuId || '')
						.toLowerCase()
						.includes(term) ||
					(t.email || '').toLowerCase().includes(term) ||
					(t.fullName || '').toLowerCase().includes(term)
				);
			})
			.sort((a, b) => {
				if (sortBy === 'newest') {
					return new Date(b.createdAt) - new Date(a.createdAt);
				}
				return new Date(a.createdAt) - new Date(b.createdAt);
			});
	}, [tickets, sortBy, searchTerm]);

	const toggleSort = () => {
		setSortBy((prev) => (prev === 'newest' ? 'oldest' : 'newest'));
	};

	const clearAllErrors = () => {
		resetTicketsError();
		resetUpdateError();
		resetDeleteError();
		setExportError('');
	};

	const selectedEvent = (events || []).find((e) => e._id === selectedEventId);
	const selectedCount = (tickets || []).length;

	return (
		<div className="space-y-6">
			<MobileFilterMenu
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
				events={events || []}
				selectedEventId={selectedEventId}
				setSelectedEventId={setSelectedEventId}
				sortBy={sortBy}
				setSortBy={setSortBy}
				handleExportTickets={handleExportTickets}
				exportLoading={exportLoading}
			/>

			{/* Top Controls */}
			<div className="flex flex-col md:flex-row justify-between gap-4">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="relative flex-1">
						<select
							className="appearance-none w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={selectedEventId}
							onChange={(e) => setSelectedEventId(e.target.value)}
						>
							<option value="">Select an event</option>
							{(events || []).map((event) => (
								<option key={event._id} value={event._id}>
									{event.title}
								</option>
							))}
						</select>
						<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
					</div>
					<div className="hidden sm:flex gap-2">
						<div className="relative">
							<select
								className="appearance-none bg-gray-700/50 border border-gray-600 rounded-lg pl-4 pr-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={sortBy}
								onChange={(e) => setSortBy(e.target.value)}
							>
								<option value="newest">Newest First</option>
								<option value="oldest">Oldest First</option>
							</select>
							<ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
						</div>
					</div>
					<button
						className="sm:hidden flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
						onClick={() => setIsMobileMenuOpen(true)}
					>
						<Filter size={16} />
						<span>Filters</span>
					</button>
				</div>
				<div className="flex gap-2">
					<div className="relative w-full md:w-64">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by LPU ID, name or email"
							className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<button
						onClick={handleExportTickets}
						disabled={exportLoading || !selectedEventId || (tickets || []).length === 0}
						className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg ${
							exportLoading || !selectedEventId || (tickets || []).length === 0
								? 'bg-gray-600 cursor-not-allowed'
								: 'bg-cyan-700/80 hover:bg-cyan-600'
						} transition text-white`}
						title="Export Tickets CSV"
						type="button"
					>
						{exportLoading ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Download className="h-5 w-5" />
						)}
						<span className="hidden md:inline">
							{exportLoading ? 'Exporting' : 'Export'}
						</span>
					</button>
				</div>
			</div>

			{/* Error Messages */}
			{(ticketsError || updateError || deleteError || exportError) && (
				<div className="bg-red-700/20 border border-red-500 text-red-300 px-4 py-3 rounded flex items-center justify-between">
					<div className="flex items-center">
						<AlertCircle className="h-5 w-5 mr-2" />
						<span>{ticketsError || updateError || deleteError || exportError}</span>
					</div>
					<button
						className="ml-4 px-3 py-1 bg-red-800/40 rounded text-sm hover:bg-red-700/60 flex items-center gap-1"
						onClick={clearAllErrors}
					>
						<X className="h-4 w-4" />
						Dismiss
					</button>
				</div>
			)}

			{/* Stats */}
			{selectedEventId && ticketStats && (
				<TicketStats stats={ticketStats} tickets={filteredTickets} />
			)}

			{/* Loading State */}
			{ticketsLoading ? (
				<div className="flex justify-center py-12">
					<div className="flex flex-col items-center">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
						<p className="mt-2 text-gray-400">Loading tickets...</p>
					</div>
				</div>
			) : selectedEventId ? (
				filteredTickets.length === 0 ? (
					<div className="text-center py-12 bg-gray-700/30 rounded-xl border border-gray-600">
						<Ticket className="h-12 w-12 mx-auto text-gray-500" />
						<h3 className="text-xl font-bold text-gray-400 mt-4">
							{searchTerm ? 'No matching tickets found' : 'No tickets found'}
						</h3>
						<p className="text-gray-500 mt-2">
							{searchTerm
								? 'Try a different search term'
								: 'This event has no tickets yet'}
						</p>
					</div>
				) : (
					<>
						{/* Desktop Table */}
						<div className="hidden md:block rounded-lg border border-gray-700 bg-gray-900/80 mt-4 overflow-x-auto">
							<table className="w-full divide-y divide-gray-700 min-w-[1000px]">
								<thead className="bg-gray-750 sticky top-0 z-10">
									<tr>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											<button
												className="flex items-center"
												onClick={toggleSort}
											>
												<span>LPU ID</span>
												<ArrowUpDown className="ml-1 h-3 w-3" />
											</button>
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Name
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Email
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Phone
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Hostel
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Club
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Is Used
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Created At
										</th>
										<th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-gray-800 divide-y divide-gray-700">
									{filteredTickets.map((ticket) => (
										<TicketRow
											key={ticket._id}
											ticket={ticket}
											onToggleIsUsed={handleToggleIsUsed}
											onDeleteTicket={handleDeleteTicket}
											updateLoading={updateLoading}
											deleteLoading={deleteLoading}
										/>
									))}
								</tbody>
							</table>
						</div>
						{/* Mobile Card List */}
						<div className="md:hidden space-y-3">
							{filteredTickets.map((ticket) => (
								<TicketCard
									key={ticket._id}
									ticket={ticket}
									onToggleIsUsed={handleToggleIsUsed}
									onDeleteTicket={handleDeleteTicket}
									updateLoading={updateLoading}
									deleteLoading={deleteLoading}
								/>
							))}
						</div>
					</>
				)
			) : (
				<div className="text-center py-12 bg-gray-700/30 rounded-xl border border-gray-600">
					<Ticket className="h-12 w-12 mx-auto text-gray-500" />
					<h3 className="text-xl font-bold text-gray-400 mt-4">Select an Event</h3>
					<p className="text-gray-500 mt-2">
						Choose an event from the dropdown to view its tickets
					</p>
				</div>
			)}
		</div>
	);
};

export default TicketsTab;

import React, { useEffect, useState } from 'react';
import {
	getAllFests,
	createFest,
	deleteFest,
	linkEventToFest,
} from '../../services/arvantisServices.js';
import { getAllEvents } from '../../services/eventServices.js';
import { Loader2, Plus, X, Link2, Trash2 } from 'lucide-react';

const ArvantisTab = ({ token, setDashboardError }) => {
	const [fests, setFests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showCreate, setShowCreate] = useState(false);

	// create form state (backend requires name, year, description, startDate, endDate)
	const [name, setName] = useState('');
	const [year, setYear] = useState(new Date().getFullYear());
	const [description, setDescription] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');

	const [createLoading, setCreateLoading] = useState(false);
	const [error, setError] = useState('');
	const [linkFest, setLinkFest] = useState(null);
	const [events, setEvents] = useState([]);
	const [selectedEvent, setSelectedEvent] = useState('');

	async function fetchFests() {
		setLoading(true);
		try {
			// fetch more items by increasing limit so admin can see all fests
			const data = await getAllFests({
				page: 1,
				limit: 50,
				sortBy: 'year',
				sortOrder: 'desc',
			});
			// getAllFests returns the raw API response (status/message/data/pagination)
			setFests(data.data || []);
		} catch (err) {
			setDashboardError(err.message || 'Failed to fetch fests.');
		} finally {
			setLoading(false);
		}
	}

	async function fetchEvents() {
		try {
			const data = await getAllEvents({ page: 1, limit: 200 });
			setEvents(data.docs || []);
		} catch (err) {
			setDashboardError(err.message || 'Failed to fetch events.');
		}
	}

	useEffect(() => {
		fetchFests();
		fetchEvents();
	}, []);

	const handleCreate = async (e) => {
		e.preventDefault();
		setCreateLoading(true);
		setError('');

		// basic client validation
		if (!name || !description || !startDate || !endDate) {
			setError('Please fill name, description, start and end dates.');
			setCreateLoading(false);
			return;
		}
		if (new Date(endDate) < new Date(startDate)) {
			setError('End date cannot be before start date.');
			setCreateLoading(false);
			return;
		}

		try {
			await createFest({
				name: name.trim(),
				year: Number(year),
				description: description.trim(),
				startDate,
				endDate,
			});
			setShowCreate(false);
			setName('');
			setYear(new Date().getFullYear());
			setDescription('');
			setStartDate('');
			setEndDate('');
			await fetchFests();
		} catch (err) {
			setError(err.message || 'Failed to create fest.');
		} finally {
			setCreateLoading(false);
		}
	};

	const handleDelete = async (fest) => {
		const identifier = fest.slug || fest.year || fest._id;
		if (!identifier) {
			setDashboardError('Cannot determine fest identifier to delete.');
			return;
		}
		if (!window.confirm(`Delete fest "${fest.name}"? This cannot be undone.`)) return;
		try {
			await deleteFest(identifier);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to delete fest.');
		}
	};

	const handleLinkEvent = async () => {
		if (!linkFest || !selectedEvent) {
			setError('Select a fest and an event to link.');
			return;
		}
		const identifier = linkFest.slug || linkFest.year || linkFest._id;
		try {
			await linkEventToFest(identifier, selectedEvent);
			setLinkFest(null);
			setSelectedEvent('');
			await fetchFests();
		} catch (err) {
			setError(err.message || 'Failed to link event.');
		}
	};

	return (
		<div className="max-w-3xl mx-auto my-4">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold">Arvantis Fests</h2>
				<button
					className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl"
					onClick={() => setShowCreate(true)}
				>
					<Plus className="w-4 h-4" /> Create Fest
				</button>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-8">
					<Loader2 className="w-8 h-8 animate-spin" />
				</div>
			) : (
				<table className="w-full text-sm mb-8">
					<thead>
						<tr>
							<th className="text-left p-2">Name</th>
							<th className="text-left p-2">Year</th>
							<th className="text-left p-2">Events Linked</th>
							<th className="text-left p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{fests.map((fest) => {
							const eventsLinked = Array.isArray(fest.events)
								? fest.events.length
								: fest.eventsCount ?? '-';
							return (
								<tr key={fest._id || fest.slug || fest.year}>
									<td className="p-2">{fest.name || fest.title || '-'}</td>
									<td className="p-2">{fest.year || '-'}</td>
									<td className="p-2">
										{eventsLinked}
										<button
											className="ml-2 text-blue-600 hover:underline inline-flex items-center gap-1"
											onClick={() => {
												setLinkFest(fest);
												fetchEvents();
											}}
										>
											<Link2 className="inline w-4 h-4" /> Link
										</button>
									</td>
									<td className="p-2 flex gap-2 items-center">
										<button
											className="text-red-500 hover:text-red-700"
											onClick={() => handleDelete(fest)}
										>
											<Trash2 className="w-4 h-4" />
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			{/* Create Modal */}
			{showCreate && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
					<div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg relative max-w-md w-full">
						<button
							className="absolute top-2 right-2"
							onClick={() => setShowCreate(false)}
						>
							<X />
						</button>
						<form onSubmit={handleCreate} className="space-y-4">
							<h3 className="text-xl font-bold">Create Fest</h3>

							<input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Fest Name"
								required
								className="w-full p-2 border rounded"
							/>

							<input
								value={year}
								onChange={(e) => setYear(Number(e.target.value))}
								type="number"
								placeholder="Year"
								required
								className="w-full p-2 border rounded"
							/>

							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Short description"
								required
								className="w-full p-2 border rounded h-24"
							/>

							<div className="grid grid-cols-2 gap-2">
								<input
									type="date"
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
									required
									className="w-full p-2 border rounded"
								/>
								<input
									type="date"
									value={endDate}
									onChange={(e) => setEndDate(e.target.value)}
									required
									className="w-full p-2 border rounded"
								/>
							</div>

							{error && <div className="text-red-500">{error}</div>}

							<button
								disabled={createLoading}
								className="w-full p-2 mt-2 bg-blue-600 text-white rounded"
								type="submit"
							>
								{createLoading ? 'Creating...' : 'Create'}
							</button>
						</form>
					</div>
				</div>
			)}

			{/* Link Event Modal */}
			{linkFest && (
				<div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
					<div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg relative max-w-xs w-full">
						<button
							className="absolute top-2 right-2"
							onClick={() => setLinkFest(null)}
						>
							<X />
						</button>
						<h3 className="font-bold mb-2">Link Event to {linkFest.name}</h3>

						<select
							value={selectedEvent}
							onChange={(e) => setSelectedEvent(e.target.value)}
							className="w-full p-2 border rounded mb-2"
						>
							<option value="">Select event</option>
							{events.map((ev) => (
								<option key={ev._id} value={ev._id}>
									{ev.title} ({ev._id.slice(-4)})
								</option>
							))}
						</select>

						{error && <div className="text-red-500 mb-2">{error}</div>}

						<button
							className="w-full p-2 bg-blue-600 text-white rounded"
							onClick={handleLinkEvent}
						>
							Link Event
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default ArvantisTab;

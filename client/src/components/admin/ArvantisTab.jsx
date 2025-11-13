import React, { useEffect, useState, useCallback } from 'react';
import {
	getAllFests,
	getFestDetails,
	createFest,
	updateFestDetails,
	deleteFest,
	addPartner,
	removePartner,
	linkEventToFest,
	unlinkEventFromFest,
	updateFestPoster,
	addGalleryMedia,
	removeGalleryMedia,
	exportFestsCSV,
	getFestAnalytics,
	getFestStatistics,
	generateFestReport,
} from '../../services/arvantisServices.js';
import { getAllEvents } from '../../services/eventServices.js';
import {
	Loader2,
	Plus,
	X,
	Link2,
	Trash2,
	UploadCloud,
	DownloadCloud,
	BarChart2,
	FileText,
} from 'lucide-react';

/*
  ArvantisTab:
  - prop initialActive: 'fests' | 'partners' to open a specific subtab
  - prop setDashboardError: global error handler
*/
const ArvantisTab = ({ initialActive = 'fests', setDashboardError }) => {
	const [active, setActive] = useState(initialActive);
	const [fests, setFests] = useState([]);
	const [loading, setLoading] = useState(true);
	const [events, setEvents] = useState([]);
	const [showCreate, setShowCreate] = useState(false);
	const [createLoading, setCreateLoading] = useState(false);
	const [createForm, setCreateForm] = useState({
		name: '',
		year: new Date().getFullYear(),
		description: '',
		startDate: '',
		endDate: '',
	});
	const [selectedFest, setSelectedFest] = useState(null);
	const [editOpen, setEditOpen] = useState(false);
	const [editForm, setEditForm] = useState({});
	const [modalError, setModalError] = useState('');
	const [partnersList, setPartnersList] = useState([]);
	const [analytics, setAnalytics] = useState(null);
	const [statistics, setStatistics] = useState(null);
	const [downloadingCSV, setDownloadingCSV] = useState(false);

	const fetchFests = useCallback(async () => {
		setLoading(true);
		try {
			const res = await getAllFests(
				{ page: 1, limit: 50, sortBy: 'year', sortOrder: 'desc' },
				{ admin: true }
			);
			setFests(res.docs || []);
		} catch (err) {
			setDashboardError(err.message || 'Failed to fetch fests.');
		} finally {
			setLoading(false);
		}
	}, [setDashboardError]);

	const fetchEvents = useCallback(async () => {
		try {
			const res = await getAllEvents({ page: 1, limit: 200 });
			setEvents(res.docs || []);
		} catch (err) {
			setDashboardError(err.message || 'Failed to fetch events.');
		}
	}, [setDashboardError]);

	useEffect(() => {
		fetchFests();
		fetchEvents();
	}, [fetchFests, fetchEvents]);

	/* --- Create / Delete --- */
	const handleCreateFest = async (e) => {
		e?.preventDefault();
		setCreateLoading(true);
		setModalError('');
		const { name, description, startDate, endDate, year } = createForm;
		if (!name || !description || !startDate || !endDate) {
			setModalError('Please fill required fields.');
			setCreateLoading(false);
			return;
		}
		if (new Date(endDate) < new Date(startDate)) {
			setModalError('End date cannot be before start date.');
			setCreateLoading(false);
			return;
		}
		try {
			await createFest({ name, year: Number(year), description, startDate, endDate });
			setShowCreate(false);
			setCreateForm({
				name: '',
				year: new Date().getFullYear(),
				description: '',
				startDate: '',
				endDate: '',
			});
			await fetchFests();
		} catch (err) {
			setModalError(err.message || 'Failed to create fest.');
		} finally {
			setCreateLoading(false);
		}
	};

	const handleDeleteFest = async (fest) => {
		if (!window.confirm(`Delete fest "${fest.name}"? This cannot be undone.`)) return;
		try {
			const id = fest.slug || fest.year || fest._id;
			await deleteFest(id);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to delete fest.');
		}
	};

	/* --- Edit / Poster / Gallery / Events --- */
	const openEdit = async (fest) => {
		try {
			const details = await getFestDetails(fest.slug || fest.year || fest._id, {
				admin: true,
			});
			setSelectedFest(details);
			setEditForm({
				name: details.name || '',
				description: details.description || '',
				startDate: details.startDate
					? new Date(details.startDate).toISOString().slice(0, 10)
					: '',
				endDate: details.endDate
					? new Date(details.endDate).toISOString().slice(0, 10)
					: '',
				status: details.status || 'upcoming',
				location: details.location || '',
				contactEmail: details.contactEmail || '',
			});
			setPartnersList(details.partners || []);
			setEditOpen(true);
		} catch (err) {
			setDashboardError(err.message || 'Failed to load fest details.');
		}
	};

	const handleUpdateFest = async () => {
		if (!selectedFest) return;
		setModalError('');
		try {
			const id = selectedFest.slug || selectedFest.year || selectedFest._id;
			await updateFestDetails(id, editForm);
			setEditOpen(false);
			await fetchFests();
		} catch (err) {
			setModalError(err.message || 'Failed to update fest.');
		}
	};

	const handlePosterUpload = async (file) => {
		if (!selectedFest || !file) return;
		try {
			const id = selectedFest.slug || selectedFest.year || selectedFest._id;
			const fd = new FormData();
			fd.append('poster', file);
			await updateFestPoster(id, fd);
			const refreshed = await getFestDetails(id, { admin: true });
			setSelectedFest(refreshed);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to upload poster.');
		}
	};

	const handleAddGallery = async (files) => {
		if (!selectedFest || !files?.length) return;
		try {
			const id = selectedFest.slug || selectedFest.year || selectedFest._id;
			const fd = new FormData();
			for (const f of files) fd.append('media', f);
			await addGalleryMedia(id, fd);
			const refreshed = await getFestDetails(id, { admin: true });
			setSelectedFest(refreshed);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to add gallery media.');
		}
	};

	const handleRemoveGallery = async (publicId) => {
		if (!selectedFest) return;
		try {
			const id = selectedFest.slug || selectedFest.year || selectedFest._id;
			await removeGalleryMedia(id, publicId);
			const refreshed = await getFestDetails(id, { admin: true });
			setSelectedFest(refreshed);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to remove gallery media.');
		}
	};

	const handleLinkEvent = async (fest, eventId) => {
		try {
			const id = fest.slug || fest.year || fest._id;
			await linkEventToFest(id, eventId);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to link event.');
		}
	};

	const handleUnlinkEvent = async (fest, eventId) => {
		if (!window.confirm('Unlink this event from the fest?')) return;
		try {
			const id = fest.slug || fest.year || fest._id;
			await unlinkEventFromFest(id, eventId);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to unlink event.');
		}
	};

	/* --- Partners (uses addPartner/removePartner) --- */
	const handleAddPartner = async (festId, formData) => {
		try {
			const fest = fests.find((f) => f._id === festId);
			const id = fest.slug || fest.year || fest._id;
			await addPartner(id, formData);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to add partner.');
		}
	};

	const handleRemovePartner = async (festId, partnerName) => {
		if (!window.confirm(`Remove partner "${partnerName}"?`)) return;
		try {
			const fest = fests.find((f) => f._id === festId);
			const id = fest.slug || fest.year || fest._id;
			await removePartner(id, partnerName);
			await fetchFests();
		} catch (err) {
			setDashboardError(err.message || 'Failed to remove partner.');
		}
	};

	/* --- Analytics / CSV / Reports --- */
	const handleExportCSV = async () => {
		setDownloadingCSV(true);
		try {
			const blob = await exportFestsCSV();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `arvantis-fests-${new Date().toISOString()}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			setDashboardError(err.message || 'Failed to export CSV.');
		} finally {
			setDownloadingCSV(false);
		}
	};

	const loadAnalytics = async () => {
		try {
			const a = await getFestAnalytics();
			const s = await getFestStatistics();
			setAnalytics(a);
			setStatistics(s);
		} catch (err) {
			setDashboardError(err.message || 'Failed to load analytics.');
		}
	};

	const handleGenerateReport = async (fest) => {
		try {
			const id = fest.slug || fest.year || fest._id;
			const report = await generateFestReport(id);
			// simple download JSON report
			const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `arvantis-report-${id}.json`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} catch (err) {
			setDashboardError(err.message || 'Failed to generate report.');
		}
	};

	/* --- UI --- */
	// simple select of events for linking inside each fest row
	return (
		<div className="max-w-6xl mx-auto py-6">
			<div className="flex gap-3 mb-4">
				<button
					className={`px-4 py-2 rounded ${
						active === 'fests' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
					}`}
					onClick={() => setActive('fests')}
				>
					Fests
				</button>
				<button
					className={`px-4 py-2 rounded ${
						active === 'partners'
							? 'bg-blue-600 text-white'
							: 'bg-gray-700 text-gray-100'
					}`}
					onClick={() => setActive('partners')}
				>
					Partners
				</button>
			</div>

			{active === 'fests' ? (
				<section>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold">Manage Fests</h2>
						<div className="flex gap-2">
							<button
								className="flex items-center gap-2 px-3 py-1 rounded bg-green-600 text-white"
								onClick={() => setShowCreate(true)}
							>
								<Plus className="w-4 h-4" /> New Fest
							</button>
							<button
								className="flex items-center gap-2 px-3 py-1 rounded bg-gray-800 text-white"
								onClick={loadAnalytics}
							>
								<BarChart2 className="w-4 h-4" /> Analytics
							</button>
							<button
								className="flex items-center gap-2 px-3 py-1 rounded bg-sky-700 text-white"
								onClick={handleExportCSV}
								disabled={downloadingCSV}
							>
								<DownloadCloud className="w-4 h-4" /> Export CSV
							</button>
						</div>
					</div>

					{loading ? (
						<div className="py-10 flex justify-center">
							<Loader2 className="w-8 h-8 animate-spin" />
						</div>
					) : (
						<table className="w-full text-sm mb-6">
							<thead>
								<tr>
									<th className="text-left p-2">Name</th>
									<th className="text-left p-2">Year</th>
									<th className="text-left p-2">Events</th>
									<th className="text-left p-2">Actions</th>
								</tr>
							</thead>
							<tbody>
								{fests.map((fest) => (
									<tr key={fest._id || fest.slug || fest.year}>
										<td className="p-2">{fest.name}</td>
										<td className="p-2">{fest.year}</td>
										<td className="p-2">
											{Array.isArray(fest.events) ? fest.events.length : '-'}
										</td>
										<td className="p-2 flex gap-2">
											<button
												className="px-2 py-1 bg-indigo-600 text-white rounded"
												onClick={() => openEdit(fest)}
											>
												Edit
											</button>
											<button
												className="px-2 py-1 bg-yellow-600 text-white rounded"
												onClick={() => setSelectedFest(fest)}
											>
												View
											</button>
											<button
												className="px-2 py-1 bg-gray-700 text-white rounded"
												onClick={() => handleGenerateReport(fest)}
												title="Generate report"
											>
												<FileText className="w-4 h-4 inline" />
											</button>
											<button
												className="px-2 py-1 bg-red-600 text-white rounded"
												onClick={() => handleDeleteFest(fest)}
											>
												<Trash2 className="w-4 h-4 inline" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}

					{/* Selected Fest quick view (poster/gallery/events) */}
					{selectedFest && (
						<div className="p-4 bg-white rounded shadow mb-6">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="text-lg font-semibold">{selectedFest.name}</h3>
									<div className="text-sm text-gray-600">
										{selectedFest.description}
									</div>
								</div>
								<div className="flex gap-2">
									<input
										type="file"
										accept="image/*"
										onChange={(e) => handlePosterUpload(e.target.files?.[0])}
									/>
									<input
										type="file"
										accept="image/*"
										multiple
										onChange={(e) => handleAddGallery([...e.target.files])}
									/>
								</div>
							</div>

							{selectedFest.poster?.url && (
								<div className="mt-4">
									<img
										src={selectedFest.poster.url}
										alt="poster"
										className="w-48 h-28 object-cover rounded"
									/>
								</div>
							)}

							{(selectedFest.gallery || []).length > 0 && (
								<div className="mt-4 flex gap-2">
									{selectedFest.gallery.map((g) => (
										<div key={g.publicId} className="relative">
											<img
												src={g.url}
												alt=""
												className="w-28 h-20 object-cover rounded"
											/>
											<button
												className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded"
												onClick={() => handleRemoveGallery(g.publicId)}
											>
												x
											</button>
										</div>
									))}
								</div>
							)}

							{/* events link/unlink area */}
							<div className="mt-4">
								<h4 className="font-medium">Linked Events</h4>
								{(selectedFest.events || []).length === 0 ? (
									<div className="text-sm text-gray-500">No events linked</div>
								) : (
									<ul className="space-y-2">
										{selectedFest.events.map((ev) => (
											<li
												key={ev._id}
												className="flex items-center justify-between p-2 bg-gray-50 rounded"
											>
												<div>
													<div className="font-medium">{ev.title}</div>
													<div className="text-xs text-gray-600">
														{new Date(ev.eventDate).toLocaleString()}
													</div>
												</div>
												<div className="flex gap-2">
													<button
														className="px-2 py-1 bg-red-500 text-white rounded"
														onClick={() =>
															handleUnlinkEvent(selectedFest, ev._id)
														}
													>
														Unlink
													</button>
												</div>
											</li>
										))}
									</ul>
								)}
								{/* link an event */}
								<div className="mt-3 flex gap-2 items-center">
									<select
										className="p-2 border rounded"
										onChange={(e) =>
											handleLinkEvent(selectedFest, e.target.value)
										}
										defaultValue=""
									>
										<option value="">Link an event</option>
										{events.map((ev) => (
											<option key={ev._id} value={ev._id}>
												{ev.title}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
					)}
				</section>
			) : (
				<section>
					{/* Partners panel */}
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold">Partners</h2>
					</div>

					{/* List fests and open partners for a chosen fest */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<h4 className="font-medium mb-2">Fests</h4>
							<ul className="space-y-2">
								{fests.map((f) => (
									<li
										key={f._id}
										className={`p-2 rounded cursor-pointer ${
											selectedFest && selectedFest._id === f._id
												? 'bg-blue-50'
												: 'bg-white'
										}`}
										onClick={async () => {
											try {
												const details = await getFestDetails(
													f.slug || f.year || f._id,
													{ admin: true }
												);
												setSelectedFest(details);
												setPartnersList(details.partners || []);
											} catch (err) {
												setDashboardError(
													err.message || 'Failed to load fest.'
												);
											}
										}}
									>
										<div className="font-medium">{f.name}</div>
										<div className="text-xs text-gray-500">{f.year}</div>
									</li>
								))}
							</ul>
						</div>

						<div className="md:col-span-2">
							{!selectedFest ? (
								<div className="text-sm text-gray-500">
									Select a fest to manage partners.
								</div>
							) : (
								<>
									<h4 className="font-medium mb-2">
										Partners for {selectedFest.name}
									</h4>
									<ul className="space-y-3 mb-4">
										{partnersList.length === 0 && (
											<div className="text-sm text-gray-500">
												No partners yet.
											</div>
										)}
										{partnersList.map((p) => (
											<li
												key={p.name}
												className="flex items-center justify-between p-3 bg-white rounded"
											>
												<div className="flex items-center gap-3">
													{p.logo?.url ? (
														<img
															src={p.logo.url}
															alt={p.name}
															className="w-12 h-12 object-cover rounded"
														/>
													) : (
														<div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
															<UploadCloud />
														</div>
													)}
													<div>
														<div className="font-medium">{p.name}</div>
														<div className="text-xs text-gray-600">
															{p.tier || '-'}
														</div>
													</div>
												</div>
												<button
													className="text-red-500"
													onClick={() =>
														handleRemovePartner(
															selectedFest._id,
															p.name
														)
													}
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</li>
										))}
									</ul>

									{/* Add partner form */}
									<AddPartnerForm
										festId={selectedFest._id}
										onAdd={(fd) => handleAddPartner(selectedFest._id, fd)}
									/>
								</>
							)}
						</div>
					</div>
				</section>
			)}

			{/* Create Modal */}
			{showCreate && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
					<div className="bg-white p-6 rounded max-w-md w-full relative">
						<button
							className="absolute top-3 right-3"
							onClick={() => setShowCreate(false)}
						>
							<X />
						</button>
						<h3 className="font-semibold mb-3">Create Fest</h3>
						<form onSubmit={handleCreateFest} className="space-y-3">
							<input
								placeholder="Name"
								value={createForm.name}
								onChange={(e) =>
									setCreateForm({ ...createForm, name: e.target.value })
								}
								className="w-full p-2 border rounded"
							/>
							<input
								type="number"
								placeholder="Year"
								value={createForm.year}
								onChange={(e) =>
									setCreateForm({ ...createForm, year: Number(e.target.value) })
								}
								className="w-full p-2 border rounded"
							/>
							<textarea
								placeholder="Description"
								value={createForm.description}
								onChange={(e) =>
									setCreateForm({ ...createForm, description: e.target.value })
								}
								className="w-full p-2 border rounded h-24"
							/>
							<div className="grid grid-cols-2 gap-2">
								<input
									type="date"
									value={createForm.startDate}
									onChange={(e) =>
										setCreateForm({ ...createForm, startDate: e.target.value })
									}
									className="p-2 border rounded"
								/>
								<input
									type="date"
									value={createForm.endDate}
									onChange={(e) =>
										setCreateForm({ ...createForm, endDate: e.target.value })
									}
									className="p-2 border rounded"
								/>
							</div>
							{modalError && <div className="text-red-500">{modalError}</div>}
							<button
								type="submit"
								disabled={createLoading}
								className="w-full py-2 bg-blue-600 text-white rounded"
							>
								{createLoading ? 'Creating...' : 'Create'}
							</button>
						</form>
					</div>
				</div>
			)}

			{/* Edit Modal */}
			{editOpen && selectedFest && (
				<div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
					<div className="bg-white p-6 rounded max-w-lg w-full relative">
						<button
							className="absolute top-3 right-3"
							onClick={() => setEditOpen(false)}
						>
							<X />
						</button>
						<h3 className="font-semibold mb-3">Edit Fest — {selectedFest.name}</h3>
						<div className="space-y-3">
							<input
								value={editForm.name}
								onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
								className="w-full p-2 border rounded"
							/>
							<textarea
								value={editForm.description}
								onChange={(e) =>
									setEditForm({ ...editForm, description: e.target.value })
								}
								className="w-full p-2 border rounded h-24"
							/>
							<div className="grid grid-cols-2 gap-2">
								<input
									type="date"
									value={editForm.startDate}
									onChange={(e) =>
										setEditForm({ ...editForm, startDate: e.target.value })
									}
									className="p-2 border rounded"
								/>
								<input
									type="date"
									value={editForm.endDate}
									onChange={(e) =>
										setEditForm({ ...editForm, endDate: e.target.value })
									}
									className="p-2 border rounded"
								/>
							</div>
							<div className="flex gap-2">
								<input
									placeholder="Location"
									value={editForm.location}
									onChange={(e) =>
										setEditForm({ ...editForm, location: e.target.value })
									}
									className="p-2 border rounded flex-1"
								/>
								<input
									placeholder="Contact email"
									value={editForm.contactEmail}
									onChange={(e) =>
										setEditForm({ ...editForm, contactEmail: e.target.value })
									}
									className="p-2 border rounded flex-1"
								/>
							</div>
							{modalError && <div className="text-red-500">{modalError}</div>}
							<div className="flex gap-2">
								<button
									className="flex-1 py-2 bg-blue-600 text-white rounded"
									onClick={handleUpdateFest}
								>
									Save
								</button>
								<button
									className="flex-1 py-2 bg-gray-300 rounded"
									onClick={() => setEditOpen(false)}
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Analytics display */}
			{analytics && statistics && (
				<div className="mt-6 p-4 bg-white rounded shadow">
					<h4 className="font-semibold mb-2">Analytics & Statistics</h4>
					<pre className="text-xs max-h-48 overflow-auto bg-gray-50 p-2 rounded">
						{JSON.stringify({ analytics, statistics }, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
};

const AddPartnerForm = ({ festId, onAdd }) => {
	const [form, setForm] = useState({ name: '', tier: 'sponsor', website: '', logo: null });
	const [adding, setAdding] = useState(false);
	const [error, setError] = useState('');

	const handleFile = (e) => setForm({ ...form, logo: e.target.files?.[0] || null });

	const submit = async () => {
		setError('');
		if (!form.name || !form.logo) {
			setError('Name and logo required');
			return;
		}
		setAdding(true);
		try {
			const fd = new FormData();
			fd.append('name', form.name);
			fd.append('tier', form.tier);
			if (form.website) fd.append('website', form.website);
			fd.append('logo', form.logo);
			await onAdd(fd);
			setForm({ name: '', tier: 'sponsor', website: '', logo: null });
		} catch (err) {
			setError(err.message || 'Failed to add partner');
		} finally {
			setAdding(false);
		}
	};

	return (
		<div className="p-3 bg-gray-50 rounded">
			<input
				placeholder="Partner name"
				value={form.name}
				onChange={(e) => setForm({ ...form, name: e.target.value })}
				className="w-full p-2 border rounded mb-2"
			/>
			<div className="flex gap-2 mb-2">
				<select
					value={form.tier}
					onChange={(e) => setForm({ ...form, tier: e.target.value })}
					className="p-2 border rounded flex-1"
				>
					<option value="sponsor">Sponsor</option>
					<option value="collaborator">Collaborator</option>
					<option value="other">Other</option>
				</select>
				<input
					placeholder="Website (optional)"
					value={form.website}
					onChange={(e) => setForm({ ...form, website: e.target.value })}
					className="p-2 border rounded flex-1"
				/>
			</div>
			<input type="file" accept="image/*" onChange={handleFile} className="mb-2" />
			{error && <div className="text-red-500 mb-2">{error}</div>}
			<button
				className="w-full py-2 bg-green-600 text-white rounded"
				onClick={submit}
				disabled={adding}
			>
				{adding ? 'Adding...' : 'Add Partner'}
			</button>
		</div>
	);
};

export default ArvantisTab;

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useApplications, useApplication, useManageApplication } from '../hooks/useApplications.js';
import { markApplicationAsSeen } from '../services/applyServices.js';

const ShowApplies = () => {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [searchTerm, setSearchTerm] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState('all');
	const [seenFilter, setSeenFilter] = useState('all');
	const [sortOption, setSortOption] = useState('newest');
	const [expandedId, setExpandedId] = useState(null);
	const [copiedEmail, setCopiedEmail] = useState(null);
	const [showExport, setShowExport] = useState(false);
	const [exportFormat, setExportFormat] = useState('csv');
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	const [errorMsg, setErrorMsg] = useState(null);

	const queryClient = useQueryClient();

	// debounce searchTerm
	useEffect(() => {
		const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
		return () => clearTimeout(t);
	}, [searchTerm]);

	const buildQuery = useMemo(() => {
		const q = { page, limit };
		if (statusFilter && statusFilter !== 'all') q.status = statusFilter;
		if (seenFilter === 'seen') q.seen = true;
		if (seenFilter === 'notseen') q.seen = false;
		if (debouncedSearch) q.search = debouncedSearch;
		return q;
	}, [page, limit, statusFilter, seenFilter, debouncedSearch]);

	// queries + mutations
	const applicationsQuery = useApplications(buildQuery);
	const applicationDetailQuery = useApplication(expandedId);
	const { updateStatus, isUpdating, removeApplication, isDeleting } = useManageApplication();

	const { mutateAsync: markAsSeenMut, isLoading: markLoading } = useMutation({
		mutationFn: (id) => markApplicationAsSeen(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['applications'] });
			queryClient.invalidateQueries({ queryKey: ['application'] });
		},
		onError: (err) => {
			console.error('Failed to mark seen:', err);
		},
	});

	// derived state
	const loading = applicationsQuery.isLoading || applicationsQuery.isFetching;
	const payload = applicationsQuery.data ?? {};
	const paginated = payload?.data ?? payload;
	const applications = paginated?.docs ?? [];
	const totalPages = paginated?.totalPages ?? 1;
	const totalDocs = paginated?.totalDocs ?? 0;

	const fetchApplications = useCallback(async () => {
		setErrorMsg(null);
		try {
			await applicationsQuery.refetch();
		} catch (err) {
			setErrorMsg(err?.message ?? 'Failed to load applications');
		}
	}, [applicationsQuery]);

	useEffect(() => {
		// reset to first page when filters/search change
		setPage(1);
	}, [statusFilter, seenFilter, debouncedSearch]);

	useEffect(() => {
		// react-query will refetch when buildQuery changes (we still expose explicit refetch via button)
		// eslint-disable-next-line
	}, [page]);

	const handleExpand = useCallback(
		(id) => {
			if (expandedId === id) {
				setExpandedId(null);
				queryClient.removeQueries({ queryKey: ['application', id], exact: true });
				return;
			}
			setExpandedId(id);
			// useApplication hook will fetch details automatically
		},
		[expandedId, queryClient]
	);

	const handleStatusUpdate = async (id, status) => {
		try {
			await new Promise((resolve, reject) => {
				updateStatus(
					{ id, status },
					{
						onSuccess: () => {
							// optimistic update for current list
							queryClient.setQueryData(['applications', buildQuery], (old) => {
								if (!old) return old;
								const data = old?.data ?? old;
								const docs = data?.docs?.map((d) =>
									d._id === id ? { ...d, status } : d
								);
								const next = { ...data, docs };
								return { ...old, data: next };
							});
							resolve();
						},
						onError: (err) => reject(err),
					}
				);
			});
		} catch (err) {
			setErrorMsg(err?.message ?? 'Failed to update status');
		}
	};

	const handleMarkAsSeen = async (id) => {
		try {
			await markAsSeenMut(id);
			queryClient.setQueryData(['applications', buildQuery], (old) => {
				if (!old) return old;
				const data = old?.data ?? old;
				const docs = data?.docs?.map((d) => (d._id === id ? { ...d, seen: true } : d));
				const next = { ...data, docs };
				return { ...old, data: next };
			});
		} catch (err) {
			setErrorMsg(err?.message ?? 'Failed to mark seen');
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this application?')) return;
		try {
			await new Promise((resolve, reject) => {
				removeApplication(id, {
					onSuccess: () => resolve(),
					onError: (err) => reject(err),
				});
			});
			// refresh page after delete
			if (applications.length === 1 && page > 1) {
				setPage((s) => s - 1);
			} else {
				await fetchApplications();
			}
			if (expandedId === id) setExpandedId(null);
		} catch (err) {
			setErrorMsg(err?.message ?? 'Failed to delete');
		}
	};

	const copyEmail = (email) => {
		if (!navigator?.clipboard) return;
		navigator.clipboard.writeText(email).then(() => {
			setCopiedEmail(email);
			setTimeout(() => setCopiedEmail(null), 1200);
		});
	};

	const sorted = [...applications].sort((a, b) =>
		sortOption === 'newest'
			? new Date(b.createdAt) - new Date(a.createdAt)
			: new Date(a.createdAt) - new Date(b.createdAt)
	);

	const exportData = () => {
		const data = sorted;
		if (!data.length) {
			alert('No data to export');
			return;
		}
		if (exportFormat === 'csv') {
			const headers = [
				'Name',
				'LPU ID',
				'Email',
				'Phone',
				'Course',
				'Domains',
				'Bio',
				'Status',
				'Seen',
				'Created At',
			];
			const rows = data.map((r) =>
				[
					`"${r.fullName || ''}"`,
					`"${r.LpuId || ''}"`,
					`"${r.email || ''}"`,
					`"${r.phone || ''}"`,
					`"${r.course || ''}"`,
					`"${Array.isArray(r.domains) ? r.domains.join('; ') : r.domains || ''}"`,
					`"${(r.bio || '').replace(/"/g, '""')}"`,
					`"${r.status || ''}"`,
					`"${r.seen ? 'Yes' : 'No'}"`,
					`"${r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}"`,
				].join(',')
			);
			const csv = [headers.join(','), ...rows].join('\n');
			const blob = new Blob([csv], { type: 'text/csv' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		} else {
			const json = JSON.stringify(
				data.map((r) => ({
					fullName: r.fullName,
					LpuId: r.LpuId,
					email: r.email,
					phone: r.phone,
					course: r.course,
					domains: r.domains,
					bio: r.bio,
					status: r.status,
					seen: !!r.seen,
					createdAt: r.createdAt,
				})),
				null,
				2
			);
			const blob = new Blob([json], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `applications-${new Date().toISOString().slice(0, 10)}.json`;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
		}
		setShowExport(false);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case 'approved':
				return 'bg-emerald-900/50 text-emerald-200 ring-1 ring-emerald-500/50';
			case 'rejected':
				return 'bg-rose-900/50 text-rose-200 ring-1 ring-rose-500/50';
			default:
				return 'bg-amber-900/50 text-amber-200 ring-1 ring-amber-500/50';
		}
	};

	return (
		<div className="min-h-screen bg-slate-950 relative overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-cyan-900/20"></div>

			<div className="relative z-10 p-4 md:p-8">
				{/* Header & Controls */}
				<div className="max-w-7xl mx-auto mb-8">
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
						<h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
							Job Applications
						</h1>

						<div className="flex gap-3 w-full lg:w-auto">
							<div className="relative flex-1 lg:w-80">
								<input
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Search by name, LPU ID, or email..."
									className="bg-slate-800/50 rounded-2xl py-3 pl-12 pr-4 text-white border border-slate-700 w-full"
								/>
							</div>

							<button
								onClick={() => setShowMobileFilters(true)}
								className="px-4 py-3 bg-slate-800/60 text-gray-200 rounded-2xl lg:hidden border border-slate-700"
							>
								Filters
							</button>
							<button
								onClick={() => setShowExport(true)}
								className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl"
							>
								Export
							</button>
							<button
								onClick={fetchApplications}
								className="px-6 py-3 bg-slate-700 text-white rounded-2xl"
								disabled={loading}
							>
								{loading ? 'Loading...' : 'Refresh'}
							</button>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
					{/* Sidebar */}
					<aside className="xl:col-span-3 hidden lg:block">
						<div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700 sticky top-8">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-xl font-bold text-white">Filters</h3>
								<button
									onClick={() => {
										setSearchTerm('');
										setDebouncedSearch('');
										setStatusFilter('all');
										setSeenFilter('all');
									}}
									className="text-sm text-cyan-400"
								>
									Clear All
								</button>
							</div>

							<div className="space-y-6">
								<div>
									<label className="block text-gray-300 mb-3 font-medium">
										Status
									</label>
									<div className="space-y-3">
										{['all', 'pending', 'approved', 'rejected'].map((s) => (
											<label key={s} className="flex items-center gap-3">
												<input
													type="radio"
													name="status"
													checked={statusFilter === s}
													onChange={() => setStatusFilter(s)}
													className="w-4 h-4 text-cyan-600"
												/>
												<span className="capitalize text-gray-300">
													{s}
												</span>
											</label>
										))}
									</div>
								</div>

								<div>
									<label className="block text-gray-300 mb-3 font-medium">
										Seen
									</label>
									<div className="space-y-3">
										{['all', 'seen', 'notseen'].map((s) => (
											<label key={s} className="flex items-center gap-3">
												<input
													type="radio"
													name="seen"
													checked={seenFilter === s}
													onChange={() => setSeenFilter(s)}
													className="w-4 h-4 text-cyan-600"
												/>
												<span className="text-gray-300">
													{s === 'notseen' ? 'Not Seen' : s}
												</span>
											</label>
										))}
									</div>
								</div>

								<div className="pt-6 border-t border-slate-700">
									<h4 className="text-gray-300 font-medium mb-4">Statistics</h4>
									<div className="space-y-3 text-sm">
										<div className="flex justify-between items-center">
											<span className="text-gray-400">
												Total Applications
											</span>
											<span className="font-bold text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded-lg">
												{totalDocs}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-400">
												Unseen (Current Page)
											</span>
											<span className="font-bold text-amber-400 bg-amber-900/30 px-2 py-1 rounded-lg">
												{applications.filter((a) => !a.seen).length}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-400">
												Pending (Current Page)
											</span>
											<span className="font-bold text-orange-400 bg-orange-900/30 px-2 py-1 rounded-lg">
												{
													applications.filter(
														(a) => a.status === 'pending'
													).length
												}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</aside>

					{/* Main */}
					<main className="xl:col-span-9">
						{loading && (
							<div className="flex items-center justify-center h-64 bg-slate-800/30 rounded-3xl border border-slate-700">
								<div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
							</div>
						)}

						{!loading && !applications.length && !errorMsg && (
							<div className="flex items-center justify-center h-64 bg-slate-800/30 rounded-3xl border border-slate-700 text-gray-400">
								No applications found
							</div>
						)}

						<div className="space-y-4">
							{sorted.map((app) => (
								<article
									key={app._id}
									className={`group bg-slate-800/40 rounded-3xl border transition ${
										expandedId === app._id
											? 'border-cyan-500/50 shadow-lg'
											: 'border-slate-700/50'
									}`}
								>
									<div className="p-6">
										<div
											className="flex justify-between items-start gap-4"
											onClick={() => handleExpand(app._id)}
										>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-3 mb-2">
													<h3 className="text-xl font-bold text-white truncate">
														{app.fullName}
													</h3>
													{!app.seen && (
														<span className="px-2 py-1 rounded-full text-xs bg-amber-900/50 text-amber-200">
															New
														</span>
													)}
												</div>
												<div className="text-gray-400 mb-1">
													{app.email} • {app.LpuId}
												</div>
												<div className="text-sm text-gray-500">
													{new Date(app.createdAt).toLocaleString()}
												</div>
											</div>

											<div className="flex items-start gap-3">
												<div
													className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
														app.status
													)}`}
												>
													{app.status}
												</div>
												<button
													onClick={(e) => {
														e.stopPropagation();
														setExpandedId(
															expandedId === app._id ? null : app._id
														);
													}}
													className="px-4 py-2 bg-slate-700 text-white rounded-xl"
												>
													{expandedId === app._id ? 'Close' : 'View'}
												</button>
											</div>
										</div>

										{expandedId === app._id && (
											<div className="mt-6 pt-6 border-t border-slate-700">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
													<div>
														<label className="text-sm text-gray-400">
															Phone
														</label>
														<p className="text-white mt-1">
															{app.phone || 'N/A'}
														</p>
													</div>
													<div>
														<label className="text-sm text-gray-400">
															Course
														</label>
														<p className="text-white mt-1">
															{app.course || 'N/A'}
														</p>
													</div>
												</div>

												<div className="flex flex-wrap gap-3 mb-4">
													<button
														onClick={() =>
															handleStatusUpdate(app._id, 'approved')
														}
														disabled={isUpdating}
														className="px-4 py-2 bg-emerald-600 text-white rounded-xl"
													>
														{isUpdating ? 'Updating...' : 'Approve'}
													</button>
													<button
														onClick={() =>
															handleStatusUpdate(app._id, 'rejected')
														}
														disabled={isUpdating}
														className="px-4 py-2 bg-rose-600 text-white rounded-xl"
													>
														{isUpdating ? 'Updating...' : 'Reject'}
													</button>
													<button
														onClick={() => copyEmail(app.email)}
														className="px-4 py-2 bg-slate-700 text-white rounded-xl"
													>
														{copiedEmail === app.email
															? 'Copied!'
															: 'Copy Email'}
													</button>
													<button
														onClick={() => handleMarkAsSeen(app._id)}
														disabled={markLoading || app.seen}
														className="px-4 py-2 bg-cyan-600 text-white rounded-xl"
													>
														{markLoading
															? 'Marking...'
															: app.seen
															? 'Seen'
															: 'Mark Seen'}
													</button>
													<button
														onClick={() => handleDelete(app._id)}
														disabled={isDeleting}
														className="px-4 py-2 bg-red-600 text-white rounded-xl"
													>
														{isDeleting ? 'Deleting...' : 'Delete'}
													</button>
												</div>

												<div className="text-xs text-gray-500 font-mono bg-slate-900/50 p-2 rounded-lg">
													ID: {app._id}
												</div>
											</div>
										)}
									</div>
								</article>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="flex justify-center mt-12">
								<nav className="inline-flex items-center bg-slate-800/60 rounded-2xl p-2">
									<button
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
										className="px-4 py-2 text-gray-300"
									>
										Previous
									</button>
									<div className="hidden sm:flex items-center gap-1 mx-4">
										{Array.from({ length: totalPages }).map((_, i) => {
											const p = i + 1;
											return (
												<button
													key={p}
													onClick={() => setPage(p)}
													className={`min-w-[44px] px-3 py-2 rounded-xl ${
														page === p
															? 'bg-cyan-600 text-white'
															: 'text-gray-300'
													}`}
												>
													{p}
												</button>
											);
										})}
									</div>
									<button
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
										className="px-4 py-2 text-gray-300"
									>
										Next
									</button>
								</nav>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

export default ShowApplies;

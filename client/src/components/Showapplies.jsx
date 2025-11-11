import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApplications } from '../hooks/useApplications.js';

const Toolbar = ({ search, setSearch, onRefresh, onExport }) => (
	<div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
		<div className="flex gap-2 w-full sm:w-auto">
			<input
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				placeholder="Search name, LPU ID, email..."
				className="flex-1 sm:w-80 px-3 py-2 rounded-lg bg-slate-800/50 text-white border border-slate-700 focus:outline-none"
			/>
		</div>

		<div className="flex gap-2">
			<button onClick={onExport} className="px-3 py-2 rounded-lg bg-cyan-600 text-white">
				Export
			</button>
			<button onClick={onRefresh} className="px-3 py-2 rounded-lg bg-slate-700 text-white">
				Refresh
			</button>
		</div>
	</div>
);

const Card = ({ item, onToggle, expanded }) => (
	<article className="bg-slate-800/40 rounded-xl border border-slate-700 p-4">
		<div className="flex justify-between items-start gap-3">
			<div className="min-w-0">
				<h3 className="text-lg font-semibold text-white truncate">{item.fullName}</h3>
				<div className="text-sm text-gray-400 truncate">
					{item.email} • {item.LpuId}
				</div>
				<div className="text-xs text-gray-500 mt-1">
					{new Date(item.createdAt).toLocaleString()}
				</div>
			</div>
			<div className="flex items-center gap-2">
				<span
					className={`px-2 py-1 rounded-full text-xs ${
						item.status === 'approved'
							? 'bg-emerald-700 text-emerald-100'
							: item.status === 'rejected'
							? 'bg-rose-700 text-rose-100'
							: 'bg-amber-700 text-amber-100'
					}`}
				>
					{item.status}
				</span>
				<button
					onClick={() => onToggle(item._id)}
					className="px-3 py-1 rounded-lg bg-slate-700 text-sm text-white"
				>
					{expanded ? 'Close' : 'View'}
				</button>
			</div>
		</div>

		{expanded && (
			<div className="mt-3 border-t border-slate-700 pt-3 text-sm text-gray-200">
				<p>
					<strong>Phone:</strong> {item.phone || 'N/A'}
				</p>
				<p className="mt-2">
					<strong>Course:</strong> {item.course || 'N/A'}
				</p>
				<p className="mt-2 whitespace-pre-wrap bg-slate-900/30 p-2 rounded">
					{item.bio || '—'}
				</p>
			</div>
		)}
	</article>
);

const ShowApplies = () => {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [search, setSearch] = useState('');
	const [debounced, setDebounced] = useState('');
	const [status, setStatus] = useState('all');
	const [expandedId, setExpandedId] = useState(null);

	const queryClient = useQueryClient();

	// debounce input
	useEffect(() => {
		const t = setTimeout(() => setDebounced(search.trim()), 300);
		return () => clearTimeout(t);
	}, [search]);

	const params = useMemo(() => {
		const p = { page, limit };
		if (debounced) p.search = debounced;
		if (status !== 'all') p.status = status;
		return p;
	}, [page, limit, debounced, status]);

	const { data, isLoading, refetch } = useApplications(params);

	const payload = data?.data ?? data ?? {};
	const items = payload?.docs ?? [];
	const totalPages = payload?.totalPages ?? 1;

	useEffect(() => setPage(1), [debounced, status]);

	const exportCsv = () => {
		if (!items.length) return alert('No data to export');
		const headers = ['Name', 'LPU ID', 'Email', 'Phone', 'Course', 'Status', 'Created At'];
		const rows = items.map((r) =>
			[
				`"${r.fullName || ''}"`,
				`"${r.LpuId || ''}"`,
				`"${r.email || ''}"`,
				`"${r.phone || ''}"`,
				`"${r.course || ''}"`,
				`"${r.status || ''}"`,
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
	};

	return (
		<section className="max-w-7xl mx-auto p-4">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-2xl font-bold text-white">Applications</h1>
				<select
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					className="bg-slate-800/50 text-white rounded-lg px-3 py-2 border border-slate-700"
				>
					<option value="all">All</option>
					<option value="pending">Pending</option>
					<option value="approved">Approved</option>
					<option value="rejected">Rejected</option>
				</select>
			</div>

			<Toolbar
				search={search}
				setSearch={setSearch}
				onRefresh={() => refetch()}
				onExport={exportCsv}
			/>

			<div className="space-y-3">
				{isLoading ? (
					<div className="text-center py-8 text-gray-400">Loading...</div>
				) : items.length === 0 ? (
					<div className="text-center py-8 text-gray-400">No applications found</div>
				) : (
					items.map((item) => (
						<Card
							key={item._id}
							item={item}
							expanded={expandedId === item._id}
							onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
						/>
					))
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-6 flex justify-center gap-2">
					<button
						onClick={() => setPage((p) => Math.max(1, p - 1))}
						className="px-3 py-1 rounded bg-slate-700 text-white"
					>
						Prev
					</button>
					<span className="px-3 py-1 bg-slate-800 text-gray-300 rounded">
						{page} / {totalPages}
					</span>
					<button
						onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						className="px-3 py-1 rounded bg-slate-700 text-white"
					>
						Next
					</button>
				</div>
			)}
		</section>
	);
};

export default ShowApplies;

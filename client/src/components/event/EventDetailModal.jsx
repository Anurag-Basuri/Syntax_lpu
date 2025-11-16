import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, Calendar, MapPin, Tag, Users, Globe, Copy } from 'lucide-react';
import { getEventById } from '../../services/eventServices.js';

/*
 EventDetailModal - full details
 - Uses getEventById to fetch the complete event document by id
 - Renders a readable breakdown (meta, registration, speakers, partners, resources)
 - Shows raw JSON (copyable) for "everything literally"
 - Keeps responsive two-column layout and accessibility from previous version
*/

const fetchEvent = async (id, signal) => {
	if (!id) return null;
	return getEventById(id, { signal });
};

const DetailRow = ({ icon: Icon, label, children }) => (
	<div className="flex items-start gap-3">
		<Icon className="text-indigo-500 mt-1" />
		<div>
			<div className="text-xs text-[var(--text-muted)]">{label}</div>
			<div className="font-medium mt-0.5">{children}</div>
		</div>
	</div>
);

const prettyDate = (d) => {
	if (!d) return 'TBD';
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return String(d);
	return dt.toLocaleString();
};

const EventDetailModal = ({ event: initialEvent, isOpen, onClose }) => {
	const id = initialEvent?._id || initialEvent?.id;
	const [showRaw, setShowRaw] = useState(false);

	// always call hooks in same order
	const {
		data: event,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['event-full', id],
		queryFn: ({ signal }) => fetchEvent(id, signal),
		enabled: !!isOpen && !!id,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});

	// compute payload and rawJson before any early returns so hooks stay stable
	const payload = event || initialEvent || {};
	const rawJson = useMemo(() => {
		try {
			return JSON.stringify(payload, null, 2);
		} catch {
			return String(payload);
		}
	}, [payload]);

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e) => {
			if (e.key === 'Escape') onClose?.();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	useEffect(() => {
		if (!isOpen) setShowRaw(false);
	}, [isOpen]);

	if (!isOpen) return null;

	const poster = payload.posters?.[0]?.url || payload.posters?.[0]?.secure_url || null;
	const title = payload.title || 'Untitled Event';
	const dateLabel = payload.eventDate ? prettyDate(payload.eventDate) : 'TBD';
	const venue = payload.venue || 'Venue TBD';
	const organizer = payload.organizer || 'Syntax Organization';
	const tags = Array.isArray(payload.tags) ? payload.tags : payload.tags ? [payload.tags] : [];
	const speakers = Array.isArray(payload.speakers) ? payload.speakers : [];
	const partners = Array.isArray(payload.partners) ? payload.partners : [];
	const resources = Array.isArray(payload.resources) ? payload.resources : [];
	const coOrganizers = Array.isArray(payload.coOrganizers) ? payload.coOrganizers : [];
	const desc = payload.description || payload.summary || 'No description available.';
	const registrationInfo = payload.registrationInfo || payload.registration || {};

	const copyRaw = async () => {
		try {
			await navigator.clipboard.writeText(rawJson);
			window.dispatchEvent(
				new CustomEvent('toast', { detail: { message: 'Event JSON copied' } })
			);
		} catch {
			/* ignore */
		}
	};

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center p-4"
			>
				{/* backdrop */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="absolute inset-0 bg-black/50 backdrop-blur-sm"
					onClick={onClose}
				/>

				{/* modal */}
				<motion.div
					initial={{ y: 20, scale: 0.98, opacity: 0 }}
					animate={{ y: 0, scale: 1, opacity: 1 }}
					exit={{ y: 20, scale: 0.98, opacity: 0 }}
					transition={{ duration: 0.22 }}
					className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-[var(--card-bg)] rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-3"
					role="dialog"
					aria-modal="true"
					aria-label={`Event details: ${title}`}
				>
					{/* left: poster + quick meta */}
					<div className="col-span-1 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex flex-col">
						<div className="relative h-56 sm:h-72 lg:h-full w-full overflow-hidden">
							{poster ? (
								<img
									src={poster}
									alt={title}
									className="w-full h-full object-cover"
									loading="lazy"
									decoding="async"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
									<div className="text-6xl text-white opacity-90">🎭</div>
								</div>
							)}
							<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
						</div>

						<div className="p-4 md:p-6 text-sm text-white/90 bg-gradient-to-t from-black/60">
							<DetailRow icon={Calendar} label="When">
								{dateLabel}
							</DetailRow>
							<div className="mt-3">
								<DetailRow icon={MapPin} label="Where">
									{venue} {payload.room ? `• ${payload.room}` : ''}
								</DetailRow>
							</div>
							<div className="mt-3">
								<DetailRow icon={Users} label="Organizer">
									{organizer}
								</DetailRow>
							</div>

							{/* small extra meta */}
							<div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/80">
								<div>
									<div className="text-[10px] text-white/70">Category</div>
									<div className="font-medium">{payload.category || '—'}</div>
								</div>
								<div>
									<div className="text-[10px] text-white/70">Status</div>
									<div className="font-medium">{payload.status || '—'}</div>
								</div>
								<div>
									<div className="text-[10px] text-white/70">Tickets</div>
									<div className="font-medium">
										{payload.ticketCount ?? payload.tickets?.length ?? 0}
									</div>
								</div>
								<div>
									<div className="text-[10px] text-white/70">Price</div>
									<div className="font-medium">
										{typeof payload.ticketPrice === 'number'
											? `₹${payload.ticketPrice}`
											: '—'}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* right: full details */}
					<div className="col-span-2 p-6 overflow-y-auto">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h2 className="text-2xl font-extrabold leading-tight">{title}</h2>
								<div className="mt-2 flex items-center gap-2 flex-wrap">
									{tags.slice(0, 8).map((t) => (
										<span
											key={t}
											className="text-xs px-2 py-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]"
										>
											<Tag className="inline-block mr-1" /> {t}
										</span>
									))}
								</div>
							</div>

							<div className="flex items-center gap-2">
								<button
									onClick={() => {
										copyRaw();
									}}
									title="Copy full JSON"
									className="p-2 rounded-md text-[var(--text-muted)] hover:bg-gray-100"
								>
									<Copy size={18} />
								</button>
								<button
									onClick={() => setShowRaw((s) => !s)}
									className="px-3 py-1 rounded-md border text-sm"
								>
									{showRaw ? 'Hide raw' : 'Show raw'}
								</button>
								<button
									onClick={onClose}
									className="p-2 rounded-md text-[var(--text-muted)] hover:bg-gray-100"
									aria-label="Close event details"
								>
									<X size={20} />
								</button>
							</div>
						</div>

						{/* registration & meta */}
						<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="rounded-md p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
								<div className="text-xs text-[var(--text-muted)]">Registration</div>
								<div className="mt-1">
									<div className="font-medium">
										{registrationInfo?.actionLabel ||
											registrationInfo?.actionUrl ||
											'No registration'}
									</div>
									{registrationInfo?.isOpen && registrationInfo?.actionUrl && (
										<a
											href={registrationInfo.actionUrl}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded bg-emerald-600 text-white text-sm"
										>
											{registrationInfo.actionLabel || 'Register'}{' '}
											<Globe size={14} />
										</a>
									)}
									{registrationInfo?.message && (
										<div className="mt-2 text-xs text-[var(--text-muted)]">
											{registrationInfo.message}
										</div>
									)}
								</div>
							</div>

							<div className="rounded-md p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
								<div className="text-xs text-[var(--text-muted)]">
									Capacity & Tickets
								</div>
								<div className="mt-1 text-sm">
									<div>
										Total spots: <strong>{payload.totalSpots ?? '—'}</strong>
									</div>
									<div>
										Effective capacity:{' '}
										<strong>{payload.effectiveCapacity ?? '—'}</strong>
									</div>
									<div>
										Spots left:{' '}
										<strong>
											{typeof payload.spotsLeft !== 'undefined'
												? payload.spotsLeft === Infinity
													? 'Unlimited'
													: payload.spotsLeft
												: '—'}
										</strong>
									</div>
									{payload.isFull && (
										<div className="mt-1 text-red-600 font-semibold">
											Event full
										</div>
									)}
								</div>
							</div>
						</div>

						{/* description */}
						<div className="mt-6">
							<h3 className="text-lg font-semibold mb-2">About</h3>
							<p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
								{desc}
							</p>
						</div>

						{/* speakers */}
						{speakers.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">Speakers</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{speakers.map((s, idx) => (
										<div
											key={idx}
											className="flex items-start gap-3 p-3 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)]"
										>
											{s.photo?.url ? (
												<img
													src={s.photo.url}
													alt={s.name}
													className="w-12 h-12 rounded-md object-cover"
												/>
											) : (
												<div className="w-12 h-12 rounded-md bg-indigo-600 text-white flex items-center justify-center font-semibold">
													{(s.name || 'S').slice(0, 2).toUpperCase()}
												</div>
											)}
											<div>
												<div className="font-medium">{s.name}</div>
												<div className="text-xs text-[var(--text-muted)]">
													{s.title}
												</div>
												{s.bio && (
													<div className="text-xs mt-1 text-[var(--text-secondary)] line-clamp-3">
														{s.bio}
													</div>
												)}
												{Array.isArray(s.links) && (
													<div className="text-xs mt-1 text-[var(--text-muted)]">
														Links: {JSON.stringify(s.links)}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* partners */}
						{partners.length > 0 && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-3">Partners</h3>
								<div className="flex gap-3 flex-wrap items-center">
									{partners.map((p, i) => (
										<a
											key={i}
											href={p.website || '#'}
											target="_blank"
											rel="noreferrer"
											className="inline-flex items-center gap-3 p-2 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)]"
										>
											{p.logo?.url ? (
												<img
													src={p.logo.url}
													alt={p.name}
													className="w-10 h-10 object-contain"
												/>
											) : (
												<div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-xs">
													{p.name?.slice(0, 2)}
												</div>
											)}
											<div className="text-sm">{p.name}</div>
										</a>
									))}
								</div>
							</div>
						)}

						{/* co-organizers & resources */}
						{(coOrganizers.length > 0 || resources.length > 0) && (
							<div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
								{coOrganizers.length > 0 && (
									<div className="rounded-md p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
										<div className="text-xs text-[var(--text-muted)]">
											Co-organizers
										</div>
										<ul className="mt-2 list-disc list-inside text-sm">
											{coOrganizers.map((c, i) => (
												<li key={i}>{c}</li>
											))}
										</ul>
									</div>
								)}

								{resources.length > 0 && (
									<div className="rounded-md p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
										<div className="text-xs text-[var(--text-muted)]">
											Resources
										</div>
										<ul className="mt-2 space-y-2 text-sm">
											{resources.map((r, i) => (
												<li key={i}>
													<a
														href={r.url}
														target="_blank"
														rel="noreferrer"
														className="text-indigo-600 underline"
													>
														{r.title || r.url}
													</a>
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}

						{/* raw JSON */}
						{showRaw && (
							<div className="mt-6">
								<h3 className="text-lg font-semibold mb-2">Raw event JSON</h3>
								<pre className="bg-black/5 p-3 rounded text-xs overflow-auto max-h-60">
									{rawJson}
								</pre>
							</div>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default React.memo(EventDetailModal);

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
	Calendar,
	MapPin,
	CreditCard,
	Ticket,
	Users,
	Share2,
	Copy,
	Globe,
	Clock,
} from 'lucide-react';
import { getEventById } from '../services/eventServices.js';
import LoadingBlock from '../components/Arvantis/LoadingBlock.jsx';
import '../arvantis.css';

const prettyDate = (d) => {
	if (!d) return 'TBD';
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return String(d);
	return dt.toLocaleString();
};

const formatPrice = (p) => {
	if (typeof p !== 'number') return p ?? 'TBD';
	if (p === 0) return 'Free';
	return `₹${new Intl.NumberFormat().format(p)}`;
};

const PricePill = ({ price }) => {
	const free = price === 0 || price === 'Free' || price === 'free';
	return (
		<div
			className={`inline-flex items-center gap-2 px-3 py-2 rounded-full font-semibold ${
				free
					? 'bg-emerald-50 text-emerald-700'
					: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
			}`}
		>
			{free ? (
				<span className="text-sm">Free</span>
			) : (
				<>
					<CreditCard size={14} /> <span className="text-sm">{formatPrice(price)}</span>
				</>
			)}
		</div>
	);
};

const MetaRow = ({ icon: Icon, label, value }) => (
	<div className="flex items-start gap-3">
		<div className="text-indigo-500">
			<Icon size={18} />
		</div>
		<div className="min-w-0">
			<div className="text-xs text-[var(--text-secondary)]">{label}</div>
			<div className="font-medium truncate">{value}</div>
		</div>
	</div>
);

const EventDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [showRaw, setShowRaw] = useState(false);

	const {
		data: payload,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ['event-public', id],
		queryFn: ({ signal }) => getEventById(id, { signal }),
		enabled: !!id,
		staleTime: 60_000,
		retry: 1,
	});

	// derive stable values before any early returns
	const event = useMemo(() => payload || {}, [payload]);

	const registrationInfo = useMemo(() => {
		return event.registrationInfo || event.registration || { mode: 'none', isOpen: false };
	}, [event.registrationInfo, event.registration]);

	const rawJson = useMemo(() => {
		try {
			return JSON.stringify(event, null, 2);
		} catch {
			return String(event);
		}
	}, [event]);

	// --- move normalized fields here so callbacks can reference them safely ---
	const title = event.title || 'Untitled Event';
	const poster = event.posters?.[0]?.url || event.posters?.[0]?.secure_url || null;
	const dateLabel = event.eventDate ? prettyDate(event.eventDate) : 'TBD';
	const venue = event.venue || 'Venue TBD';
	const tags = Array.isArray(event.tags) ? event.tags : event.tags ? [event.tags] : [];
	const speakers = Array.isArray(event.speakers) ? event.speakers : [];
	const partners = Array.isArray(event.partners) ? event.partners : [];
	const resources = Array.isArray(event.resources) ? event.resources : [];
	const coOrganizers = Array.isArray(event.coOrganizers) ? event.coOrganizers : [];
	const desc = event.description || event.summary || 'No description available.';
	const price =
		typeof event.ticketPrice === 'number' ? event.ticketPrice : event.ticketPrice ?? null;
	const ticketCount =
		event.ticketCount ?? (Array.isArray(event.tickets) ? event.tickets.length : null);
	const spotsLeft = typeof event.spotsLeft !== 'undefined' ? event.spotsLeft : null;
	const isFull = !!event.isFull;
	// --- end normalized fields ---

	useEffect(() => {
		if (!id) navigate(-1);
	}, [id, navigate]);

	const handleRegister = useCallback(() => {
		const info = registrationInfo || {};
		if (info.mode === 'external' && info.actionUrl) {
			window.open(info.actionUrl, '_blank', 'noopener,noreferrer');
			return;
		}
		// internal registration: navigate to register route (frontend should handle)
		const route = info.actionUrl || `/events/${id}/register`;
		navigate(route);
	}, [registrationInfo, navigate, id]);

	const handleShare = useCallback(async () => {
		const url = window.location.href;
		const titleShare = title;
		if (navigator.share) {
			try {
				await navigator.share({ title: titleShare, url });
				return;
			} catch {
				// fallthrough to copy
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			window.dispatchEvent(
				new CustomEvent('toast', { detail: { message: 'Link copied to clipboard' } })
			);
		} catch {
			/* ignore */
		}
	}, [title]);

	if (isLoading) return <LoadingBlock label="Loading event..." />;
	if (isError)
		return <div className="p-8">Error loading event: {error?.message || 'Unknown'}</div>;

	return (
		<motion.main
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			className="min-h-screen py-8"
		>
			<div className="max-w-6xl mx-auto px-4">
				<nav className="flex items-center gap-3 text-sm mb-4">
					<button onClick={() => navigate(-1)} className="btn-ghost small">
						← Back
					</button>
					<Link to="/events" className="text-xs muted">
						All events
					</Link>
					<span className="text-xs muted">/</span>
					<span className="font-medium">{title}</span>
				</nav>

				{/* Header: poster + quick meta/actions */}
				<header className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start mb-6">
					<div className="md:col-span-2 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-900">
						{poster ? (
							<img
								src={poster}
								alt={title}
								className="w-full h-64 md:h-96 object-cover block"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-64 md:h-96 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
								<div className="text-6xl">🎭</div>
							</div>
						)}
						<div className="absolute left-6 bottom-6 z-20 text-white">
							<h1 className="text-2xl md:text-4xl font-extrabold neon-text leading-tight">
								{title}
							</h1>
							<div className="mt-1 mono-tech text-sm">
								{venue} • {dateLabel}
							</div>
						</div>
					</div>

					<aside className="space-y-4">
						<div className="glass-card p-4 tech">
							<div className="flex items-start justify-between gap-3">
								<div>
									<div className="text-xs text-[var(--text-secondary)]">When</div>
									<div className="font-medium">{dateLabel}</div>
								</div>
								<div>
									<PricePill price={price} />
								</div>
							</div>

							<div className="mt-3 space-y-2">
								<MetaRow icon={MapPin} label="Venue" value={venue} />
								{typeof ticketCount === 'number' && (
									<MetaRow
										icon={Users}
										label="Tickets issued"
										value={ticketCount}
									/>
								)}
								{typeof spotsLeft === 'number' && (
									<MetaRow
										icon={Clock}
										label="Spots left"
										value={spotsLeft || '0'}
									/>
								)}
								<div className="mt-3">
									<div className="text-xs text-[var(--text-secondary)]">
										Registration
									</div>
									<div className="mt-2 flex items-center gap-2">
										{registrationInfo && registrationInfo.isOpen ? (
											<button
												onClick={handleRegister}
												className="btn-primary neon-btn w-full"
											>
												<Ticket size={16} />{' '}
												{registrationInfo.actionLabel || 'Register'}
											</button>
										) : (
											<button
												disabled
												className="btn-ghost w-full opacity-60"
											>
												{registrationInfo?.message || 'Registration closed'}
											</button>
										)}
									</div>
									{registrationInfo?.actionUrl && (
										<div className="mt-2 text-xs mono muted break-all">
											<Link
												to={registrationInfo.actionUrl}
												className="underline"
											>
												Registration link
											</Link>
										</div>
									)}
								</div>
							</div>

							<div className="mt-4 flex gap-2">
								<button
									onClick={handleShare}
									className="btn-ghost small inline-flex items-center gap-2"
								>
									<Share2 size={14} /> Share
								</button>
								<button
									onClick={() => {
										navigator.clipboard?.writeText(rawJson);
										window.dispatchEvent(
											new CustomEvent('toast', {
												detail: { message: 'Event JSON copied' },
											})
										);
									}}
									className="btn-ghost small inline-flex items-center gap-2"
								>
									<Copy size={14} /> JSON
								</button>
								{event.website && (
									<a
										href={event.website}
										target="_blank"
										rel="noreferrer"
										className="btn-ghost small inline-flex items-center gap-2"
									>
										<Globe size={14} /> Website
									</a>
								)}
							</div>
						</div>

						{/* tags */}
						{tags.length > 0 && (
							<div className="glass-card p-4">
								<div className="text-xs text-[var(--text-secondary)]">Tags</div>
								<div className="mt-2 flex flex-wrap gap-2">
									{tags.map((t) => (
										<span
											key={t}
											className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-sm"
										>
											{t}
										</span>
									))}
								</div>
							</div>
						)}

						{/* co-organizers */}
						{coOrganizers.length > 0 && (
							<div className="glass-card p-4">
								<div className="text-xs text-[var(--text-secondary)]">
									Co-organizers
								</div>
								<ul className="mt-2 list-inside list-disc text-sm">
									{coOrganizers.map((c, i) => (
										<li key={i}>{c}</li>
									))}
								</ul>
							</div>
						)}
					</aside>
				</header>

				{/* Main content */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<main className="lg:col-span-2 space-y-6">
						{/* about */}
						<div className="glass-card p-6">
							<h2
								className="text-lg font-semibold"
								style={{ color: 'var(--text-primary)' }}
							>
								About
							</h2>
							<p className="mt-3 text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
								{desc}
							</p>
						</div>

						{/* speakers */}
						{speakers.length > 0 && (
							<div className="glass-card p-6">
								<h3 className="text-lg font-semibold mb-4">Speakers</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{speakers.map((s, i) => (
										<div
											key={i}
											className="flex items-start gap-4 p-3 rounded-md border bg-white/5"
										>
											{s.photo?.url ? (
												<img
													src={s.photo.url}
													alt={s.name}
													className="w-14 h-14 rounded-md object-cover"
												/>
											) : (
												<div className="w-14 h-14 rounded-md bg-indigo-600 text-white flex items-center justify-center font-medium">
													{(s.name || 'S').slice(0, 2).toUpperCase()}
												</div>
											)}
											<div>
												<div className="font-semibold">{s.name}</div>
												{s.title && (
													<div className="text-xs muted">{s.title}</div>
												)}
												{s.bio && (
													<div className="mt-2 text-sm text-[var(--text-secondary)]">
														{s.bio}
													</div>
												)}
												{s.links && (
													<div className="mt-2 flex gap-2">
														{s.links.twitter && (
															<a
																href={s.links.twitter}
																target="_blank"
																rel="noreferrer"
																className="btn-ghost small"
															>
																Twitter
															</a>
														)}
														{s.links.linkedin && (
															<a
																href={s.links.linkedin}
																target="_blank"
																rel="noreferrer"
																className="btn-ghost small"
															>
																LinkedIn
															</a>
														)}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* partners with stacked layout */}
						{partners.length > 0 && (
							<div className="glass-card p-6">
								<h3 className="text-lg font-semibold mb-4">Partners</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{partners.map((p, i) => (
										<a
											key={i}
											href={p.website || '#'}
											target="_blank"
											rel="noreferrer"
											className="flex flex-col items-center text-center gap-2 p-3 rounded-md border bg-white/5"
										>
											{p.logo?.url ? (
												<img
													src={p.logo.url}
													alt={p.name}
													className="max-h-16 object-contain"
												/>
											) : (
												<div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
													{(p.name || '—').slice(0, 22)}
												</div>
											)}
											<div className="font-medium mt-1">{p.name}</div>
											{p.tier && (
												<div className="text-xs mono muted">{p.tier}</div>
											)}
											{p.description && (
												<div className="text-xs muted mt-2">
													{p.description}
												</div>
											)}
										</a>
									))}
								</div>
							</div>
						)}

						{/* resources */}
						{resources.length > 0 && (
							<div className="glass-card p-6">
								<h3 className="text-lg font-semibold mb-3">Resources</h3>
								<ul className="space-y-2">
									{resources.map((r, i) => (
										<li key={i}>
											<a
												className="text-indigo-600 dark:text-indigo-400 underline"
												href={r.url}
												target="_blank"
												rel="noreferrer"
											>
												{r.title || r.url}
											</a>
										</li>
									))}
								</ul>
							</div>
						)}
					</main>

					{/* right column: repeat quick actions + raw JSON toggle */}
					<aside className="space-y-6">
						<div className="glass-card p-4">
							<div className="text-xs text-[var(--text-secondary)]">
								Quick actions
							</div>
							<div className="mt-3 flex flex-col gap-2">
								{registrationInfo && registrationInfo.isOpen ? (
									<button
										onClick={handleRegister}
										className="btn-primary neon-btn w-full inline-flex items-center justify-center gap-2"
									>
										<Ticket size={16} />{' '}
										{registrationInfo.actionLabel || 'Register'}
									</button>
								) : (
									<button disabled className="btn-ghost w-full">
										Registration closed
									</button>
								)}
								<button
									onClick={handleShare}
									className="btn-ghost w-full inline-flex items-center gap-2"
								>
									<Share2 size={14} /> Share link
								</button>
								<button
									onClick={() => {
										navigator.clipboard?.writeText(rawJson);
										window.dispatchEvent(
											new CustomEvent('toast', {
												detail: { message: 'Event JSON copied' },
											})
										);
									}}
									className="btn-ghost w-full inline-flex items-center gap-2"
								>
									<Copy size={14} /> Copy JSON
								</button>
								<Link to="/events" className="btn-ghost w-full text-center">
									All events
								</Link>
							</div>
						</div>

						{showRaw && (
							<div className="glass-card p-3">
								<pre className="text-xs overflow-auto max-h-48">{rawJson}</pre>
								<button
									onClick={() => setShowRaw(false)}
									className="mt-2 btn-ghost small"
								>
									Hide raw
								</button>
							</div>
						)}
						{!showRaw && (
							<button onClick={() => setShowRaw(true)} className="btn-ghost w-full">
								Show raw JSON
							</button>
						)}
					</aside>
				</section>
			</div>
		</motion.main>
	);
};

export default EventDetailPage;

import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
	Calendar,
	Clock,
	MapPin,
	Home,
	Users,
	Tag,
	CheckCircle,
	Share2,
	Globe,
} from 'lucide-react';
import { getEventById } from '../services/eventServices.js';
import LoadingBlock from '../components/Arvantis/LoadingBlock.jsx';
import '../arvantis.css';

const prettyDate = (d) => {
	if (!d) return 'TBD';
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return String(d);
	return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
const prettyTime = (t) => (t ? String(t) : 'TBD');

const DetailRow = ({ Icon, label, value }) => (
	<div className="flex items-start gap-3">
		<div className="text-indigo-500 mt-1">
			<Icon size={18} />
		</div>
		<div className="min-w-0">
			<div className="text-xs text-[var(--text-secondary)]">{label}</div>
			<div className="font-medium break-words">{value ?? '—'}</div>
		</div>
	</div>
);

const EventDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();

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

	// derived stable values
	const event = useMemo(() => payload || {}, [payload]);

	const title = event.title || 'Untitled Event';
	const poster = event.posters?.[0]?.url || event.posters?.[0]?.secure_url || null;
	const dateLabel = event.eventDate ? prettyDate(event.eventDate) : 'TBD';
	const timeLabel = event.eventTime ? prettyTime(event.eventTime) : 'TBD';
	const venue = event.venue || 'TBD';
	const room = event.room || null;
	const organizer = event.organizer || 'Syntax Organization';
	const coOrganizers = Array.isArray(event.coOrganizers)
		? event.coOrganizers
		: event.coOrganizers
		? [event.coOrganizers]
		: [];
	const category = event.category || '—';
	const subcategory = event.subcategory || '—';
	const partners = Array.isArray(event.partners) ? event.partners : [];
	const speakers = Array.isArray(event.speakers) ? event.speakers : [];
	const resources = Array.isArray(event.resources) ? event.resources : [];
	const ticketPriceRaw =
		typeof event.ticketPrice === 'number' ? event.ticketPrice : event.ticketPrice ?? null;
	const ticketPriceLabel =
		ticketPriceRaw === 0
			? 'Free'
			: typeof ticketPriceRaw === 'number'
			? `₹${new Intl.NumberFormat().format(ticketPriceRaw)}`
			: ticketPriceRaw ?? 'TBD';
	const status = event.status || 'upcoming';
	const registrationInfo = useMemo(() => {
		return event.registrationInfo ||
			event.registration || { mode: 'none', isOpen: false, actionUrl: null, actionLabel: null };
	}, [event.registrationInfo, event.registration]);

	useEffect(() => {
		if (!id) navigate(-1);
	}, [id, navigate]);

	const handleRegister = useCallback(() => {
		if (!registrationInfo) return;
		if (registrationInfo.actionUrl) {
			window.open(registrationInfo.actionUrl, '_blank', 'noopener,noreferrer');
			return;
		}
		if (registrationInfo.mode === 'internal') navigate(`/events/${id}/register`);
	}, [registrationInfo, navigate, id]);

	const handleShare = useCallback(async () => {
		const url = window.location.href;
		if (navigator.share) {
			try {
				await navigator.share({ title, url });
				return;
			} catch {
				/* fall through */
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			window.dispatchEvent(new CustomEvent('toast', { detail: { message: 'Link copied' } }));
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
				{/* Header */}
				<div className="mb-6">
					<nav className="flex items-center gap-3 text-sm mb-3">
						<button onClick={() => navigate(-1)} className="btn-ghost small">
							← Back
						</button>
						<Link to="/events" className="text-xs muted">
							All events
						</Link>
						<span className="text-xs muted">/</span>
						<span className="font-medium">{title}</span>
					</nav>

					<h1
						className="text-3xl md:text-4xl font-extrabold mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						{title}
					</h1>
					<div className="flex items-center gap-3 flex-wrap">
						<div className="text-sm mono-tech text-[var(--text-secondary)]">
							{dateLabel} • {timeLabel}
						</div>
						<div className="text-sm mono-tech text-[var(--text-secondary)]">
							{venue}
							{room ? ` · ${room}` : ''}
						</div>
						<div className="ml-auto flex items-center gap-2">
							<button
								onClick={handleShare}
								className="btn-ghost small inline-flex items-center gap-2"
							>
								<Share2 size={14} /> Share
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
				</div>

				{/* Poster / details */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
					<div className="lg:col-span-2 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
						{poster ? (
							<img
								src={poster}
								alt={title}
								className="w-full h-auto poster-plain"
								loading="lazy"
							/>
						) : (
							<div className="w-full h-56 flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
								<div className="text-5xl">🎭</div>
							</div>
						)}
					</div>

					<aside className="space-y-4">
						<div className="glass-card p-4 tech">
							<div className="flex items-center justify-between">
								<div>
									<div className="text-xs text-[var(--text-secondary)]">
										Status
									</div>
									<div className="font-semibold flex items-center gap-2">
										<span
											className={status === 'upcoming' ? 'text-cyan-400' : ''}
										>
											{status.toUpperCase()}
										</span>
										{status === 'upcoming' && (
											<CheckCircle size={16} className="text-cyan-400" />
										)}
									</div>
								</div>

								<div>
									<div className="text-xs text-[var(--text-secondary)]">
										Ticket price
									</div>
									<div className="font-medium">{ticketPriceLabel}</div>
								</div>
							</div>

							<div className="mt-4 space-y-3">
								<DetailRow Icon={Calendar} label="Date" value={dateLabel} />
								<DetailRow Icon={Clock} label="Time" value={timeLabel} />
								<DetailRow Icon={MapPin} label="Venue" value={venue} />
								{room && <DetailRow Icon={Home} label="Room" value={room} />}
								<DetailRow Icon={Users} label="Organizer" value={organizer} />
								{coOrganizers.length > 0 && (
									<DetailRow
										Icon={Users}
										label="Co-organizers"
										value={coOrganizers.join(', ')}
									/>
								)}
								<DetailRow
									Icon={Tag}
									label="Category"
									value={`${category}${subcategory ? ` · ${subcategory}` : ''}`}
								/>
							</div>

							{registrationInfo?.actionUrl || registrationInfo?.isOpen ? (
								<div className="mt-4">
									<button
										onClick={handleRegister}
										className="btn-primary neon-btn w-full"
									>
										{registrationInfo?.actionLabel || 'Register'}
									</button>
								</div>
							) : (
								<div className="mt-4 text-sm text-[var(--text-secondary)]">
									{registrationInfo?.message || 'Registration not available'}
								</div>
							)}
						</div>

						{resources.length > 0 && (
							<div className="glass-card p-3">
								<div className="text-xs text-[var(--text-secondary)]">
									Resources
								</div>
								<ul className="mt-2 list-inside list-disc text-sm space-y-1">
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
					</aside>
				</section>

				{/* Main details */}
				<section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
					<main className="lg:col-span-2 space-y-6">
						<div className="glass-card p-6">
							<h2
								className="text-lg font-semibold"
								style={{ color: 'var(--text-primary)' }}
							>
								About the event
							</h2>
							<p className="mt-3 text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
								{event.description || 'No description provided.'}
							</p>
						</div>

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
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{partners.length > 0 && (
							<div className="glass-card p-6">
								<h3 className="text-lg font-semibold mb-4">Partners</h3>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{partners.map((p, i) => (
										<div
											key={i}
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
										</div>
									))}
								</div>
							</div>
						)}
					</main>

					<aside className="space-y-6">
						<div className="glass-card p-4">
							<div className="text-xs text-[var(--text-secondary)]">Quick links</div>
							<div className="mt-3 flex flex-col gap-2">
								{event.website && (
									<a
										href={event.website}
										target="_blank"
										rel="noreferrer"
										className="btn-ghost w-full text-center"
									>
										Event website
									</a>
								)}
								<Link to="/events" className="btn-ghost w-full text-center">
									All events
								</Link>
							</div>
						</div>
					</aside>
				</section>
			</div>
		</motion.main>
	);
};

export default EventDetailPage;

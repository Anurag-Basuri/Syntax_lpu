import { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEvent } from '../../hooks/useEvents.js';
import SpeakerDetailModal from './SpeakerDetailModal.jsx';

// Utility: readable date/time
const safeFormatDate = (dateInput) => {
	if (!dateInput) return 'TBD';
	const d = new Date(dateInput);
	if (isNaN(d.getTime())) return 'Invalid date';
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(d);
};

// Small time-until helper (used for "Starts in")
const timeUntil = (date) => {
	if (!date) return null;
	const now = new Date();
	const diff = new Date(date) - now;
	if (!isFinite(diff) || diff <= 0) return null;
	const mins = Math.floor(diff / 60000);
	const days = Math.floor(mins / (60 * 24));
	const hours = Math.floor((mins % (60 * 24)) / 60);
	const minutes = mins % 60;
	return { days, hours, minutes, totalMinutes: mins };
};

// Safe string truncate helper
const truncate = (str = '', n = 300) => (str.length > n ? str.slice(0, n - 1).trim() + '…' : str);

// Small reusable Avatar component
const Avatar = ({ src, name, size = 56 }) => {
	const initials =
		(name || '')
			.split(' ')
			.map((s) => s[0])
			.join('')
			.slice(0, 2)
			.toUpperCase() || '–';
	return src ? (
		<img
			src={src}
			alt={name || 'avatar'}
			className="rounded-full object-cover"
			style={{ width: size, height: size }}
			loading="lazy"
		/>
	) : (
		<div
			className="rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white"
			style={{ width: size, height: size }}
			aria-hidden
		>
			<span className="font-semibold">{initials}</span>
		</div>
	);
};

// Speaker card (clickable to open speaker slide-over)
const SpeakerCard = ({ sp, onOpen }) => {
	const bio = sp?.bio || sp?.description || '';
	return (
		<button
			type="button"
			onClick={(e) => {
				e.stopPropagation();
				onOpen(sp);
			}}
			className="group text-left p-3 rounded-md hover-lift transition-shadow duration-200 flex gap-3 items-start"
			style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
			aria-label={`Open details for ${sp?.name || 'speaker'}`}
		>
			<Avatar src={sp?.photo} name={sp?.name} size={56} />
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<div className="font-medium text-[var(--text-primary)] truncate">{sp?.name || sp?.title || 'Speaker'}</div>
					{sp?.company && <div className="text-xs text-[var(--text-muted)]">{sp.company}</div>}
				</div>
				{sp?.title && <div className="text-xs text-[var(--text-muted)] truncate">{sp.title}</div>}
				{bio && <div className="text-sm text-[var(--text-secondary)] mt-2">{truncate(bio, 180)}</div>}
			</div>
		</button>
	);
};

// Partner tile (used in grid and carousel)
const PartnerTile = ({ p }) => (
	<a
		href={p?.website || '#'}
		onClick={(e) => e.stopPropagation()}
		target="_blank"
		rel="noreferrer"
		className="group flex items-center gap-3 p-3 rounded-md hover-lift transition-transform duration-200"
		style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
	>
		<div className="flex-shrink-0 w-12 h-12 rounded-md bg-white/5 overflow-hidden flex items-center justify-center">
			{p?.logo ? (
				<img src={p.logo} alt={p?.name || 'partner'} className="w-full h-full object-contain" loading="lazy" />
			) : (
				<div className="text-sm text-[var(--text-primary)]">{(p?.name || '').slice(0, 1)}</div>
			)}
		</div>
		<div className="min-w-0">
			<div className="font-medium text-[var(--text-primary)] truncate">{p?.name || 'Partner'}</div>
			{p?.tier && <div className="text-xs text-[var(--text-muted)] mt-0.5">{p.tier}</div>}
		</div>
		<div className="ml-auto text-xs text-[var(--text-muted)] transform transition-transform duration-200 group-hover:translate-x-1">→</div>
	</a>
);

// Co-organizer chip
const CoOrganizerChip = ({ c }) => (
	<div
		className="group flex items-center gap-2 rounded-full px-3 py-1 hover-lift transition-transform"
		style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)' }}
	>
		<div className="w-7 h-7 rounded-full overflow-hidden">
			{c?.logo ? (
				<img src={c.logo} alt={c?.name || 'co-organizer'} className="w-full h-full object-cover" loading="lazy" />
			) : (
				<div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white">
					{(c?.name || '').slice(0, 1)}
				</div>
			)}
		</div>
		<div className="text-xs text-[var(--text-primary)]">{c?.name || c}</div>
	</div>
);

const EventDetailModal = ({ event: initialEvent, isOpen, onClose }) => {
	const [imgIndex, setImgIndex] = useState(0);
	const [posterOk, setPosterOk] = useState(true);
	const closeRef = useRef(null);
	const id = initialEvent?._id ?? null;

	// use existing hook unchanged
	const { data: fetched } = useEvent(isOpen ? id : null);
	const event = fetched || initialEvent;

	// speaker slide-over
	const [activeSpeaker, setActiveSpeaker] = useState(null);

	// partners carousel ref (mobile)
	const partnersRef = useRef(null);

	// compute countdown and simple derived values
	const countdown = useMemo(() => timeUntil(event?.eventDate || event?.date), [event]);
	const posterUrl = event?.posters?.[imgIndex]?.url ?? null;

	// detect theme quickly (uses CSS data-theme or prefers-color-scheme)
	const isDark = (() => {
		try {
			const dt = document.documentElement?.getAttribute?.('data-theme');
			if (dt) return dt === 'dark';
			return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		} catch {
			return true;
		}
	})();

	// preload poster to protect against broken links; posters are typically landscape,
	// so we render them inside a framed area with object-contain so the full poster is visible.
	useEffect(() => {
		let mounted = true;
		if (!posterUrl) {
			setPosterOk(false);
			return;
		}
		const img = new Image();
		img.onload = () => mounted && setPosterOk(true);
		img.onerror = () => mounted && setPosterOk(false);
		img.src = posterUrl;
		return () => {
			mounted = false;
		};
	}, [posterUrl]);

	// prevent background scroll while modal open
	useEffect(() => {
		if (!isOpen) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev || '';
		};
	}, [isOpen]);

	// focus close and escape handling
	useEffect(() => {
		if (!isOpen) return;
		closeRef.current?.focus();
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	// defensive normalized collections
	const speakers = Array.isArray(event?.speakers) ? event.speakers : event?.speakers ? [event.speakers] : [];
	const partners = Array.isArray(event?.partners) ? event.partners : event?.partners ? [event.partners] : [];
	const coOrganizers = Array.isArray(event?.coOrganizers) ? event.coOrganizers : event?.coOrganizers ? [event.coOrganizers] : [];
	const resources = Array.isArray(event?.resources) ? event.resources : event?.resources ? [event.resources] : [];
	const faqs = Array.isArray(event?.faqs) ? event.faqs : [];

	if (!isOpen || !event) return null;

	const registrationLink =
		event.registrationLink || event.registrationUrl || event.registration || event.registerUrl || null;

	const onRegister = (e) => {
		e.stopPropagation();
		if (registrationLink) window.open(registrationLink, '_blank');
	};

	const onRemind = (e) => {
		e.stopPropagation();
		try {
			localStorage.setItem(`remind_${event._id}`, Date.now());
		} catch (_) {}
		alert('Reminder saved locally.');
	};

	const downloadICS = (e) => {
		e.stopPropagation();
		// generate ICS
		const start = event.eventDate || event.date;
		if (!start) {
			alert('Event date missing — cannot generate calendar file.');
			return;
		}
		const ics = [
			'BEGIN:VCALENDAR',
			'VERSION:2.0',
			'PRODID:-//Syntax Club//EN',
			'BEGIN:VEVENT',
			`UID:${event._id || Math.random().toString(36).slice(2)}@syntaxclub`,
			`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
			`DTSTART:${new Date(start).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
			`DTEND:${event.endDate ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : new Date(start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}`,
			`SUMMARY:${(event.title || 'Event').replace(/\r?\n/g, ' ')}`,
			`DESCRIPTION:${(event.description || '').replace(/\r\n/g, '\\n').replace(/\n/g, '\\n')}`,
			`LOCATION:${event.venue || ''}`,
			'END:VEVENT',
			'END:VCALENDAR',
		].join('\r\n');
		const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${(event.title || 'event').replace(/\s+/g, '_')}.ics`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	const nextPoster = (e) => {
		e.stopPropagation();
		if (!event.posters?.length) return;
		setImgIndex((p) => (p + 1) % event.posters.length);
	};
	const prevPoster = (e) => {
		e.stopPropagation();
		if (!event.posters?.length) return;
		setImgIndex((p) => (p - 1 + event.posters.length) % event.posters.length);
	};

	// partners carousel helper
	const scrollPartners = (dir = 1) => {
		const el = partnersRef.current;
		if (!el) return;
		const offset = el.clientWidth * 0.7 * dir;
		el.scrollBy({ left: offset, behavior: 'smooth' });
	};

	// Render into body so modal overlays navbar
	return createPortal(
		<AnimatePresence>
			<Motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				style={{ zIndex: 99999 }}
				className="fixed inset-0 flex items-center justify-center"
				aria-modal="true"
				role="dialog"
				onClick={onClose}
			>
				{/* Adaptive overlay */}
				<Motion.div
					className="absolute inset-0"
					style={{
						background: isDark ? 'rgba(0,0,0,0.78)' : 'rgba(255,255,255,0.72)',
						backdropFilter: 'blur(6px)',
						webkitBackdropFilter: 'blur(6px)',
					}}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				/>

				{/* Modal container */}
				<Motion.div
					initial={{ scale: 0.98, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.98, opacity: 0 }}
					onClick={(e) => e.stopPropagation()}
					className="relative w-[96vw] max-w-[1200px] h-[92vh] rounded-2xl overflow-hidden shadow-2xl grid md:grid-cols-3"
					style={{
						background:
							'linear-gradient(180deg, color-mix(in srgb, var(--glass-bg) 95%, transparent), color-mix(in srgb, var(--glass-bg) 90%, transparent))',
						border: '1px solid var(--glass-border)',
					}}
					aria-labelledby="event-modal-title"
				>
					{/* Visual / hero area — treat posters as landscape: preserve entire poster using object-contain inside a framed area */}
					<div className="md:col-span-1 w-full h-full relative flex items-stretch bg-[var(--bg-soft)]">
						<div className="w-full h-full flex items-center justify-center bg-[color-mix(in srgb, var(--bg-soft) 95%, transparent)]">
							{posterOk && posterUrl ? (
								<img
									src={posterUrl}
									alt={event.posters?.[imgIndex]?.caption || event.title || 'poster'}
									className="max-w-full max-h-full object-contain"
									style={{ boxShadow: 'inset 0 0 120px rgba(0,0,0,0.08)' }}
									loading="lazy"
								/>
							) : (
								<div
									className="w-full h-full flex items-center justify-center"
									style={{
										background: isDark ? 'linear-gradient(180deg,#071226,#04111a)' : 'linear-gradient(180deg,#fbfeff,#eef7f8)',
									}}
								>
									<div className="text-7xl opacity-20">🎭</div>
								</div>
							)}
						</div>

						{/* Poster controls */}
						{(event.posters?.length ?? 0) > 1 && (
							<>
								<button
									onClick={prevPoster}
									className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"
									aria-label="Previous poster"
								>
									<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
									</svg>
								</button>
								<button
									onClick={nextPoster}
									className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white"
									aria-label="Next poster"
								>
									<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</>
						)}

						{/* poster caption */}
						{event.posters?.[imgIndex]?.caption && (
							<div className="absolute left-4 bottom-4 px-3 py-1 bg-black/40 rounded text-xs text-white">
								{event.posters[imgIndex].caption}
							</div>
						)}

						{/* close top-right */}
						<button
							ref={closeRef}
							onClick={onClose}
							aria-label="Close"
							className="absolute top-3 right-3 bg-red-600/90 text-white p-2 rounded-full"
						>
							<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* content area */}
					<div className="md:col-span-2 p-6 overflow-auto flex flex-col gap-4">
						{/* header */}
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h2 id="event-modal-title" className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
									{event.title}
								</h2>
								<div className="text-sm" style={{ color: 'var(--text-muted)' }}>
									{event.organizer || event.host || ''}
								</div>
								<div className="mt-2 flex flex-wrap gap-2">
									{Array.isArray(event.tags) &&
										event.tags.map((t) => (
											<span
												key={t}
												className="text-xs px-2 py-0.5 rounded"
												style={{
													background: 'var(--glass-bg)',
													border: '1px solid var(--glass-border)',
													color: 'var(--text-primary)',
												}}
											>
												{t}
											</span>
										))}
								</div>
							</div>

							{/* right CTAs */}
							<div className="flex-shrink-0 flex flex-col items-end gap-2">
								{registrationLink ? (
									<button onClick={onRegister} className="px-3 py-1 bg-emerald-500 text-white rounded">
										Register
									</button>
								) : countdown ? (
									<div className="text-right">
										<div className="text-xs" style={{ color: 'var(--text-muted)' }}>
											Starts in
										</div>
										<div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
											{countdown.days > 0 ? `${countdown.days}d ${countdown.hours}h` : countdown.hours > 0 ? `${countdown.hours}h ${countdown.minutes}m` : `${countdown.minutes}m`}
										</div>
										<button onClick={onRemind} className="mt-1 text-xs px-2 py-0.5 rounded bg-blue-600 text-white">
											Remind
										</button>
									</div>
								) : (
									<div className="text-xs" style={{ color: 'var(--text-muted)' }}>
										{event.status || 'TBD'}
									</div>
								)}
								<button onClick={downloadICS} className="text-xs px-3 py-1 border rounded" style={{ borderColor: 'var(--glass-border)' }}>
									Add to calendar
								</button>
							</div>
						</div>

						{/* schedule & venue row */}
						<div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
							<div className="flex items-center gap-2">
								<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{safeFormatDate(event.eventDate)}
							</div>

							{event.startDate && event.endDate && (
								<div className="text-xs px-2 py-1 rounded bg-white/3">{`From ${safeFormatDate(event.startDate)} — ${safeFormatDate(event.endDate)}`}</div>
							)}

							{event.venue && (
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									</svg>
									{event.venue}
									{event.mapLink && (
										<a href={event.mapLink} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="ml-2 text-xs text-blue-300">
											View on map
										</a>
									)}
								</div>
							)}
						</div>

						{/* description */}
						<section>
							<h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
								Description
							</h3>
							<div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
								{event.description || 'No description available.'}
							</div>
						</section>

						{/* tickets / registration details if present */}
						{(event.tickets || event.ticketInfo) && (
							<section>
								<h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
									Tickets
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{Array.isArray(event.tickets)
										? event.tickets.map((t, i) => (
												<div key={t?.id || i} className="p-3 rounded-md" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
													<div className="flex items-center justify-between">
														<div>
															<div className="font-medium text-[var(--text-primary)]">{t.title || t.name || 'Ticket'}</div>
															<div className="text-xs text-[var(--text-muted)]">{t.description || ''}</div>
														</div>
														<div className="text-sm font-semibold">{t.price ? `$${t.price}` : t.type || ''}</div>
													</div>
													{t.link && (
														<div className="mt-2">
															<a href={t.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs px-3 py-1 rounded bg-emerald-500 text-white">
																Buy
															</a>
														</div>
													)}
												</div>
										  ))
										: event.ticketInfo && (
												<div className="p-3 rounded-md" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
													<div className="text-sm text-[var(--text-secondary)]">{event.ticketInfo}</div>
												</div>
										  )}
								</div>
							</section>
						)}

						{/* speakers */}
						{speakers.length > 0 && (
							<section>
								<h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
									Speakers
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{speakers.map((sp, i) => (
										<SpeakerCard key={sp._id || sp.name || i} sp={sp} onOpen={setActiveSpeaker} />
									))}
								</div>
							</section>
						)}

						{/* partners — grid on desktop, carousel on mobile */}
						{partners.length > 0 && (
							<section>
								<h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
									Partners
								</h3>

								<div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
									{partners.map((p, i) => (
										<PartnerTile key={p._id || p.name || i} p={p} />
									))}
								</div>

								<div className="md:hidden relative">
									<div ref={partnersRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory py-2 scroll-smooth">
										{partners.map((p, i) => (
											<div key={p._id || p.name || i} className="snap-start min-w-[72%]">
												<PartnerTile p={p} />
											</div>
										))}
									</div>

									<div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
										<button
											onClick={(e) => {
												e.stopPropagation();
												scrollPartners(-1);
											}}
											className="p-2 rounded-full bg-white/6"
											aria-label="Scroll partners left"
										>
											<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
											</svg>
										</button>
										<button
											onClick={(e) => {
												e.stopPropagation();
												scrollPartners(1);
											}}
											className="p-2 rounded-full bg-white/6"
											aria-label="Scroll partners right"
										>
											<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</button>
									</div>
								</div>
							</section>
						)}

						{/* co-organizers */}
						{coOrganizers.length > 0 && (
							<section>
								<h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
									Co-organizers
								</h3>
								<div className="flex flex-wrap gap-2">{coOrganizers.map((c, i) => <CoOrganizerChip key={c._id || c.name || i} c={c} />)}</div>
							</section>
						)}

						{/* FAQs (collapsible style) */}
						{faqs.length > 0 && (
							<section>
								<h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
									FAQ
								</h3>
								<div className="space-y-2">
									{faqs.map((f, i) => (
										<details key={i} className="p-3 rounded-md" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
											<summary className="cursor-pointer font-medium text-[var(--text-primary)]">{f.question}</summary>
											<div className="mt-2 text-sm text-[var(--text-secondary)]">{f.answer}</div>
										</details>
									))}
								</div>
							</section>
						)}

						{/* resources */}
						{resources.length > 0 && (
							<section>
								<h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
									Resources
								</h3>
								<ul className="list-disc list-inside text-sm" style={{ color: 'var(--text-secondary)' }}>
									{resources.map((r, i) => (
										<li key={r.title || r.url || i}>
											<a href={r.url || '#'} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-1)' }}>
												{r.title || r.url}
											</a>
										</li>
									))}
								</ul>
							</section>
						)}
					</div>
				</Motion.div>

				{/* Speaker slide-over */}
				{activeSpeaker && <SpeakerDetailModal speaker={activeSpeaker} onClose={() => setActiveSpeaker(null)} />}
			</Motion.div>
		</AnimatePresence>,
		document.body
	);
};

export default EventDetailModal;

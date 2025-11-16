import { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useEvent } from '../../hooks/useEvents.js'; // keep existing hook

// Friendly date formatter
const safeFormatDate = (dateInput) => {
	if (!dateInput) return 'Date TBD';
	const date = new Date(dateInput);
	if (isNaN(date.getTime())) return 'Invalid Date';
	return new Intl.DateTimeFormat('en-US', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

const timeUntil = (date) => {
	if (!date) return null;
	const now = new Date();
	const diff = new Date(date) - now;
	if (isNaN(diff) || diff <= 0) return null;
	const minutes = Math.floor(diff / 60000);
	const days = Math.floor(minutes / 1440);
	const hours = Math.floor((minutes % 1440) / 60);
	const mins = minutes % 60;
	return { days, hours, mins, totalMinutes: minutes };
};

const generateICS = (ev = {}) => {
	const start = ev.eventDate || ev.date;
	if (!start) return null;
	const dtstart = new Date(start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
	const dtend = dtstart;
	const uid = `${ev._id || Math.random().toString(36).slice(2)}@syntaxclub`;
	const title = (ev.title || 'Event').replace(/\r?\n/g, ' ');
	const desc = (ev.description || '').replace(/\r\n/g, '\\n').replace(/\n/g, '\\n');
	const location = ev.venue || '';
	return [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Syntax Club//EN',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
		`DTSTART:${dtstart}`,
		`DTEND:${dtend}`,
		`SUMMARY:${title}`,
		`DESCRIPTION:${desc}`,
		`LOCATION:${location}`,
		'END:VEVENT',
		'END:VCALENDAR',
	].join('\r\n');
};

/**
 * EventDetailModal
 * - Uses existing useEvent hook (no changes to hooks or services)
 * - Modal is non-scrollable; layout adapts to viewport to show all details on one page.
 * - Fully responsive: two-column on md+, stacked but compact on small screens.
 */
const EventDetailModal = ({ event: initialEvent, isOpen, onClose }) => {
	const [imgIndex, setImgIndex] = useState(0);
	const closeRef = useRef(null);
	const id = initialEvent?._id ?? null;

	// call hook with id only when modal is open; hook still respects enabled: !!id
	// call unconditionally so hook order is stable
	const { data: fetched, isLoading, isError, refetch } = useEvent(isOpen ? id : null);

	// Prefer fetched, fallback to initial event to open fast
	const event = fetched || initialEvent;

	// Precompute countdown even if event is undefined (safe)
	const countdown = useMemo(() => timeUntil(event?.eventDate || event?.date), [event]);

	useEffect(() => {
		if (!isOpen) return;
		closeRef.current?.focus();
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	// If not open or no event data available, render nothing
	if (!isOpen || !event) return null;

	const registrationLink =
		event.registrationLink ||
		event.registrationUrl ||
		event.registration ||
		event.registerUrl ||
		null;

	const onRegister = (ev) => {
		ev.stopPropagation();
		if (registrationLink) window.open(registrationLink, '_blank');
	};

	const onRemind = (ev) => {
		ev.stopPropagation();
		// placeholder behavior — integrate real subscription if desired
		try {
			localStorage.setItem(`remind_${event._id}`, Date.now());
		} catch (e) {
			/* ignore storage errors */
		}
		alert('Reminder saved locally.');
	};

	const downloadICS = (ev) => {
		ev.stopPropagation();
		const ics = generateICS(event);
		if (!ics) {
			alert('Cannot generate calendar file — missing date.');
			return;
		}
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

	const nextImg = (e) => {
		e.stopPropagation();
		if (!event.posters?.length) return;
		setImgIndex((p) => (p + 1) % event.posters.length);
	};
	const prevImg = (e) => {
		e.stopPropagation();
		if (!event.posters?.length) return;
		setImgIndex((p) => (p - 1 + event.posters.length) % event.posters.length);
	};

	// Compact helpers to ensure layout fits screen
	const compactText = (text, max = 500) =>
		typeof text === 'string' && text.length > max ? text.slice(0, max).trim() + '…' : text || '';

	// Build lists (speakers, partners, resources) defensively
	const speakers = Array.isArray(event.speakers) ? event.speakers : event.speakers ? [event.speakers] : [];
	const partners = Array.isArray(event.partners) ? event.partners : event.partners ? [event.partners] : [];
	const resources = Array.isArray(event.resources) ? event.resources : event.resources ? [event.resources] : [];

	return (
		<AnimatePresence>
			<Motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
				onClick={onClose}
			>
				{/* Non-scrollable modal container, uses viewport-fitting layout */}
				<Motion.div
					initial={{ scale: 0.98, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.98, opacity: 0 }}
					className="bg-gradient-to-br from-gray-900/90 to-black/90 text-white rounded-2xl w-[92vw] max-w-[1100px] h-[88vh] overflow-hidden shadow-2xl grid grid-rows-1 md:grid-cols-2 md:grid-rows-1"
					onClick={(e) => e.stopPropagation()}
					role="dialog"
					aria-modal="true"
					aria-labelledby="event-modal-title"
				>
					{/* Left: image area (flexible) */}
					<div className="relative md:col-span-1 flex-shrink-0 flex items-center justify-center bg-black">
						{/* Constrain image so it doesn't force scrolling */}
						{event.posters?.length ? (
							<>
								<img
									src={event.posters[imgIndex]?.url}
									alt={event.posters[imgIndex]?.caption || event.title || 'poster'}
									className="w-full h-full object-cover"
									loading="lazy"
								/>
								{event.posters.length > 1 && (
									<>
										<button
											onClick={prevImg}
											aria-label="Previous image"
											className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full"
										>
											<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
											</svg>
										</button>
										<button
											onClick={nextImg}
											aria-label="Next image"
											className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 p-2 rounded-full"
										>
											<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</button>
									</>
								)}
								{/* image overlay summary */}
								<div className="absolute left-4 bottom-4 px-3 py-2 bg-black/50 rounded-md text-sm">
									{event.posters[imgIndex]?.caption ?? ''}
								</div>
							</>
						) : (
							<div className="flex items-center justify-center w-full h-full text-6xl opacity-20">🎭</div>
						)}
						{/* Close button over image for mobile */}
						<button
							ref={closeRef}
							onClick={onClose}
							aria-label="Close"
							className="absolute top-4 right-4 bg-red-600/90 text-white p-2 rounded-full"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Right: details area - designed to fit inside viewport (no scroll) */}
					<div className="p-5 md:p-6 flex flex-col justify-between md:col-span-1 bg-gradient-to-t from-black/60 to-transparent">
						{/* Top: title + meta */}
						<div className="space-y-3">
							<div className="flex items-start justify-between gap-3">
								<div className="flex-1 min-w-0">
									<h2 id="event-modal-title" className="text-lg md:text-2xl font-bold leading-tight truncate">
										{event.title}
									</h2>
									<p className="text-xs text-gray-400 mt-1">
										{event.organizer ? `${event.organizer}` : event.host || ''}
									</p>
								</div>

								{/* CTA column (compact) */}
								<div className="flex flex-col items-end gap-2">
									{registrationLink ? (
										<button
											onClick={onRegister}
											className="bg-emerald-500 text-white px-3 py-1 rounded text-sm"
										>
											Register
										</button>
									) : countdown ? (
										<div className="text-right">
											<div className="text-xs text-gray-300">Starts in</div>
											<div className="font-semibold">
												{countdown.days > 0
													? `${countdown.days}d ${countdown.hours}h`
													: countdown.hours > 0
													? `${countdown.hours}h ${countdown.mins}m`
													: `${countdown.mins}m`}
											</div>
											<button onClick={onRemind} className="mt-1 text-xs px-2 py-0.5 rounded bg-blue-600 text-white">
												Remind
											</button>
										</div>
									) : (
										<div className="text-xs text-gray-300">{event.status || 'TBD'}</div>
									)}
								</div>
							</div>

							{/* Meta chips */}
							<div className="flex flex-wrap gap-2 items-center">
								<span className="text-xs text-gray-300 flex items-center gap-1">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{safeFormatDate(event.eventDate)}
								</span>

								{event.venue && (
									<span className="text-xs text-gray-300 flex items-center gap-1">
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										</svg>
										{event.venue}
									</span>
								)}

								{Array.isArray(event.tags) &&
									event.tags.slice(0, 4).map((t) => (
										<span key={t} className="text-xs bg-white/5 px-2 py-0.5 rounded">
											{t}
										</span>
									))}
							</div>
						</div>

						{/* Middle: compact description and details (must fit) */}
						<div className="mt-3 flex-1 min-h-0">
							{/* We keep text compact to avoid modal overflow */}
							<p className="text-sm text-gray-300 leading-snug" style={{ fontSize: '0.95rem', lineHeight: 1.2 }}>
								{compactText(event.description, 1400)}
							</p>

							{/* Speakers / Partners / Resources in small tiles */}
							<div className="mt-3 grid grid-cols-2 gap-2 text-xs">
								{speakers.length > 0 && (
									<div className="p-2 bg-white/3 rounded">
										<div className="font-semibold text-xs">Speakers</div>
										<div className="mt-1">
											{speakers.slice(0, 4).map((sp, idx) => (
												<div key={`${sp.name || idx}`} className="truncate">
													{sp.name || sp.title || sp}
												</div>
											))}
										</div>
									</div>
								)}

								{partners.length > 0 && (
									<div className="p-2 bg-white/3 rounded">
										<div className="font-semibold text-xs">Partners</div>
										<div className="mt-1">
											{partners.slice(0, 4).map((p, i) => (
												<div key={p.name || i} className="truncate">
													{p.name || p}
												</div>
											))}
										</div>
									</div>
								)}

								{resources.length > 0 && (
									<div className="p-2 bg-white/3 rounded col-span-2">
										<div className="font-semibold text-xs">Resources</div>
										<div className="mt-1 grid gap-1 text-xxs">
											{resources.slice(0, 6).map((r, i) => (
												<a
													key={r.title || r.url || i}
													href={r.url || '#'}
													onClick={(e) => e.stopPropagation()}
													target="_blank"
													rel="noreferrer"
													className="text-sm text-blue-300 inline-block truncate"
												>
													{r.title || r.url}
												</a>
											))}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Bottom: actions and small meta bar (always visible) */}
						<div className="mt-4 flex items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<button
									onClick={downloadICS}
									className="text-sm px-3 py-1 rounded bg-transparent border border-white/10"
								>
									Add to calendar
								</button>

								{!registrationLink && (
									<button onClick={onRemind} className="text-sm px-3 py-1 rounded bg-blue-600 text-white">
										Notify me
									</button>
								)}
							</div>

							<div className="text-right text-xs text-gray-400">
								<div>ID: <span className="text-gray-300">{event._id?.slice?.(0, 8) ?? '-'}</span></div>
								<div className="mt-1">Created: <span className="text-gray-300">{event.createdAt ? new Date(event.createdAt).toLocaleDateString() : '-'}</span></div>
							</div>
						</div>
					</div>
				</Motion.div>
			</Motion.div>
		</AnimatePresence>
	);
};

export default EventDetailModal;

import { useState, useEffect, useRef, useMemo } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useEvent } from '../../hooks/useEvents.js'; // keep existing hook

// Friendly date/time formatter
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
	const dtend = ev.endDate
		? new Date(ev.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
		: dtstart;
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
 * Full-screen Event detail modal rendered into body via portal.
 * - Uses existing useEvent hook (no changes).
 * - Modal overlay uses very high zIndex to ensure it is above navbar and other components.
 * - When open, document.body scroll is disabled to keep focus on modal.
 * - Content area can scroll internally so all details can be displayed.
 */
const EventDetailModal = ({ event: initialEvent, isOpen, onClose }) => {
	const [imgIndex, setImgIndex] = useState(0);
	const closeRef = useRef(null);
	const id = initialEvent?._id ?? null;

	// call hook if open (useEvent is unchanged)
	const { data: fetched, isLoading, isError, refetch } = useEvent(isOpen ? id : null);

	// prefer fetched details when available
	const event = fetched || initialEvent;

	// compute countdown even if event undefined
	const countdown = useMemo(() => timeUntil(event?.eventDate || event?.date), [event]);

	// Disable body scroll while modal open and restore on close/unmount
	useEffect(() => {
		if (!isOpen) return;
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prevOverflow || '';
		};
	}, [isOpen]);

	// focus close button and listen Escape
	useEffect(() => {
		if (!isOpen) return;
		closeRef.current?.focus();
		const onKey = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	// defensive lists
	const speakers = Array.isArray(event?.speakers) ? event.speakers : event?.speakers ? [event.speakers] : [];
	const partners = Array.isArray(event?.partners) ? event.partners : event?.partners ? [event.partners] : [];
	const resources = Array.isArray(event?.resources) ? event.resources : event?.resources ? [event.resources] : [];
	const coOrganizers = Array.isArray(event?.coOrganizers) ? event.coOrganizers : event?.coOrganizers ? [event.coOrganizers] : [];
	const registrations = Array.isArray(event?.registrations) ? event.registrations : [];

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
		try {
			localStorage.setItem(`remind_${event._id}`, Date.now());
		} catch (e) {
			/* ignore */
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

	// render the modal into document.body so it floats above the whole app
	return createPortal(
		<AnimatePresence>
			<Motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				// very high zIndex to out-prioritize navbar and dropdowns
				style={{ zIndex: 99999 }}
				className="fixed inset-0 flex items-center justify-center"
				aria-modal="true"
				role="dialog"
				onClick={onClose}
			>
				{/* dim backdrop */}
				<Motion.div
					className="absolute inset-0 bg-black/75"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				/>

				{/* Modal box: full-screen feel, but constrained max-size and internal scroll for details */}
				<Motion.div
					initial={{ scale: 0.98, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.98, opacity: 0 }}
					onClick={(e) => e.stopPropagation()}
					className="relative w-[96vw] max-w-[1200px] h-[92vh] bg-gradient-to-br from-gray-900/95 to-black rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row"
					aria-labelledby="event-modal-title"
				>
					{/* left column: visual / meta strip */}
					<div className="w-full md:w-1/3 bg-black flex-shrink-0 relative flex items-center justify-center">
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
							</>
						) : (
							<div className="text-7xl opacity-10">🎭</div>
						)}

						{/* left meta overlay */}
						<div className="absolute left-3 bottom-3 text-xs text-gray-300 bg-black/50 px-3 py-1 rounded">
							{event.posters?.[imgIndex]?.caption ?? ''}
						</div>

						{/* close button top-right of the modal (on visual side) */}
						<button
							ref={closeRef}
							onClick={onClose}
							aria-label="Close"
							className="absolute top-3 right-3 bg-red-600/90 text-white p-2 rounded-full"
						>
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* right column: full details in an internal scroll area */}
					<div className="w-full md:w-2/3 p-5 md:p-6 overflow-auto">
						<header className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
							<div className="min-w-0">
								<h2 id="event-modal-title" className="text-xl md:text-2xl font-bold leading-tight">
									{event.title}
								</h2>
								<p className="text-sm text-gray-400 mt-1">{event.organizer || event.host || ''}</p>
							</div>

							{/* right actions */}
							<div className="flex items-center gap-2 md:flex-col md:items-end">
								{registrationLink ? (
									<button onClick={onRegister} className="px-3 py-1 bg-emerald-500 text-white rounded">
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
									<div className="text-xs text-gray-400">{event.status || 'TBD'}</div>
								)}

								{/* Add to calendar / misc */}
								<div className="flex gap-2">
									<button onClick={downloadICS} className="px-2 py-1 border rounded text-sm">
										Add to calendar
									</button>
								</div>
							</div>
						</header>

						{/* primary meta row */}
						<div className="mt-4 flex flex-wrap gap-3 items-center text-sm text-gray-300">
							<span className="flex items-center gap-2">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								{safeFormatDate(event.eventDate)}
							</span>

							{event.venue && (
								<span className="flex items-center gap-2">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
									</svg>
									{event.venue}
								</span>
							)}

							{Array.isArray(event.tags) &&
								event.tags.map((t) => (
									<span key={t} className="text-xs bg-white/5 px-2 py-0.5 rounded">
										{t}
									</span>
								))}
						</div>

						{/* full description */}
						<section className="mt-4 text-sm text-gray-300 leading-relaxed">
							<h3 className="text-sm font-semibold text-gray-200 mb-2">Description</h3>
							<div className="whitespace-pre-wrap">{event.description || 'No description provided.'}</div>
						</section>

						{/* Speakers / Partners / Resources */}
						<section className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
							{speakers.length > 0 && (
								<div className="p-3 bg-white/3 rounded">
									<div className="font-semibold mb-2">Speakers</div>
									<div className="space-y-2">
										{speakers.map((sp, i) => (
											<div key={sp._id || sp.name || i} className="flex items-center gap-3">
												{sp.photo ? (
													<img src={sp.photo} alt={sp.name || 'speaker'} className="w-9 h-9 rounded-full object-cover" />
												) : (
													<div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs">{(sp.name || '').slice(0,1)}</div>
												)}
												<div className="min-w-0">
													<div className="font-medium truncate">{sp.name || sp.title || 'Speaker'}</div>
													<div className="text-xs text-gray-400 truncate">{sp.title || sp.role || ''}</div>
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{partners.length > 0 && (
								<div className="p-3 bg-white/3 rounded">
									<div className="font-semibold mb-2">Partners</div>
									<div className="flex flex-wrap gap-2 items-center">
										{partners.map((p, i) => (
											<div key={p._id || p.name || i} className="flex items-center gap-2">
												{p.logo ? <img src={p.logo} alt={p.name || 'partner'} className="w-8 h-8 object-contain" /> : null}
												<span className="text-xs text-gray-200">{p.name || p}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{resources.length > 0 && (
								<div className="p-3 bg-white/3 rounded md:col-span-2">
									<div className="font-semibold mb-2">Resources</div>
									<ul className="space-y-1">
										{resources.map((r, i) => (
											<li key={r.title || r.url || i}>
												<a href={r.url || '#'} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-blue-300">
													{r.title || r.url}
												</a>
											</li>
										))}
									</ul>
								</div>
							)}
						</section>

						{/* co-organizers / registrations / misc */}
						<section className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
							{coOrganizers.length > 0 && (
								<div className="p-3 bg-white/3 rounded">
									<div className="font-semibold mb-2">Co-organizers</div>
									<div className="text-xs space-y-1">
										{coOrganizers.map((c, i) => (
											<div key={c.name || i}>{c.name || c}</div>
										))}
									</div>
								</div>
							)}

							<div className="p-3 bg-white/3 rounded">
								<div className="font-semibold mb-2">Registrations</div>
								<div className="text-xs text-gray-300">
									{registrations.length > 0 ? `${registrations.length} registered` : 'No registrations yet'}
								</div>
								{event.capacity ? <div className="text-xs text-gray-400 mt-1">Capacity: {event.capacity}</div> : null}
							</div>

							<div className="p-3 bg-white/3 rounded">
								<div className="font-semibold mb-2">Meta</div>
								<div className="text-xs text-gray-300">ID: {event._id}</div>
								<div className="text-xs text-gray-300">Created: {event.createdAt ? new Date(event.createdAt).toLocaleString() : '-'}</div>
								<div className="text-xs text-gray-300">Last updated: {event.updatedAt ? new Date(event.updatedAt).toLocaleString() : '-'}</div>
							</div>
						</section>

						{/* contact / location actions */}
						<section className="mt-4 flex flex-wrap items-center justify-between gap-3">
							<div className="flex gap-2 items-center">
								{event.contactEmail && (
									<a href={`mailto:${event.contactEmail}`} onClick={(e) => e.stopPropagation()} className="text-sm px-3 py-1 border rounded">
										Contact
									</a>
								)}
								{event.venue && event.mapLink && (
									<a href={event.mapLink} onClick={(e) => e.stopPropagation()} target="_blank" rel="noreferrer" className="text-sm px-3 py-1 border rounded">
										View on map
									</a>
								)}
							</div>

							<div className="flex gap-2">
								{registrationLink && <button onClick={onRegister} className="px-3 py-1 bg-emerald-500 text-white rounded">Register</button>}
								<button onClick={downloadICS} className="px-3 py-1 border rounded">Add to calendar</button>
							</div>
						</section>
					</div>
				</Motion.div>
			</Motion.div>
		</AnimatePresence>,
		document.body
	);
};

export default EventDetailModal;

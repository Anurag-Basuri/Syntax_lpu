import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, Calendar, MapPin, Tag, Users, Globe, Copy, CreditCard } from 'lucide-react';
import { getEventById } from '../../services/eventServices.js';
import { useTheme } from '../../hooks/useTheme.js';

/*
  EventDetailModal — premium UI
  - Poster on top, content below (single vertical scroll)
  - Focus trap & restore previous focus
  - Strong backdrop blur above navbar
  - Smooth native scrolling + styled scrollbar
  - No ticket/spot counts displayed (per request)
*/

const fetchEvent = async (id, signal) => {
	if (!id) return null;
	return getEventById(id, { signal });
};

const DetailRow = ({ icon: Icon, label, children }) => (
	<div className="flex items-start gap-3">
		<div className="p-2 rounded-md bg-slate-100/60 dark:bg-slate-800/40">
			<Icon className="text-indigo-500" />
		</div>
		<div className="min-w-0">
			<div className="text-xs text-slate-500 dark:text-slate-300">{label}</div>
			<div className="font-medium text-slate-900 dark:text-white mt-0.5 truncate">
				{children}
			</div>
		</div>
	</div>
);

const prettyDate = (d) => {
	if (!d) return 'TBD';
	const dt = new Date(d);
	if (isNaN(dt.getTime())) return String(d);
	return dt.toLocaleString();
};

const PricePill = ({ price }) => {
	const isFree = typeof price === 'number' ? price === 0 : !price;
	const formatted =
		typeof price === 'number'
			? new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(price)
			: null;
	return (
		<div
			className={`inline-flex items-baseline gap-2 px-4 py-2 rounded-full font-semibold shadow-sm ring-1 ring-black/5
        ${
			isFree
				? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
				: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
		}`}
			aria-hidden
		>
			{isFree ? (
				<span className="text-sm">Free</span>
			) : (
				<>
					<CreditCard size={16} />
					<span className="text-sm opacity-80">₹</span>
					<span className="text-lg tracking-wider">{formatted}</span>
				</>
			)}
		</div>
	);
};

const EventDetailModal = ({ event: initialEvent, isOpen, onClose }) => {
	const id = initialEvent?._id || initialEvent?.id;
	const [showRaw, setShowRaw] = useState(false);
	const rightPaneRef = useRef(null);
	const modalRootRef = useRef(null);
	const previouslyFocusedRef = useRef(null);

	// follow application theme (modal uses global theme; no toggle here)
	const themeCtx = useTheme(); // returns { mode, theme, setMode, toggleMode } per app
	const theme = themeCtx?.theme ?? (Array.isArray(themeCtx) ? themeCtx[0] : 'light');

	const { data: event } = useQuery({
		queryKey: ['event-full', id],
		queryFn: ({ signal }) => fetchEvent(id, signal),
		enabled: !!isOpen && !!id,
		staleTime: 60_000,
		refetchOnWindowFocus: false,
	});

	const payload = event || initialEvent || {};
	const rawJson = useMemo(() => {
		try {
			return JSON.stringify(payload, null, 2);
		} catch {
			return String(payload);
		}
	}, [payload]);

	// lock background scroll while modal open
	useEffect(() => {
		if (!isOpen) return;
		const prev = {
			overflow: document.body.style.overflow,
			paddingRight: document.body.style.paddingRight,
		};
		const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = 'hidden';
		if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
		return () => {
			document.body.style.overflow = prev.overflow || '';
			document.body.style.paddingRight = prev.paddingRight || '';
		};
	}, [isOpen]);

	// Escape closes modal & focus management
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e) => {
			if (e.key === 'Escape') onClose?.();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	// Reset raw view when closing
	useEffect(() => {
		if (!isOpen) setShowRaw(false);
	}, [isOpen]);

	// Focus trap and restore
	useEffect(() => {
		if (!isOpen) return;

		previouslyFocusedRef.current = document.activeElement;
		const root = modalRootRef.current;
		const focusable = () =>
			root.querySelectorAll(
				'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
			);

		// focus first focusable element or the root
		const first = focusable()[0];
		(first || root)?.focus?.();

		const handleTab = (e) => {
			if (e.key !== 'Tab') return;
			const nodes = Array.from(focusable());
			if (!nodes.length) {
				e.preventDefault();
				return;
			}
			const firstNode = nodes[0];
			const lastNode = nodes[nodes.length - 1];
			if (e.shiftKey && document.activeElement === firstNode) {
				e.preventDefault();
				lastNode.focus();
			} else if (!e.shiftKey && document.activeElement === lastNode) {
				e.preventDefault();
				firstNode.focus();
			}
		};

		window.addEventListener('keydown', handleTab);
		return () => {
			window.removeEventListener('keydown', handleTab);
			// restore focus
			try {
				previouslyFocusedRef.current?.focus?.();
			} catch {
				/* ignore */
			}
		};
	}, [isOpen]);

	// Robust wheel & touch handling (capture phase to beat global scrollers)
	useEffect(() => {
		if (!isOpen) return;
		const root = modalRootRef.current;
		const right = rightPaneRef.current;
		if (!root || !right) return;

		const forwardWheel = (e) => {
			if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
			if (!root.contains(e.target)) return;
			const before = right.scrollTop;
			right.scrollBy({ top: e.deltaY, behavior: 'auto' });
			if (right.scrollTop !== before) {
				e.stopImmediatePropagation();
				e.preventDefault();
			}
		};

		const forwardTouch = (e) => {
			if (!root.contains(e.target)) return;
			const canScroll =
				right.scrollHeight > right.clientHeight &&
				(right.scrollTop > 0 || right.scrollTop + right.clientHeight < right.scrollHeight);
			if (canScroll) {
				e.stopImmediatePropagation();
				// allow native touch scrolling
			}
		};

		window.addEventListener('wheel', forwardWheel, { passive: false, capture: true });
		window.addEventListener('touchmove', forwardTouch, { passive: false, capture: true });

		return () => {
			window.removeEventListener('wheel', forwardWheel, { capture: true });
			window.removeEventListener('touchmove', forwardTouch, { capture: true });
		};
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
	const price =
		typeof payload.ticketPrice === 'number' ? payload.ticketPrice : payload.ticketPrice ?? null;

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

	const modalMaxHeight = '90vh';

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				// sit above everything (including navbar) and align near top so poster is visible immediately
				className="fixed inset-0 z-[99999] flex items-start justify-center"
				style={{
					// small top padding so modal isn't flush with the OS/browser UI
					paddingTop: '1.25rem',
					paddingBottom: '1.25rem',
				}}
			>
				{/* blurred backdrop above everything */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					// stronger blur + slightly darker overlay for premium feel
					className="absolute inset-0 bg-black/50 backdrop-blur-3xl"
					onClick={onClose}
				/>

				{/* modal */}
				<motion.div
					ref={modalRootRef}
					initial={{ y: 8, scale: 0.995, opacity: 0 }}
					animate={{ y: 0, scale: 1, opacity: 1 }}
					exit={{ y: 8, scale: 0.995, opacity: 0 }}
					transition={{ duration: 0.18 }}
					role="dialog"
					aria-modal="true"
					aria-label={`Event details: ${title}`}
					className="relative z-10 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col bg-white dark:bg-slate-900 ring-1 ring-black/5"
					style={{ maxHeight: modalMaxHeight }}
					tabIndex={-1}
				>
					{/* Poster (visual only) — rounded top and overflow-hidden for a polished header */}
					<div className="relative w-full h-64 md:h-80 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-t-2xl overflow-hidden">
						{poster ? (
							<img
								src={poster}
								alt={`${title} poster`}
								className="w-full h-full object-cover"
								loading="lazy"
								decoding="async"
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
								<div className="text-6xl text-white/90">🎭</div>
							</div>
						)}
						{/* top-right close (minimal) */}
						<div className="absolute top-3 right-3">
							<button
								onClick={onClose}
								className="p-2 rounded-full bg-white/90 dark:bg-slate-900/70 hover:scale-105 transition-transform shadow ring-1 ring-black/10"
								aria-label="Close"
							>
								<X
									size={18}
									className={theme === 'dark' ? 'text-white' : 'text-slate-900'}
								/>
							</button>
						</div>
					</div>

					{/* scrollable content */}
					<div
						ref={rightPaneRef}
						tabIndex={0}
						className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
						style={{
							WebkitOverflowScrolling: 'touch',
							touchAction: 'pan-y',
							overscrollBehavior: 'contain',
						}}
					>
						{/* Header (title moved here for clean typographic treatment) */}
						<header className="space-y-3">
							<h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-slate-900 dark:text-white">
								{title}
							</h2>
							<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
								<div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
									<Calendar className="w-4 h-4 text-indigo-500" />
									<span>{dateLabel}</span>
									<span className="mx-1">·</span>
									<MapPin className="w-4 h-4 text-indigo-500" />
									<span>{venue}</span>
								</div>
								<div className="ml-auto flex items-center gap-3">
									<PricePill price={price} />
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								{tags.slice(0, 8).map((t) => (
									<span
										key={t}
										className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
									>
										{t}
									</span>
								))}
							</div>
						</header>

						{/* Partners — prominent showcase */}
						{partners.length > 0 && (
							<section className="rounded-xl p-5 bg-gradient-to-r from-indigo-50 to-white dark:from-slate-900 dark:to-slate-800 ring-1 ring-black/5">
								<div className="flex items-center justify-between mb-4">
									<div>
										<div className="text-sm text-indigo-600 font-semibold">
											Partners
										</div>
										<h3 className="text-xl font-bold text-slate-900 dark:text-white">
											Supported by
										</h3>
										<div className="text-sm text-slate-500 dark:text-slate-300 mt-1">
											We thank our partners for their support.
										</div>
									</div>
									<div className="text-xs text-slate-400">
										Trusted collaborators
									</div>
								</div>

								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 items-center">
									{partners.map((p, i) => (
										<a
											key={i}
											href={p.website || '#'}
											target="_blank"
											rel="noreferrer"
											onClick={(e) => e.stopPropagation()}
											className={`flex items-center justify-center gap-3 p-3 rounded-lg transition-shadow transform hover:scale-102 ${
												theme === 'dark'
													? 'bg-slate-800/60 border border-slate-700'
													: 'bg-white border border-slate-100'
											}`}
										>
											{p.logo?.url ? (
												<img
													src={p.logo.url}
													alt={p.name}
													className="max-h-14 object-contain"
												/>
											) : (
												<div className="h-12 w-full rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-700 dark:text-slate-200 font-medium">
													{(p.name || '—').slice(0, 18)}
												</div>
											)}
										</a>
									))}
								</div>
							</section>
						)}

						{/* remaining content: registration, about, speakers, resources, raw JSON (unchanged) */}
						{/* registration card */}
						<div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
							<div className="flex items-center justify-between gap-4">
								<div>
									<div className="text-xs text-slate-500 dark:text-slate-300">
										Registration
									</div>
									<div className="font-medium text-slate-900 dark:text-white mt-1">
										{registrationInfo?.actionLabel ||
											registrationInfo?.actionUrl ||
											'No registration'}
									</div>
									{registrationInfo?.message && (
										<div className="text-xs text-slate-500 dark:text-slate-300 mt-1">
											{registrationInfo.message}
										</div>
									)}
								</div>

								{registrationInfo?.isOpen && registrationInfo?.actionUrl && (
									<a
										href={registrationInfo.actionUrl}
										target="_blank"
										rel="noreferrer"
										onClick={(e) => e.stopPropagation()}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm shadow-sm"
									>
										{registrationInfo.actionLabel || 'Register'}{' '}
										<Globe size={14} />
									</a>
								)}
							</div>
						</div>

						{/* about */}
						<section>
							<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
								About
							</h4>
							<p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
								{desc}
							</p>
						</section>

						{/* speakers */}
						{speakers.length > 0 && (
							<section>
								<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
									Speakers
								</h4>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{speakers.map((s, i) => (
										<div
											key={i}
											className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
										>
											{s.photo?.url ? (
												<img
													src={s.photo.url}
													alt={s.name}
													className="w-12 h-12 rounded-md object-cover"
												/>
											) : (
												<div className="w-12 h-12 rounded-md bg-indigo-600 text-white flex items-center justify-center font-medium">
													{(s.name || 'S').slice(0, 2).toUpperCase()}
												</div>
											)}
											<div>
												<div className="font-medium text-slate-900 dark:text-white">
													{s.name}
												</div>
												<div className="text-xs text-slate-500 dark:text-slate-300">
													{s.title}
												</div>
												{s.bio && (
													<div className="text-xs mt-1 text-slate-600 dark:text-slate-300">
														{s.bio}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</section>
						)}

						{/* partners */}
						{partners.length > 0 && (
							<section>
								<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
									Partners
								</h4>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{partners.map((p, i) => (
										<a
											key={i}
											href={p.website || '#'}
											target="_blank"
											rel="noreferrer"
											onClick={(e) => e.stopPropagation()}
											className="flex flex-col items-center gap-2 p-3 rounded-lg bg-white/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow"
										>
											{p.logo?.url ? (
												<img
													src={p.logo.url}
													alt={p.name}
													className="w-full h-12 object-contain max-w-[140px]"
												/>
											) : (
												<div className="w-full h-12 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-700 dark:text-slate-200 font-medium">
													{(p.name || '—').slice(0, 12)}
												</div>
											)}
											<div className="text-sm text-slate-700 dark:text-slate-200 text-center">
												{p.name}
											</div>
										</a>
									))}
								</div>
							</section>
						)}

						{/* co-organizers & resources */}
						{(coOrganizers.length > 0 || resources.length > 0) && (
							<section className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{coOrganizers.length > 0 && (
									<div className="rounded-md p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
										<div className="text-xs text-slate-500 dark:text-slate-300">
											Co-organizers
										</div>
										<ul className="mt-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-200">
											{coOrganizers.map((c, i) => (
												<li key={i}>{c}</li>
											))}
										</ul>
									</div>
								)}

								{resources.length > 0 && (
									<div className="rounded-md p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
										<div className="text-xs text-slate-500 dark:text-slate-300">
											Resources
										</div>
										<ul className="mt-2 space-y-2 text-sm">
											{resources.map((r, i) => (
												<li key={i}>
													<a
														href={r.url}
														target="_blank"
														rel="noreferrer"
														onClick={(e) => e.stopPropagation()}
														className="text-indigo-600 dark:text-indigo-400 underline"
													>
														{r.title || r.url}
													</a>
												</li>
											))}
										</ul>
									</div>
								)}
							</section>
						)}

						{/* raw JSON */}
						{showRaw && (
							<section>
								<h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
									Raw event JSON
								</h4>
								<pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-xs overflow-auto max-h-60 text-slate-800 dark:text-slate-200">
									{rawJson}
								</pre>
							</section>
						)}

						{/* actions footer */}
						<div className="flex items-center gap-2 justify-end">
							<button
								onClick={copyRaw}
								className="px-3 py-1 rounded-md border bg-transparent text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
							>
								Copy JSON
							</button>

							<button
								onClick={() => setShowRaw((s) => !s)}
								className="px-3 py-1 rounded-md border bg-transparent text-sm"
							>
								{showRaw ? 'Hide raw' : 'Show raw'}
							</button>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default React.memo(EventDetailModal);

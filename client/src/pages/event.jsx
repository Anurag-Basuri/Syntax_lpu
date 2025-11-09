import { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents.js';
import EventCard from '../components/event/EventCard.jsx';
import EventFilter from '../components/event/EventFilter.jsx';
import LoadingSpinner from '../components/event/LoadingSpinner.jsx';
import { AnimatePresence, motion } from 'framer-motion';

// Floating background with light/dark support
const EventFloatingBackground = () => (
	<div className="absolute inset-0 overflow-hidden pointer-events-none">
		<motion.div
			animate={{ x: [0, 30, 0], y: [0, -20, 0], rotate: [0, 180, 360] }}
			transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
			className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl"
		/>
		<motion.div
			animate={{ x: [0, -25, 0], y: [0, 15, 0], scale: [1, 1.2, 1] }}
			transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
			className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-pink-500/10 rounded-full blur-2xl"
		/>
		<motion.div
			animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.1, 1] }}
			transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
			className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-tr from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl"
		/>
	</div>
);

const pickDate = (e) => new Date(e?.eventDate || e?.date);

// Hero with light/dark background
const EventHero = ({ events, loading }) => {
	const now = new Date();
	const upcomingCount = events?.filter((e) => pickDate(e) > now).length || 0;
	const ongoingCount = events?.filter((e) => e.status === 'ongoing').length || 0;
	const pastCount =
		events?.filter((e) => pickDate(e) < now && e.status !== 'ongoing').length || 0;

	return (
		<div className="relative bg-gradient-to-b from-gray-50 to-white dark:from-[#0a0e17] dark:to-[#1a1f3a] text-gray-900 dark:text-white py-12 sm:py-16 lg:py-20 overflow-hidden">
			<EventFloatingBackground />
			<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

			<div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className="text-center mb-8 sm:mb-12"
				>
					<p className="text-base sm:text-lg lg:text-xl text-blue-700/80 dark:text-blue-200 max-w-3xl mx-auto leading-relaxed px-4">
						Discover, join, and explore our vibrant community events
					</p>
				</motion.div>

				{/* Enhanced Stats */}
				{!loading && events && events.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1, duration: 0.6 }}
						className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-2xl mx-auto"
					>
						<div className="glass-card-success p-4 sm:p-6 rounded-xl text-center border border-emerald-400/20">
							<div className="text-2xl sm:text-3xl font-bold text-emerald-500 dark:text-emerald-300">
								{upcomingCount}
							</div>
							<div className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-200">
								Upcoming
							</div>
						</div>
						<div className="glass-card-error p-4 sm:p-6 rounded-xl text-center border border-red-400/20">
							<div className="text-2xl sm:text-3xl font-bold text-red-500 dark:text-red-300">
								{ongoingCount}
							</div>
							<div className="text-xs sm:text-sm text-red-700 dark:text-red-200">
								Live Now
							</div>
						</div>
						<div className="glass-card p-4 sm:p-6 rounded-xl text-center border border-purple-400/20">
							<div className="text-2xl sm:text-3xl font-bold text-purple-500 dark:text-purple-300">
								{pastCount}
							</div>
							<div className="text-xs sm:text-sm text-purple-700 dark:text-purple-200">
								Past Events
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
};

const getCategorizedEvents = (events) => {
	const now = new Date();
	const categorized = { ongoing: [], upcoming: [], past: [] };

	events.forEach((event) => {
		if (event.status === 'cancelled') return;
		const eventDate = pickDate(event);
		if (event.status === 'ongoing' || eventDate.toDateString() === now.toDateString()) {
			categorized.ongoing.push(event);
		} else if (eventDate > now) {
			categorized.upcoming.push(event);
		} else {
			categorized.past.push(event);
		}
	});
	return categorized;
};

const EventCategorySection = ({ categoryKey, events, emptyMessage }) => {
	const meta = {
		ongoing: {
			title: 'Live Events',
			emoji: '🔴',
			countBadgeClass:
				'glass-card px-3 sm:px-4 py-2 rounded-full text-sm font-bold shrink-0 border border-red-400/20',
			desc: 'Happening right now',
		},
		upcoming: {
			title: 'Upcoming Events',
			emoji: '🚀',
			countBadgeClass:
				'glass-card px-3 sm:px-4 py-2 rounded-full text-sm font-bold shrink-0 border border-blue-400/20',
			desc: 'Coming soon',
		},
		past: {
			title: 'Past Events',
			emoji: '🏆',
			countBadgeClass:
				'glass-card px-3 sm:px-4 py-2 rounded-full text-sm font-bold shrink-0 border border-purple-400/20',
			desc: 'Event archive',
		},
	}[categoryKey];

	return (
		<section className="mb-16 sm:mb-20 lg:mb-24">
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				whileInView={{ opacity: 1, x: 0 }}
				viewport={{ once: true }}
				transition={{ duration: 0.4 }}
				className="mb-8 sm:mb-12 lg:mb-16"
			>
				<div className="flex items-center gap-3 sm:gap-4 lg:gap-6 mb-3">
					<span className="text-2xl sm:text-3xl lg:text-4xl">{meta.emoji}</span>
					<h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
						{meta.title}
					</h2>
					<div className="flex-1 h-px bg-gradient-to-r from-gray-300/50 via-transparent to-transparent dark:from-white/30 ml-4" />
					<span className={meta.countBadgeClass}>{events.length}</span>
				</div>
				<p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base ml-8 sm:ml-12 lg:ml-16">
					{meta.desc}
				</p>
			</motion.div>

			{events.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="glass-card p-10 sm:p-14 rounded-3xl text-center border border-gray-200/20 dark:border-white/10"
				>
					<div className="text-6xl sm:text-7xl mb-4 opacity-60">{meta.emoji}</div>
					<p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300">
						{emptyMessage}
					</p>
				</motion.div>
			) : (
				<motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
					<AnimatePresence mode="popLayout">
						{events.map((event, index) => (
							<motion.div
								key={event._id}
								layout
								initial={{ opacity: 0, scale: 0.98, y: 10 }}
								whileInView={{ opacity: 1, scale: 1, y: 0 }}
								exit={{ opacity: 0, scale: 0.98, y: -10 }}
								viewport={{ once: true, margin: '-50px' }}
								transition={{ duration: 0.35, delay: index * 0.05 }}
							>
								<EventCard event={event} />
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			)}
		</section>
	);
};

const EventPage = () => {
	// Fetch events via react-query (auto fetch, handles caching)
	const { data, isLoading, isError, error, refetch } = useEvents();
	const events = useMemo(() => data?.docs || [], [data]);

	const [activeCategory, setActiveCategory] = useState('all');
	const [searchTerm, setSearchTerm] = useState('');

	const categorizedEvents = useMemo(() => getCategorizedEvents(events), [events]);

	const filteredCategories = useMemo(() => {
		const filterEvents = (eventList) => {
			if (!searchTerm) return eventList;
			return eventList.filter((event) => {
				const date = pickDate(event);
				const hay = [
					event.title,
					event.description,
					event.venue,
					...(event.tags || []),
					date.toLocaleDateString(),
				]
					.filter(Boolean)
					.join(' ')
					.toLowerCase();
				return hay.includes(searchTerm.toLowerCase());
			});
		};
		if (activeCategory === 'all') {
			return {
				ongoing: filterEvents(categorizedEvents.ongoing),
				upcoming: filterEvents(categorizedEvents.upcoming),
				past: filterEvents(categorizedEvents.past),
			};
		}
		return { [activeCategory]: filterEvents(categorizedEvents[activeCategory] || []) };
	}, [categorizedEvents, activeCategory, searchTerm]);

	const isEmpty =
		Object.values(filteredCategories).reduce((acc, arr) => acc + arr.length, 0) === 0;

	if (isError) {
		return (
			<div className="min-h-screen flex items-center justify-center p-4">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="glass-card-error p-8 text-center max-w-lg w-full rounded-3xl border border-red-400/20"
				>
					<div className="text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-red-200 mb-3">Unable to Load Events</h2>
					<p className="text-sm text-red-100 mb-6">
						{error?.message || 'Something went wrong.'}
					</p>
					<motion.button
						whileHover={{ scale: 1.03, y: -1 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => refetch()}
						className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium"
					>
						Try Again
					</motion.button>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen text-gray-900 dark:text-white bg-white dark:bg-[#0b0f19]">
			<div className="relative z-10">
				<EventHero events={events} loading={isLoading} />

				<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3 }}
						className="sticky top-4 sm:top-6 z-30 mb-10"
					>
						<div className="glass-card p-4 sm:p-6 rounded-2xl border border-gray-200/40 dark:border-white/10">
							<div className="flex flex-col gap-4">
								<div className="relative group">
									<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
										<svg
											className="w-5 h-5 text-gray-500 dark:text-blue-300"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</div>
									<input
										type="text"
										placeholder="Search events by title, description, venue, or tags..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-12 pr-12 py-3 w-full bg-white/70 dark:bg-white/5 border border-gray-300 dark:border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm placeholder-gray-400 dark:text-white"
									/>
									{searchTerm && (
										<button
											onClick={() => setSearchTerm('')}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white w-6 h-6 flex items-center justify-center rounded-full"
										>
											✕
										</button>
									)}
								</div>
								<EventFilter
									activeFilter={activeCategory}
									setActiveFilter={setActiveCategory}
								/>
							</div>
						</div>
					</motion.div>

					{isLoading ? (
						<div className="flex justify-center py-16">
							<LoadingSpinner />
						</div>
					) : isEmpty ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							className="glass-card p-12 rounded-3xl text-center max-w-3xl mx-auto border border-gray-200/40 dark:border-white/10"
						>
							<div className="text-7xl mb-6">🔍</div>
							<h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
								{searchTerm ? 'No results found' : 'No events found'}
							</h2>
							<p className="text-gray-600 dark:text-blue-200 mb-8">
								{searchTerm
									? 'Try adjusting your search terms or browse all events'
									: 'New events are being planned. Check back soon!'}
							</p>
							{searchTerm && (
								<button
									onClick={() => {
										setSearchTerm('');
										setActiveCategory('all');
									}}
									className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-medium"
								>
									Show All Events
								</button>
							)}
						</motion.div>
					) : (
						<div>
							{Object.entries(filteredCategories).map(
								([category, eventsArr]) =>
									eventsArr.length > 0 && (
										<EventCategorySection
											key={category}
											categoryKey={category}
											events={eventsArr}
											emptyMessage={`No ${
												category === 'ongoing' ? 'live' : category
											} events`}
										/>
									)
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default EventPage;

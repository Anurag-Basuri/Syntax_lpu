import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	getArvantisLandingData,
	getFestDetails,
	getAllFests,
} from '../../services/arvantisServices.js';
import EventDetailModal from '../../components/event/EventDetailModal.jsx';
import { Calendar, Image as ImageIcon, Layers3, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PosterHero from '../../components/Arvantis/PosterHero.jsx';
import EditionsStrip from '../../components/Arvantis/EditionsStrip.jsx';
import StatCard from '../../components/Arvantis/StatCard.jsx';
import EventsGrid from '../../components/Arvantis/EventsGrid.jsx';
import PartnersGrid from '../../components/Arvantis/PartnersGrid.jsx';
import GalleryGrid from '../../components/Arvantis/GalleryGrid.jsx';
import ImageLightbox from '../../components/Arvantis/ImageLightbox.jsx';
import ErrorBlock from '../../components/Arvantis/ErrorBlock.jsx';
import LoadingBlock from '../../components/Arvantis/LoadingBlock.jsx';

const ArvantisPage = () => {
	const [identifier, setIdentifier] = useState(null);
	const [selectedEvent, setSelectedEvent] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);

	// Landing query (current or most recent fest)
	const landingQuery = useQuery({
		queryKey: ['arvantis', 'landing'],
		queryFn: getArvantisLandingData,
		staleTime: 60_000,
		retry: 1,
	});

	// Editions list (past editions)
	const editionsQuery = useQuery({
		queryKey: ['arvantis', 'editions', { page: 1, limit: 12 }],
		queryFn: () => getAllFests({ page: 1, limit: 12, sortBy: 'year', sortOrder: 'desc' }),
		staleTime: 60_000,
		retry: 1,
	});

	// Normalize editions array from possible server shapes
	const editions = useMemo(() => {
		const raw = editionsQuery.data;
		if (!raw) return [];
		// server might return pagination shape or plain array
		if (Array.isArray(raw)) return raw;
		if (Array.isArray(raw.docs)) return raw.docs;
		if (Array.isArray(raw.data)) return raw.data;
		// fallback: try nested data
		const payload = raw?.data ?? raw;
		if (Array.isArray(payload)) return payload;
		if (Array.isArray(payload?.docs)) return payload.docs;
		return [];
	}, [editionsQuery.data]);

	// Initialize identifier from landing or editions (only once)
	useEffect(() => {
		if (identifier) return;
		// prefer landing if available
		const landing = landingQuery.data;
		if (landing) {
			const id = landing.slug || String(landing.year || '');
			if (id) {
				console.debug('[ArvantisPage] set identifier from landing', id);
				setIdentifier(id);
				return;
			}
		}
		// fallback to first edition from editions list
		if (editions.length > 0) {
			const first = editions[0];
			const id = first?.slug || String(first?.year || '');
			if (id) {
				console.debug('[ArvantisPage] set identifier from editions', id);
				setIdentifier(id);
			}
		}
	}, [identifier, landingQuery.data, editions]);

	// Details for selected identifier (only when identifier present)
	const detailsQuery = useQuery({
		queryKey: ['arvantis', 'details', identifier],
		queryFn: () => getFestDetails(identifier),
		enabled: !!identifier,
		staleTime: 60_000,
		retry: 1,
	});

	// Resolve the fest to display (details -> landing fallback)
	const fest = useMemo(() => {
		return detailsQuery.data ?? landingQuery.data ?? null;
	}, [detailsQuery.data, landingQuery.data]);

	// Stats for UI cards (defensive access)
	const stats = useMemo(() => {
		const safeFest = fest || {};
		return [
			{ icon: Layers3, label: 'Edition', value: safeFest?.year ?? '—' },
			{ icon: Users, label: 'Partners', value: safeFest?.partners?.length ?? 0 },
			{ icon: Calendar, label: 'Events', value: safeFest?.events?.length ?? 0 },
			{ icon: ImageIcon, label: 'Gallery', value: safeFest?.gallery?.length ?? 0 },
		];
	}, [fest]);

	const isLoadingOverall =
		landingQuery.isLoading ||
		(!identifier && editionsQuery.isLoading) ||
		detailsQuery.isLoading;

	const isErrorOverall = landingQuery.isError || detailsQuery.isError || editionsQuery.isError;
	const errorMsg =
		landingQuery.error?.message ||
		detailsQuery.error?.message ||
		editionsQuery.error?.message ||
		'Unknown error occurred.';

	const handleEventClick = useCallback((event) => {
		// normalize event object if server returns different keys
		const normalized = {
			...event,
			title: event.title ?? event.name ?? '',
			eventDate: event.eventDate ?? event.date ?? null,
			posters: Array.isArray(event.posters)
				? event.posters
				: event.posters
				? [event.posters]
				: [],
		};
		setSelectedEvent(normalized);
	}, []);

	const handleImageClick = useCallback((image) => {
		setSelectedImage(image);
	}, []);

	const closeModal = useCallback(() => {
		setSelectedEvent(null);
		setSelectedImage(null);
	}, []);

	// Defensive UI: show loading / error / empty states
	return (
		<div className="min-h-screen bg-gray-900 text-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				<header className="mb-8">
					<h2 className="text-4xl font-extrabold tracking-tight text-white">Arvantis</h2>
					<p className="text-lg text-gray-400 mt-1">
						The annual flagship fest by Syntax Club.
					</p>
				</header>

				{isErrorOverall ? (
					<ErrorBlock
						message={errorMsg}
						onRetry={() => {
							landingQuery.refetch();
							editionsQuery.refetch();
							if (identifier) detailsQuery.refetch();
						}}
					/>
				) : isLoadingOverall && !fest ? (
					<LoadingBlock />
				) : !fest ? (
					<div className="py-20 text-center">
						<h3 className="text-2xl font-semibold mb-2">No Fest Data Available</h3>
						<p className="text-gray-400">
							Please check back later for updates on Arvantis.
						</p>
					</div>
				) : (
					<div className="space-y-12">
						{/* Poster / Hero */}
						<PosterHero fest={fest} />

						{/* Editions / selector */}
						<EditionsStrip
							editions={editions}
							currentIdentifier={identifier}
							onSelect={(id) => {
								if (!id) return;
								console.debug('[ArvantisPage] edition selected', id);
								setIdentifier(id);
								// scroll top for better UX
								window.scrollTo({ top: 0, behavior: 'smooth' });
							}}
						/>

						{/* Stats */}
						<div className="bg-gray-900/50 rounded-2xl p-6">
							<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
								{stats.map((s, idx) => (
									<StatCard
										key={idx}
										icon={s.icon}
										label={s.label}
										value={s.value}
										index={idx}
									/>
								))}
							</section>
						</div>

						{/* Main content sections */}
						<div className="space-y-12">
							<EventsGrid
								events={Array.isArray(fest?.events) ? fest.events : []}
								onEventClick={handleEventClick}
							/>
							<PartnersGrid
								partners={Array.isArray(fest?.partners) ? fest.partners : []}
							/>
							<GalleryGrid
								gallery={Array.isArray(fest?.gallery) ? fest.gallery : []}
								onImageClick={handleImageClick}
							/>
						</div>
					</div>
				)}

				{/* Modals */}
				<AnimatePresence>
					{selectedEvent && (
						<EventDetailModal
							event={selectedEvent}
							isOpen={!!selectedEvent}
							onClose={closeModal}
						/>
					)}
					{selectedImage && <ImageLightbox image={selectedImage} onClose={closeModal} />}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default ArvantisPage;

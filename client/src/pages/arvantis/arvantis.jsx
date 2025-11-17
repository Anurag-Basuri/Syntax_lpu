import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	HelpCircle,
	ChevronDown,
	ChevronUp,
	Copy,
	ExternalLink,
	Layers3,
	Calendar,
	Users,
	Image,
} from 'lucide-react';
import PosterHero from '../../components/Arvantis/PosterHero.jsx';
import StatCard from '../../components/Arvantis/StatCard.jsx';
import EventsGrid from '../../components/Arvantis/EventsGrid.jsx';
import PartnersGrid from '../../components/Arvantis/PartnersGrid.jsx';
import GalleryGrid from '../../components/Arvantis/GalleryGrid.jsx';
import ImageLightbox from '../../components/Arvantis/ImageLightbox.jsx';
import LoadingBlock from '../../components/Arvantis/LoadingBlock.jsx';
import ErrorBlock from '../../components/Arvantis/ErrorBlock.jsx';
import EditionsStrip from '../../components/Arvantis/EditionsStrip.jsx';
import {
	getArvantisLandingData,
	getAllFests,
	getFestDetails,
} from '../../services/arvantisServices.js';
import '../../arvantis.css';

/*
  Reorganized, industry-grade Arvantis page:
  - Two-column layout: main content (description, events, gallery, faqs) + right sidebar (stats, partners, sponsor)
  - Description and Location always visible under hero
  - Respect fest.themeColors by setting CSS vars on root container (non-invasive)
  - Clear sections with headings and consistent spacing
  - Minimal, defensive data handling and accessible markup
*/

// --- Utility ---
const safeArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const normalizeLanding = (raw) => {
	if (!raw) return null;
	if (raw.fest) {
		const f = { ...raw.fest };
		f.hero = raw.hero ?? f.hero ?? f.posters?.[0] ?? null;
		f.events = raw.events ?? f.events ?? [];
		f.partners = raw.partners ?? f.partners ?? [];
		f.computed = raw.computed ?? {};
		return f;
	}
	return raw;
};
const findTitleSponsor = (partners = []) => {
	if (!partners || partners.length === 0) return null;
	const byTier = partners.find(
		(p) => p.tier && /title|title-sponsor|presenting|powered by|lead/i.test(p.tier)
	);
	if (byTier) return byTier;
	const byFlag = partners.find((p) => p.isTitleSponsor || p.role === 'title' || p.titleSponsor);
	if (byFlag) return byFlag;
	return (
		partners.find((p) =>
			/title sponsor|powered by|presented by/i.test(`${p.name} ${p.description || ''}`)
		) || null
	);
};

// --- FAQ Section ---
const FAQList = ({ faqs = [] }) => {
	const [query, setQuery] = useState('');
	const [expanded, setExpanded] = useState({});

	useEffect(() => {
		// collapse when faqs change
		setExpanded({});
	}, [faqs]);

	const filtered = useMemo(() => {
		if (!query) return faqs;
		const q = query.toLowerCase();
		return faqs.filter(
			(f) =>
				(f.question || '').toLowerCase().includes(q) ||
				(f.answer || '').toLowerCase().includes(q)
		);
	}, [faqs, query]);

	const toggle = useCallback((id) => setExpanded((s) => ({ ...s, [id]: !s[id] })), []);

	if (!faqs || faqs.length === 0) return null;

	return (
		<section aria-labelledby="arvantis-faqs" className="mt-10">
			<div className="flex items-center justify-between mb-4">
				<h3 id="arvantis-faqs" className="section-title flex items-center gap-2">
					<HelpCircle size={20} className="text-[var(--accent-1)]" /> FAQs
				</h3>
				<div className="flex items-center gap-2">
					<input
						type="search"
						placeholder="Search FAQs…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="rounded-md border py-2 px-3 bg-[var(--input-bg)]"
						aria-label="Search FAQs"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{filtered.map((f, i) => {
					const id = f._id || i;
					const open = !!expanded[id];
					return (
						<article
							key={id}
							className="glass-card p-4 transition-all"
							aria-expanded={open}
						>
							<header>
								<button
									type="button"
									onClick={() => toggle(id)}
									className="w-full flex items-center justify-between text-left"
									aria-controls={`faq-body-${id}`}
									aria-expanded={open}
								>
									<div className="font-semibold text-[var(--text-primary)]">
										{f.question}
									</div>
									{open ? (
										<ChevronUp className="text-[var(--accent-1)]" />
									) : (
										<ChevronDown className="text-[var(--accent-1)]" />
									)}
								</button>
							</header>
							{open && (
								<div
									id={`faq-body-${id}`}
									className="mt-3 text-[var(--text-secondary)]"
								>
									{f.answer}
									<div className="mt-3">
										<button
											type="button"
											className="btn-ghost small"
											onClick={() => {
												const url = `${window.location.origin}${window.location.pathname}#faq-${id}`;
												navigator.clipboard?.writeText?.(url);
												window.dispatchEvent(
													new CustomEvent('toast', {
														detail: { message: 'FAQ link copied' },
													})
												);
											}}
										>
											<Copy size={14} /> Copy link
										</button>
									</div>
								</div>
							)}
						</article>
					);
				})}
			</div>
		</section>
	);
};

// --- Main Page ---
const ArvantisPage = () => {
	const [identifier, setIdentifier] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);

	const landingQuery = useQuery({
		queryKey: ['arvantis', 'landing'],
		queryFn: getArvantisLandingData,
		staleTime: 60_000,
		retry: 1,
	});
	const editionsQuery = useQuery({
		queryKey: ['arvantis', 'editions'],
		queryFn: () => getAllFests({ page: 1, limit: 50, sortBy: 'year', sortOrder: 'desc' }),
		staleTime: 60_000,
		retry: 1,
	});

	const editions = useMemo(() => {
		const raw = editionsQuery.data;
		if (!raw) return [];
		if (Array.isArray(raw)) return raw;
		if (Array.isArray(raw.docs)) return raw.docs;
		if (Array.isArray(raw.data)) return raw.data;
		return [];
	}, [editionsQuery.data]);

	const landingFest = useMemo(() => normalizeLanding(landingQuery.data), [landingQuery.data]);

	useEffect(() => {
		if (identifier) return;
		if (landingFest) {
			const id = landingFest.slug || String(landingFest.year || '');
			if (id) {
				setIdentifier(id);
				return;
			}
		}
		if (editions && editions.length) {
			const first = editions[0];
			const id = first?.slug || String(first?.year || '');
			if (id) setIdentifier(id);
		}
	}, [identifier, landingFest, editions]);

	const detailsQuery = useQuery({
		queryKey: ['arvantis', 'details', identifier],
		queryFn: () => (identifier ? getFestDetails(identifier) : Promise.resolve(null)),
		enabled: !!identifier,
		staleTime: 60_000,
		retry: 1,
	});

	const fest = useMemo(
		() => detailsQuery.data ?? landingFest ?? null,
		[detailsQuery.data, landingFest]
	);
	const events = useMemo(() => safeArray(fest?.events), [fest]);
	const partners = useMemo(() => safeArray(fest?.partners), [fest]);
	const titleSponsor = useMemo(() => findTitleSponsor(partners), [partners]);

	const stats = useMemo(() => {
		const safe = fest || {};
		return [
			{ icon: Layers3, label: 'Edition', value: safe.year ?? '—' },
			{ icon: Users, label: 'Partners', value: safe.partners?.length ?? 0 },
			{ icon: Calendar, label: 'Events', value: safe.events?.length ?? 0 },
			{ icon: Image, label: 'Gallery', value: safe.gallery?.length ?? 0 },
		];
	}, [fest]);

	const isLoading = landingQuery.isLoading || editionsQuery.isLoading || detailsQuery.isLoading;
	const isError = landingQuery.isError || editionsQuery.isError || detailsQuery.isError;
	const errorMsg =
		landingQuery.error?.message ||
		detailsQuery.error?.message ||
		editionsQuery.error?.message ||
		'Failed to load data.';

	const handleSelectEdition = useCallback((id) => {
		if (!id) return;
		setIdentifier(id);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	const handleImageClick = useCallback((img) => setSelectedImage(img), []);

	// apply fest theme colors to this container via CSS variables (non-destructive)
	const themeVars = useMemo(() => {
		return {
			['--accent-1']: fest?.themeColors?.primary || undefined,
			['--accent-2']: fest?.themeColors?.accent || undefined,
		};
	}, [fest]);

	if (isLoading) return <LoadingBlock label="Loading Arvantis..." />;
	if (isError) return <ErrorBlock message={errorMsg} onRetry={() => window.location.reload()} />;

	return (
		<div className="arvantis-page" style={themeVars}>
			{/* Top editions */}
			<EditionsStrip
				editions={editions}
				currentIdentifier={identifier}
				onSelect={handleSelectEdition}
				landingIdentifier={landingFest?.slug || String(landingFest?.year || '')}
			/>

			{/* Hero */}
			<PosterHero fest={fest} />

			{/* Organized layout: main + right sidebar */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main column */}
				<main className="lg:col-span-2 space-y-8">
					{/* Always-visible summary: name, tagline, location, description */}
					<section className="glass-card p-6">
						<div className="flex flex-col md:flex-row md:items-start md:gap-6">
							<div className="flex-1 min-w-0">
								<h1
									className="text-2xl font-extrabold"
									style={{ color: 'var(--text-primary)' }}
								>
									{fest?.name || 'Arvantis'} {fest?.year ? `· ${fest.year}` : ''}
								</h1>
								<div
									className="mt-2 text-sm mono"
									style={{ color: 'var(--text-secondary)' }}
								>
									{fest?.tagline || 'Tech • Hack • Build'}
								</div>

								<div
									className="mt-4 text-base leading-relaxed"
									style={{ color: 'var(--text-secondary)' }}
								>
									{fest?.description || 'No description available.'}
								</div>

								<div
									className="mt-4 flex items-center gap-4 text-sm"
									style={{ color: 'var(--text-secondary)' }}
								>
									<div className="inline-flex items-center gap-2">
										<Calendar size={16} />{' '}
										<span>
											{fest?.startDate
												? new Date(fest.startDate).toLocaleDateString()
												: 'TBD'}
										</span>
									</div>
									<div className="inline-flex items-center gap-2">
										<ExternalLink size={16} />{' '}
										<span>{fest?.location || 'Location TBA'}</span>
									</div>
								</div>
							</div>

							{/* quick actions visible on larger screens */}
							<div className="mt-4 md:mt-0 md:flex-shrink-0 flex flex-col gap-3">
								{fest?.tickets?.url && (
									<a
										href={fest.tickets.url}
										target="_blank"
										rel="noreferrer"
										className="btn-primary neon-btn"
									>
										Buy Tickets
									</a>
								)}
								<a href="#events" className="btn-ghost">
									Browse Events
								</a>
							</div>
						</div>
					</section>

					{/* Events list */}
					<EventsGrid
						events={events}
						onEventClick={() => {
							/* event modal handled elsewhere */
						}}
					/>

					{/* Gallery */}
					<GalleryGrid gallery={fest?.gallery || []} onImageClick={handleImageClick} />

					{/* FAQ */}
					<FAQList faqs={fest?.faqs || []} />
				</main>

				{/* Right sidebar */}
				<aside className="space-y-6">
					{/* Stats */}
					<div className="glass-card p-4">
						<div className="text-sm text-[var(--text-secondary)]">Overview</div>
						<div className="mt-3 grid grid-cols-2 gap-3">
							{stats.map((s) => (
								<StatCard
									key={s.label}
									icon={s.icon}
									label={s.label}
									value={s.value}
								/>
							))}
						</div>
					</div>

					{/* Title sponsor */}
					{titleSponsor && (
						<div className="glass-card p-4">
							<div className="text-sm text-[var(--text-secondary)]">
								Title Sponsor
							</div>
							<div className="mt-3 flex items-center gap-3">
								<div
									className="w-14 h-14 rounded-md overflow-hidden bg-white/5 flex items-center justify-center"
									style={{ border: '1px solid var(--glass-border)' }}
								>
									{titleSponsor.logo?.url ? (
										<img
											src={titleSponsor.logo.url}
											alt={titleSponsor.name}
											className="w-full h-full object-contain"
										/>
									) : (
										<div className="mono">{titleSponsor.name}</div>
									)}
								</div>
								<div className="min-w-0">
									<div
										className="font-medium"
										style={{ color: 'var(--text-primary)' }}
									>
										{titleSponsor.name}
									</div>
									{titleSponsor.website && (
										<a
											href={titleSponsor.website}
											target="_blank"
											rel="noreferrer"
											className="text-sm muted inline-flex items-center gap-1"
										>
											<ExternalLink size={12} /> Visit
										</a>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Partners preview */}
					<div className="glass-card p-4">
						<div className="flex items-center justify-between">
							<div className="text-sm text-[var(--text-secondary)]">Partners</div>
							<div className="text-xs muted">{partners.length}</div>
						</div>
						<div className="mt-3">
							<PartnersGrid partners={partners.slice(0, 8)} />
						</div>
						{partners.length > 8 && (
							<div className="mt-3 text-center">
								<a href="#partners" className="btn-ghost small">
									View all partners
								</a>
							</div>
						)}
					</div>
				</aside>
			</div>

			{/* Lightbox */}
			{selectedImage && (
				<ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />
			)}
		</div>
	);
};

export default ArvantisPage;

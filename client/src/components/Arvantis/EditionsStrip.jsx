import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * EditionsStrip
 * - horizontal scrollable strip of edition pills (year)
 * - highlights currentIdentifier and marks the landing/latest edition
 * - provides left/right buttons for overflow navigation
 */
const EditionsStrip = ({ editions = [], currentIdentifier, onSelect, landingIdentifier = null }) => {
	if (!editions?.length) return null;
	const containerRef = useRef(null);

	const scrollBy = (dir = 1) => {
		const el = containerRef.current;
		if (!el) return;
		const step = Math.min(320, el.clientWidth * 0.6);
		el.scrollBy({ left: dir * step, behavior: 'smooth' });
	};

	return (
		<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="editions-strip p-3 rounded-xl overflow-hidden flex items-center gap-3">
			<div className="flex items-center gap-3">
				<span className="text-sm font-semibold whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>Editions</span>
			</div>

			<div className="relative flex-1">
				<button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/6 rounded-full hover:bg-white/10 hidden sm:inline-flex">
					<ChevronLeft size={16} />
				</button>

				<div ref={containerRef} className="flex items-center gap-2 overflow-x-auto py-1 px-4 scroll-snap-x">
					{editions.map((f) => {
						const id = f?.slug || String(f?.year || '');
						const active = id && id === currentIdentifier;
						const isLatest = landingIdentifier && id === landingIdentifier;
						return (
							<button
								key={id}
								onClick={() => onSelect(id)}
								className={`edition-pill ${active ? 'active' : ''}`}
								title={`${f?.name || 'Arvantis'} ${f?.year || ''}`}
								aria-pressed={active}
							>
								<div className="flex items-center gap-2">
									<span className="mono">{f?.year || 'Year'}</span>
									{isLatest && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-1)]/10 text-[var(--accent-1)]">Latest</span>}
								</div>
							</button>
						);
					})}
				</div>

				<button onClick={() => scrollBy(1)} aria-label="Scroll right" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/6 rounded-full hover:bg-white/10 hidden sm:inline-flex">
					<ChevronRight size={16} />
				</button>
			</div>
		</motion.div>
	);
};

export default EditionsStrip;

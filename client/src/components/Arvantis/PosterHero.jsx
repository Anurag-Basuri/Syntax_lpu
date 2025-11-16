import React, { useMemo, useState, useCallback } from 'react';
import { Sparkles, Calendar, Ticket, MapPin, Info } from 'lucide-react';
import { StatusPill } from './StatusPill';
import { motion } from 'framer-motion';
import Countdown from './Countdown';
import PosterCarousel from './PosterCarousel';
import ImageLightbox from './ImageLightbox';
import FestDetails from './FestDetails.jsx';

/* keep formatDate util */
const formatDate = (date) => {
  if (!date) return 'TBA';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'TBA';
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const PosterHero = ({ fest = {} }) => {
  const posters = useMemo(() => {
    const raw = Array.isArray(fest?.posters) ? fest.posters : (fest?.gallery || []);
    const hero = fest?.poster ? [{ url: fest.poster.url || fest.poster }] : [];
    const normalized = raw.map((p) => (typeof p === 'string' ? { url: p } : p));
    if (hero.length) {
      const merged = [hero[0], ...normalized.filter((p) => p.url !== hero[0].url)];
      return merged;
    }
    return normalized.length ? normalized : hero;
  }, [fest]);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const openLightbox = useCallback((i) => { setLightboxIndex(i || 0); setLightboxOpen(true); }, []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const showPrev = useCallback(() => setLightboxIndex((i) => (i - 1 + posters.length) % posters.length), [posters.length]);
  const showNext = useCallback(() => setLightboxIndex((i) => (i + 1) % posters.length), [posters.length]);

  const ticketSold = fest?.tickets?.sold || 0;
  const ticketCap = fest?.tickets?.capacity || 0;
  const ticketPct = ticketCap > 0 ? Math.min(100, Math.round((ticketSold / ticketCap) * 100)) : 0;

  const heroPoster = posters.length ? posters[0] : (fest?.poster ? (typeof fest.poster === 'string' ? { url: fest.poster } : fest.poster) : null);

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="arvantis-hero relative overflow-hidden rounded-3xl min-h-[420px] md:min-h-[520px] flex items-stretch text-white"
        aria-label={`${fest?.name || 'Arvantis'} hero`}
        style={{ background: 'transparent' }}
      >
        <div className="relative z-10 max-w-6xl w-full mx-auto px-4 py-8 md:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="col-span-2">
              <PosterCarousel posters={posters} heroPoster={heroPoster} autoplay onOpenLightbox={openLightbox} />
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-white flex-shrink-0">
                    <img src={fest?.logo?.url || heroPoster?.url || ''} alt={`${fest?.name || 'Arvantis'} logo`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{fest?.name || 'Arvantis'} <span className="accent-neon ml-1">{fest?.year ? `’${String(fest.year).slice(-2)}` : ''}</span></div>
                    <div className="text-sm mono" style={{ color: 'var(--text-secondary)' }}>{fest?.tagline || 'Tech • Hack • Build'}</div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3">
                  {fest?.tickets?.url && <a href={fest.tickets.url} className="btn-primary neon-btn" target="_blank" rel="noreferrer"><Ticket size={16} /> Buy Tickets</a>}
                  <a href="#events" className="btn-ghost">Explore Events</a>
                  <button onClick={() => setShowDetails((s) => !s)} className="btn-ghost" aria-expanded={showDetails} aria-controls="fest-full-details">
                    <Info size={14} /> {showDetails ? 'Hide Details' : 'View Full Details'}
                  </button>
                </div>
              </div>

              {/* mobile small CTA */}
              <div className="mt-3 md:hidden flex gap-3">
                {fest?.tickets?.url && <a href={fest.tickets.url} className="btn-primary neon-btn" style={{ flex: 1 }}><Ticket size={14} /> Buy</a>}
                <button onClick={() => setShowDetails((s) => !s)} className="btn-ghost" aria-expanded={showDetails} aria-controls="fest-full-details">
                  <Info size={14} /> {showDetails ? 'Hide' : 'Details'}
                </button>
              </div>
            </div>

            <aside className="details-panel glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>Status</div>
                  <div className="mt-2"><StatusPill status={fest?.status} /></div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>When</div>
                  <div className="mt-2 mono" style={{ color: 'var(--text-primary)' }}>{formatDate(fest?.startDate)} — {formatDate(fest?.endDate)}</div>
                </div>
              </div>

              {fest?.startDate && (
                <div className="mt-4">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Countdown</div>
                  <div className="mt-2"><Countdown target={fest.startDate} /></div>
                </div>
              )}

              {typeof fest?.tickets?.capacity !== 'undefined' && (
                <div className="mt-4">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Tickets</div>
                  <div className="mt-2">
                    <div className="ticket-progress" aria-hidden>
                      <div className="progress-bar" style={{ width: `${ticketPct}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm mono" style={{ color: 'var(--text-secondary)' }}>
                      <div>{ticketSold} sold</div>
                      <div>{ticketCap || '—'} capacity</div>
                    </div>
                    {fest?.tickets?.url && <div className="mt-3"><a href={fest.tickets.url} target="_blank" rel="noreferrer" className="btn-primary neon-btn" style={{ width: '100%' }}><Ticket size={14} /> Buy Tickets</a></div>}
                  </div>
                </div>
              )}

              {Array.isArray(fest?.sponsors) && fest.sponsors.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Top Sponsors</div>
                  <div className="mt-2 flex gap-2 items-center overflow-auto">
                    {fest.sponsors.slice(0, 6).map((s, i) => <img key={i} src={s.logo || s.logoUrl || s.url} alt={s.name || 'Sponsor'} className="sponsor-mini" />)}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </motion.section>

      {/* details panel / expanded */}
      <div id="fest-full-details" aria-hidden={!showDetails} style={{ display: showDetails ? 'block' : 'none' }}>
        <FestDetails fest={fest} />
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          image={posters[lightboxIndex] || heroPoster}
          onClose={closeLightbox}
          onPrev={posters.length > 1 ? showPrev : undefined}
          onNext={posters.length > 1 ? showNext : undefined}
        />
      )}
    </>
  );
};

export default PosterHero;

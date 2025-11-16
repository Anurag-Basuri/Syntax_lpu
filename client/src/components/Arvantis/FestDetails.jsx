import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, MapPin, Calendar, Users, Tag, Globe, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

import EditionsStrip from './EditionsStrip';
import StatCard from './StatCard';
import EventsGrid from './EventsGrid';
import PartnersGrid from './PartnersGrid';
import GalleryGrid from './GalleryGrid';
import GlassCard from './GlassCard';
import EmptyState from './EmptyState';
import Badge from './Badge';

/**
 * FestDetails
 * - Full festival page / expanded details block
 * - Designed to be visually rich and responsive while staying accessible
 *
 * Props:
 *  - fest: object (the festival/edition object)
 *  - editions: array (other editions for the strip)
 *  - onSelectEdition: fn (select another edition)
 *  - onEventClick: fn (open event detail)
 */
const FestDetails = ({ fest = {}, editions = [], onSelectEdition = () => {}, onEventClick = () => {} }) => {
  const {
    name,
    year,
    tagline,
    description,
    logo,
    hero,
    startDate,
    endDate,
    location,
    tickets,
    tags,
    sponsors,
    partners,
    gallery,
    stats = {},
    events = [],
    slug,
    landingSlug,
  } = fest || {};

  // computed values
  const safeName = name || 'Arvantis';
  const displayYear = year ? `’${String(year).slice(-2)}` : '';
  const headerLogo = (logo && (logo.url || logo)) || (hero && (hero.url || hero)) || null;

  const statItems = useMemo(() => [
    { icon: Users, label: 'Attendees', value: stats.attendees ?? stats.attendance ?? '—' },
    { icon: Sparkles, label: 'Events', value: events?.length ?? stats.events ?? 0 },
    { icon: Tag, label: 'Sponsors', value: Array.isArray(sponsors) ? sponsors.length : stats.sponsors ?? '—' },
    { icon: Globe, label: 'Partners', value: Array.isArray(partners) ? partners.length : stats.partners ?? '—' },
  ], [events, sponsors, partners, stats]);

  const [showContact, setShowContact] = useState(false);

  const onSelect = useCallback((identifier) => {
    if (onSelectEdition) onSelectEdition(identifier);
    // scroll into view for better UX (if needed)
    const el = document.getElementByIdThanks — I’ll finish the `FestDetails.jsx` component. Below I’m replacing/continuing the file with a complete implementation that matches the style of the other Arvantis components and uses the existing subcomponents. Save this file at:

Syntax_Club/client/src/components/Arvantis/FestDetails.jsx

```Syntax_Club/client/src/components/Arvantis/FestDetails.jsx#L1-400
import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Sparkles, MapPin, Calendar, Users, Tag, Globe, Ticket, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';

import EditionsStrip from './EditionsStrip';
import StatCard from './StatCard';
import EventsGrid from './EventsGrid';
import PartnersGrid from './PartnersGrid';
import GalleryGrid from './GalleryGrid';
import GlassCard from './GlassCard';
import EmptyState from './EmptyState';
import Badge from './Badge';

/**
 * FestDetails - Expanded festival page
 *
 * Props:
 *  - fest: object (festival/edition details)
 *  - editions: array (other editions for the strip)
 *  - onSelectEdition: fn (select another edition slug)
 *  - onEventClick: fn (open event)
 */
const formatDate = (d) => {
  if (!d) return 'TBA';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return 'TBA';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const FestDetails = ({ fest = {}, editions = [], onSelectEdition = () => {}, onEventClick = () => {} }) => {
  const {
    name,
    year,
    tagline,
    description,
    logo,
    poster,
    startDate,
    endDate,
    location,
    tickets,
    tags,
    sponsors,
    partners,
    gallery,
    stats = {},
    events = [],
    slug,
    landingSlug,
  } = fest || {};

  const safeName = name || 'Arvantis';
  const displayYear = year ? `’${String(year).slice(-2)}` : '';
  const headerLogo = (logo && (logo.url || logo)) || (poster && (poster.url || poster)) || null;

  const statItems = useMemo(() => [
    { icon: Users, label: 'Attendees', value: stats.attendees ?? stats.attendance ?? '—' },
    { icon: Sparkles, label: 'Events', value: events?.length ?? stats.events ?? 0 },
    { icon: Tag, label: 'Sponsors', value: Array.isArray(sponsors) ? sponsors.length : stats.sponsors ?? '—' },
    { icon: Globe, label: 'Partners', value: Array.isArray(partners) ? partners.length : stats.partners ?? '—' },
  ], [events, sponsors, partners, stats]);

  const [showContact, setShowContact] = useState(false);
  const [copied, setCopied] = useState(false);

  const onSelect = useCallback((identifier) => {
    if (onSelectEdition) onSelectEdition(identifier);
    const el = document.getElementById('fest-full-details');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [onSelectEdition]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${safeName} ${displayYear}`, text: tagline || safeName, url });
      } catch (e) {
        // ignore user cancel
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch (e) {
        // fallback: nothing
      }
    }
  };

  return (
    <div className="arvantis-page space-y-6">
      {/* editions strip */}
      {Array.isArray(editions) && editions.length > 0 && (
        <EditionsStrip editions={editions} currentIdentifier={slug} onSelect={onSelect} landingIdentifier={landingSlug} />
      )}

      {/* main header */}
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 glass-card p-6 relative overflow-hidden" style={{ border: '1px solid var(--glass-border)' }}>
          <div className="flex items-start gap-4">
            <div className="logo-wrap w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              {headerLogo ? <img src={headerLogo} alt={`${safeName} logo`} className="w-full h-full object-cover" /> : <div className="placeholder-logo flex items-center justify-center bg-white/6 text-xl font-bold">{(safeName || 'A').slice(0,1)}</div>}
            </div>

            <div className="flex-1">
              <h2 id="fest-details" className="fest-title text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {safeName} <span className="accent-neon ml-2">{displayYear}</span>
              </h2>
              <div className="muted mt-1 text-sm">{tagline}</div>

              <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {description || 'No description available for this edition.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 items-center">
                {Array.isArray(tags) && tags.length > 0 ? tags.slice(0,6).map((t, i) => (
                  <Badge key={i} variant="default" size="sm" className="uppercase">{t}</Badge>
                )) : <Badge variant="upcoming" size="sm">Arvantis</Badge>}
              </div>
            </div>
          </div>

          {/* meta row */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="text-[var(--accent-1)]" />
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>When</div>
                <div className="mono" style={{ color: 'var(--text-primary)' }}>{formatDate(startDate)} — {formatDate(endDate)}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="text-[var(--accent-1)]" />
              <div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Where</div>
                <div className="mono" style={{ color: 'var(--text-primary)' }}>{location || 'TBA'}</div>
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            {tickets?.url ? (
              <a href={tickets.url} target="_blank" rel="noreferrer" className="btn-primary neon-btn inline-flex items-center gap-2">
                <Ticket size={16} /> Buy Tickets
              </a>
            ) : (
              <div className="btn-ghost">Tickets: {tickets?.capacity ? `${tickets.capacity} cap` : 'TBA'}</div>
            )}

            <button type="button" onClick={() => setShowContact((s) => !s)} className="btn-ghost inline-flex items-center gap-2">
              <Users size={14} /> Contact
            </button>

            <button type="button" onClick={handleShare} className="btn-ghost inline-flex items-center gap-2">
              <Share2 size={14} /> {copied ? 'Link copied' : 'Share'}
            </button>

            <div className="ml-auto hidden lg:flex items-center gap-3">
              <div className="text-xs text-[var(--text-secondary)]">Status</div>
              <div><Badge variant={fest?.status === 'ongoing' ? 'ongoing' : fest?.status === 'completed' ? 'completed' : 'upcoming'} size="sm">{fest?.status || 'TBA'}</Badge></div>
            </div>
          </div>
        </div>

        {/* right column: stats / sponsors */}
        <aside className="glass-card p-4 space-y-4" style={{ border: '1px solid var(--glass-border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Quick Stats</div>
              <div className="text-sm mono" style={{ color: 'var(--text-primary)' }}>{safeName} {displayYear}</div>
            </div>
            <div className="text-right">
              {tickets?.url && <a href={tickets.url} target="_blank" rel="noreferrer" className="text-sm font-semibold neon-text">Get Tickets</a>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {statItems.map((s, i) => <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} index={i} />)}
          </div>

          {Array.isArray(sponsors) && sponsors.length > 0 ? (
            <>
              <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Top Sponsors</div>
              <div className="flex items-center gap-2 overflow-auto py-2">
                {sponsors.slice(0, 6).map((sp, i) => (
                  <div key={i} className="w-20 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    {sp?.logo ? <img src={sp.logo || sp.logoUrl || sp.logo?.url} alt={sp.name || `Sponsor ${i+1}`} className="max-w-full max-h-full object-contain" /> : <div className="text-sm mono">{sp.name}</div>}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-sm muted">No sponsors listed yet.</div>
          )}
        </aside>
      </motion.header>

      {/* content sections */}
      <main className="space-y-8">
        {/* events */}
        <section>
          <EventsGrid events={events} onEventClick={onEventClick} />
        </section>

        {/* partners */}
        <section>
          {Array.isArray(partners) && partners.length > 0 ? <PartnersGrid partners={partners} /> : <EmptyState title="No partners yet" subtitle="Partners will appear here when added." />}
        </section>

        {/* gallery */}
        <section>
          {Array.isArray(gallery) && gallery.length > 0 ? (
            <GalleryGrid gallery={gallery} onImageClick={() => { /* lightbox handled by PosterHero often */ }} />
          ) : (
            <EmptyState title="Gallery empty" subtitle="Photos will appear here after the event." />
          )}
        </section>

        {/* details and organizers */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold mb-2">About</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{description || 'No additional details.'}</p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Calendar size={14} /> <div className="text-sm mono">{formatDate(startDate)} — {formatDate(endDate)}</div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} /> <div className="text-sm mono">{location || 'TBA'}</div>
              </div>
              {tickets?.url && <div className="flex items-center gap-2">
                <Ticket size={14} /> <a href={tickets.url} target="_blank" rel="noreferrer" className="mono neon-text">Tickets & Info</a>
              </div>}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold mb-2">Organizers & Contacts</h4>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              If you'd like to get in touch regarding partnerships, volunteering or sponsorships, use the contact button above or email the organizers.
            </p>

            <div className="mt-4">
              <button className="btn-primary w-full inline-flex items-center justify-center gap-2" onClick={() => setShowContact(true)}>Contact Organizers</button>
            </div>

            {showContact && (
              <div className="mt-4">
                <form onSubmit={(e) => { e.preventDefault(); setShowContact(false); }} className="space-y-3">
                  <input required placeholder="Your name" className="w-full p-3 rounded-xl bg-white/5 border border-white/10" />
                  <input required placeholder="Email" className="w-full p-3 rounded-xl bg-white/5 border border-white/10" />
                  <textarea required placeholder="Message" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 h-28" />
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 btn-primary">Send</button>
                    <button type="button" onClick={() => setShowContact(false)} className="btn-ghost">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <a href="#events" className="btn-ghost">Browse Events</a>
              <a href="#arvantis-gallery" className="btn-ghost">Open Gallery</a>
              <a href="#arvantis-partners" className="btn-ghost">Our Partners</a>
              <button onClick={handleShare} className="btn-ghost inline-flex items-center gap-2">{copied ? 'Copied' : 'Share this page'}</button>
            </div>
          </GlassCard>
        </section>
      </main>
    </div>
  );
};

FestDetails.propTypes = {
  fest: PropTypes.object,
  editions: PropTypes.array,
  onSelectEdition: PropTypes.func,
  onEventClick: PropTypes.func,
};

export default React.memo(FestDetails);

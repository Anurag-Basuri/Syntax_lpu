import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const PartnersGrid = ({ partners = [] }) => {
	if (!partners?.length) return null;
	return (
		<section aria-labelledby="arvantis-partners">
			<h3 id="arvantis-partners" className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Our Partners</h3>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6 items-center">
				{partners.map((p, idx) => (
					<motion.a
						key={`${p?.name || 'partner'}-${idx}`}
						href={p?.website || '#'}
						target={p?.website ? '_blank' : '_self'}
						rel={p?.website ? 'noopener noreferrer' : undefined}
						className="group flex items-center justify-center p-4 rounded-xl transition-transform duration-300"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.04 * idx, duration: 0.45 }}
						title={p?.name}
						style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-md)' }}
					>
						{p?.logo?.url ? (
							<img
								src={p.logo.url}
								alt={p.name || 'Partner'}
								loading="lazy"
								className="max-h-14 object-contain"
								style={{ filter: 'brightness(.98)' }}
							/>
						) : (
							<span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p?.name || 'Partner'}</span>
						)}
					</motion.a>
				))}
			</div>
		</section>
	);
};

PartnersGrid.propTypes = {
	partners: PropTypes.array,
};

export default React.memo(PartnersGrid);

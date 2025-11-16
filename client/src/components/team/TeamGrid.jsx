import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TeamMemberCard from './TeamMemberCard.jsx';
import { Users } from 'lucide-react';

/**
 * TeamGrid - unified grid (no separate leadership section)
 * - responsive grid columns driven by CSS (design.css)
 * - stable keys
 */

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.03 },
	},
};

const TeamGrid = ({ members = [], onCardClick }) => {
	const safeMembers = Array.isArray(members) ? members : [];

	if (safeMembers.length === 0) {
		return (
			<div className="team-grid-empty" role="status" aria-live="polite">
				<div className="flex flex-col items-center justify-center text-center py-16 px-4">
					<div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
						<Users size={36} className="text-white" />
					</div>
					<h3
						className="text-xl font-semibold mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						No members found
					</h3>
					<p className="max-w-lg text-sm" style={{ color: 'var(--text-secondary)' }}>
						Try adjusting filters or search — we couldn't find anyone matching the
						current criteria.
					</p>
				</div>
			</div>
		);
	}

	const getKey = (m, idx) =>
		m?._id || m?.id || m?.memberID || `${m?.fullname || 'member'}-${idx}`;

	return (
		<motion.div
			className="team-grid-root"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<section aria-label="Team members">
				<div className="team-grid">
					<AnimatePresence>
						{safeMembers.map((m, i) => (
							<motion.div
								key={getKey(m, i)}
								layout
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 8 }}
								transition={{ duration: 0.2 }}
							>
								<div className="h-full min-h-[180px]">
									<TeamMemberCard member={m} onClick={onCardClick} />
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</section>
		</motion.div>
	);
};

export default React.memo(TeamGrid);

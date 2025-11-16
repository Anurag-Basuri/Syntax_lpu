import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TeamMemberCard from './TeamMemberCard.jsx';
import { Users } from 'lucide-react';

const containerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.04 },
	},
};

const TeamGrid = ({ members = [], onCardClick }) => {
	if (!members || members.length === 0) {
		return (
			<div className="team-grid-empty">
				<div className="flex flex-col items-center justify-center text-center py-16 px-4">
					<div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
						<Users size={36} className="text-white" />
					</div>
					<h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
						No members found
					</h3>
					<p className="max-w-lg text-sm" style={{ color: 'var(--text-secondary)' }}>
						Try adjusting filters or search — we couldn't find anyone matching the current criteria.
					</p>
				</div>
			</div>
		);
	}

	// Optionally surface leaders first
	const leaders = members.filter((m) => m.isLeader);
	const rest = members.filter((m) => !m.isLeader);

	return (
		<motion.div className="team-grid" variants={containerVariants} initial="hidden" animate="visible">
			{/* Featured leaders row */}
			{leaders.length > 0 && (
				<section className="mb-6">
					<h3 className="text-lg font-semibold mb-3">Leadership</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
						<AnimatePresence mode="popLayout">
							{leaders.map((m) => (
								<motion.div key={m._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
									<TeamMemberCard member={m} onClick={onCardClick} />
								</motion.div>
							))}
						</AnimatePresence>
					</div>
				</section>
			)}

			{/* Main grid */}
			<section>
				<div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-min">
					<AnimatePresence mode="popLayout">
						{rest.map((m) => (
							<motion.div key={m._id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.22 }}>
								<TeamMemberCard member={m} onClick={onCardClick} />
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</section>
		</motion.div>
	);
};

export default React.memo(TeamGrid);

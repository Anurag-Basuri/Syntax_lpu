import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TeamMemberCard from './TeamMemberCard.jsx';
import { Users } from 'lucide-react';

const container = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.04 } },
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

	return (
		<motion.div className="team-grid" variants={container} initial="hidden" animate="visible">
			<AnimatePresence mode="popLayout">
				<div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
					{members.map((m) => (
						<motion.div key={m._id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.22 }}>
							<TeamMemberCard member={m} onClick={onCardClick} />
						</motion.div>
					))}
				</div>
			</AnimatePresence>
		</motion.div>
	);
};

export default React.memo(TeamGrid);

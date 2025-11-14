import { Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const formatDate = (date) => {
	if (!date) return 'TBA';
	const d = new Date(date);
	if (isNaN(d.getTime())) return 'TBA';
	return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const EventsGrid = ({ events, onEventClick }) => {
	if (!events?.length) return null;
	return (
		<section>
			<h3 className="text-2xl font-bold mb-4 text-white">Events</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{events.map((e, index) => (
					<motion.div
						key={e?._id || e?.id || e?.name}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 * index, duration: 0.5 }}
					>
						<button
							onClick={() => onEventClick(e)}
							className="w-full text-left p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
						>
							<div className="flex items-center justify-between mb-3">
								<span className="text-xs px-2 py-1 rounded-md bg-cyan-500/10 text-cyan-400 font-semibold">
									{e?.type || 'General'}
								</span>
								<div className="text-xs text-gray-400 flex items-center gap-1.5">
									<Calendar size={14} />
									{formatDate(e?.eventDate)}
								</div>
							</div>
							<h4 className="font-bold text-lg text-white mb-2 truncate">
								{e?.name || 'Event'}
							</h4>
							<div className="flex items-center justify-end text-sm text-cyan-400 font-semibold">
								View Details
								<ArrowRight
									size={16}
									className="ml-1 transform group-hover:translate-x-1 transition-transform"
								/>
							</div>
						</button>
					</motion.div>
				))}
			</div>
		</section>
	);
};

export default EventsGrid;

import { motion, AnimatePresence } from 'framer-motion';

const EventFilter = ({ activeFilter, setActiveFilter }) => {
	const filters = [
		{
			key: 'all',
			label: 'All',
			icon: '🎭',
			color: 'blue',
		},
		{
			key: 'upcoming',
			label: 'Upcoming',
			icon: '🚀',
			color: 'cyan',
		},
		{
			key: 'ongoing',
			label: 'Live',
			icon: '🔴',
			color: 'red',
		},
		{
			key: 'past',
			label: 'Past',
			icon: '📚',
			color: 'purple',
		},
	];

	const getFilterStyles = (color, isActive) => {
		const colorConfig = {
			blue: {
				active: 'bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-blue-500/20',
				inactive:
					'text-gray-400 border-gray-600/20 hover:text-blue-300 hover:border-blue-500/30 hover:bg-blue-500/5',
			},
			cyan: {
				active: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-cyan-500/20',
				inactive:
					'text-gray-400 border-gray-600/20 hover:text-cyan-300 hover:border-cyan-500/30 hover:bg-cyan-500/5',
			},
			red: {
				active: 'bg-red-500/20 text-red-300 border-red-400/40 shadow-red-500/20',
				inactive:
					'text-gray-400 border-gray-600/20 hover:text-red-300 hover:border-red-500/30 hover:bg-red-500/5',
			},
			purple: {
				active: 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-purple-500/20',
				inactive:
					'text-gray-400 border-gray-600/20 hover:text-purple-300 hover:border-purple-500/30 hover:bg-purple-500/5',
			},
		};
		return colorConfig[color][isActive ? 'active' : 'inactive'];
	};

	return (
		<div className="relative">
			{/* Filter Buttons Container */}
			<div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 lg:gap-3">
				{filters.map((filter, index) => {
					const isActive = activeFilter === filter.key;
					return (
						<motion.button
							key={filter.key}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
							whileHover={{
								scale: 1.02,
								y: -1,
								transition: { duration: 0.2 },
							}}
							whileTap={{ scale: 0.98 }}
							className={`
                                group relative overflow-hidden
                                px-2.5 sm:px-3 lg:px-4 
                                py-1.5 sm:py-2 
                                rounded-lg sm:rounded-xl 
                                border backdrop-blur-md
                                transition-all duration-300 ease-out
                                flex items-center gap-1.5 sm:gap-2 
                                font-medium text-xs sm:text-sm
                                shadow-lg
                                ${getFilterStyles(filter.color, isActive)}
                                ${isActive ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
                            `}
							onClick={() => setActiveFilter(filter.key)}
						>
							{/* Animated Background */}
							<motion.div
								className="absolute inset-0 bg-white/5"
								initial={{ scale: 0, opacity: 0 }}
								animate={{
									scale: isActive ? 1 : 0,
									opacity: isActive ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
							/>

							{/* Hover Background */}
							{!isActive && (
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
									initial={false}
								/>
							)}

							{/* Content */}
							<div className="relative z-10 flex items-center gap-1.5 sm:gap-2">
								{/* Icon with animation */}
								<motion.span
									className="text-xs sm:text-sm"
									animate={
										isActive
											? {
													scale: [1, 1.1, 1],
													rotate: [0, 5, -5, 0],
												}
											: {}
									}
									transition={{
										duration: 2,
										repeat: isActive ? Infinity : 0,
										repeatType: 'reverse',
									}}
								>
									{filter.icon}
								</motion.span>

								{/* Label - responsive visibility */}
								<span className="relative font-semibold hidden sm:inline whitespace-nowrap">
									{filter.label}
								</span>

								{/* Mobile-only label for active filter */}
								<span className="relative font-semibold sm:hidden text-xs whitespace-nowrap">
									{isActive ? filter.label : ''}
								</span>
							</div>

							{/* Active indicator with smooth animation */}
							{isActive && (
								<motion.div
									layoutId="activeFilterIndicator"
									className="absolute inset-0 bg-white/10 rounded-lg sm:rounded-xl border border-white/20"
									initial={false}
									transition={{
										type: 'spring',
										stiffness: 400,
										damping: 30,
										duration: 0.4,
									}}
								/>
							)}

							{/* Subtle glow effect for active filter */}
							{isActive && (
								<motion.div
									className={`absolute inset-0 rounded-lg sm:rounded-xl blur-sm opacity-30 ${
										filter.color === 'blue'
											? 'bg-blue-400'
											: filter.color === 'cyan'
												? 'bg-cyan-400'
												: filter.color === 'red'
													? 'bg-red-400'
													: 'bg-purple-400'
									}`}
									animate={{ opacity: [0.2, 0.4, 0.2] }}
									transition={{ duration: 2, repeat: Infinity }}
								/>
							)}
						</motion.button>
					);
				})}
			</div>
		</div>
	);
};

export default EventFilter;

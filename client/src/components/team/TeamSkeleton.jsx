import React from 'react';
import { motion } from 'framer-motion';

const TeamSkeleton = () => {
	return (
		<div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
			{/* Leadership skeleton with better animations */}
			<div className="mb-16 sm:mb-20">
				{/* Header skeleton */}
				<div className="flex justify-center mb-8 sm:mb-10">
					<motion.div
						className="h-8 sm:h-10 w-48 sm:w-64 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-xl"
						animate={{
							opacity: [0.4, 0.8, 0.4],
							scale: [1, 1.02, 1],
						}}
						transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
					/>
				</div>

				{/* CEO skeleton */}
				<div className="flex justify-center mb-8">
					<div className="w-full max-w-[300px] px-2">
						<SkeletonCard index={0} isLeader />
					</div>
				</div>

				{/* Other leadership skeleton */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-2">
					{Array(3)
						.fill(null)
						.map((_, index) => (
							<motion.div
								key={index}
								className="flex justify-center"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1, duration: 0.5 }}
							>
								<div className="w-full max-w-[300px]">
									<SkeletonCard index={index + 1} />
								</div>
							</motion.div>
						))}
				</div>
			</div>

			{/* Department sections skeleton */}
			<div className="space-y-16 sm:space-y-20">
				{Array(4)
					.fill(null)
					.map((_, sectionIndex) => (
						<motion.div
							key={sectionIndex}
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: sectionIndex * 0.2, duration: 0.6 }}
						>
							{/* Department header skeleton */}
							<div className="flex flex-col items-center mb-8 px-4">
								<motion.div
									className="h-16 w-full max-w-lg bg-gradient-to-r from-slate-800/40 to-slate-700/40 rounded-2xl mb-4 
                                    border border-indigo-500/20"
									animate={{
										opacity: [0.4, 0.7, 0.4],
										borderColor: [
											'rgba(99, 102, 241, 0.2)',
											'rgba(99, 102, 241, 0.4)',
											'rgba(99, 102, 241, 0.2)',
										],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										delay: sectionIndex * 0.3,
									}}
								/>
								<motion.div
									className="h-1 w-16 sm:w-20 bg-gradient-to-r from-indigo-600/30 to-blue-600/30 rounded-full"
									animate={{
										scaleX: [0.8, 1.2, 0.8],
										opacity: [0.5, 1, 0.5],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										delay: sectionIndex * 0.4,
									}}
								/>
							</div>

							{/* Cards skeleton */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-3">
								{Array(6)
									.fill(null)
									.map((_, cardIndex) => (
										<motion.div
											key={cardIndex}
											className="flex justify-center"
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												delay: (sectionIndex * 6 + cardIndex) * 0.05,
												duration: 0.4,
											}}
										>
											<div className="w-full max-w-[300px]">
												<SkeletonCard
													index={sectionIndex * 6 + cardIndex}
												/>
											</div>
										</motion.div>
									))}
							</div>
						</motion.div>
					))}
			</div>
		</div>
	);
};

const SkeletonCard = ({ index, isLeader = false }) => (
	<motion.div
		className={`p-5 rounded-2xl bg-gradient-to-b from-slate-800/40 to-slate-900/40 
            border border-indigo-500/20 overflow-hidden relative ${isLeader ? 'min-h-[320px]' : 'min-h-[300px]'}
            shadow-lg shadow-slate-900/10`}
		initial={{ opacity: 0.4, scale: 0.95 }}
		animate={{
			opacity: [0.4, 0.7, 0.4],
			scale: [0.95, 1, 0.95],
		}}
		transition={{
			duration: 2.5,
			repeat: Infinity,
			delay: index * 0.1,
			ease: 'easeInOut',
		}}
	>
		{/* Enhanced shimmer effect */}
		<motion.div
			className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-400/10 to-transparent skew-x-12"
			animate={{ x: ['-100%', '200%'] }}
			transition={{
				duration: 3,
				repeat: Infinity,
				repeatDelay: 2,
				delay: index * 0.1,
				ease: 'easeInOut',
			}}
		/>

		{/* Top accent line skeleton */}
		<motion.div
			className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600/20 to-blue-600/20"
			animate={{ opacity: [0.3, 0.7, 0.3] }}
			transition={{ duration: 2, repeat: Infinity, delay: index * 0.05 }}
		/>

		{/* Profile image skeleton */}
		<div className="flex justify-center mb-5">
			<motion.div
				className={`${isLeader ? 'w-24 h-24' : 'w-20 h-20'} rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 
                    relative overflow-hidden border-3 border-slate-600/20`}
				animate={{
					scale: [1, 1.05, 1],
					borderColor: [
						'rgba(71, 85, 105, 0.2)',
						'rgba(99, 102, 241, 0.3)',
						'rgba(71, 85, 105, 0.2)',
					],
				}}
				transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
			>
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
					animate={{ rotate: [0, 360] }}
					transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
				/>
			</motion.div>
		</div>

		{/* Name skeleton */}
		<div className="flex justify-center mb-4">
			<motion.div
				className={`h-5 ${isLeader ? 'w-36' : 'w-32'} bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-lg`}
				animate={{
					opacity: [0.5, 0.8, 0.5],
					scaleX: [1, 1.05, 1],
				}}
				transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
			/>
		</div>

		{/* Info card skeleton */}
		<div className="p-4 rounded-xl bg-white/5 mb-4 flex-1 space-y-3">
			{/* Designation skeleton */}
			<div className="flex items-center">
				<motion.div
					className="w-6 h-6 bg-blue-600/20 rounded-lg mr-3 flex-shrink-0"
					animate={{
						scale: [1, 1.1, 1],
						backgroundColor: [
							'rgba(37, 99, 235, 0.2)',
							'rgba(37, 99, 235, 0.4)',
							'rgba(37, 99, 235, 0.2)',
						],
					}}
					transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
				/>
				<motion.div
					className="h-4 w-24 bg-blue-600/20 rounded-md"
					animate={{
						opacity: [0.4, 0.7, 0.4],
						scaleX: [1, 1.1, 1],
					}}
					transition={{ duration: 1.8, repeat: Infinity, delay: index * 0.2 }}
				/>
			</div>

			{/* Department skeleton */}
			<div className="flex items-center">
				<motion.div
					className="w-6 h-6 bg-indigo-600/20 rounded-lg mr-3 flex-shrink-0"
					animate={{
						scale: [1, 1.1, 1],
						backgroundColor: [
							'rgba(99, 102, 241, 0.2)',
							'rgba(99, 102, 241, 0.4)',
							'rgba(99, 102, 241, 0.2)',
						],
					}}
					transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
				/>
				<motion.div
					className="h-4 w-20 bg-indigo-600/20 rounded-md"
					animate={{
						opacity: [0.4, 0.7, 0.4],
						scaleX: [1, 1.1, 1],
					}}
					transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.25 }}
				/>
			</div>
		</div>

		{/* Button skeleton */}
		<motion.div
			className="h-12 w-full bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-xl"
			animate={{
				opacity: [0.4, 0.6, 0.4],
				scale: [1, 1.02, 1],
				backgroundColor: [
					'rgba(99, 102, 241, 0.2)',
					'rgba(99, 102, 241, 0.3)',
					'rgba(99, 102, 241, 0.2)',
				],
			}}
			transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
		/>

		{/* Corner decorations */}
		<div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-indigo-500/10 to-transparent opacity-50"></div>
		<div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-50"></div>
	</motion.div>
);

export default TeamSkeleton;

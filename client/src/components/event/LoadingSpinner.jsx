import { motion } from 'framer-motion';

const LoadingSpinner = () => {
	return (
		<div className="flex flex-col items-center justify-center py-20">
			<div className="relative">
				{/* Outer ring */}
				<motion.div
					className="w-16 h-16 border-4 border-blue-500/20 rounded-full"
					animate={{ rotate: 360 }}
					transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
				/>

				{/* Inner spinning ring */}
				<motion.div
					className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full border-t-blue-400"
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
				/>

				{/* Center dot */}
				<motion.div
					className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
					animate={{ scale: [1, 1.5, 1] }}
					transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
				/>
			</div>

			<motion.p
				className="mt-6 text-blue-200 font-medium"
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
			>
				Loading events...
			</motion.p>

			{/* Loading dots */}
			<div className="flex gap-1 mt-2">
				{[0, 1, 2].map((i) => (
					<motion.div
						key={i}
						className="w-1 h-1 bg-blue-400 rounded-full"
						animate={{ opacity: [0.3, 1, 0.3] }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut',
							delay: i * 0.2,
						}}
					/>
				))}
			</div>
		</div>
	);
};

export default LoadingSpinner;

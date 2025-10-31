import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

const Hero = () => {
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();

	const quotes = [
		'Start small. Ship often. Grow together.',
		'Design bravely. Build kindly.',
		'Real learning happens when you ship.',
		'Ideas are drafts—shipping is the edit.',
		'Make. Share. Iterate.',
	];
	const [qIndex, setQIndex] = useState(0);

	useEffect(() => {
		const t = setInterval(() => setQIndex((p) => (p + 1) % quotes.length), 4500);
		return () => clearInterval(t);
	}, []);

	return (
		<section className="relative min-h-[85vh] md:min-h-screen px-4 py-24 md:py-32 flex items-center bg-transparent">
			{/* Floating particles */}
			{!prefersReducedMotion &&
				Array.from({ length: 6 }).map((_, i) => (
					<motion.div
						key={i}
						className="pointer-events-none absolute w-1.5 h-1.5 rounded-full bg-brand-1/30"
						style={{
							top: `${(i * 17 + 10) % 80}%`,
							left: `${(i * 29 + 15) % 85}%`,
						}}
						animate={{
							y: [0, -12, 0],
							opacity: [0.3, 0.7, 0.3],
							scale: [1, 1.2, 1],
						}}
						transition={{
							duration: 4 + (i % 2),
							repeat: Infinity,
							delay: i * 0.3,
							ease: 'easeInOut',
						}}
					/>
				))}

			<div className="relative z-10 w-full max-w-6xl mx-auto text-center">
				{/* Badge */}
				<motion.div
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="mb-8 inline-flex"
				>
					<div className="glass-card px-5 py-2.5 inline-flex items-center gap-2 text-sm">
						<Sparkles className="w-4 h-4 text-brand-2" />
						<span className="text-secondary font-medium">Build. Learn. Grow.</span>
					</div>
				</motion.div>

				{/* Main heading */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.1 }}
					className="mb-6"
				>
					<h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight brand-text leading-tight">
						SYNTAX
					</h1>
					<p className="mt-4 text-xl sm:text-2xl md:text-3xl text-muted font-display font-medium tracking-wide">
						Create • Collaborate • Ship
					</p>
				</motion.div>

				{/* Subheading */}
				<motion.p
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.2 }}
					className="text-lg sm:text-xl md:text-2xl text-secondary font-body max-w-3xl mx-auto mb-12 leading-relaxed"
				>
					A multidisciplinary community where builders turn ideas into impact through
					hands-on projects and mentorship.
				</motion.p>

				{/* CTAs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, delay: 0.3 }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
				>
					<motion.button
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						onClick={() => navigate('/event')}
						className="btn-primary group inline-flex items-center gap-2"
					>
						<span>Explore Events</span>
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.97 }}
						onClick={() => navigate('/auth', { state: { tab: 'register' } })}
						className="btn-secondary"
					>
						Join Syntax
					</motion.button>
				</motion.div>

				{/* Stats */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
					className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted mb-10"
				>
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 rounded-full bg-brand-1 animate-pulse-soft" />
						<span>200+ members</span>
					</div>
					<div className="flex items-center gap-2">
						<div
							className="w-2 h-2 rounded-full bg-brand-2 animate-pulse-soft"
							style={{ animationDelay: '1s' }}
						/>
						<span>60+ projects</span>
					</div>
					<div className="flex items-center gap-2">
						<div
							className="w-2 h-2 rounded-full bg-brand-3 animate-pulse-soft"
							style={{ animationDelay: '2s' }}
						/>
						<span>15+ pods</span>
					</div>
				</motion.div>

				{/* Rotating quote */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="flex justify-center"
				>
					<div className="glass-card px-6 py-3 max-w-md">
						<div className="relative h-6 overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.p
									key={qIndex}
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -20, opacity: 0 }}
									transition={{ duration: 0.4 }}
									className="text-sm text-secondary font-medium italic text-center"
								>
									"{quotes[qIndex]}"
								</motion.p>
							</AnimatePresence>
						</div>
					</div>
				</motion.div>

				{/* Scroll indicator */}
				<motion.div
					className="mt-16 md:mt-20 flex justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.7 }}
				>
					<div className="h-12 w-7 rounded-full border border-glass-border flex items-start justify-center p-2">
						<motion.div
							className="h-2.5 w-2.5 rounded-full bg-brand-1"
							animate={
								prefersReducedMotion
									? {}
									: {
											y: [0, 20, 0],
											opacity: [0.8, 0.3, 0.8],
									  }
							}
							transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Hero;

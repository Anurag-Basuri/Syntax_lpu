import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Quote } from 'lucide-react';

const Hero = () => {
	const navigate = useNavigate();
	const prefersReducedMotion = useReducedMotion();
	const dots = Array.from({ length: 8 });

	// Rotating micro-quotes
	const quotes = [
		'Start small. Ship often. Grow together.',
		'Design bravely. Build kindly.',
		'Real learning happens when you ship.',
		'Ideas are drafts—shipping is the edit.',
		'Make. Share. Iterate.',
	];
	const [qIndex, setQIndex] = useState(0);

	useEffect(() => {
		const t = setInterval(() => setQIndex((p) => (p + 1) % quotes.length), 4200);
		return () => clearInterval(t);
	}, []);

	return (
		<section className="relative min-h-[78vh] md:min-h-screen px-4 py-20 md:py-24 flex items-center bg-transparent">
			{/* Lightweight particles (respect reduced motion) */}
			{dots.map((_, i) => (
				<motion.span
					key={i}
					className="pointer-events-none absolute w-1 h-1 rounded-full bg-indigo-300/20"
					style={{ top: `${(i * 13 + 7) % 90}%`, left: `${(i * 23 + 11) % 90}%` }}
					animate={
						prefersReducedMotion
							? { opacity: 0.35 }
							: { y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }
					}
					transition={{
						duration: 3 + (i % 3),
						repeat: Infinity,
						delay: i * 0.2,
						ease: 'easeInOut',
					}}
				/>
			))}

			<div className="relative z-[1] w-full max-w-6xl mx-auto text-center">
				{/* Soft halo behind heading */}
				<div
					className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full opacity-10 blur-3xl hidden md:block"
					style={{
						background:
							'radial-gradient(40% 40% at 50% 50%, rgba(99,102,241,0.45) 0%, rgba(99,102,241,0.0) 60%)',
					}}
				/>

				{/* Main heading */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className="mb-4 md:mb-5"
				>
					<h1 className="text-display-lg font-brand brand-text tracking-tight drop-shadow-[0_0_30px_rgba(99,102,241,0.18)]">
						SYNTAX
					</h1>
				</motion.div>

				{/* Subtle orbit arcs around title (themed stops) */}
				<motion.div
					className="relative mx-auto mb-6 md:mb-8 h-8 w-[80%] max-w-[560px]"
					aria-hidden="true"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.15 }}
				>
					<motion.svg
						viewBox="0 0 600 80"
						className="absolute inset-0 w-full h-full"
						animate={prefersReducedMotion ? {} : { rotate: [0, 2, -2, 0] }}
						transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
					>
						<defs>
							<linearGradient id="orbit-a" x1="0" x2="1" y1="0" y2="0">
								<stop offset="0%" style={{ stopColor: 'var(--brand-1)' }} />
								<stop offset="50%" style={{ stopColor: 'var(--brand-2)' }} />
								<stop offset="100%" style={{ stopColor: 'var(--brand-3)' }} />
							</linearGradient>
							<linearGradient id="orbit-b" x1="1" x2="0" y1="0" y2="0">
								<stop offset="0%" style={{ stopColor: 'var(--brand-3)' }} />
								<stop offset="50%" style={{ stopColor: 'var(--brand-2)' }} />
								<stop offset="100%" style={{ stopColor: 'var(--brand-1)' }} />
							</linearGradient>
						</defs>
						<motion.path
							d="M10,60 C200,10 400,110 590,30"
							fill="none"
							stroke="url(#orbit-a)"
							strokeWidth="2"
							strokeLinecap="round"
							strokeDasharray="8 12"
							animate={prefersReducedMotion ? {} : { strokeDashoffset: [0, 100, 0] }}
							transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
							opacity="0.9"
						/>
						<motion.path
							d="M10,50 C220,0 380,120 590,40"
							fill="none"
							stroke="url(#orbit-b)"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeDasharray="6 10"
							animate={prefersReducedMotion ? {} : { strokeDashoffset: [60, 0, 60] }}
							transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
							opacity="0.6"
						/>
					</motion.svg>
				</motion.div>

				{/* Curved, italic accent line (theme text) */}
				<motion.p
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
					className="font-accent italic-soft text-xl md:text-2xl text-primary -rotate-[1.2deg] mb-6 md:mb-8 opacity-90"
				>
					Create • Collaborate • Ship
				</motion.p>

				{/* Swoosh (themed stops) */}
				<motion.svg
					viewBox="0 0 600 80"
					className="mx-auto mb-10 md:mb-14 w-[82%] max-w-[620px] h-10"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<defs>
						<linearGradient id="hero-swoosh" x1="0" x2="1" y1="0" y2="0">
							<stop offset="0%" style={{ stopColor: 'var(--brand-1)' }} />
							<stop offset="50%" style={{ stopColor: 'var(--brand-2)' }} />
							<stop offset="100%" style={{ stopColor: 'var(--brand-3)' }} />
						</linearGradient>
					</defs>
					<motion.path
						d="M10,60 C150,10 450,110 590,30"
						fill="none"
						stroke="url(#hero-swoosh)"
						strokeWidth="3"
						strokeLinecap="round"
						strokeDasharray="640"
						strokeDashoffset="640"
						animate={prefersReducedMotion ? {} : { strokeDashoffset: [640, 0] }}
						transition={{ duration: 1.6, ease: 'easeInOut' }}
					/>
				</motion.svg>

				{/* Supporting copy (theme text) */}
				<motion.p
					initial={{ opacity: 0, y: 15 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
					className="text-lg md:text-xl text-secondary font-body max-w-2xl mx-auto mb-10 md:mb-14 leading-relaxed"
				>
					A multidisciplinary community where builders turn ideas into impact.
				</motion.p>

				{/* CTAs */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.22, ease: 'easeOut' }}
					className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
				>
					<motion.button
						whileHover={{ scale: 1.05, y: -2 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => navigate('/event')}
						className="w-full sm:w-auto btn-primary"
						aria-label="Explore Events"
					>
						Explore Events
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.05, y: -2 }}
						whileTap={{ scale: 0.98 }}
						onClick={() => navigate('/auth', { state: { tab: 'register' } })}
						className="w-full sm:w-auto btn-secondary"
						aria-label="Join Syntax"
					>
						Join Syntax
					</motion.button>
				</motion.div>

				{/* Trust line */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.35, duration: 0.5 }}
					className="mt-4 text-slate-400 text-sm"
				>
					<span>200+ members • 60+ projects • 15+ pods</span>
				</motion.div>

				{/* Rotating micro‑quotes */}
				<div className="mt-8 md:mt-10 flex justify-center">
					<div className="hero-quote inline-flex items-center gap-2 px-4 py-2">
						<Quote className="w-4 h-4 text-purple-300/80" />
						<div className="relative h-5 overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.span
									key={qIndex}
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -20, opacity: 0 }}
									transition={{ duration: 0.35, ease: 'easeOut' }}
									className="text-slate-200 text-sm font-accent italic-soft whitespace-nowrap"
								>
									{quotes[qIndex]}
								</motion.span>
							</AnimatePresence>
						</div>
					</div>
				</div>

				{/* Scroll indicator border uses themed border */}
				<motion.div
					className="mt-12 md:mt-16 flex justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<div
						className="h-10 w-6 rounded-full flex items-start justify-center p-1"
						style={{ border: `1px solid var(--glass-border)` }}
					>
						<motion.div
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: 'var(--text-secondary)' }}
							animate={
								prefersReducedMotion
									? {}
									: { y: [0, 16, 0], opacity: [0.8, 0.3, 0.8] }
							}
							transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
						/>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Hero;

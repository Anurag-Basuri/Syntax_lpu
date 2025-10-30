import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Quote } from 'lucide-react';

const testimonials = [
	{
		quote: 'Syntax gave me the confidence to lead a project from scratch. The mentorship and collaboration are unmatched.',
		name: 'Alex Johnson',
		role: 'Project Lead',
		avatar: 'https://i.pravatar.cc/150?img=1',
	},
	{
		quote: "I've learned more shipping with peers than from any course. The feedback loops are fast and kind.",
		name: 'Samantha Lee',
		role: 'Frontend Engineer',
		avatar: 'https://i.pravatar.cc/150?img=2',
	},
	{
		quote: 'Everyone shares knowledge. You always have support when you try something new.',
		name: 'Michael Chen',
		role: 'Cloud Enthusiast',
		avatar: 'https://i.pravatar.cc/150?img=3',
	},
	{
		quote: 'From zero to a full-stack app—this community showed me how to build and iterate.',
		name: 'Jessica Rodriguez',
		role: 'Full‑Stack Developer',
		avatar: 'https://i.pravatar.cc/150?img=4',
	},
];

const Testimonials = () => {
	const [current, setCurrent] = useState(0);
	const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

	useEffect(() => {
		const t = setInterval(
			() => setCurrent((p) => (p === testimonials.length - 1 ? 0 : p + 1)),
			5000
		);
		return () => clearInterval(t);
	}, []);

	const variants = {
		enter: (d) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
		center: { zIndex: 1, x: 0, opacity: 1 },
		exit: (d) => ({ zIndex: 0, x: d < 0 ? 100 : -100, opacity: 0 }),
	};

	return (
		<section ref={ref} className="section-container py-loose relative z-10 overflow-hidden">
			{/* Background elements - subtle and transparent */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl animate-glow-pulse" />
				<div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-600/5 rounded-full blur-3xl animate-glow-pulse" />
			</div>

			<div className="max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-display-md text-heading mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
						Member Spotlights
					</h2>
					<p className="text-body text-slate-300 max-w-2xl mx-auto">
						Stories from members who build, learn, and lead together.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={inView ? { opacity: 1, scale: 1 } : {}}
					transition={{ duration: 0.7, delay: 0.2 }}
					className="glass-card p-8 md:p-12 min-h-[380px] flex flex-col justify-center items-center overflow-hidden"
				>
					<Quote className="absolute top-8 left-8 w-12 h-12 text-purple-500/25" />
					<AnimatePresence initial={false} custom={1}>
						<motion.div
							key={current}
							custom={1}
							variants={variants}
							initial="enter"
							animate="center"
							exit="exit"
							transition={{
								x: { type: 'spring', stiffness: 300, damping: 30 },
								opacity: { duration: 0.2 },
							}}
							className="w-full text-center"
						>
							<p className="text-lg md:text-xl text-body text-slate-100 leading-relaxed mb-10 max-w-3xl mx-auto font-light">
								"{testimonials[current].quote}"
							</p>
							<div className="flex items-center justify-center gap-4">
								<img
									src={testimonials[current].avatar}
									alt={testimonials[current].name}
									className="w-14 h-14 rounded-full border-2 border-indigo-400/40 object-cover"
								/>
								<div className="text-left">
									<h4 className="text-base font-semibold text-white">
										{testimonials[current].name}
									</h4>
									<p className="text-sm text-slate-400">
										{testimonials[current].role}
									</p>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
					<div className="absolute bottom-8 flex gap-2">
						{testimonials.map((_, i) => (
							<button
								key={i}
								onClick={() => setCurrent(i)}
								className={`rounded-full transition-all duration-300 ${
									current === i
										? 'bg-indigo-400 w-6 h-2.5'
										: 'bg-slate-500/40 w-2.5 h-2.5'
								}`}
								aria-label={`Go to testimonial ${i + 1}`}
							/>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default Testimonials;

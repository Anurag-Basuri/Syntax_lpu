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
		<section ref={ref} className="py-24 px-4 relative z-10 overflow-hidden">
			{/* Background elements */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/30 backdrop-blur-2xl" />
				<div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse-slow" />
				<div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
			</div>

			<div className="max-w-4xl mx-auto">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent tracking-tight">
						Member Spotlights
					</h2>
					<p className="text-xl text-purple-200 max-w-2xl mx-auto">
						Stories from members who build, learn, and lead together.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={inView ? { opacity: 1, scale: 1 } : {}}
					transition={{ duration: 0.7, delay: 0.2 }}
					className="relative bg-gradient-to-br from-indigo-900/30 to-purple-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 min-h-[350px] flex flex-col justify-center items-center overflow-hidden"
				>
					<Quote className="absolute top-6 left-6 w-16 h-16 text-purple-600/30" />
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
							<p className="text-xl md:text-2xl font-light text-white leading-relaxed mb-8 max-w-3xl mx-auto">
								"{testimonials[current].quote}"
							</p>
							<div className="flex items-center justify-center gap-4">
								<img
									src={testimonials[current].avatar}
									alt={testimonials[current].name}
									className="w-14 h-14 rounded-full border-2 border-purple-400/50 object-cover"
								/>
								<div>
									<h4 className="text-lg font-bold text-white">
										{testimonials[current].name}
									</h4>
									<p className="text-purple-300">{testimonials[current].role}</p>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>
					<div className="absolute bottom-6 flex gap-2">
						{testimonials.map((_, i) => (
							<button
								key={i}
								onClick={() => setCurrent(i)}
								className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
									current === i ? 'bg-purple-400 w-6' : 'bg-white/30'
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

import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Flame, Compass, HeartHandshake, Quote } from 'lucide-react';

const container = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AboutSyntax = () => {
	return (
		<section className="py-20 md:py-24 px-4 bg-transparent relative overflow-hidden">
			{/* soft background accents */}
			<div className="absolute inset-0 pointer-events-none -z-10">
				<div className="absolute -top-10 -left-16 w-64 h-64 bg-indigo-600/10 blur-3xl rounded-full" />
				<div className="absolute bottom-0 right-[-40px] w-72 h-72 bg-purple-600/10 blur-3xl rounded-full" />
			</div>

			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 12 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-12"
				>
					<span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-200 text-xs sm:text-sm backdrop-blur-md">
						<Users2 className="w-4 h-4" />
						People • Projects • Progress
					</span>
					<h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
						About Syntax
					</h2>
					<p className="mt-4 text-indigo-200/90 max-w-3xl mx-auto text-sm sm:text-base">
						A creative space where builders meet, learn in public, and turn ideas into
						momentum.
					</p>
				</motion.div>

				{/* The Spark + How We Work */}
				<motion.div
					variants={container}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.25 }}
					className="grid grid-cols-1 lg:grid-cols-2 gap-6"
				>
					<motion.div
						variants={item}
						className="relative bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl overflow-hidden"
					>
						<div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-500/10 blur-2xl" />
						<div className="flex items-center gap-3 mb-4">
							<Flame className="w-5 h-5 text-cyan-300" />
							<h3 className="text-2xl font-bold text-white">The Spark</h3>
						</div>
						<p className="text-indigo-100/90 text-sm sm:text-base">
							Started with a simple belief: learning accelerates when you build with
							others. Syntax is a home for doers—shaped by experiments, feedback, and
							consistent shipping.
						</p>
					</motion.div>

					<motion.div
						variants={item}
						className="relative bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl overflow-hidden"
					>
						<div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-purple-500/10 blur-2xl" />
						<div className="flex items-center gap-3 mb-4">
							<Compass className="w-5 h-5 text-purple-300" />
							<h3 className="text-2xl font-bold text-white">How We Work</h3>
						</div>
						<ul className="list-disc pl-5 space-y-2 text-indigo-100 text-sm sm:text-base">
							<li>Small pods build focused features and products.</li>
							<li>Guilds share craft across tracks like web, AI, cloud, design.</li>
							<li>Weekly demos keep the loop tight and transparent.</li>
						</ul>
					</motion.div>
				</motion.div>

				{/* Principles */}
				<motion.div
					variants={container}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.25 }}
					className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
				>
					<motion.div
						variants={item}
						className="bg-gradient-to-br from-blue-900/25 to-indigo-900/20 border border-white/10 rounded-2xl p-6 md:p-7 backdrop-blur-xl hover:border-white/20 transition-colors"
					>
						<div className="flex items-center gap-3 mb-3">
							<HeartHandshake className="w-5 h-5 text-cyan-300" />
							<h3 className="text-xl font-semibold text-white">Kind + Candid</h3>
						</div>
						<p className="text-indigo-100 text-sm sm:text-base">
							We give honest feedback and help each other level up.
						</p>
					</motion.div>
					<motion.div
						variants={item}
						className="bg-gradient-to-br from-indigo-900/25 to-purple-900/20 border border-white/10 rounded-2xl p-6 md:p-7 backdrop-blur-xl hover:border-white/20 transition-colors"
					>
						<div className="flex items-center gap-3 mb-3">
							<Compass className="w-5 h-5 text-amber-300" />
							<h3 className="text-xl font-semibold text-white">Build > Talk</h3>
						</div>
						<p className="text-indigo-100 text-sm sm:text-base">
							Prototype early, iterate often, learn in public.
						</p>
					</motion.div>
					<motion.div
						variants={item}
						className="bg-gradient-to-br from-purple-900/25 to-pink-900/20 border border-white/10 rounded-2xl p-6 md:p-7 backdrop-blur-xl hover:border-white/20 transition-colors"
					>
						<div className="flex items-center gap-3 mb-3">
							<Users2 className="w-5 h-5 text-pink-300" />
							<h3 className="text-xl font-semibold text-white">Everyone Ships</h3>
						</div>
						<p className="text-indigo-100 text-sm sm:text-base">
							Roles are fluid; contribution is what counts.
						</p>
					</motion.div>
				</motion.div>

				{/* Quote */}
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6 }}
					className="mt-10 md:mt-12"
				>
					<div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6 text-center">
						<Quote className="w-6 h-6 text-purple-300/70 mx-auto mb-2" />
						<p className="text-sm sm:text-base text-indigo-100 italic">
							“Start small. Ship often. Grow together.”
						</p>
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default AboutSyntax;

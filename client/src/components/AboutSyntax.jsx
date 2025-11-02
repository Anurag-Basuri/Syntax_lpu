import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Flame, Compass, HeartHandshake, Zap, BrainCircuit } from 'lucide-react';

const container = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const item = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const AboutSyntax = () => {
	return (
		<section className="section-padding page-container">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 15 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.3 }}
				transition={{ duration: 0.6 }}
				className="text-center mb-16"
			>
				<div className="hero-badge inline-flex items-center gap-2 mb-6">
					<Users2 className="w-4 h-4 text-accent-2" />
					<span className="font-medium">The Syntax Philosophy</span>
				</div>
				<h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-primary mb-4">
					A place to build, learn, and <span className="brand-text">grow</span>.
				</h2>
				<p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
					Syntax is a creative space where builders meet, learn in public, and turn ideas
					into momentum. We are a community of doers, driven by curiosity and a passion
					for shipping great work.
				</p>
			</motion.div>

			{/* Core Principles */}
			<motion.div
				variants={container}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				className="grid grid-cols-1 md:grid-cols-3 gap-6"
			>
				{[
					{
						icon: HeartHandshake,
						title: 'Community First',
						desc: 'We give honest feedback, share knowledge, and help each other level up. Success is a team sport.',
					},
					{
						icon: Zap,
						title: 'Bias for Action',
						desc: 'We believe in prototyping early, iterating often, and learning in public. Build more, talk less.',
					},
					{
						icon: BrainCircuit,
						title: 'Own Your Craft',
						desc: 'Roles are fluid; contribution is what counts. We encourage taking ownership and shipping with pride.',
					},
				].map((P, idx) => (
					<motion.div
						key={idx}
						variants={item}
						className="glass-card p-8 text-center hover-lift"
					>
						<div
							className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
							style={{
								background:
									'linear-gradient(135deg, color-mix(in srgb, var(--accent-1) 18%, transparent), color-mix(in srgb, var(--accent-2) 18%, transparent))',
							}}
						>
							<P.icon className="w-7 h-7 text-accent-1" />
						</div>
						<h3 className="text-xl font-display font-semibold text-primary mb-2">
							{P.title}
						</h3>
						<p className="text-secondary text-sm leading-relaxed">{P.desc}</p>
					</motion.div>
				))}
			</motion.div>
		</section>
	);
};

export default AboutSyntax;

import React from 'react';
import { motion } from 'framer-motion';
import { Users2, Flame, Compass, HeartHandshake, Zap } from 'lucide-react';

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
		<section className="section-container py-loose px-4 bg-transparent relative overflow-hidden">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 15 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<div className="glass-card inline-flex items-center gap-2 px-4 py-2 mb-6">
						<Users2 className="w-4 h-4" style={{ color: 'var(--accent-2)' }} />
						<span className="text-sm text-secondary font-medium">About Us</span>
					</div>
					<h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-primary mb-4">
						What is <span className="brand-text">Syntax</span>?
					</h2>
					<p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
						A creative space where builders meet, learn in public, and turn ideas into
						momentum.
					</p>
				</motion.div>

				{/* Core Cards */}
				<motion.div
					variants={container}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
				>
					<motion.div variants={item} className="glass-card p-8 hover-lift">
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-12 h-12 rounded-2xl flex items-center justify-center"
								style={{
									background:
										'linear-gradient(135deg, color-mix(in srgb, var(--accent-1) 20%, transparent), color-mix(in srgb, var(--accent-2) 20%, transparent))',
								}}
							>
								<Flame className="w-6 h-6" style={{ color: 'var(--accent-2)' }} />
							</div>
							<h3 className="text-2xl font-display font-bold text-primary">
								The Spark
							</h3>
						</div>
						<p className="text-secondary leading-relaxed">
							Started with a simple belief: learning accelerates when you build with
							others. Syntax is a home for doers—shaped by experiments, feedback, and
							consistent shipping.
						</p>
					</motion.div>

					<motion.div variants={item} className="glass-card p-8 hover-lift">
						<div className="flex items-center gap-3 mb-4">
							<div
								className="w-12 h-12 rounded-2xl flex items-center justify-center"
								style={{
									background:
										'linear-gradient(135deg, color-mix(in srgb, var(--accent-2) 20%, transparent), color-mix(in srgb, var(--accent-1) 20%, transparent))',
								}}
							>
								<Compass className="w-6 h-6" style={{ color: 'var(--accent-1)' }} />
							</div>
							<h3 className="text-2xl font-display font-bold text-primary">
								How We Work
							</h3>
						</div>
						<ul className="space-y-3 text-secondary">
							<li className="flex items-start gap-2">
								<Zap
									className="w-5 h-5 flex-shrink-0 mt-0.5"
									style={{ color: 'var(--accent-1)' }}
								/>
								<span>Small pods build focused features and products</span>
							</li>
							<li className="flex items-start gap-2">
								<Zap
									className="w-5 h-5 flex-shrink-0 mt-0.5"
									style={{ color: 'var(--accent-2)' }}
								/>
								<span>Guilds share craft across web, AI, cloud, design</span>
							</li>
							<li className="flex items-start gap-2">
								<Zap
									className="w-5 h-5 flex-shrink-0 mt-0.5"
									style={{ color: 'var(--accent-1)' }}
								/>
								<span>Weekly demos keep the loop tight and transparent</span>
							</li>
						</ul>
					</motion.div>
				</motion.div>

				{/* Principles */}
				<motion.div
					variants={container}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.2 }}
					className="grid grid-cols-1 md:grid-cols-3 gap-5"
				>
					{[
						{
							icon: HeartHandshake,
							title: 'Kind + Candid',
							desc: 'We give honest feedback and help each other level up.',
						},
						{
							icon: Zap,
							title: 'Build > Talk',
							desc: 'Prototype early, iterate often, learn in public.',
						},
						{
							icon: Users2,
							title: 'Everyone Ships',
							desc: 'Roles are fluid; contribution is what counts.',
						},
					].map((P, idx) => (
						<motion.div
							key={idx}
							variants={item}
							className="glass-card p-6 text-center hover-lift"
						>
							<div
								className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
								style={{
									background:
										'linear-gradient(135deg, color-mix(in srgb, var(--accent-1) 18%, transparent), color-mix(in srgb, var(--accent-2) 18%, transparent))',
								}}
							>
								<P.icon className="w-7 h-7" style={{ color: 'var(--accent-1)' }} />
							</div>
							<h3 className="text-xl font-display font-semibold text-primary mb-2">
								{P.title}
							</h3>
							<p className="text-secondary text-sm leading-relaxed">{P.desc}</p>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default AboutSyntax;

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Lightbulb, Users, Zap } from 'lucide-react';

const AboutSyntax = () => {
	const culture = [
		{
			icon: Lightbulb,
			title: 'Creativity',
			desc: 'We encourage new ideas and innovative thinking to solve real problems.',
		},
		{
			icon: BrainCircuit,
			title: 'Curiosity',
			desc: 'A desire to learn, explore, and question is at the heart of everything we do.',
		},
		{
			icon: Zap,
			title: 'Leadership',
			desc: 'We empower students to take initiative, lead projects, and inspire others.',
		},
		{
			icon: Users,
			title: 'Collaboration',
			desc: 'We believe the best work comes from diverse teams working together.',
		},
	];

	return (
		<section className="section-padding page-container">
			{/* Main "What is Syntax?" Section */}
			<div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center mb-24">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.7 }}
					className="lg:col-span-2"
				>
					<h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-primary mb-4">
						What is <span className="brand-text">Syntax?</span>
					</h2>
				</motion.div>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, amount: 0.3 }}
					transition={{ duration: 0.7, delay: 0.1 }}
					className="lg:col-span-3"
				>
					<p className="text-lg sm:text-xl text-secondary leading-relaxed">
						Syntax is a dynamic student organization at Lovely Professional University
						focused on innovation, leadership, and collaborative learning. We bridge
						academics with real-world execution by providing a platform to work on
						impactful projects, develop essential skills, and network with like-minded
						peers.
					</p>
				</motion.div>
			</div>

			{/* Culture Section */}
			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.2 }}
				variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
			>
				{culture.map((item) => (
					<motion.div
						key={item.title}
						variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
						className="glass-card p-6 text-center hover-lift"
					>
						<div className="culture-icon-wrapper">
							<item.icon className="w-6 h-6 text-accent-1" />
						</div>
						<h3 className="text-xl font-display font-semibold text-primary mb-2">
							{item.title}
						</h3>
						<p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
					</motion.div>
				))}
			</motion.div>

			{/* Vision & Mission Section */}
			<motion.div
				initial={{ opacity: 0, scale: 0.95 }}
				whileInView={{ opacity: 1, scale: 1 }}
				viewport={{ once: true, amount: 0.5 }}
				transition={{ duration: 0.7 }}
				className="vision-mission-card"
			>
				<div className="text-center">
					<h3 className="text-2xl font-bold text-primary mb-2">Our Vision</h3>
					<p className="text-lg text-secondary max-w-3xl mx-auto">
						To build one of the most impactful student communities in India — where
						students learn by doing, grow through collaboration, and lead with
						confidence.
					</p>
					<div className="vision-mission-divider" />
					<h3 className="text-2xl font-bold text-primary mb-2">Our Mission</h3>
					<p className="text-lg brand-text font-semibold">
						Empower students to turn ideas into action.
					</p>
				</div>
			</motion.div>
		</section>
	);
};

export default AboutSyntax;

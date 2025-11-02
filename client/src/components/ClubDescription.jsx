import React from 'react';
import { motion } from 'framer-motion';
import { Code, BrainCircuit, Zap, Users, Award, Briefcase } from 'lucide-react';

const ClubDescription = () => {
	const offerings = [
		{
			icon: Code,
			title: 'Skill Development',
			desc: 'Engage in tech, management, creative & research-based learning.',
		},
		{
			icon: BrainCircuit,
			title: 'Hands-On Projects',
			desc: 'Build real products, websites, and impactful tech solutions.',
		},
		{
			icon: Zap,
			title: 'Event Execution',
			desc: 'Plan and run university events, workshops, and competitions.',
		},
		{
			icon: Users,
			title: 'Leadership Roles',
			desc: 'Lead teams, departments, and initiatives with real responsibility.',
		},
		{
			icon: Briefcase,
			title: 'Networking',
			desc: 'Connect with mentors, alumni, and distinguished industry guests.',
		},
		{
			icon: Award,
			title: 'Recognition',
			desc: 'Earn certificates and build a portfolio of achievements.',
		},
	];

	return (
		<section className="section-padding page-container">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, amount: 0.2 }}
				transition={{ duration: 0.7 }}
				className="text-center mb-16"
			>
				<h2 className="text-4xl sm:text-5xl font-display font-bold tracking-tight text-primary mb-4">
					Where Students Become <span className="brand-text">Creators</span>
				</h2>
				<p className="text-lg sm:text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
					At Syntax, you don’t just join a club — you become part of an ecosystem that
					supports learning by doing.
				</p>
			</motion.div>

			<motion.div
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, amount: 0.1 }}
				variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
			>
				{offerings.map((item) => (
					<motion.div
						key={item.title}
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0 },
						}}
						className="offering-card"
					>
						<div className="offering-icon-wrapper">
							<item.icon className="w-6 h-6 text-accent-1" />
						</div>
						<div>
							<h3 className="text-xl font-display font-semibold text-primary mb-2">
								{item.title}
							</h3>
							<p className="text-secondary text-sm leading-relaxed">{item.desc}</p>
						</div>
					</motion.div>
				))}
			</motion.div>
		</section>
	);
};

export default ClubDescription;

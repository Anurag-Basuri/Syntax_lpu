import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ClubDescription = () => {
	const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
	};
	const itemVariants = {
		hidden: { opacity: 0, y: 30 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring', damping: 12 } },
	};
	const statVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.6, type: 'spring', stiffness: 300 },
		},
	};

	return (
		<section className="py-24 px-4 relative z-10 overflow-hidden">
			{/* Decorative floating elements */}
			<motion.div
				className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-indigo-600/10 blur-3xl -z-10"
				animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
				transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
			/>
			<motion.div
				className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-purple-600/10 blur-3xl -z-10"
				animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
				transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
			/>

			<div className="max-w-7xl mx-auto">
				<motion.div
					ref={ref}
					variants={containerVariants}
					initial="hidden"
					animate={inView ? 'visible' : 'hidden'}
					className="grid grid-cols-1 lg:grid-cols-2 gap-10"
				>
					{/* Who We Are */}
					<motion.div variants={itemVariants} className="relative group">
						<div className="bg-gradient-to-br from-blue-900/20 to-indigo-900/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 h-full shadow-2xl shadow-blue-900/20 overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:shadow-blue-900/40">
							<div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-bl-full backdrop-blur-sm transition-all duration-300 group-hover:scale-125" />
							<div className="relative z-10">
								<h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent mb-6">
									Who We Are
								</h2>
								<div className="space-y-4">
									<p className="text-base md:text-lg text-blue-100 leading-relaxed">
										Syntax is a collective of makers—developers, designers,
										product thinkers—who learn by building and grow by shipping.
									</p>
									<p className="text-base md:text-lg text-blue-100 leading-relaxed">
										We create a runway for ideas to become projects, projects to
										become experiences, and experiences to become impact.
									</p>
								</div>
								<div className="mt-8 grid grid-cols-3 gap-4">
									{[
										{ value: '200+', label: 'Members' },
										{ value: '50+', label: 'Projects' },
										{ value: '12+', label: 'Domains' },
									].map((stat, index) => (
										<motion.div
											key={index}
											variants={statVariants}
											className="text-center bg-blue-900/30 backdrop-blur-sm py-4 rounded-xl border border-white/10"
										>
											<div className="text-2xl font-bold text-cyan-300">
												{stat.value}
											</div>
											<div className="text-sm text-blue-200 mt-1">
												{stat.label}
											</div>
										</motion.div>
									))}
								</div>
							</div>
						</div>
						<motion.div
							className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-xl -z-10"
							animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
							transition={{
								duration: 8,
								repeat: Infinity,
								repeatType: 'reverse',
								ease: 'easeInOut',
							}}
						/>
					</motion.div>

					{/* What We Do */}
					<motion.div variants={itemVariants} className="relative group">
						<div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 h-full shadow-2xl shadow-indigo-900/20 overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:shadow-indigo-900/40">
							<div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-bl-full backdrop-blur-sm transition-all duration-300 group-hover:scale-125" />
							<div className="relative z-10">
								<h2 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-6">
									What We Do
								</h2>
								<motion.div
									variants={containerVariants}
									initial="hidden"
									animate={inView ? 'visible' : 'hidden'}
									className="grid grid-cols-1 sm:grid-cols-2 gap-6"
								>
									{[
										{
											title: 'Skill Development',
											desc: 'Workshops across dev, design, cloud, AI and more.',
											icon: '📚',
											color: 'from-blue-600/20 to-cyan-600/20',
										},
										{
											title: 'Project Building',
											desc: 'Teams ship real solutions to real problems.',
											icon: '🚀',
											color: 'from-indigo-600/20 to-purple-600/20',
										},
										{
											title: 'Industry Connect',
											desc: 'Talks, reviews, and networking with professionals.',
											icon: '🤝',
											color: 'from-purple-600/20 to-pink-600/20',
										},
										{
											title: 'Innovation Labs',
											desc: 'Hackathons, sprints, showcases, and demos.',
											icon: '💻',
											color: 'from-pink-600/20 to-red-600/20',
										},
									].map((item, index) => (
										<motion.div
											key={index}
											variants={itemVariants}
											className={`bg-gradient-to-br ${item.color} backdrop-blur-lg border border-white/10 rounded-2xl p-5 transition-all duration-300 hover:scale-[1.03] hover:border-white/20 hover:shadow-xl`}
										>
											<div className="flex gap-4 items-start">
												<div className="text-3xl mt-1">{item.icon}</div>
												<div>
													<h3 className="text-xl font-semibold text-white mb-1">
														{item.title}
													</h3>
													<p className="text-blue-100 text-sm">
														{item.desc}
													</p>
												</div>
											</div>
										</motion.div>
									))}
								</motion.div>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
};

export default ClubDescription;

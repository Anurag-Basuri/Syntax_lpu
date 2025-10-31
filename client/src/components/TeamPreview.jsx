import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { publicClient } from '../services/api';

const CARD_THEME = {
	bg: 'from-cyan-500/20 via-blue-500/20 to-sky-500/20',
	glow: '0, 200, 255, 0.30',
};

const TeamPreview = () => {
	const [teamMembers, setTeamMembers] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchLeaders = async () => {
			try {
				const response = await publicClient.get('/api/members/getleaders');
				setTeamMembers(
					Array.isArray(response.data?.data?.members) ? response.data.data.members : []
				);
			} catch {
				setTeamMembers([]);
			}
		};
		fetchLeaders();
	}, []);

	const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

	return (
		<section className="section-container py-normal bg-transparent relative overflow-hidden">
			<div className="relative z-10 px-4 w-full">
				<div className="max-w-7xl mx-auto">
					{/* Header Section */}
					<div className="text-center mb-16">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="mb-6"
						>
							<span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/15 text-accent text-base font-semibold shadow-lg backdrop-blur-md">
								Meet Our Core Team
							</span>
							<p className="text-secondary text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
								The driving force behind Syntax. A diverse team of leaders, mentors,
								and builders.
							</p>
						</motion.div>
					</div>

					{/* Team Grid */}
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{teamMembers.slice(0, 6).map((member, index) => (
							<motion.div
								key={member._id || index}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
							>
								<div
									className="glass-card p-6 shadow-2xl hover-lift border border-white/12"
									style={{ boxShadow: `0 0 24px rgba(${CARD_THEME.glow})` }}
								>
									<div className="relative z-10 text-center">
										<div className="w-20 h-20 mx-auto mb-4 rounded-full border border-white/20 bg-white/10 flex items-center justify-center">
											<span className="text-2xl font-bold text-primary">
												{member.name?.charAt(0).toUpperCase() || '?'}
											</span>
										</div>
										<h3 className="text-xl font-bold text-primary mb-1">
											{member.name || 'Team Member'}
										</h3>
										<p className="text-accent font-medium">
											{member.role || 'Role'}
										</p>
										<p className="text-secondary text-sm mt-2 leading-relaxed">
											{member.bio ||
												'Passionate about technology and innovation.'}
										</p>
									</div>
								</div>
							</motion.div>
						))}
					</motion.div>

					{/* CTA Button */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.8 }}
						className="text-center mt-16"
					>
						<motion.button
							onClick={() => navigate('/team')}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="group relative px-8 py-4 btn-primary rounded-full font-semibold text-white text-lg shadow-2xl overflow-hidden"
						>
							<span className="relative z-10">Explore Full Team</span>
						</motion.button>
					</motion.div>
				</div>
			</div>
		</section>
	);
};

export default TeamPreview;

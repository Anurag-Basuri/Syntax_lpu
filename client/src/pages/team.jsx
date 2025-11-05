import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader, Users, Menu, X, ChevronUp } from 'lucide-react';
import { publicClient } from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import ErrorBoundary from '../components/team/ErrorBoundary';

// Import components
import UnifiedTeamCard from '../components/team/UnifiedTeamCard';
import DepartmentSection from '../components/team/DepartmentSection';
import TeamMemberModal from '../components/team/TeamMemberModal';
import TeamSkeleton from '../components/team/TeamSkeleton';

const TeamsPage = () => {
	const { isAuthenticated } = useAuth();
	const [selectedMember, setSelectedMember] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [teamData, setTeamData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const [expandedDepartment, setExpandedDepartment] = useState(null);

	// Toggle function for department expansion
	const toggleDepartment = (departmentKey) => {
		setExpandedDepartment(expandedDepartment === departmentKey ? null : departmentKey);
	};

	// Memoized department filtering (removed search functionality)
	const departmentData = useMemo(() => {
		if (!teamData.length) return {};

		// Leadership members
		const leadership = teamData
			.filter((member) => ['CEO', 'CTO', 'CMO', 'COO'].includes(member.designation))
			.sort((a, b) => {
				const order = { CEO: 0, CTO: 1, CMO: 2, COO: 3 };
				return order[a.designation] - order[b.designation];
			});

		const excludeLeadership = (member) => !leadership.some((lm) => lm._id === member._id);

		// Department members
		const departments = {
			leadership,
			technical: teamData.filter((m) => m.department === 'Technical' && excludeLeadership(m)),
			management: teamData.filter(
				(m) => m.department === 'Management' && excludeLeadership(m)
			),
			marketing: teamData.filter((m) => m.department === 'Marketing' && excludeLeadership(m)),
			socialMedia: teamData.filter(
				(m) => m.department === 'Social Media' && excludeLeadership(m)
			),
			media: teamData.filter((m) => m.department === 'Media' && excludeLeadership(m)),
			contentWriting: teamData.filter(
				(m) => m.department === 'Content Writing' && excludeLeadership(m)
			),
			design: teamData.filter((m) => m.department === 'Design' && excludeLeadership(m)),
			hr: teamData.filter((m) => m.department === 'HR' && excludeLeadership(m)),
			eventManagement: teamData.filter(
				(m) => m.department === 'Event Management' && excludeLeadership(m)
			),
			pr: teamData.filter((m) => m.department === 'PR' && excludeLeadership(m)),
			coordinator: teamData.filter(
				(m) => m.department === 'Coordinator' && excludeLeadership(m)
			),
		};

		return departments;
	}, [teamData]);

	// API call
	useEffect(() => {
		const fetchTeamData = async () => {
			try {
				setLoading(true);
				const response = await publicClient.get('api/members/getall');

				if (response.data?.data?.members) {
					setTeamData(response.data.data.members);
					setError(null);
				} else {
					throw new Error('Invalid data format received from server');
				}
			} catch (error) {
				console.error('Error fetching team data:', error);
				setError('Failed to load team data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		fetchTeamData();
	}, []);

	// Scroll to top functionality
	useEffect(() => {
		const handleScroll = () => {
			setShowScrollTop(window.scrollY > 500);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleMemberClick = (member) => {
		setSelectedMember(member);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setTimeout(() => setSelectedMember(null), 300);
	};

	const scrollToDepartment = (departmentId) => {
		const element = document.getElementById(departmentId);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		setMobileMenuOpen(false);
	};

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Available departments for navigation
	const departments = [
		{ id: 'leadership', name: 'Leadership', count: departmentData.leadership?.length || 0 },
		{ id: 'technical', name: 'Technical', count: departmentData.technical?.length || 0 },
		{ id: 'management', name: 'Management', count: departmentData.management?.length || 0 },
		{ id: 'marketing', name: 'Marketing', count: departmentData.marketing?.length || 0 },
		{ id: 'socialMedia', name: 'Social Media', count: departmentData.socialMedia?.length || 0 },
		{ id: 'media', name: 'Media', count: departmentData.media?.length || 0 },
		{
			id: 'contentWriting',
			name: 'Content Writing',
			count: departmentData.contentWriting?.length || 0,
		},
		{ id: 'design', name: 'Design', count: departmentData.design?.length || 0 },
		{ id: 'hr', name: 'HR', count: departmentData.hr?.length || 0 },
		{
			id: 'eventManagement',
			name: 'Event Management',
			count: departmentData.eventManagement?.length || 0,
		},
		{ id: 'pr', name: 'PR', count: departmentData.pr?.length || 0 },
		{ id: 'coordinator', name: 'Coordinators', count: departmentData.coordinator?.length || 0 },
	].filter((dept) => dept.count > 0);

	return (
		<div className="min-h-screen text-white overflow-x-hidden">
			{/* Enhanced Mobile Navigation Menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg lg:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setMobileMenuOpen(false)}
					>
						<motion.div
							className="absolute top-0 right-0 h-full w-4/5 max-w-sm bg-slate-900/95 backdrop-blur-xl border-l border-indigo-500/30 shadow-2xl"
							initial={{ x: '100%' }}
							animate={{ x: 0 }}
							exit={{ x: '100%' }}
							transition={{ type: 'spring', damping: 25, stiffness: 300 }}
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="p-6 border-b border-indigo-500/20">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-bold text-white">Departments</h2>
									<motion.button
										onClick={() => setMobileMenuOpen(false)}
										className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<X size={20} />
									</motion.button>
								</div>
							</div>

							{/* Department list */}
							<div className="p-4 overflow-y-auto h-[calc(100%-100px)]">
								<div className="space-y-2">
									{departments.map((dept, index) => (
										<motion.button
											key={dept.id}
											onClick={() => scrollToDepartment(dept.id)}
											className="w-full flex items-center justify-between p-3 rounded-xl 
                        bg-slate-800/30 hover:bg-slate-700/50 transition-all duration-200 group"
											initial={{ opacity: 0, x: 20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.05 }}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<span className="text-white font-medium group-hover:text-blue-200 transition-colors">
												{dept.name}
											</span>
											<span className="text-indigo-400 bg-slate-800 px-2 py-1 rounded-full text-xs font-medium">
												{dept.count}
											</span>
										</motion.button>
									))}
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Scroll to top button */}
			<AnimatePresence>
				{showScrollTop && (
					<motion.button
						onClick={scrollToTop}
						className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 hover:bg-indigo-500 
              text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0 }}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
					>
						<ChevronUp size={24} />
					</motion.button>
				)}
			</AnimatePresence>

			{loading ? (
				<div className="py-10">
					<div className="text-center mb-8">
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
						>
							<Loader className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
						</motion.div>
						<p className="text-lg text-slate-300">Loading amazing people...</p>
					</div>
					<TeamSkeleton />
				</div>
			) : error ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg p-4">
					<motion.div
						className="text-center p-8 rounded-2xl bg-slate-900/95 border border-red-500/30 max-w-md backdrop-blur-xl"
						initial={{ scale: 0.8, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.3 }}
					>
						<h3 className="text-2xl font-bold text-red-400 mb-4">Error Loading Data</h3>
						<p className="text-slate-300 mb-6">{error}</p>
						<motion.button
							onClick={() => window.location.reload()}
							className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 
                text-white font-medium hover:opacity-90 transition-opacity"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							Try Again
						</motion.button>
					</motion.div>
				</div>
			) : (
				<>
					{/* Hero Section */}
					<section className="relative w-full pt-20 pb-8 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
						<div className="relative z-10 max-w-5xl mx-auto w-full">
							<motion.div
								className="mb-8 flex justify-center"
								initial={{ scale: 0, opacity: 0, rotate: -180 }}
								animate={{ scale: 1, opacity: 1, rotate: 0 }}
								transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
							>
								<div className="relative">
									<motion.div
										className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 opacity-80 blur-lg"
										animate={{
											scale: [1, 1.2, 1],
											opacity: [0.8, 1, 0.8],
											rotate: [0, 360],
										}}
										transition={{
											duration: 8,
											repeat: Infinity,
											ease: 'linear',
										}}
									/>
									<motion.div
										className="relative p-6 rounded-full bg-slate-800/80 backdrop-blur-xl border border-white/20 shadow-2xl"
										whileHover={{ scale: 1.1, rotate: 360 }}
										transition={{ duration: 0.8 }}
									>
										<Users size={32} className="text-white" />
									</motion.div>
								</div>
							</motion.div>

							<motion.h1
								className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r 
                  from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent 
                  tracking-tight mb-6 leading-tight px-2"
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									delay: 0.3,
									duration: 1,
									ease: [0.25, 0.46, 0.45, 0.94],
								}}
							>
								Meet Our{' '}
								<motion.span
									className="italic bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text"
									animate={{
										backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
									}}
									transition={{ duration: 5, repeat: Infinity }}
								>
									Incredible
								</motion.span>{' '}
								Team
							</motion.h1>

							<motion.p
								className="text-lg md:text-xl text-white/80 font-light mb-8 max-w-3xl mx-auto leading-relaxed px-2"
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6, duration: 1 }}
							>
								<motion.span
									animate={{ rotate: [0, 360] }}
									transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
									className="inline-block mr-2"
								>
									<Sparkles className="text-blue-400" size={20} />
								</motion.span>
								Where creativity meets technology and collaboration sparks
								innovation.
							</motion.p>

							{/* Navigation Controls - Only show on mobile/tablet */}
							<motion.div
								className="flex items-center justify-center mt-8 lg:hidden"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1, duration: 0.8 }}
							>
								{/* Mobile menu button - only visible on mobile/tablet */}
								<motion.button
									onClick={() => setMobileMenuOpen(true)}
									className="flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 
                    text-slate-200 rounded-xl text-sm font-medium backdrop-blur-sm border border-slate-600/50
                    transition-all duration-200"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
								>
									<Menu size={18} />
									<span>Browse Departments</span>
								</motion.button>
							</motion.div>
						</div>
					</section>

					{/* Leadership Section */}
					{departmentData.leadership?.length > 0 && (
						<section id="leadership" className="py-12 px-4 relative z-10">
							<div className="max-w-7xl mx-auto">
								<motion.div
									className="flex flex-col items-center mb-10"
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
								>
									<motion.h2
										className="text-3xl md:text-4xl font-bold text-center mb-6 
                      bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent px-4 leading-tight"
										animate={{
											backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
										}}
										transition={{ duration: 6, repeat: Infinity }}
									>
										Leadership Team
									</motion.h2>

									<motion.div
										className="relative"
										initial={{ scaleX: 0 }}
										whileInView={{ scaleX: 1 }}
										transition={{ delay: 0.4, duration: 0.8 }}
									>
										<div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"></div>
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full blur-sm"
											animate={{ opacity: [0.5, 1, 0.5] }}
											transition={{ duration: 2, repeat: Infinity }}
										/>
									</motion.div>
								</motion.div>

								<div className="relative">
									{/* CEO Card */}
									{departmentData.leadership.find(
										(m) => m.designation === 'CEO'
									) && (
										<motion.div
											className="flex justify-center mb-12"
											initial={{ opacity: 0, scale: 0.8 }}
											whileInView={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.2, duration: 0.8 }}
										>
											<div className="w-full max-w-sm px-2">
												<UnifiedTeamCard
													member={departmentData.leadership.find(
														(m) => m.designation === 'CEO'
													)}
													delay={0}
													onClick={handleMemberClick}
													isAuthenticated={isAuthenticated}
												/>
											</div>
										</motion.div>
									)}

									{/* Other leadership */}
									<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-2">
										{departmentData.leadership
											.filter((m) => m.designation !== 'CEO')
											.map((leader, index) => (
												<motion.div
													key={leader._id || index}
													className="flex justify-center"
													initial={{ opacity: 0, y: 30, scale: 0.9 }}
													whileInView={{ opacity: 1, y: 0, scale: 1 }}
													viewport={{ once: true, margin: '-20px' }}
													transition={{
														delay: index * 0.1,
														duration: 0.6,
														ease: [0.25, 0.46, 0.45, 0.94],
													}}
												>
													<div className="w-full max-w-sm">
														<UnifiedTeamCard
															member={leader}
															delay={index * 0.05}
															onClick={handleMemberClick}
															isAuthenticated={isAuthenticated}
														/>
													</div>
												</motion.div>
											))}
									</div>
								</div>
							</div>
						</section>
					)}

					{/* Departments Section */}
					<section id="departments" className="py-8 px-4 relative z-10">
						<div className="max-w-7xl mx-auto">
							<motion.div
								className="flex flex-col items-center mb-12"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6 }}
							>
								<h2
									className="text-3xl md:text-4xl font-bold text-center mb-4 
                  bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent px-4"
								>
									Our Departments
								</h2>
								<div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
							</motion.div>

							<div className="space-y-8 md:space-y-12">
								{/* Department sections with proper props */}
								{departmentData.technical?.length > 0 && (
									<DepartmentSection
										id="technical"
										department="Technical"
										members={departmentData.technical}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'technical'}
										onToggle={() => toggleDepartment('technical')}
									/>
								)}

								{departmentData.management?.length > 0 && (
									<DepartmentSection
										id="management"
										department="Management"
										members={departmentData.management}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'management'}
										onToggle={() => toggleDepartment('management')}
									/>
								)}

								{departmentData.marketing?.length > 0 && (
									<DepartmentSection
										id="marketing"
										department="Marketing"
										members={departmentData.marketing}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'marketing'}
										onToggle={() => toggleDepartment('marketing')}
									/>
								)}

								{departmentData.socialMedia?.length > 0 && (
									<DepartmentSection
										id="socialMedia"
										department="Social Media"
										members={departmentData.socialMedia}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'socialMedia'}
										onToggle={() => toggleDepartment('socialMedia')}
									/>
								)}

								{departmentData.media?.length > 0 && (
									<DepartmentSection
										id="media"
										department="Media"
										members={departmentData.media}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'media'}
										onToggle={() => toggleDepartment('media')}
									/>
								)}

								{departmentData.contentWriting?.length > 0 && (
									<DepartmentSection
										id="contentWriting"
										department="Content Writing"
										members={departmentData.contentWriting}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'contentWriting'}
										onToggle={() => toggleDepartment('contentWriting')}
									/>
								)}

								{departmentData.design?.length > 0 && (
									<DepartmentSection
										id="design"
										department="Design"
										members={departmentData.design}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'design'}
										onToggle={() => toggleDepartment('design')}
									/>
								)}

								{departmentData.hr?.length > 0 && (
									<DepartmentSection
										id="hr"
										department="HR"
										members={departmentData.hr}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'hr'}
										onToggle={() => toggleDepartment('hr')}
									/>
								)}

								{departmentData.eventManagement?.length > 0 && (
									<DepartmentSection
										id="eventManagement"
										department="Event Management"
										members={departmentData.eventManagement}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'eventManagement'}
										onToggle={() => toggleDepartment('eventManagement')}
									/>
								)}

								{departmentData.pr?.length > 0 && (
									<DepartmentSection
										id="pr"
										department="PR"
										members={departmentData.pr}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'pr'}
										onToggle={() => toggleDepartment('pr')}
									/>
								)}

								{departmentData.coordinator?.length > 0 && (
									<DepartmentSection
										id="coordinator"
										department="Coordinator"
										members={departmentData.coordinator}
										onClick={handleMemberClick}
										isAuthenticated={isAuthenticated}
										isExpanded={expandedDepartment === 'coordinator'}
										onToggle={() => toggleDepartment('coordinator')}
									/>
								)}
							</div>
						</div>
					</section>

					{/* Modal */}
					<TeamMemberModal
						member={selectedMember}
						isOpen={modalOpen}
						onClose={closeModal}
						isAuthenticated={isAuthenticated}
					/>
				</>
			)}
		</div>
	);
};

const TeamsPageWrapper = () => (
	<ErrorBoundary>
		<TeamsPage />
	</ErrorBoundary>
);

export default TeamsPageWrapper;

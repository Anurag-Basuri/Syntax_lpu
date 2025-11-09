import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
	X,
	Mail,
	Linkedin,
	Github,
	Globe,
	Phone,
	Code,
	GraduationCap,
	Building,
	FileText,
	User,
	ExternalLink,
	Download,
	Calendar,
	Badge,
	Clock,
	Sparkles,
	School,
} from 'lucide-react';

const getAvatarUrl = (profilePicture) => {
	if (!profilePicture) return null;
	if (typeof profilePicture === 'string') return profilePicture;
	if (typeof profilePicture === 'object' && profilePicture.url) return profilePicture.url;
	return null;
};

const asText = (value, fallback = 'N/A') => {
	if (!value) return fallback;
	return Array.isArray(value) ? value.filter(Boolean).join(', ') || fallback : value;
};

// Utility function for formatting dates
const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	const d = new Date(dateString);
	return isNaN(d.getTime())
		? 'Invalid date'
		: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// Get icon based on social platform
const getSocialIcon = (platform) => {
	const platformLower = platform?.toLowerCase() || '';
	if (platformLower.includes('linkedin')) return Linkedin;
	if (platformLower.includes('github')) return Github;
	return Globe;
};

// Component for social link item with premium styling
const SocialLinkItem = ({ social }) => {
	const IconComponent = getSocialIcon(social.platform);
	const url = social.url?.startsWith('http') ? social.url : `https://${social.url}`;

	return (
		<a
			href={url}
			target="_blank"
			rel="noopener noreferrer"
			className="group relative flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 backdrop-blur-sm"
			aria-label={`Visit ${social.platform} profile`}
		>
			<div className="flex items-center min-w-0 flex-1">
				<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-4 flex-shrink-0">
					<IconComponent size={18} className="text-blue-400" />
				</div>
				<div className="min-w-0 flex-1">
					<span className="text-slate-200 group-hover:text-white font-medium text-sm block truncate">
						{social.platform}
					</span>
					<span className="text-slate-400 text-xs">Social Profile</span>
				</div>
			</div>
			<ExternalLink
				size={16}
				className="text-slate-400 group-hover:text-blue-400 flex-shrink-0 ml-2 transition-colors"
			/>
		</a>
	);
};

// Component for info card with premium styling
const InfoCard = ({ icon: Icon, label, value, className = '', accent = false }) => (
	<div
		className={`group relative bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl p-4 border border-slate-600/30 hover:border-blue-400/30 transition-all duration-300 backdrop-blur-sm ${
			accent ? 'ring-2 ring-blue-500/20' : ''
		} ${className}`}
	>
		<div className="flex items-center text-blue-300 mb-3">
			<div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-3 flex-shrink-0">
				<Icon size={16} className="text-blue-400" />
			</div>
			<span className="font-semibold text-sm">{label}</span>
		</div>
		<div className="text-slate-100 font-medium text-sm leading-relaxed break-words pl-9">
			{value}
		</div>
	</div>
);

// Enhanced skill badge component
const SkillBadge = ({ skill, isPrimary = false }) => (
	<span
		className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
			isPrimary
				? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
				: 'bg-gradient-to-r from-slate-700/50 to-slate-600/30 text-slate-200 border border-slate-600/40 hover:border-blue-400/50 hover:bg-gradient-to-r hover:from-blue-900/30 hover:to-indigo-900/20'
		} hover:scale-105`}
	>
		{skill}
	</span>
);

// Tab content component
const TabContent = ({ activeTab, member, isAuthenticated }) => {
	if (!member) return null;

	const renderContent = () => {
		switch (activeTab) {
			case 'about':
				return (
					<div className="space-y-6 pb-4">
						<div>
							<h3 className="text-xl font-bold text-white mb-4 flex items-center">
								<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-3">
									<User size={20} className="text-blue-400" />
								</div>
								About Me
							</h3>
							<div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl p-6 border border-slate-600/30 backdrop-blur-sm">
								<p className="text-slate-200 leading-relaxed text-base">
									{member.bio ||
										'This member prefers to keep their bio private for now. Connect with them to learn more!'}
								</p>
							</div>
						</div>

						{member.joinedAt && (
							<InfoCard
								icon={Clock}
								label="Member Since"
								value={formatDate(member.joinedAt)}
								accent={true}
							/>
						)}
					</div>
				);

			case 'contact':
				return (
					<div className="space-y-6 pb-4">
						<h3 className="text-xl font-bold text-white mb-6 flex items-center">
							<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-3">
								<Mail size={20} className="text-blue-400" />
							</div>
							Get In Touch
						</h3>

						<div className="space-y-4">
							{/* Email and Phone with enhanced styling */}
							{member.email && (
								<a
									href={`mailto:${member.email}`}
									className="group relative flex items-center p-5 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-green-400/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 backdrop-blur-sm"
									aria-label={`Send email to ${member.email}`}
								>
									<div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20 mr-4 flex-shrink-0">
										<Mail size={20} className="text-green-400" />
									</div>
									<div className="min-w-0 flex-1">
										<span className="text-slate-200 group-hover:text-white font-medium block break-all">
											{member.email}
										</span>
										<span className="text-slate-400 text-sm">
											Primary Email
										</span>
									</div>
								</a>
							)}

							{member.phone && (
								<a
									href={`tel:${member.phone}`}
									className="group relative flex items-center p-5 bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 backdrop-blur-sm"
									aria-label={`Call ${member.phone}`}
								>
									<div className="p-3 rounded-lg bg-purple-500/10 border border-purple-400/20 mr-4 flex-shrink-0">
										<Phone size={20} className="text-purple-400" />
									</div>
									<div className="min-w-0 flex-1">
										<span className="text-slate-200 group-hover:text-white font-medium">
											{member.phone}
										</span>
										<span className="text-slate-400 text-sm block">
											Phone Number
										</span>
									</div>
								</a>
							)}

							{/* Enhanced Social Links */}
							{member.socialLinks && member.socialLinks.length > 0 && (
								<div>
									<h4 className="text-lg font-semibold text-blue-300 mb-4 flex items-center">
										<div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-2">
											<Globe size={16} className="text-blue-400" />
										</div>
										Social Profiles
									</h4>
									<div className="grid gap-3">
										{member.socialLinks.map((social, index) => (
											<SocialLinkItem
												key={`social-${index}`}
												social={social}
											/>
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				);

			case 'skills':
				return (
					<div className="space-y-6 pb-4">
						<h3 className="text-xl font-bold text-white mb-6 flex items-center">
							<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-3">
								<Code size={20} className="text-blue-400" />
							</div>
							Skills
						</h3>
						<div className="flex flex-wrap gap-3">
							{member.skills?.map((skill, index) => (
								<SkillBadge key={`skill-${index}-${skill}`} skill={skill} />
							))}
						</div>
					</div>
				);

			case 'academic':
				return (
					<div className="space-y-6 pb-4">
						<h3 className="text-xl font-bold text-white mb-6 flex items-center">
							<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-3">
								<GraduationCap size={20} className="text-blue-400" />
							</div>
							Academic Journey
						</h3>

						<div className="grid gap-4 sm:grid-cols-2">
							{member.program && (
								<InfoCard
									icon={School}
									label="Program"
									value={member.program}
									accent={true}
								/>
							)}

							{member.year && (
								<InfoCard
									icon={Calendar}
									label="Academic Year"
									value={`Year ${member.year}`}
								/>
							)}
						</div>

						{/* Residence Information for authenticated users */}
						{isAuthenticated && member.hosteler !== undefined && (
							<InfoCard
								icon={Building}
								label="Residence Status"
								value={
									member.hosteler
										? `Hosteler${member.hostel ? ` - ${member.hostel}` : ''}`
										: 'Day Scholar'
								}
								accent={member.hosteler}
							/>
						)}
					</div>
				);

			case 'documents':
				return (
					<div className="space-y-6 pb-4">
						<h3 className="text-xl font-bold text-white mb-6 flex items-center">
							<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-400/20 mr-3">
								<FileText size={20} className="text-blue-400" />
							</div>
							Professional Documents
						</h3>

						{member.resume?.url ? (
							<a
								href={member.resume.url}
								target="_blank"
								rel="noopener noreferrer"
								className="group relative flex items-center justify-between p-6 bg-gradient-to-r from-emerald-900/20 to-green-800/20 rounded-xl border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 backdrop-blur-sm"
								aria-label="Download resume"
							>
								<div className="flex items-center min-w-0 flex-1">
									<div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20 mr-4 flex-shrink-0">
										<FileText size={24} className="text-emerald-400" />
									</div>
									<div className="min-w-0 flex-1">
										<span className="text-slate-200 group-hover:text-white font-semibold block text-lg">
											Resume / CV
										</span>
										<span className="text-emerald-300 text-sm">
											Click to view or download
										</span>
									</div>
								</div>
								<div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 ml-4">
									<Download
										size={20}
										className="text-emerald-400 group-hover:scale-110 transition-transform"
									/>
								</div>
							</a>
						) : (
							<div className="text-center py-12 bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl border border-slate-600/30">
								<FileText size={48} className="text-slate-500 mx-auto mb-4" />
								<p className="text-slate-400 text-lg">No documents available</p>
								<p className="text-slate-500 text-sm">
									The member hasn't uploaded any documents yet
								</p>
							</div>
						)}
					</div>
				);

			default:
				return (
					<div className="text-center py-12 pb-4">
						<div className="bg-gradient-to-br from-slate-800/60 to-slate-700/40 rounded-xl p-8 border border-slate-600/30">
							<p className="text-slate-400 text-lg">No content available</p>
						</div>
					</div>
				);
		}
	};

	return <div className="animate-in fade-in duration-300">{renderContent()}</div>;
};

// Main modal component
const TeamMemberModal = ({ member, isOpen, onClose, isAuthenticated = false }) => {
	const [activeTab, setActiveTab] = useState('about');
	const [imageError, setImageError] = useState(false);

	const initials = useMemo(() => {
		if (!member?.fullname) return '??';
		return member.fullname
			.split(' ')
			.map((n) => n?.[0] || '')
			.join('')
			.substring(0, 2)
			.toUpperCase();
	}, [member?.fullname]);

	// Handle keyboard events
	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		},
		[isOpen, onClose]
	);

	// Handle close with proper event stopping
	const handleClose = useCallback(
		(e) => {
			e?.stopPropagation();
			onClose();
		},
		[onClose]
	);

	// Handle modal click (close on backdrop)
	const handleModalClick = useCallback(
		(e) => {
			if (e.target === e.currentTarget) {
				onClose();
			}
		},
		[onClose]
	);

	// Handle modal visibility
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			setActiveTab('about');
			setImageError(false);
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	// Keyboard event listener
	useEffect(() => {
		if (isOpen) {
			window.addEventListener('keydown', handleKeyDown);
			return () => window.removeEventListener('keydown', handleKeyDown);
		}
	}, [isOpen, handleKeyDown]);

	// Dynamic tabs based on available data
	const tabs = useMemo(
		() =>
			[
				{ id: 'about', label: 'About', icon: User, show: true },
				{
					id: 'contact',
					label: 'Contact',
					icon: Mail,
					show: member?.email || member?.phone || member?.socialLinks?.length > 0,
				},
				{
					id: 'skills',
					label: 'Skills',
					icon: Code,
					show: member?.skills && member.skills.length > 0,
				},
				{
					id: 'academic',
					label: 'Academic',
					icon: GraduationCap,
					show: member?.program || member?.year,
				},
				{
					id: 'documents',
					label: 'Documents',
					icon: FileText,
					show: member?.resume?.url,
				},
			].filter((tab) => tab.show),
		[member]
	);

	if (!isOpen || !member) return null;

	const avatar = getAvatarUrl(member.profilePicture);
	const departmentText = member.primaryDepartment || asText(member.department);
	const designationText = member.primaryDesignation || asText(member.designation);

	return (
		<div
			className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div
				className="relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-3xl xl:max-w-4xl h-[95vh] sm:h-[90vh] md:h-[85vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-600/50 shadow-2xl overflow-hidden flex flex-col"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onClose();
					}}
					className="absolute top-4 right-4 p-2 rounded-lg bg-black/30 border border-white/10 hover:bg-black/50 transition"
					aria-label="Close modal"
				>
					<X size={18} className="text-white" />
				</button>

				{/* Header */}
				<div className="relative p-4 sm:p-6 md:p-8 border-b border-white/10 bg-gradient-to-r from-blue-900/70 via-indigo-800/70 to-purple-800/70">
					<div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 pr-10">
						<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white/20 shadow">
							{!imageError && avatar ? (
								<img
									src={avatar}
									alt={member.fullname || 'Profile'}
									className="w-full h-full object-cover"
									onError={() => setImageError(true)}
									loading="lazy"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700">
									<span className="text-white font-bold text-xl">{initials}</span>
								</div>
							)}
						</div>

						<div className="flex-1 min-w-0">
							<h2 className="text-2xl font-bold text-white mb-2 break-words">
								{member.fullname}
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
								{departmentText && departmentText !== 'N/A' && (
									<div className="bg-white/10 rounded-xl p-3 border border-white/15">
										<div className="flex items-center text-blue-200 mb-1">
											<Sparkles size={14} className="mr-2" />
											<span className="font-semibold">Department</span>
										</div>
										<div
											className="text-white font-medium truncate"
											title={departmentText}
										>
											{departmentText}
										</div>
									</div>
								)}
								{designationText && designationText !== 'N/A' && (
									<div className="bg-white/10 rounded-xl p-3 border border-white/15">
										<div className="flex items-center text-blue-200 mb-1">
											<Badge size={14} className="mr-2" />
											<span className="font-semibold">Role</span>
										</div>
										<div
											className="text-white font-medium truncate"
											title={designationText}
										>
											{designationText}
										</div>
									</div>
								)}
								{isAuthenticated && member.LpuId && (
									<div className="bg-white/10 rounded-xl p-3 border border-white/15">
										<div className="flex items-center text-blue-200 mb-1">
											<School size={14} className="mr-2" />
											<span className="font-semibold">Student ID</span>
										</div>
										<div className="text-white font-medium">{member.LpuId}</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="flex border-b border-slate-600/50 bg-slate-800/90 overflow-x-auto">
					<div className="flex min-w-full sm:min-w-0">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-semibold whitespace-nowrap relative ${
										activeTab === tab.id
											? 'text-blue-400 bg-blue-900/30 border-b-2 border-blue-400'
											: 'text-slate-400 hover:text-white hover:bg-slate-700/50'
									}`}
									onClick={() => setActiveTab(tab.id)}
								>
									<Icon size={16} />
									<span>{tab.label}</span>
								</button>
							);
						})}
					</div>
				</div>

				{/* Content */}
				<div className="flex-1 min-h-0 overflow-y-auto">
					<div className="p-4 sm:p-6 md:p-8 text-slate-100 text-sm leading-relaxed">
						{activeTab === 'about' && (
							<div className="space-y-4">
								<p className="bg-white/5 border border-white/10 rounded-xl p-4">
									{member.bio ||
										'This member prefers to keep their bio private for now.'}
								</p>
								{member.joinedAt && (
									<div className="bg-white/5 border border-white/10 rounded-xl p-4">
										<div className="flex items-center text-blue-200 mb-1">
											<Clock size={14} className="mr-2" />
											<span className="font-semibold">Member Since</span>
										</div>
										<div>{formatDate(member.joinedAt)}</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'contact' && (
							<div className="space-y-3">
								{member.email && (
									<a
										href={`mailto:${member.email}`}
										className="flex items-center gap-2 underline text-blue-300"
									>
										<Mail size={16} /> {member.email}
									</a>
								)}
								{member.phone && (
									<a
										href={`tel:${member.phone}`}
										className="flex items-center gap-2 underline text-blue-300"
									>
										<Phone size={16} /> {member.phone}
									</a>
								)}
								{member.socialLinks?.length > 0 && (
									<div className="flex flex-col gap-1">
										{member.socialLinks.map((s, i) => {
											const url = s?.url?.startsWith('http')
												? s.url
												: `https://${s?.url || ''}`;
											const Icon = (s.platform || '')
												.toLowerCase()
												.includes('github')
												? Github
												: (s.platform || '')
														.toLowerCase()
														.includes('linkedin')
												? Linkedin
												: Globe;
											return (
												<a
													key={i}
													href={url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 underline text-blue-300 truncate"
												>
													<Icon size={16} /> {s.platform || 'Profile'}
												</a>
											);
										})}
									</div>
								)}
							</div>
						)}

						{activeTab === 'skills' && (
							<div className="flex flex-wrap gap-2">
								{member.skills?.map((skill, idx) => (
									<span
										key={idx}
										className="px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
									>
										{skill}
									</span>
								))}
							</div>
						)}

						{activeTab === 'academic' && (
							<div className="grid gap-3 sm:grid-cols-2">
								{member.program && (
									<div className="bg-white/5 border border-white/10 rounded-xl p-4">
										<div className="flex items-center text-blue-200 mb-1">
											<School size={14} className="mr-2" />
											<span className="font-semibold">Program</span>
										</div>
										<div>{member.program}</div>
									</div>
								)}
								{member.year && (
									<div className="bg-white/5 border border-white/10 rounded-xl p-4">
										<div className="flex items-center text-blue-200 mb-1">
											<Calendar size={14} className="mr-2" />
											<span className="font-semibold">Academic Year</span>
										</div>
										<div>Year {member.year}</div>
									</div>
								)}
								{typeof member.hosteler === 'boolean' && (
									<div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:col-span-2">
										<div className="flex items-center text-blue-200 mb-1">
											<Building size={14} className="mr-2" />
											<span className="font-semibold">Residence Status</span>
										</div>
										<div>
											{member.hosteler
												? `Hosteler${
														member.hostel ? ` - ${member.hostel}` : ''
												  }`
												: 'Day Scholar'}
										</div>
									</div>
								)}
							</div>
						)}

						{activeTab === 'documents' && (
							<div>
								{member.resume?.url ? (
									<a
										href={member.resume.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500"
									>
										<Download size={16} /> View Resume
									</a>
								) : (
									<p className="text-slate-300">No documents available.</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TeamMemberModal;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github, Globe, Star, Shield } from 'lucide-react';

const cardVariants = {
	hidden: { opacity: 0, y: 8 },
	visible: { opacity: 1, y: 0 },
};

const TeamMemberCard = React.forwardRef(({ member, onClick }, ref) => {
	const [imageError, setImageError] = useState(false);

	const socialLinks = Array.isArray(member.socialLinks) ? member.socialLinks : [];
	const hasSocials = socialLinks.length > 0;

	const avatarUrl =
		member.profilePicture?.url ||
		`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(member.fullname)}`;

	const isLeader = !!member.isLeader;

	// Get initials
	const initials =
		member.fullname
			?.split(' ')
			.map((n) => n?.[0] || '')
			.join('')
			.substring(0, 2)
			.toUpperCase() || '??';

	// Helper to select icon
	const getSocialIcon = (platform) => {
		const p = (platform || '').toLowerCase();
		if (p.includes('github')) return Github;
		if (p.includes('linkedin')) return Linkedin;
		if (p.includes('twitter')) return Twitter;
		return Globe;
	};

	// Open card - used on click/Enter. We stop propagation on social links.
	const handleOpen = () => onClick && onClick(member);

	return (
		<motion.article
			layout
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			exit="hidden"
			transition={{ duration: 0.28, ease: 'easeInOut' }}
			className="team-card group bg-gradient-to-b from-white/60 to-white/30 dark:from-gray-900/60 dark:to-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transform-gpu hover:-translate-y-2 transition-all duration-300 cursor-pointer focus:outline-none"
			onClick={handleOpen}
			tabIndex={0}
			role="button"
			aria-label={`Open profile for ${member.fullname}`}
			onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
			ref={ref}
		>
			{/* Top image area with subtle gradient and overlay */}
			<div className="relative w-full h-36 sm:h-40 overflow-hidden bg-gradient-to-br from-indigo-600/10 to-purple-600/6">
				{!imageError ? (
					<img
						src={avatarUrl}
						alt={member.fullname}
						className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-500"
						loading="lazy"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold text-3xl">
						{initials}
					</div>
				)}

				{/* Avatar overlapping */}
				<div className="absolute left-4 -bottom-8">
					<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring-2 ring-white dark:ring-gray-900 overflow-hidden bg-gray-200 shadow-lg">
						{!imageError ? (
							<img
								src={avatarUrl}
								alt={member.fullname}
								className="w-full h-full object-cover"
								onError={() => setImageError(true)}
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white font-bold text-lg">
								{initials}
							</div>
						)}
					</div>
				</div>

				{/* Leader badge */}
				{isLeader && (
					<span className="absolute right-3 top-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 shadow">
						<Shield size={14} /> Leader
					</span>
				)}
			</div>

			{/* Content */}
			<div className="px-4 pt-6 pb-4 sm:pb-5">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<h3 className="text-base sm:text-lg font-semibold leading-tight truncate" title={member.fullname} style={{ color: 'var(--text-primary)' }}>
							{member.fullname}
						</h3>
						<p className="text-sm text-[var(--text-secondary)] truncate" title={member.primaryRole || member.primaryDesignation || 'Member'}>
							{member.primaryRole || member.primaryDesignation || 'Member'}
						</p>
						<p className="text-xs text-[var(--text-muted)] mt-1 truncate" title={member.primaryDept || member.primaryDepartment || 'Team'}>
							{member.primaryDept || member.primaryDepartment || 'Team'}
						</p>
					</div>
				</div>

				{/* Skills */}
				{Array.isArray(member.skills) && member.skills.length > 0 && (
					<div className="mt-3 flex flex-wrap gap-2">
						{member.skills.slice(0, 6).map((s, idx) => (
							<span key={idx} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
								{s}
							</span>
						))}
					</div>
				)}

				{/* Socials */}
				{hasSocials && (
					<div className="mt-4 flex items-center gap-2">
						{socialLinks.slice(0, 4).map((social, idx) => {
							const Icon = getSocialIcon(social.platform);
							const raw = social.url || '';
							const url = raw.startsWith('http') ? raw : `https://${raw}`;
							return (
								<a
									key={idx}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/8 hover:bg-white/12 transition-colors text-[var(--text-secondary)]"
									onClick={(e) => e.stopPropagation()}
									aria-label={`${member.fullname} - ${social.platform || 'link'}`}
									title={social.platform || 'link'}
								>
									<Icon size={14} />
								</a>
							);
						})}
						{socialLinks.length > 4 && (
							<span className="ml-auto text-xs px-2 py-0.5 rounded-md bg-white/5 text-[var(--text-muted)]">+{socialLinks.length - 4}</span>
						)}
					</div>
				)}
			</div>
		</motion.article>
	);
});

TeamMemberCard.displayName = 'TeamMemberCard';

export default TeamMemberCard;

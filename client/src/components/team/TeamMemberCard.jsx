import React from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github, Globe, Star, Shield } from 'lucide-react';

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

const TeamMemberCard = React.forwardRef(({ member, onClick }, ref) => {
	// Get social links from backend structure (socialLinks array)
	const socialLinks = member.socialLinks || [];
	const hasSocials = socialLinks.length > 0;

	const avatarUrl =
		member.profilePicture?.url ||
		`https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(member.fullname)}`;
	const isLeader = member.isLeader;

	// Helper to get icon for social platform
	const getSocialIcon = (platform) => {
		const platformLower = (platform || '').toLowerCase();
		if (platformLower.includes('github')) return Github;
		if (platformLower.includes('linkedin')) return Linkedin;
		if (platformLower.includes('twitter')) return Twitter;
		return Globe;
	};

	return (
		<motion.div
			layout
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			exit="hidden"
			transition={{ duration: 0.3, ease: 'easeInOut' }}
			className="team-card enhanced-card"
			onClick={() => onClick(member)}
			tabIndex={0}
			role="button"
			aria-label={`Open profile for ${member.fullname}`}
			onKeyDown={(e) => e.key === 'Enter' && onClick(member)}
			ref={ref}
		>
			<div className="team-card-image-wrapper">
				<img
					src={avatarUrl}
					alt={member.fullname}
					className="team-card-image"
					loading="lazy"
					onError={(e) => {
						// Fallback to initials if image fails
						e.target.style.display = 'none';
						const parent = e.target.parentElement;
						if (parent) {
							const initials =
								member.fullname
									?.split(' ')
									.map((n) => n?.[0] || '')
									.join('')
									.substring(0, 2)
									.toUpperCase() || '??';
							parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-xl sm:text-2xl">${initials}</div>`;
						}
					}}
				/>
				<div className="team-card-image-overlay" />
				{isLeader && (
					<div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1 shadow-lg z-10">
						<Shield size={12} /> Leader
					</div>
				)}
			</div>
			<div className="team-card-content">
				<h3 className="team-card-name" title={member.fullname}>
					{member.fullname}
				</h3>
				<p
					className="team-card-role"
					title={member.primaryRole || member.primaryDesignation}
				>
					{member.primaryRole || member.primaryDesignation || 'Member'}
				</p>
				<p
					className="team-card-dept"
					title={member.primaryDept || member.primaryDepartment}
				>
					{member.primaryDept || member.primaryDepartment || 'Team'}
				</p>
				{hasSocials && (
					<div className="team-card-socials">
						{socialLinks.slice(0, 3).map((social, idx) => {
							const Icon = getSocialIcon(social.platform);
							const url = social.url?.startsWith('http')
								? social.url
								: `https://${social.url || ''}`;
							return (
								<a
									key={idx}
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="social-link"
									onClick={(e) => e.stopPropagation()}
									aria-label={`${member.fullname}'s ${
										social.platform || 'Social Profile'
									}`}
									title={social.platform || 'Social Profile'}
								>
									<Icon size={16} />
								</a>
							);
						})}
						{socialLinks.length > 3 && (
							<span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
								+{socialLinks.length - 3}
							</span>
						)}
					</div>
				)}
			</div>
		</motion.div>
	);
});

TeamMemberCard.displayName = 'TeamMemberCard';

export default TeamMemberCard;

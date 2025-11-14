import React, { useState } from 'react';
// eslint-disable-next-line
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github, Globe, Star, Shield } from 'lucide-react';

const cardVariants = {
	hidden: { opacity: 0, y: 16 },
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
			className="team-card enhanced-card shadow-sm hover:shadow-lg transform-gpu hover:-translate-y-1 transition-all duration-250 rounded-2xl overflow-hidden bg-[var(--card-bg)] border border-[var(--card-border)] focus:outline-none"
			onClick={handleOpen}
			tabIndex={0}
			role="button"
			aria-label={`Open profile for ${member.fullname}`}
			onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
			ref={ref}
		>
			<div className="team-card-image-wrapper relative w-full h-44 sm:h-48 md:h-52 overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/30">
				{!imageError ? (
					<img
						src={avatarUrl}
						alt={member.fullname}
						className="team-card-image w-full h-full object-cover"
						loading="lazy"
						onError={() => setImageError(true)}
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-semibold text-2xl">
						{initials}
					</div>
				)}

				{/* subtle overlay to improve text legibility if needed */}
				<div className="team-card-image-overlay absolute inset-0 pointer-events-none" />

				{isLeader && (
					<span
						className="absolute top-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold"
						style={{
							background:
								'linear-gradient(90deg, rgba(250,204,21,0.95), rgba(245,158,11,0.95))',
							color: '#111827',
							boxShadow: '0 6px 18px rgba(249, 115, 22, 0.14)',
						}}
						aria-hidden="true"
					>
						<Shield size={12} />
						<span>Leader</span>
					</span>
				)}
			</div>

			<div className="team-card-content px-4 py-4 sm:py-5">
				<h3
					className="team-card-name text-base sm:text-lg md:text-xl font-semibold truncate"
					title={member.fullname}
					style={{ color: 'var(--text-primary)' }}
				>
					{member.fullname}
				</h3>

				<p
					className="team-card-role mt-1 text-sm sm:text-sm text-[var(--text-secondary)] truncate"
					title={member.primaryRole || member.primaryDesignation || 'Member'}
				>
					{member.primaryRole || member.primaryDesignation || 'Member'}
				</p>

				<p
					className="team-card-dept mt-1 text-sm text-[color:var(--text-muted)] truncate"
					title={member.primaryDept || member.primaryDepartment || 'Team'}
				>
					{member.primaryDept || member.primaryDepartment || 'Team'}
				</p>

				{hasSocials && (
					<div className="team-card-socials mt-3 flex items-center gap-3">
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
									className="social-link inline-flex items-center justify-center w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-[var(--text-secondary)]"
									onClick={(e) => e.stopPropagation()}
									aria-label={`${member.fullname} - ${social.platform || 'link'}`}
									title={social.platform || 'link'}
								>
									<Icon size={14} />
								</a>
							);
						})}

						{socialLinks.length > 4 && (
							<span
								className="ml-auto text-xs px-2 py-0.5 rounded-md bg-white/3 text-[var(--text-muted)]"
								aria-hidden="true"
							>
								+{socialLinks.length - 4}
							</span>
						)}
					</div>
				)}
			</div>
		</motion.article>
	);
});

TeamMemberCard.displayName = 'TeamMemberCard';

export default TeamMemberCard;

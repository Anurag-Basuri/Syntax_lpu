import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Github } from 'lucide-react';

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

const TeamMemberCard = ({ member, onClick }) => {
	const hasSocials = member.linkedin || member.twitter || member.github;

	return (
		<motion.div
			layout
			variants={cardVariants}
			initial="hidden"
			animate="visible"
			exit="hidden"
			transition={{ duration: 0.3, ease: 'easeInOut' }}
			className="team-card"
			onClick={() => onClick(member)}
		>
			<div className="team-card-image-wrapper">
				<img
					src={
						member.profilePicture?.secure_url ||
						`https://api.dicebear.com/8.x/initials/svg?seed=${member.fullname}`
					}
					alt={member.fullname}
					className="team-card-image"
					loading="lazy"
				/>
				<div className="team-card-image-overlay" />
			</div>
			<div className="team-card-content">
				<h3 className="team-card-name">{member.fullname}</h3>
				<p className="team-card-role">{member.primaryRole}</p>
				{hasSocials && (
					<div className="team-card-socials">
						{member.linkedin && (
							<a
								href={member.linkedin}
								target="_blank"
								rel="noopener noreferrer"
								className="social-link"
								onClick={(e) => e.stopPropagation()}
								aria-label={`${member.fullname}'s LinkedIn`}
							>
								<Linkedin size={16} />
							</a>
						)}
						{member.twitter && (
							<a
								href={member.twitter}
								target="_blank"
								rel="noopener noreferrer"
								className="social-link"
								onClick={(e) => e.stopPropagation()}
								aria-label={`${member.fullname}'s Twitter`}
							>
								<Twitter size={16} />
							</a>
						)}
						{member.github && (
							<a
								href={member.github}
								target="_blank"
								rel="noopener noreferrer"
								className="social-link"
								onClick={(e) => e.stopPropagation()}
								aria-label={`${member.fullname}'s GitHub`}
							>
								<Github size={16} />
							</a>
						)}
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default TeamMemberCard;

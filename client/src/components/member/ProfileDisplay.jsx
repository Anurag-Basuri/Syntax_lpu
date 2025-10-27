import React, { memo } from 'react';
import { motion } from 'framer-motion';
import {
	Mail,
	Phone,
	GraduationCap,
	Calendar,
	Building,
	Award,
	Users,
	FileText,
	Download,
	ExternalLink,
	MapPin,
} from 'lucide-react';

// Memoize the component to prevent unnecessary re-renders
const ProfileDisplay = memo(({ member, onEditToggle }) => {
	const InfoCard = ({ icon: Icon, title, children, className = '' }) => (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}
		>
			<h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
				<div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
					<Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
				</div>
				{title}
			</h3>
			{children}
		</motion.div>
	);

	const InfoItem = ({ icon: Icon, label, value, iconColor = 'text-gray-500' }) => (
		<div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
			<Icon className={`w-5 h-5 ${iconColor}`} />
			<div>
				<p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
					{label}
				</p>
				<p className="text-gray-900 dark:text-white font-semibold">
					{value || 'Not provided'}
				</p>
			</div>
		</div>
	);

	return (
		<div className="space-y-8">
			{/* Contact & Academic Information */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<InfoCard icon={Mail} title="Contact Information">
					<div className="space-y-4">
						<InfoItem
							icon={Mail}
							label="Email"
							value={member.email}
							iconColor="text-blue-500"
						/>
						<InfoItem
							icon={Phone}
							label="Phone"
							value={member.phone}
							iconColor="text-green-500"
						/>
					</div>
				</InfoCard>

				<InfoCard icon={GraduationCap} title="Academic Information">
					<div className="space-y-4">
						<InfoItem
							icon={GraduationCap}
							label="Program"
							value={member.program}
							iconColor="text-purple-500"
						/>
						<InfoItem
							icon={Calendar}
							label="Year"
							value={
								member.year
									? `${member.year}${member.year === 1 ? 'st' : member.year === 2 ? 'nd' : member.year === 3 ? 'rd' : 'th'} Year`
									: null
							}
							iconColor="text-orange-500"
						/>
						{member.hosteler && (
							<InfoItem
								icon={MapPin}
								label="Hostel"
								value={member.hostel}
								iconColor="text-indigo-500"
							/>
						)}
					</div>
				</InfoCard>
			</div>

			{/* Skills Section */}
			{member.skills && member.skills.length > 0 && (
				<InfoCard icon={Award} title={`Skills (${member.skills.length})`}>
					<div className="flex flex-wrap gap-3">
						{member.skills.map((skill, index) => (
							<motion.span
								key={index}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: index * 0.1 }}
								className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold border border-blue-200 dark:border-blue-700 shadow-sm"
							>
								{skill}
							</motion.span>
						))}
					</div>
				</InfoCard>
			)}

			{/* Social Links Section */}
			{member.socialLinks && member.socialLinks.length > 0 && (
				<InfoCard icon={Users} title={`Social Links (${member.socialLinks.length})`}>
					<div className="space-y-3">
						{member.socialLinks.map((link, index) => (
							<motion.a
								key={index}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
								className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
							>
								<div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
								<div className="flex-1 min-w-0">
									<p className="text-gray-900 dark:text-white font-bold text-sm truncate">
										{link.platform}
									</p>
									<p className="text-gray-500 dark:text-gray-400 text-xs truncate">
										{link.url}
									</p>
								</div>
								<ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
							</motion.a>
						))}
					</div>
				</InfoCard>
			)}

			{/* Bio Section */}
			{member.bio && (
				<InfoCard icon={FileText} title="About" className="lg:col-span-2">
					<div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
						<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
							{member.bio}
						</p>
					</div>
				</InfoCard>
			)}

			{/* Resume Section */}
			{member.resume?.url && (
				<InfoCard icon={FileText} title="Resume">
					<div className="space-y-4">
						<motion.a
							href={member.resume.url}
							target="_blank"
							rel="noopener noreferrer"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 transition-all duration-200 group"
						>
							<div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
								<FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
							</div>
							<div className="flex-1">
								<p className="text-gray-900 dark:text-white font-bold">
									View Resume
								</p>
								<p className="text-gray-500 dark:text-gray-400 text-sm">
									Click to open in new tab
								</p>
							</div>
							<div className="flex items-center gap-3">
								<span className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
									PDF
								</span>
								<ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
							</div>
						</motion.a>
					</div>
				</InfoCard>
			)}

			{/* Empty State for Missing Information */}
			{!member.email &&
				!member.phone &&
				!member.program &&
				!member.year &&
				(!member.skills || member.skills.length === 0) &&
				(!member.socialLinks || member.socialLinks.length === 0) &&
				!member.bio &&
				!member.resume?.url && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
					>
						<div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
							<FileText className="w-8 h-8 text-gray-400" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							Complete Your Profile
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
							Add your personal information, skills, and social links to make your
							profile more complete.
						</p>
						<button
							onClick={onEditToggle}
							className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
						>
							Edit Profile
						</button>
					</motion.div>
				)}
		</div>
	);
});

export default ProfileDisplay;

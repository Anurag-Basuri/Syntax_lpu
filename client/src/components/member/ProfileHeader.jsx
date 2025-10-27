import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	User,
	Camera,
	Upload,
	Edit3,
	Lock,
	Shield,
	Hash,
	Calendar,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Settings,
	ZoomIn,
} from 'lucide-react';
import { getDesignationColor, getDepartmentIcon, getStatusColor } from '../../utils/fileUtils.js';

const ProfileHeader = ({
	member,
	onEditToggle,
	onPasswordReset,
	onProfilePictureClick,
	uploadLoading,
	uploadResumeLoading,
	isEditing,
	fileInputRef,
	onImageSelect,
	onResumeUpload,
}) => {
	const resumeInputRef = useRef(null);
	const [showProfilePicture, setShowProfilePicture] = useState(false);
	const DepartmentIcon = getDepartmentIcon(member.department);

	// Modern SVG cover image with abstract shapes, gradients, and subtle geometric accents
	const defaultCoverImage =
		'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
		>
			{/* Cover Image Section */}
			<div className="relative h-24 sm:h-32 md:h-40 lg:h-48">
				<div
					className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 relative"
					style={{
						backgroundImage: `url("${defaultCoverImage}")`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
					}}
				>
					{/* Overlay for better text visibility */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
				</div>
			</div>

			{/* Main Content Section */}
			<div className="relative px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
				{/* Mobile-First Layout */}
				<div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-8">
					{/* Profile Picture */}
					<div className="relative group flex-shrink-0 -mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20 self-center lg:self-start">
						<div
							onClick={() => {
								if (member.profilePicture?.url) {
									onProfilePictureClick(member.profilePicture.url, true); // true = has image
								} else {
									fileInputRef.current?.click(); // No image, open file picker directly
								}
							}}
							className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 rounded-xl sm:rounded-2xl overflow-hidden border-3 sm:border-4 border-white dark:border-gray-800 shadow-xl bg-white dark:bg-gray-800 cursor-pointer"
						>
							{member.profilePicture?.url ? (
								<img
									src={member.profilePicture.url}
									alt={member.fullname}
									className="w-full h-full object-cover"
									style={{ cursor: 'pointer' }}
								/>
							) : (
								<div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
									<User className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-12 lg:h-12 text-white" />
								</div>
							)}
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={onImageSelect}
							className="hidden"
						/>
					</div>

					{/* Member Information Container */}
					<div className="flex-1 pt-1 sm:pt-2 lg:pt-4 min-w-0">
						{/* Mobile: Stack everything vertically */}
						<div className="block lg:hidden space-y-3">
							{/* Name and Status - Mobile */}
							<div className="text-center">
								<h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 break-words leading-tight">
									{member.fullname}
								</h2>

								{/* Status Badges - Mobile */}
								<div className="flex items-center justify-center gap-1.5 flex-wrap">
									<span
										className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(member.status)}`}
									>
										{member.status === 'active' && (
											<CheckCircle2 className="w-3 h-3 inline mr-1" />
										)}
										{member.status === 'banned' && (
											<AlertTriangle className="w-3 h-3 inline mr-1" />
										)}
										{member.status === 'removed' && (
											<Clock className="w-3 h-3 inline mr-1" />
										)}
										{member.status.charAt(0).toUpperCase() +
											member.status.slice(1)}
									</span>
									{member.restriction?.isRestricted && (
										<span className="px-2.5 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30">
											<AlertTriangle className="w-3 h-3 inline mr-1" />
											Restricted
										</span>
									)}
								</div>
							</div>

							{/* Action Buttons - Mobile */}
							<div className="grid grid-cols-3 gap-2">
								<button
									onClick={onEditToggle}
									className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 text-xs font-semibold shadow-md ${
										isEditing
											? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
											: 'bg-blue-600 hover:bg-blue-700 text-white'
									}`}
								>
									{isEditing ? (
										<Settings className="w-3 h-3" />
									) : (
										<Edit3 className="w-3 h-3" />
									)}
									<span className="xs:inline">
										{isEditing ? 'Cancel' : 'Edit'}
									</span>
								</button>

								<button
									onClick={onPasswordReset}
									className="flex items-center justify-center gap-1 px-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 text-xs font-semibold shadow-md"
								>
									<Lock className="w-3 h-3" />
									<span className="xs:inline">Reset</span>
								</button>

								<div className="relative">
									<button
										onClick={() => resumeInputRef.current?.click()}
										disabled={uploadResumeLoading}
										className="w-full flex items-center justify-center gap-1 px-2 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg transition-all duration-200 text-xs font-semibold shadow-md disabled:cursor-not-allowed"
									>
										{uploadResumeLoading ? (
											<div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
										) : (
											<Upload className="w-3 h-3" />
										)}
										<span className="xs:inline">Resume</span>
									</button>

									{member.resume?.url && !uploadResumeLoading && (
										<div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
											<CheckCircle2 className="w-1.5 h-1.5 text-white" />
										</div>
									)}

									<input
										ref={resumeInputRef}
										type="file"
										accept=".pdf,.doc,.docx"
										onChange={onResumeUpload}
										className="hidden"
									/>
								</div>
							</div>
						</div>

						{/* Desktop: Side by Side Layout */}
						<div className="hidden lg:flex lg:items-start lg:justify-between gap-4 mb-6">
							{/* Left Side - Name, Title, and Status */}
							<div className="flex-1 min-w-0">
								<h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 break-words">
									{member.fullname}
								</h2>

								{/* Status Badges */}
								<div className="flex items-center gap-2 flex-wrap">
									<span
										className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(member.status)}`}
									>
										{member.status === 'active' && (
											<CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5" />
										)}
										{member.status === 'banned' && (
											<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5" />
										)}
										{member.status === 'removed' && (
											<Clock className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5" />
										)}
										{member.status.charAt(0).toUpperCase() +
											member.status.slice(1)}
									</span>
									{member.restriction?.isRestricted && (
										<span className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-amber-700 bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30">
											<AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1.5" />
											Restricted
										</span>
									)}
								</div>
							</div>

							{/* Right Side - Action Buttons (Desktop) */}
							<div className="flex-shrink-0 w-48">
								<div className="flex flex-col gap-2">
									<button
										onClick={onEditToggle}
										className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg justify-center ${
											isEditing
												? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
												: 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:scale-105'
										}`}
									>
										{isEditing ? (
											<Settings className="w-4 h-4" />
										) : (
											<Edit3 className="w-4 h-4" />
										)}
										{isEditing ? 'Cancel Edit' : 'Edit Profile'}
									</button>

									<button
										onClick={onPasswordReset}
										className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 justify-center"
									>
										<Lock className="w-4 h-4" />
										Reset Password
									</button>

									<div className="relative">
										<button
											onClick={() => resumeInputRef.current?.click()}
											disabled={uploadResumeLoading}
											className="w-full flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 justify-center"
										>
											{uploadResumeLoading ? (
												<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
											) : (
												<Upload className="w-4 h-4" />
											)}
											{member.resume?.url ? 'Update Resume' : 'Upload Resume'}
										</button>

										{member.resume?.url && !uploadResumeLoading && (
											<div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
												<CheckCircle2 className="w-2.5 h-2.5 text-white" />
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Member Details Grid */}
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4 lg:mt-0">
							<div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600">
								<div
									className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${getDesignationColor(member.designation)}`}
								>
									<Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
										Designation
									</p>
									<p className="text-gray-900 dark:text-white font-bold text-xs sm:text-sm truncate">
										{member.designation}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600">
								<div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600">
									<DepartmentIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
										Department
									</p>
									<p className="text-gray-900 dark:text-white font-bold text-xs sm:text-sm truncate">
										{member.department}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600">
								<div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600">
									<Hash className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
										LPU ID
									</p>
									<p className="text-gray-900 dark:text-white font-bold text-xs sm:text-sm">
										{member.LpuId}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-600">
								<div className="p-1.5 sm:p-2 rounded-md sm:rounded-lg bg-gradient-to-r from-orange-500 to-amber-600">
									<Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">
										Joined
									</p>
									<p className="text-gray-900 dark:text-white font-bold text-xs sm:text-sm">
										{new Date(
											member.joinedAt || member.createdAt
										).toLocaleDateString('en-US', {
											month: 'short',
											year: 'numeric',
										})}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Restriction Notice - Separate section for better spacing */}
				{member.restriction?.isRestricted && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="mt-4 sm:mt-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg sm:rounded-xl"
					>
						<div className="flex items-start gap-2 sm:gap-3">
							<div className="p-1.5 sm:p-2 bg-amber-100 dark:bg-amber-500/20 rounded-md sm:rounded-lg flex-shrink-0">
								<AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-amber-900 dark:text-amber-300 font-bold text-xs sm:text-sm">
									Account Restriction
								</p>
								<p className="text-amber-800 dark:text-amber-400 text-xs sm:text-sm mt-1 leading-relaxed break-words">
									{member.restriction.reason}
								</p>
								{member.restriction.time && (
									<p className="text-amber-700 dark:text-amber-500 text-xs mt-2 font-semibold">
										Restricted on:{' '}
										{new Date(member.restriction.time).toLocaleDateString(
											'en-US',
											{
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											}
										)}
									</p>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</div>

			{/* Profile Picture Viewer */}
			<AnimatePresence>
				{showProfilePicture && member?.profilePicture?.url && (
					<ProfilePictureView
						image={member.profilePicture.url}
						onClose={() => setShowProfilePicture(false)}
						onUploadNew={() => {
							setShowProfilePicture(false);
							setTimeout(() => fileInputRef.current?.click(), 200);
						}}
					/>
				)}
			</AnimatePresence>
		</motion.div>
	);
};

export default ProfileHeader;

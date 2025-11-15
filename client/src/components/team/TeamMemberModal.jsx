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
	Download,
	Calendar,
	School,
	Badge,
	Clock,
	IdCard,
	Shield,
	AlertTriangle,
	CheckCircle,
	XCircle,
	Info,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

const getAvatarUrl = (profilePicture) => {
	if (!profilePicture) return null;
	if (typeof profilePicture === 'string') return profilePicture;
	if (typeof profilePicture === 'object') return profilePicture.url || null;
	return null;
};

const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	const d = new Date(dateString);
	if (isNaN(d.getTime())) return 'Invalid date';
	return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateTime = (dateString) => {
	if (!dateString) return 'N/A';
	const d = new Date(dateString);
	if (isNaN(d.getTime())) return 'Invalid date';
	return d.toLocaleString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
};

const TeamMemberModal = ({ member, isOpen, onClose }) => {
	const { isAuthenticated } = useAuth();
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

	const avatar = getAvatarUrl(member?.profilePicture);

	// Enhanced tabs with authentication-aware visibility
	const tabs = useMemo(() => {
		if (!member) return [];
		const hasContactInfo =
			(isAuthenticated && (member.email || member.phone)) ||
			(member.socialLinks?.length ?? 0) > 0;
		const hasAcademicInfo = !!(member.program || member.year || member.hosteler !== undefined);

		return [
			{ id: 'about', label: 'About', icon: User, show: true },
			{
				id: 'contact',
				label: 'Contact',
				icon: Mail,
				show: hasContactInfo,
			},
			{
				id: 'skills',
				label: 'Skills',
				icon: Code,
				show: Array.isArray(member.skills) && member.skills.length > 0,
			},
			{
				id: 'academic',
				label: 'Academic',
				icon: GraduationCap,
				show: hasAcademicInfo,
			},
			{
				id: 'documents',
				label: 'Documents',
				icon: FileText,
				show: !!member.resume?.url,
			},
			{
				id: 'details',
				label: 'Details',
				icon: Info,
				show: isAuthenticated && (member.memberID || member.status || member._id),
			},
		].filter((t) => t.show);
	}, [member, isAuthenticated]);

	const handleKeyDown = useCallback(
		(e) => {
			if (e.key === 'Escape' && isOpen) onClose();
		},
		[isOpen, onClose]
	);

	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			setActiveTab('about');
			setImageError(false);
			window.addEventListener('keydown', handleKeyDown);
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, handleKeyDown]);

	if (!isOpen || !member) return null;

	// Get all departments and designations (not just primary)
	const allDepartments = Array.isArray(member.department)
		? member.department.filter(Boolean)
		: member.department
		? [member.department]
		: [];
	const allDesignations = Array.isArray(member.designation)
		? member.designation.filter(Boolean)
		: member.designation
		? [member.designation]
		: [];

	const departmentText = member.primaryDepartment || allDepartments.join(', ') || '';
	const designationText = member.primaryDesignation || allDesignations.join(', ') || '';

	// Status badge component
	const StatusBadge = ({ status }) => {
		const statusConfig = {
			active: {
				icon: CheckCircle,
				color: 'text-green-600 dark:text-green-400',
				label: 'Active',
			},
			banned: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'Banned' },
			removed: { icon: XCircle, color: 'text-gray-600 dark:text-gray-400', label: 'Removed' },
		};
		const config = statusConfig[status] || statusConfig.active;
		const Icon = config.icon;

		return (
			<div className={`flex items-center gap-2 ${config.color}`}>
				<Icon size={16} />
				<span className="font-medium">{config.label}</span>
			</div>
		);
	};

	const avatarCoverStyle = avatar
		? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.18)), url(${avatar})` }
		: { background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' };

	return (
		<div
			className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
			role="dialog"
			aria-modal="true"
			aria-label={`Profile of ${member.fullname}`}
		>
			<div
				className="relative w-full max-w-5xl max-h-[calc(100vh-var(--navbar-height,4.5rem)-2rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Left: Hero/Cover */}
				<div
					className="w-full md:w-1/3 lg:w-1/3 flex-shrink-0"
					style={{ minHeight: 220, ...avatarCoverStyle }}
				>
					<div className="h-full p-6 flex flex-col justify-between text-white">
						<div className="flex items-start gap-3">
							<div className="w-20 h-20 rounded-xl overflow-hidden ring-4 ring-white shadow-xl">
								{!imageError && avatar ? (
									<img
										src={avatar}
										alt={member.fullname}
										className="w-full h-full object-cover"
										onError={() => setImageError(true)}
										loading="lazy"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center bg-indigo-600 font-bold text-2xl text-white">
										{initials}
									</div>
								)}
							</div>
							<div className="min-w-0">
								<h2 className="text-xl sm:text-2xl font-bold leading-tight break-words">{member.fullname}</h2>
								<p className="text-sm mt-1 text-white/80 truncate">{member.primaryRole || member.primaryDesignation || 'Member'}</p>
								<p className="text-xs mt-1 text-white/70">{member.primaryDept || member.primaryDepartment || 'Team'}</p>
							</div>
						</div>

						{/* Actions */}
						<div className="mt-4">
							<div className="flex flex-col sm:flex-row sm:items-center gap-3">
								{member.email && (
									<a
										href={`mailto:${member.email}`}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-indigo-700 font-medium shadow hover:opacity-95"
									>
										<Mail size={16} /> Email
									</a>
								)}
								{member.phone && (
									<a
										href={`tel:${member.phone}`}
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:opacity-95"
									>
										<Phone size={16} /> Call
									</a>
								)}
								{member.resume?.url && (
									<a
										href={member.resume.url}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium shadow hover:bg-emerald-500"
									>
										<Download size={16} /> Resume
									</a>
								)}
							</div>

							{/* Social Icons */}
							{member.socialLinks?.length > 0 && (
								<div className="mt-4 flex flex-wrap gap-2">
									{member.socialLinks.map((s, i) => {
										const raw = s?.url?.startsWith('http') ? s.url : `https://${s?.url || ''}`;
										const p = (s.platform || '').toLowerCase();
										const Icon = p.includes('github') ? Github : p.includes('linkedin') ? Linkedin : Globe;
										return (
											<a
												key={i}
												href={raw}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 text-white hover:bg-white/20"
											>
												<Icon size={14} /> <span className="text-sm">{s.platform || 'Profile'}</span>
											</a>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Right: Content */}
				<div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-900 p-5 md:p-6">
					{/* Header quick meta */}
					<div className="flex items-center justify-between gap-4 mb-4">
						<div className="flex items-center gap-4 min-w-0">
							<div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
								<div className="font-medium">{designationText}</div>
								<div className="text-xs mt-1">{departmentText}</div>
							</div>
							{member.isLeader && (
								<div className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
									<Shield size={14} /> Leader
								</div>
							)}
						</div>

						<button
							onClick={onClose}
							className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
							aria-label="Close profile"
						>
							<X size={18} />
						</button>
					</div>

					{/* Tabs */}
					<div className="mb-4 border-b border-gray-200 dark:border-gray-700">
						<div className="flex gap-2 overflow-x-auto scrollbar-hide">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
											activeTab === tab.id
												? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
												: 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
										}`}
									>
										<Icon size={14} />
										<span>{tab.label}</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Tab Content */}
					<div className="space-y-4 text-sm text-gray-800 dark:text-gray-200">
						{/* About */}
						{activeTab === 'about' && (
							<div className="space-y-4">
								<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700">
									<p className={member.bio ? 'text-sm' : 'text-sm italic text-gray-500 dark:text-gray-400'}>
										{member.bio || 'No bio provided.'}
									</p>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									{member.joinedAt && (
										<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 flex items-center gap-3">
											<Clock size={18} className="text-indigo-600 dark:text-indigo-300" />
											<div>
												<div className="text-xs text-gray-500 dark:text-gray-400">Member since</div>
												<div className="text-sm font-medium">{formatDate(member.joinedAt)}</div>
											</div>
										</div>
									)}
									{isAuthenticated && member.restriction?.isRestricted && (
										<div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
											<AlertTriangle className="text-amber-600 dark:text-amber-300" size={18} />
											<div>
												<div className="font-semibold text-amber-800 dark:text-amber-200">Account Restriction</div>
												{member.restriction.reason && (
													<div className="text-xs text-amber-700 dark:text-amber-200 mt-1">{member.restriction.reason}</div>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Contact */}
						{activeTab === 'contact' && (
							<div className="space-y-3">
								{isAuthenticated && member.email && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2"><Mail size={14} /> Email</div>
										<a href={`mailto:${member.email}`} className="text-indigo-700 dark:text-indigo-300 font-medium break-all">{member.email}</a>
									</div>
								)}
								{isAuthenticated && member.phone && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2"><Phone size={14} /> Phone</div>
										<a href={`tel:${member.phone}`} className="text-indigo-700 dark:text-indigo-300 font-medium">{member.phone}</a>
									</div>
								)}
								{member.socialLinks?.length > 0 && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2"><Globe size={14} /> Social Profiles</div>
										<div className="flex flex-wrap gap-2">
											{member.socialLinks.map((s, i) => {
												const url = s?.url?.startsWith('http') ? s.url : `https://${s?.url || ''}`;
												const platform = (s.platform || '').toLowerCase();
												const Icon = platform.includes('github') ? Github : platform.includes('linkedin') ? Linkedin : Globe;
												return (
													<a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm">
														<Icon size={14} /> {s.platform || 'Profile'}
													</a>
												);
											})}
										</div>
									</div>
								)}
								{!isAuthenticated && !member.socialLinks?.length && (
									<p className="text-gray-500 dark:text-gray-400 italic text-center py-4">Contact information is only available to authenticated users.</p>
								)}
							</div>
						)}

						{/* Skills */}
						{activeTab === 'skills' && (
							<div>
								{member.skills?.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{member.skills.map((skill, idx) => (
											<span key={idx} className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
												{skill}
											</span>
										))}
									</div>
								) : (
									<p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No skills listed.</p>
								)}
							</div>
						)}

						{/* Academic */}
						{activeTab === 'academic' && (
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{member.program && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><School size={14} /> Program</div>
										<div className="font-medium">{member.program}</div>
									</div>
								)}
								{member.year && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Calendar size={14} /> Academic Year</div>
										<div className="font-medium">Year {member.year}</div>
									</div>
								)}
								{typeof member.hosteler === 'boolean' && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 sm:col-span-2">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Building size={14} /> Residence</div>
										<div className="font-medium">{member.hosteler ? `Hosteler${member.hostel ? ` - ${member.hostel}` : ''}` : 'Day Scholar'}</div>
									</div>
								)}
							</div>
						)}

						{/* Documents */}
						{activeTab === 'documents' && (
							<div>
								{member.resume?.url ? (
									<a href={member.resume.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white">
										<Download size={16} /> View Resume
									</a>
								) : (
									<p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No documents available.</p>
								)}
							</div>
						)}

						{/* Details */}
						{activeTab === 'details' && isAuthenticated && (
							<div className="space-y-3">
								{member.memberID && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><IdCard size={14} /> Member ID</div>
										<div className="font-mono text-xs break-all">{member.memberID}</div>
									</div>
								)}
								{member._id && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><IdCard size={14} /> Database ID</div>
										<div className="font-mono text-xs break-all">{member._id}</div>
									</div>
								)}
								{member.status && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Shield size={14} /> Account Status</div>
										<StatusBadge status={member.status} />
									</div>
								)}
								{allDepartments.length > 0 && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-2 flex items-center gap-2"><Badge size={14} /> All Departments</div>
										<div className="flex flex-wrap gap-2">
											{allDepartments.map((d, i) => (
												<span key={i} className="px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-xs">{d}</span>
											))}
										</div>
									</div>
								)}
								{allDesignations.length > 0 && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-2 flex items-center gap-2"><User size={14} /> All Designations</div>
										<div className="flex flex-wrap gap-2">
											{allDesignations.map((d, i) => (
												<span key={i} className="px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs">{d}</span>
											))}
										</div>
									</div>
								)}
								{member.createdAt && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Clock size={14} /> Created At</div>
										<div className="text-xs">{formatDateTime(member.createdAt)}</div>
									</div>
								)}
								{member.updatedAt && (
									<div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700">
										<div className="text-xs text-gray-500 mb-1 flex items-center gap-2"><Clock size={14} /> Last Updated</div>
										<div className="text-xs">{formatDateTime(member.updatedAt)}</div>
									</div>
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

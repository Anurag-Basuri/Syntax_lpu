import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
	Mail,
	Phone,
	GraduationCap,
	Calendar,
	Building,
	MapPin,
	Award,
	Users,
	FileText,
	Save,
	X,
	Plus,
	Trash2,
} from 'lucide-react';
import { allSkills } from '../../utils/fileUtils.js';

// --- SkillsSelector Component ---
const SkillsSelector = ({ allSkills, selectedSkills, onSkillAdd, newSkill, setNewSkill }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const inputRef = useRef(null);
	const dropdownRef = useRef(null);
	const scrollContainerRef = useRef(null);

	// Popular skills (not already selected)
	const popularSkills = useMemo(
		() =>
			[
				'JavaScript',
				'React',
				'Python',
				'Java',
				'HTML',
				'CSS',
				'UI/UX Design',
				'Project Management',
				'Data Analysis',
				'Public Speaking',
				'Leadership',
				'Teamwork',
			].filter(
				(skill) => !selectedSkills.some((sel) => sel.toLowerCase() === skill.toLowerCase())
			),
		[selectedSkills]
	);

	// Filtered skills based on input
	const filteredSkills = useMemo(() => {
		const searchTerm = newSkill.trim().toLowerCase();
		if (!searchTerm) return [];
		const startsWith = allSkills.filter(
			(skill) =>
				skill.toLowerCase().startsWith(searchTerm) &&
				!selectedSkills.some((sel) => sel.toLowerCase() === skill.toLowerCase())
		);
		const contains = allSkills.filter(
			(skill) =>
				!skill.toLowerCase().startsWith(searchTerm) &&
				skill.toLowerCase().includes(searchTerm) &&
				!selectedSkills.some((sel) => sel.toLowerCase() === skill.toLowerCase())
		);
		return [...startsWith, ...contains].slice(0, 50);
	}, [allSkills, newSkill, selectedSkills]);

	const skillsToShow = newSkill.trim() === '' ? popularSkills : filteredSkills;

	// Add skill handler
	const handleAddSkill = useCallback(
		(skillToAdd) => {
			const trimmed = skillToAdd.trim();
			if (
				trimmed &&
				!selectedSkills.some((sel) => sel.toLowerCase() === trimmed.toLowerCase())
			) {
				onSkillAdd(trimmed);
				setNewSkill('');
				setIsDropdownOpen(false);
				setFocusedIndex(-1);
				inputRef.current?.focus();
			}
		},
		[onSkillAdd, selectedSkills, setNewSkill]
	);

	// Keyboard navigation
	const handleKeyDown = (e) => {
		if (!isDropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
			setIsDropdownOpen(true);
			setFocusedIndex(0);
			return;
		}
		if (!isDropdownOpen) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setFocusedIndex((i) => (i + 1) % skillsToShow.length);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setFocusedIndex((i) => (i - 1 + skillsToShow.length) % skillsToShow.length);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (focusedIndex >= 0 && skillsToShow[focusedIndex]) {
				handleAddSkill(skillsToShow[focusedIndex]);
			} else if (newSkill.trim()) {
				handleAddSkill(newSkill);
			}
		} else if (e.key === 'Escape') {
			setIsDropdownOpen(false);
		}
	};

	// Close dropdown on outside click
	useEffect(() => {
		const handleClick = (e) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target) &&
				inputRef.current &&
				!inputRef.current.contains(e.target)
			) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	// Scroll focused item into view
	useEffect(() => {
		if (!scrollContainerRef.current || focusedIndex < 0) return;
		const item = scrollContainerRef.current.querySelector(`[data-index="${focusedIndex}"]`);
		if (item) item.scrollIntoView({ block: 'nearest' });
	}, [focusedIndex]);

	// Highlight search term in skill
	const renderSkillOption = (skill) => {
		const searchTerm = newSkill.trim().toLowerCase();
		if (!searchTerm) return skill;
		const idx = skill.toLowerCase().indexOf(searchTerm);
		if (idx === -1) return skill;
		return (
			<>
				{skill.substring(0, idx)}
				<span className="font-semibold bg-yellow-100 dark:bg-yellow-900/40 rounded">
					{skill.substring(idx, idx + searchTerm.length)}
				</span>
				{skill.substring(idx + searchTerm.length)}
			</>
		);
	};

	return (
		<div className="relative">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<input
						ref={inputRef}
						type="text"
						value={newSkill}
						onChange={(e) => {
							setNewSkill(e.target.value);
							setIsDropdownOpen(true);
							setFocusedIndex(-1);
						}}
						onFocus={() => setIsDropdownOpen(true)}
						onKeyDown={handleKeyDown}
						className="w-full pl-3 pr-9 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
						placeholder="Search skills or add your own"
						aria-label="Search skills"
						role="combobox"
						aria-expanded={isDropdownOpen}
						aria-controls="skills-listbox"
						aria-autocomplete="list"
						autoComplete="off"
					/>
					{newSkill && (
						<button
							type="button"
							onClick={() => {
								setNewSkill('');
								inputRef.current?.focus();
							}}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
							aria-label="Clear search"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
					{isDropdownOpen && (
						<div
							ref={dropdownRef}
							id="skills-listbox"
							role="listbox"
							className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
						>
							<div
								ref={scrollContainerRef}
								className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
							>
								{skillsToShow.length > 0 ? (
									<>
										<div className="sticky top-0 bg-gray-50 dark:bg-gray-700 py-1.5 px-3 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
											{newSkill.trim() === ''
												? 'Popular Skills'
												: `Search Results (${skillsToShow.length})`}
										</div>
										{skillsToShow.map((skill, idx) => (
											<button
												key={skill}
												data-index={idx}
												type="button"
												onClick={() => handleAddSkill(skill)}
												onMouseEnter={() => setFocusedIndex(idx)}
												className={`w-full text-left px-4 py-2 text-sm transition-colors ${
													idx === focusedIndex
														? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
														: 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
												}`}
												role="option"
												aria-selected={idx === focusedIndex}
											>
												{renderSkillOption(skill)}
											</button>
										))}
									</>
								) : newSkill.trim() ? (
									<div className="py-3 px-4 text-sm">
										<p className="text-gray-500 dark:text-gray-400 mb-2">
											No matching skills found.
										</p>
										<button
											onClick={() => handleAddSkill(newSkill)}
											className="w-full text-left flex items-center justify-between gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
										>
											<span className="text-gray-700 dark:text-gray-300">
												Add "{newSkill}" as a custom skill
											</span>
											<span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
												Enter
											</span>
										</button>
									</div>
								) : (
									<div className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-center">
										Start typing to search for skills
									</div>
								)}
							</div>
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={() => handleAddSkill(newSkill)}
					disabled={!newSkill.trim()}
					className="px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm disabled:opacity-50 disabled:hover:bg-cyan-500 flex-shrink-0"
					title="Add skill"
					aria-label="Add skill"
				>
					<Plus className="w-4 h-4" />
				</button>
			</div>
			<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
				<span className="flex items-center gap-1">
					<span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">
						↑
					</span>
					<span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">
						↓
					</span>
					to navigate
				</span>
				<span className="flex items-center gap-1">
					<span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">
						Enter
					</span>
					to select
				</span>
				<span className="flex items-center gap-1">
					<span className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded font-mono">
						Esc
					</span>
					to close
				</span>
			</div>
		</div>
	);
};

// --- Main ProfileForm Component ---
const ProfileForm = ({
	formData,
	onInputChange,
	onSocialLinkChange,
	onAddSocialLink,
	onRemoveSocialLink,
	onAddSkill,
	onRemoveSkill,
	newSkill,
	setNewSkill,
	onSubmit,
	onCancel,
	isLoading,
}) => {
	// Validation: If hosteler is true, hostel must not be empty
	const isHostelInvalid = formData.hosteler && !formData.hostel;

	// Prevent duplicate social links (by platform or url)
	const isSocialLinksValid = useMemo(() => {
		const platforms = new Set();
		const urls = new Set();
		for (const link of formData.socialLinks) {
			if (!link.platform || !link.url) return false;
			const plat = link.platform.trim().toLowerCase();
			const url = link.url.trim().toLowerCase();
			if (platforms.has(plat) || urls.has(url)) return false;
			platforms.add(plat);
			urls.add(url);
		}
		return true;
	}, [formData.socialLinks]);

	// Prevent duplicate skills (case-insensitive)
	const isSkillsValid = useMemo(() => {
		const lowerSkills = formData.skills.map((s) => s.trim().toLowerCase());
		return lowerSkills.length === new Set(lowerSkills).size;
	}, [formData.skills]);

	const canSubmit = !isHostelInvalid && isSocialLinksValid && isSkillsValid && !isLoading;

	return (
		<motion.div
			initial={{ opacity: 0, height: 0 }}
			animate={{ opacity: 1, height: 'auto' }}
			exit={{ opacity: 0, height: 0 }}
			className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!canSubmit) return;
					onSubmit(e);
				}}
				className="space-y-6"
				autoComplete="off"
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Email */}
					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
							<Mail className="w-4 h-4 inline mr-2" />
							Email
						</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={onInputChange}
							className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
							placeholder="Enter your email"
							required
						/>
					</div>
					{/* Phone */}
					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
							<Phone className="w-4 h-4 inline mr-2" />
							Phone Number
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={onInputChange}
							pattern="[0-9]{10}"
							className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
							placeholder="10-digit phone number"
							required
						/>
					</div>
					{/* Program */}
					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
							<GraduationCap className="w-4 h-4 inline mr-2" />
							Program
						</label>
						<input
							type="text"
							name="program"
							value={formData.program}
							onChange={onInputChange}
							className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
							placeholder="e.g., B.Tech CSE"
							required
						/>
					</div>
					{/* Year */}
					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
							<Calendar className="w-4 h-4 inline mr-2" />
							Year
						</label>
						<select
							name="year"
							value={formData.year}
							onChange={onInputChange}
							className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
							required
						>
							<option value="">Select Year</option>
							<option value="1">1st Year</option>
							<option value="2">2nd Year</option>
							<option value="3">3rd Year</option>
							<option value="4">4th Year</option>
						</select>
					</div>
				</div>

				{/* Hosteler */}
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
						<input
							type="checkbox"
							name="hosteler"
							checked={formData.hosteler}
							onChange={onInputChange}
							className="rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
						/>
						<Building className="w-4 h-4" />
						Are you a hosteler?
					</label>
				</div>
				{/* Hostel selection */}
				{formData.hosteler && (
					<div>
						<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
							<MapPin className="w-4 h-4 inline mr-2" />
							Hostel
						</label>
						<select
							name="hostel"
							value={formData.hostel}
							onChange={onInputChange}
							className={`w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border ${
								isHostelInvalid
									? 'border-red-500 dark:border-red-400'
									: 'border-gray-200 dark:border-gray-600'
							} text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm`}
							required={formData.hosteler}
						>
							<option value="">Select Hostel</option>
							{[
								'BH-1',
								'BH-2',
								'BH-3',
								'BH-4',
								'BH-5',
								'BH-6',
								'BH-7',
								'GH-1',
								'GH-2',
								'GH-3',
								'GH-4',
								'GH-5',
								'GH-6',
								'GH-7',
							].map((h) => (
								<option key={h} value={h}>
									{h}
								</option>
							))}
						</select>
						{isHostelInvalid && (
							<p className="text-red-500 text-xs mt-1">Please select your hostel.</p>
						)}
					</div>
				)}

				{/* Skills */}
				<div>
					<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
						<Award className="w-4 h-4 inline mr-2" />
						Skills (Max 15)
					</label>
					<div className="flex flex-wrap gap-2 mb-3">
						{formData.skills.map((skill, idx) => (
							<motion.span
								key={skill + idx}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								className="flex items-center gap-1 px-2.5 py-1 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-full text-xs"
							>
								{skill}
								<button
									type="button"
									onClick={() => onRemoveSkill(idx)}
									className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-200"
									aria-label={`Remove skill ${skill}`}
								>
									<X className="w-3 h-3" />
								</button>
							</motion.span>
						))}
					</div>
					{formData.skills.length < 15 && (
						<SkillsSelector
							allSkills={allSkills}
							selectedSkills={formData.skills}
							onSkillAdd={(skill) => {
								onAddSkill(skill);
								setNewSkill(''); // Ensure input is cleared after adding
							}}
							newSkill={newSkill}
							setNewSkill={setNewSkill}
						/>
					)}
					{/* Duplicate skills error message */}
					{!isSkillsValid && (
						<p className="text-red-500 text-xs mt-1">
							Duplicate skills are not allowed.
						</p>
					)}
				</div>

				{/* Social Links */}
				<div>
					<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
						<Users className="w-4 h-4 inline mr-2" />
						Social Links (Max 5)
					</label>
					<div className="space-y-3">
						{formData.socialLinks.map((link, idx) => (
							<motion.div
								key={idx}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex gap-2"
							>
								<input
									type="text"
									value={link.platform}
									onChange={(e) =>
										onSocialLinkChange(idx, 'platform', e.target.value)
									}
									className="w-1/3 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
									placeholder="Platform"
									required
								/>
								<input
									type="url"
									value={link.url}
									onChange={(e) => onSocialLinkChange(idx, 'url', e.target.value)}
									className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-sm"
									placeholder="https://..."
									required
								/>
								<button
									type="button"
									onClick={() => onRemoveSocialLink(idx)}
									className="px-2.5 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
									aria-label="Remove social link"
								>
									<Trash2 className="w-4 h-4" />
								</button>
							</motion.div>
						))}
					</div>
					{formData.socialLinks.length < 5 && (
						<button
							type="button"
							onClick={onAddSocialLink}
							className="mt-3 flex items-center gap-2 px-3 py-2 bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-500/30 transition-colors text-sm"
						>
							<Plus className="w-4 h-4" />
							Add Social Link
						</button>
					)}
					{/* Social links validation message */}
					{!isSocialLinksValid && (
						<p className="text-red-500 text-xs mt-1">
							Social links must be unique and filled.
						</p>
					)}
				</div>

				{/* Bio */}
				<div>
					<label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium text-sm">
						<FileText className="w-4 h-4 inline mr-2" />
						Bio (Max 500 characters)
					</label>
					<textarea
						name="bio"
						value={formData.bio}
						onChange={onInputChange}
						maxLength={500}
						rows={4}
						className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none text-sm"
						placeholder="Tell us about yourself..."
						required
					/>
					<p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
						{formData.bio.length}/500 characters
					</p>
				</div>

				{/* Actions */}
				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={!canSubmit}
						className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm disabled:opacity-50"
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
								Saving...
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Save className="w-4 h-4" />
								Save Changes
							</div>
						)}
					</button>
				</div>
			</form>
		</motion.div>
	);
};

export default ProfileForm;

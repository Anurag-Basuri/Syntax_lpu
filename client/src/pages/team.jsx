import React, { useState, useMemo } from 'react';
import { useMembers } from '../hooks/useMembers.js';
import DepartmentSection from '../components/team/DepartmentSection.jsx';
import TeamMemberModal from '../components/team/TeamMemberModal.jsx';
import TeamSkeleton from '../components/team/TeamSkeleton.jsx';
import ErrorBoundary from '../components/team/ErrorBoundary.jsx';
import { Search } from 'lucide-react';

// Error & Empty blocks unchanged
const ErrorBlock = ({ message, onRetry }) => (
	<div className="py-24 text-center">
		<div className="text-5xl mb-4">⚠️</div>
		<h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
			Failed to load team
		</h2>
		<p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{message}</p>
		<button
			onClick={onRetry}
			className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-500"
		>
			Retry
		</button>
	</div>
);

const EmptyState = () => (
	<div className="py-24 text-center">
		<div className="text-6xl mb-4">👥</div>
		<h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
			No members yet
		</h2>
		<p className="text-sm text-gray-500 dark:text-gray-400">
			Check back later. Team onboarding in progress.
		</p>
	</div>
);

const leadershipRoles = ['CEO', 'CTO', 'CFO', 'CMO', 'COO', 'Head', 'President', 'Lead'];

const TeamsPage = () => {
	const { data, isLoading, isError, error, refetch } = useMembers();
	const [selectedMember, setSelectedMember] = useState(null);
	const [expandedDepartments, setExpandedDepartments] = useState({});
	const [query, setQuery] = useState('');

	const members = data?.members || [];

	// Fallback isLeader if backend hasn't added it
	const withLeaderFlag = useMemo(
		() =>
			members.map((m) => ({
				...m,
				isLeader:
					m.isLeader ||
					(Array.isArray(m.designation)
						? m.designation.some((d) => leadershipRoles.includes(d))
						: leadershipRoles.includes(m.designation)),
			})),
		[members]
	);

	// Text match helper
	const matchesQuery = (m) => {
		if (!query) return true;
		const hay = [
			m.fullname,
			m.primaryDesignation,
			m.primaryDepartment,
			Array.isArray(m.designation) ? m.designation.join(' ') : m.designation,
			Array.isArray(m.department) ? m.department.join(' ') : m.department,
			...(m.skills || []),
		]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();
		return hay.includes(query.toLowerCase());
	};

	const leadership = useMemo(
		() => withLeaderFlag.filter((m) => m.isLeader && matchesQuery(m)),
		[withLeaderFlag, query]
	);
	const nonLeadership = useMemo(
		() => withLeaderFlag.filter((m) => !m.isLeader && matchesQuery(m)),
		[withLeaderFlag, query]
	);

	const departments = useMemo(() => {
		return nonLeadership.reduce((acc, member) => {
			const dept =
				member.primaryDepartment ||
				(Array.isArray(member.department) ? member.department[0] : member.department) ||
				'Other';
			if (!acc[dept]) acc[dept] = [];
			acc[dept].push(member);
			return acc;
		}, {});
	}, [nonLeadership]);

	const openModal = (member) => setSelectedMember(member);
	const closeModal = () => setSelectedMember(null);

	const toggleDepartment = (deptName) => {
		setExpandedDepartments((prev) => ({ ...prev, [deptName]: !prev[deptName] }));
	};

	const expandAll = () => {
		const next = {};
		Object.keys(departments).forEach((k) => (next[k] = true));
		setExpandedDepartments(next);
	};
	const collapseAll = () => {
		const next = {};
		Object.keys(departments).forEach((k) => (next[k] = false));
		setExpandedDepartments(next);
	};

	if (isError) {
		return (
			<div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
				<ErrorBlock message={error?.message || 'Unknown error'} onRetry={refetch} />
			</div>
		);
	}

	const totalDepartments = Object.keys(departments).length;

	return (
		<div className="min-h-screen max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
			<header className="mb-6">
				<h1 className="text-3xl font-bold tracking-tight mb-2">
					Team
					<span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">
						/ people behind the club
					</span>
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{isLoading
						? 'Loading…'
						: `Total: ${members.length} • Leadership: ${leadership.length} • Departments: ${totalDepartments}`}
				</p>
			</header>

			{/* Toolbar */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
				<div className="relative w-full sm:w-80">
					<Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search members, roles, departments, skills…"
						className="w-full pl-9 pr-8 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
					/>
					{query && (
						<button
							type="button"
							aria-label="Clear search"
							onClick={() => setQuery('')}
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs"
						>
							✕
						</button>
					)}
				</div>

				<div className="flex gap-2">
					<button
						onClick={expandAll}
						className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						Expand all
					</button>
					<button
						onClick={collapseAll}
						className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						Collapse all
					</button>
				</div>
			</div>

			{isLoading ? (
				<TeamSkeleton />
			) : members.length === 0 ? (
				<EmptyState />
			) : (
				<>
					{leadership.length > 0 && (
						<DepartmentSection
							title="Leadership"
							members={leadership}
							onClick={openModal}
							isExpanded={true}
							onToggle={() => {}}
						/>
					)}

					{Object.entries(departments).map(([dept, memberList]) => (
						<DepartmentSection
							key={dept}
							title={dept}
							members={memberList}
							onClick={openModal}
							isExpanded={expandedDepartments[dept] ?? false}
							onToggle={() => toggleDepartment(dept)}
						/>
					))}
				</>
			)}

			<TeamMemberModal
				member={selectedMember}
				isOpen={!!selectedMember}
				onClose={closeModal}
			/>
		</div>
	);
};

const TeamsPageWrapper = () => (
	<ErrorBoundary>
		<TeamsPage />
	</ErrorBoundary>
);

export default TeamsPageWrapper;

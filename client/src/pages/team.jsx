import React, { useState, useMemo } from 'react';
import { useMembers } from '../hooks/useMembers.js';
import DepartmentSection from '../components/team/DepartmentSection.jsx';
import TeamMemberModal from '../components/team/TeamMemberModal.jsx';
import TeamSkeleton from '../components/team/TeamSkeleton.jsx';
import ErrorBoundary from '../components/team/ErrorBoundary.jsx';

// Error and Empty states remain the same as they are already good.
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

const TeamsPage = () => {
	const { data, isLoading, isError, error, refetch } = useMembers();
	const [selectedMember, setSelectedMember] = useState(null);
	// FIX: Centralize expansion state here
	const [expandedDepartments, setExpandedDepartments] = useState({});

	const members = data?.members || [];

	// FIX: Use the 'isLeader' virtual from the backend for filtering
	const leadership = useMemo(() => members.filter((m) => m.isLeader), [members]);
	const nonLeadership = useMemo(() => members.filter((m) => !m.isLeader), [members]);

	const departments = useMemo(() => {
		return nonLeadership.reduce((acc, member) => {
			const dept = member.primaryDepartment || 'Other';
			if (!acc[dept]) {
				acc[dept] = [];
			}
			acc[dept].push(member);
			return acc;
		}, {});
	}, [nonLeadership]);

	const openModal = (member) => setSelectedMember(member);
	const closeModal = () => setSelectedMember(null);

	// FIX: Handler to toggle department expansion state
	const toggleDepartment = (deptName) => {
		setExpandedDepartments((prev) => ({
			...prev,
			[deptName]: !prev[deptName],
		}));
	};

	if (isError) {
		return (
			<div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
				<ErrorBlock message={error?.message || 'Unknown error'} onRetry={refetch} />
			</div>
		);
	}

	return (
		<div className="min-h-screen max-w-7xl mx-auto px-4 py-8 text-gray-900 dark:text-gray-100">
			<header className="mb-8">
				<h1 className="text-3xl font-bold tracking-tight mb-2">
					Team
					<span className="ml-2 text-base font-medium text-gray-500 dark:text-gray-400">
						/ people behind the club
					</span>
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					{isLoading
						? 'Loading…'
						: `Total members: ${members.length}${
								leadership.length ? ` • Leadership: ${leadership.length}` : ''
						  }`}
				</p>
			</header>

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
							isExpanded={true} // Always show leadership
							onToggle={() => {}} // No toggle for leadership
						/>
					)}

					{Object.entries(departments).map(([dept, memberList]) => (
						<DepartmentSection
							key={dept}
							title={dept}
							members={memberList}
							onClick={openModal}
							isExpanded={expandedDepartments[dept] ?? false} // Use centralized state
							onToggle={() => toggleDepartment(dept)} // Pass handler
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

import React, { useState, useMemo } from 'react';
import { useMembers } from '../hooks/useMembers.js';
import ErrorBoundary from '../components/team/ErrorBoundary';

// Import components
import UnifiedTeamCard from '../components/team/UnifiedTeamCard';
import DepartmentSection from '../components/team/DepartmentSection';
import TeamMemberModal from '../components/team/TeamMemberModal';

// Simple states like Event page
const LoadingGrid = () => (
	<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
		{Array.from({ length: 8 }).map((_, i) => (
			<div
				key={i}
				className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse space-y-3"
			>
				<div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto" />
				<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
				<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
				<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
			</div>
		))}
	</div>
);

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
	const [selected, setSelected] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	const members = data?.members || [];

	// Leadership filtering supports array designations
	const leadership = useMemo(
		() =>
			members.filter((m) =>
				(m.designation || []).some((d) => ['CEO', 'CTO', 'CMO', 'COO'].includes(d))
			),
		[members]
	);

	// Exclude leadership for departmental grouping
	const nonLeadership = members.filter((m) => !leadership.some((l) => l._id === m._id));

	const groupByPrimaryDepartment = useMemo(() => {
		const map = {};
		for (const m of nonLeadership) {
			const dep = m.primaryDepartment || 'Other';
			if (!map[dep]) map[dep] = [];
			map[dep].push(m);
		}
		return map;
	}, [nonLeadership]);

	const openModal = (member) => {
		setSelected(member);
		setModalOpen(true);
	};
	const closeModal = () => {
		setModalOpen(false);
		setTimeout(() => setSelected(null), 200);
	};

	if (isError)
		return (
			<div className="min-h-screen max-w-7xl mx-auto px-4 py-8">
				<ErrorBlock message={error?.message || 'Unknown error'} onRetry={refetch} />
			</div>
		);

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
				<LoadingGrid />
			) : members.length === 0 ? (
				<EmptyState />
			) : (
				<>
					{leadership.length > 0 && (
						<section className="mb-10">
							<div className="flex items-center gap-2 mb-4">
								<h2 className="text-lg font-semibold">Leadership</h2>
								<span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
									{leadership.length}
								</span>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
								{leadership.map((m) => (
									<UnifiedTeamCard key={m._id} member={m} onClick={openModal} />
								))}
							</div>
						</section>
					)}

					{Object.entries(groupByPrimaryDepartment).map(([dep, list]) => (
						<DepartmentSection
							key={dep}
							title={dep}
							members={list}
							onClick={openModal}
						/>
					))}
				</>
			)}

			<TeamMemberModal member={selected} isOpen={modalOpen} onClose={closeModal} />
		</div>
	);
};

const TeamsPageWrapper = () => (
	<ErrorBoundary>
		<TeamsPage />
	</ErrorBoundary>
);

export default TeamsPageWrapper;

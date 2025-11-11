import React, { useState } from 'react';
import ShowContacts from '../components/Showcontacts.jsx';
import ShowApplies from '../components/Showapplies.jsx';
import useTheme from '../hooks/useTheme.js';

const TabButton = ({ active, onClick, children, isDark }) => {
	const activeCls = 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl';
	const inactiveClsDark = 'bg-white/5 text-slate-300 hover:bg-white/6';
	const inactiveClsLight = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
	const inactiveCls = isDark ? inactiveClsDark : inactiveClsLight;

	return (
		<button
			onClick={onClick}
			className={`px-5 py-2 rounded-full font-semibold transition-all duration-150 focus:outline-none ${
				active ? activeCls : inactiveCls
			}`}
		>
			{children}
		</button>
	);
};

const ShowPage = () => {
	const [view, setView] = useState('applications');
	const { theme } = useTheme();
	const isDark = theme === 'dark';

	return (
		<div
			className={`min-h-screen bg-transparent antialiased ${
				isDark ? 'text-white' : 'text-slate-900'
			}`}
		>
			<div className="relative z-10 p-6">
				<div className="max-w-6xl mx-auto">
					<header className="flex items-center justify-between mb-6">
						<div className="flex gap-3">
							<TabButton
								active={view === 'applications'}
								onClick={() => setView('applications')}
								isDark={isDark}
							>
								Applications
							</TabButton>
							<TabButton
								active={view === 'contacts'}
								onClick={() => setView('contacts')}
								isDark={isDark}
							>
								Contacts
							</TabButton>
						</div>
						<div className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm`}>
							Admin Panel
						</div>
					</header>

					<main className="bg-transparent">
						{view === 'applications' ? <ShowApplies /> : <ShowContacts />}
					</main>
				</div>
			</div>
		</div>
	);
};

export default ShowPage;

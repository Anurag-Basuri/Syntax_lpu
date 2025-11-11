import React, { useState } from 'react';
import ShowContacts from '../components/Showcontacts.jsx';
import ShowApplies from '../components/Showapplies.jsx';

const TabButton = ({ active, onClick, children }) => (
	<button
		onClick={onClick}
		className={`px-5 py-2 rounded-full font-semibold transition-all duration-150 focus:outline-none ${
			active
				? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-2xl'
				: 'bg-white/5 text-slate-300 hover:bg-white/6'
		}`}
	>
		{children}
	</button>
);

const ShowPage = () => {
	const [view, setView] = useState('applications');

	return (
		<div className="min-h-screen bg-transparent text-white antialiased">
			<div className="relative z-10 p-6">
				<div className="max-w-6xl mx-auto">
					<header className="flex items-center justify-between mb-6">
						<div className="flex gap-3">
							<TabButton
								active={view === 'applications'}
								onClick={() => setView('applications')}
							>
								Applications
							</TabButton>
							<TabButton
								active={view === 'contacts'}
								onClick={() => setView('contacts')}
							>
								Contacts
							</TabButton>
						</div>
						<div className="text-sm text-slate-400">Admin Panel</div>
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

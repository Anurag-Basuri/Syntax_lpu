import React, { useState } from 'react';
import ShowContacts from '../components/Showcontacts.jsx';
import ShowApplies from '../components/Showapplies.jsx';

const TabButton = ({ active, onClick, children }) => (
	<button
		onClick={onClick}
		className={`px-5 py-2 rounded-2xl font-medium transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
			active
				? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
				: 'bg-transparent text-gray-300 border border-slate-700 hover:shadow-sm'
		}`}
	>
		{children}
	</button>
);

const ShowPage = () => {
	const [view, setView] = useState('applications');

	return (
		<div className="min-h-screen bg-transparent text-white">
			{/* fully transparent background: removed gradient / opaque layers */}

			<div className="relative z-10 p-6">
				<div className="max-w-7xl mx-auto">
					<div className="flex gap-3 mb-6">
						<TabButton
							active={view === 'applications'}
							onClick={() => setView('applications')}
						>
							Applications
						</TabButton>
						<TabButton active={view === 'contacts'} onClick={() => setView('contacts')}>
							Contacts
						</TabButton>
					</div>

					{/* page content */}
					{view === 'applications' ? <ShowApplies /> : <ShowContacts />}
				</div>
			</div>
		</div>
	);
};

export default ShowPage;

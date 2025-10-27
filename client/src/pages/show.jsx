import { useState } from 'react';
import ShowContacts from '../components/Showcontacts.jsx';
import ShowApplies from '../components/Showapplies.jsx';

const ShowPage = () => {
	const [view, setView] = useState('applications');

	return (
		<div className="min-h-screen bg-slate-950 relative overflow-hidden">
			{/* Background effects - consistent with ShowApplies */}
			<div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-cyan-900/20"></div>
			<div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
			<div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

			<div className="relative z-10 p-4 md:p-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
						<div className="flex gap-3">
							<button
								onClick={() => setView('applications')}
								className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
									view === 'applications'
										? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
										: 'bg-slate-800/60 backdrop-blur-sm text-gray-300 hover:bg-slate-700 border border-slate-700'
								}`}
							>
								<div className="flex items-center gap-2">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
										/>
									</svg>
									Applications
								</div>
							</button>
							<button
								onClick={() => setView('contacts')}
								className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
									view === 'contacts'
										? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
										: 'bg-slate-800/60 backdrop-blur-sm text-gray-300 hover:bg-slate-700 border border-slate-700'
								}`}
							>
								<div className="flex items-center gap-2">
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
										/>
									</svg>
									Contacts
								</div>
							</button>
						</div>
					</div>

					<div>{view === 'applications' ? <ShowApplies /> : <ShowContacts />}</div>
				</div>
			</div>
		</div>
	);
};

export default ShowPage;

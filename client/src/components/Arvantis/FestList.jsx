import React from 'react';
import EmptyState from './EmptyState.jsx';
import Badge from './Badge.jsx';
import { Download } from 'lucide-react';

const FestList = ({
	fests = [],
	selectedFestId,
	loadFestDetails,
	fetchFests,
	setCreateOpen,
	exportCSV,
	downloadingCSV,
}) => {
	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h3 className="font-semibold text-white">Fests</h3>
				<button onClick={fetchFests} className="text-sm text-gray-400">
					Refresh
				</button>
			</div>

			<div className="space-y-2 max-h-[60vh] overflow-auto">
				{fests.length === 0 && (
					<EmptyState
						title="No fests"
						subtitle="Create one"
						action={
							<button
								onClick={() => setCreateOpen(true)}
								className="py-2 px-4 rounded bg-purple-600 text-white"
							>
								Create
							</button>
						}
					/>
				)}

				{fests.map((f) => (
					<button
						key={f._id}
						onClick={() => loadFestDetails(f._id)}
						className={`w-full text-left p-3 rounded ${
							selectedFestId === f._id ? 'bg-purple-800/40' : 'bg-white/3'
						} transition`}
						aria-pressed={selectedFestId === f._id}
					>
						<div className="flex items-center justify-between">
							<div>
								<div className="font-medium text-white">
									{f.name || `Arvantis ${f.year}`}
								</div>
								<div className="text-sm text-gray-400">{f.year}</div>
							</div>
							<Badge variant={f.status || 'default'} size="sm">
								{f.status}
							</Badge>
						</div>
					</button>
				))}
			</div>

			<div className="mt-4 flex gap-2">
				<button
					onClick={() => setCreateOpen(true)}
					className="flex-1 py-2 rounded bg-emerald-600 text-white"
				>
					New Fest
				</button>
				<button
					onClick={exportCSV}
					className="px-3 py-2 rounded bg-gray-800 text-white disabled:opacity-50"
					disabled={downloadingCSV}
				>
					{downloadingCSV ? (
						'Exporting...'
					) : (
						<>
							<Download className="inline-block mr-1 h-4 w-4" /> CSV
						</>
					)}
				</button>
			</div>
		</div>
	);
};

export default FestList;

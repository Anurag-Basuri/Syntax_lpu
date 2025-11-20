import React from 'react';

const FestUtilities = ({ downloadAnalytics, refreshEvents, downloadStatistics }) => {
	return (
		<div>
			<h4 className="font-semibold text-white mb-2">Utilities</h4>
			<div className="flex flex-col gap-2">
				<button onClick={downloadAnalytics} className="py-2 rounded bg-blue-600 text-white">
					Download Analytics
				</button>
				<button onClick={refreshEvents} className="py-2 rounded bg-gray-700 text-white">
					Refresh Events
				</button>
				<button
					onClick={downloadStatistics}
					className="py-2 rounded bg-indigo-700 text-white"
				>
					Download Statistics
				</button>
			</div>
		</div>
	);
};

export default FestUtilities;

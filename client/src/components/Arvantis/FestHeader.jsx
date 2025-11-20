import React from 'react';

const FestHeader = ({ editForm, saveEdit, removeFest, downloadReport, actionBusy }) => {
	return (
		<div className="flex items-start justify-between mb-4 gap-4">
			<div>
				<h2 className="text-2xl font-semibold text-white">
					{editForm.name} — {editForm.year}
				</h2>
				<div className="text-sm text-gray-400">
					Status: <span className="inline-block ml-1">{editForm.status}</span>
				</div>
			</div>

			<div className="flex gap-2">
				<button
					onClick={saveEdit}
					disabled={actionBusy}
					className="px-4 py-2 bg-emerald-600 text-white rounded"
				>
					Save
				</button>
				<button
					onClick={() => removeFest(editForm)}
					disabled={actionBusy}
					className="px-4 py-2 bg-red-600 text-white rounded"
				>
					Delete
				</button>
				<button
					onClick={downloadReport}
					disabled={actionBusy}
					className="px-4 py-2 bg-gray-800 text-white rounded"
				>
					Download Report
				</button>
			</div>
		</div>
	);
};

export default FestHeader;

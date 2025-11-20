import React from 'react';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const EditGuidelines = ({
	items = [],
	quickTitle,
	setQuickTitle,
	quickDetails,
	setQuickDetails,
	onAdd,
	onRemove,
	onReorder,
	actionBusy,
}) => {
	return (
		<div className="mb-4">
			<div className="flex items-center justify-between mb-2">
				<h4 className="font-semibold text-white">Guidelines ({items.length})</h4>
				<div className="flex items-center gap-2">
					<input
						value={quickTitle}
						onChange={(e) => setQuickTitle(e.target.value)}
						placeholder="Title"
						className="p-2 bg-white/5 rounded w-44"
					/>
					<input
						value={quickDetails}
						onChange={(e) => setQuickDetails(e.target.value)}
						placeholder="Details"
						className="p-2 bg-white/5 rounded w-64"
					/>
					<button
						onClick={onAdd}
						disabled={actionBusy}
						className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
					>
						Add
					</button>
				</div>
			</div>

			<div className="space-y-2">
				{items.map((g, idx) => (
					<div
						key={String(g._id || g.id || idx)}
						className="flex items-center justify-between p-3 bg-white/3 rounded"
					>
						<div className="flex-1">
							<div className="font-medium text-white">{g.title || '(untitled)'}</div>
							<div className="text-sm text-gray-400">{g.details}</div>
						</div>
						<div className="flex gap-2 items-center">
							<button
								onClick={() => onRemove(g._id || g.id)}
								className="text-red-400"
							>
								<Trash2 className="w-5 h-5" />
							</button>
							<button
								onClick={() => onReorder(idx, idx - 1)}
								disabled={idx === 0 || actionBusy}
								className="text-gray-400"
								title="Move up"
							>
								<ArrowUp />
							</button>
							<button
								onClick={() => onReorder(idx, idx + 1)}
								disabled={idx === items.length - 1 || actionBusy}
								className="text-gray-400"
								title="Move down"
							>
								<ArrowDown />
							</button>
						</div>
					</div>
				))}
				{items.length === 0 && <div className="text-sm text-gray-400">No guidelines</div>}
			</div>
		</div>
	);
};

export default EditGuidelines;

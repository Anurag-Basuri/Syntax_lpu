import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const EditPrizes = ({
	items = [],
	quickTitle,
	setQuickTitle,
	quickPosition,
	setQuickPosition,
	quickAmount,
	setQuickAmount,
	quickCurrency,
	setQuickCurrency,
	onAdd,
	onRemove,
	onReorder,
	actionBusy,
}) => {
	return (
		<div className="mb-4">
			<div className="flex items-center justify-between mb-2">
				<h4 className="font-semibold text-white">Prizes ({items.length})</h4>
				<div className="flex items-center gap-2">
					<input
						value={quickTitle}
						onChange={(e) => setQuickTitle(e.target.value)}
						placeholder="Title"
						className="p-2 bg-white/5 rounded w-40"
					/>
					<input
						value={quickPosition}
						onChange={(e) => setQuickPosition(e.target.value)}
						placeholder="Position"
						className="p-2 bg-white/5 rounded w-24"
					/>
					<input
						value={quickAmount}
						onChange={(e) => setQuickAmount(e.target.value)}
						placeholder="Amount"
						className="p-2 bg-white/5 rounded w-24"
					/>
					<select
						value={quickCurrency}
						onChange={(e) => setQuickCurrency(e.target.value)}
						className="p-2 bg-white/5 rounded"
					>
						<option>INR</option>
						<option>USD</option>
						<option>EUR</option>
					</select>
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
				{items.map((p, idx) => (
					<div
						key={String(p._id || p.id || idx)}
						className="flex items-center justify-between p-3 bg-white/3 rounded"
					>
						<div>
							<div className="font-medium text-white">
								{p.title || p.position || '(prize)'}
							</div>
							<div className="text-sm text-gray-400">
								{p.position}{' '}
								{p.amount ? `— ${p.amount} ${p.currency || 'INR'}` : ''}
							</div>
						</div>
						<div className="flex gap-2 items-center">
							<button
								onClick={() => onRemove(p._id || p.id)}
								className="text-red-400"
							>
								Remove
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
				{items.length === 0 && (
					<div className="text-sm text-gray-400">No prizes defined</div>
				)}
			</div>
		</div>
	);
};

export default EditPrizes;

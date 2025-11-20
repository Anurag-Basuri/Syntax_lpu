import React, { useState } from 'react';

const GuestRow = ({ g, onUpdate, onRemove, onEditOpen, actionBusy }) => {
	const [expanded, setExpanded] = useState(false);
	return (
		<div className="flex flex-col gap-2 p-3 bg-white/3 rounded">
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-3">
					{g.photo?.url ? (
						<img
							src={g.photo.url}
							alt={g.name}
							className="w-10 h-10 object-cover rounded"
						/>
					) : (
						<div className="w-10 h-10 bg-gray-700 rounded" />
					)}
					<div>
						<div className="font-medium text-white">{g.name}</div>
						<div className="text-sm text-gray-400 whitespace-pre-wrap">{g.bio}</div>
					</div>
				</div>
				<div className="flex gap-2 items-start">
					<button onClick={() => setExpanded((s) => !s)} className="text-gray-300">
						{expanded ? 'Close' : 'Details'}
					</button>
					<button onClick={() => onEditOpen(g._id || g.id)} className="text-blue-400">
						Edit
					</button>
					<button onClick={() => onRemove(g._id || g.id)} className="text-red-400">
						Remove
					</button>
				</div>
			</div>

			{expanded && (
				<div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-300">
					{Object.entries(g.socialLinks || {}).map(([k, v]) => (
						<div key={k}>
							<div className="text-xs text-gray-400 capitalize">{k}</div>
							<div className="truncate">{v}</div>
						</div>
					))}
					{!(g.socialLinks && Object.keys(g.socialLinks).length) && (
						<div className="col-span-2 text-sm text-gray-400">No social links</div>
					)}
				</div>
			)}
		</div>
	);
};

const EditGuests = ({
	items = [],
	quickName,
	setQuickName,
	quickBio,
	setQuickBio,
	onAdd,
	onUpdate,
	onRemove,
	actionBusy,
}) => {
	const handleAdd = () => {
		onAdd({ name: quickName?.trim(), bio: quickBio?.trim() });
	};

	const handleEditOpen = (guestId) => {
		// show simple prompts to edit name/bio/socials
		const g = items.find((x) => String(x._id || x.id) === String(guestId));
		if (!g) return;
		const newName = prompt('Guest name', g.name || '')?.trim();
		const newBio = prompt('Guest bio (multiline ok)', g.bio || '')?.trim();
		const web = prompt('Website (optional)', g.socialLinks?.website || '')?.trim();
		const twitter = prompt('Twitter (optional)', g.socialLinks?.twitter || '')?.trim();
		const instagram = prompt('Instagram (optional)', g.socialLinks?.instagram || '')?.trim();
		const payload = {};
		if (newName !== null) payload.name = newName;
		if (newBio !== null) payload.bio = newBio;
		payload.socialLinks = {
			...(g.socialLinks || {}),
			website: web || undefined,
			twitter: twitter || undefined,
			instagram: instagram || undefined,
		};
		onUpdate(guestId, payload);
	};

	return (
		<div className="mb-4">
			<div className="flex items-start justify-between mb-2 gap-3">
				<h4 className="font-semibold text-white">Guests ({items.length})</h4>
				<div className="flex-1 flex items-start gap-2">
					<input
						value={quickName}
						onChange={(e) => setQuickName(e.target.value)}
						placeholder="Name"
						className="p-2 bg-white/5 rounded w-44"
					/>
					<textarea
						value={quickBio}
						onChange={(e) => setQuickBio(e.target.value)}
						placeholder="Bio (supports multiple lines)"
						className="p-2 bg-white/5 rounded flex-1 min-h-[56px] resize-y"
						rows={2}
					/>
					<button
						onClick={handleAdd}
						disabled={actionBusy}
						className="px-3 py-1 rounded bg-emerald-600 text-white text-sm"
					>
						Add
					</button>
				</div>
			</div>

			<div className="space-y-2">
				{items.map((g, idx) => (
					<GuestRow
						key={String(g._id || g.id || idx)}
						g={g}
						onUpdate={onUpdate}
						onRemove={onRemove}
						onEditOpen={handleEditOpen}
						actionBusy={actionBusy}
					/>
				))}
				{items.length === 0 && <div className="text-sm text-gray-400">No guests</div>}
			</div>
		</div>
	);
};

export default EditGuests;

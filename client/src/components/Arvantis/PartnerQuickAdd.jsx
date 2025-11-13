import React, { useState } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import GlassCard from './GlassCard';

const PartnerQuickAdd = React.memo(({ onAdd = () => {}, disabled = false }) => {
	const [isExpanded, setIsExpanded] = useState(false);
	const [name, setName] = useState('');
	const [tier, setTier] = useState('sponsor');
	const [website, setWebsite] = useState('');
	const [logoFile, setLogoFile] = useState(null);
	const [adding, setAdding] = useState(false);
	const [err, setErr] = useState('');

	const submit = async () => {
		setErr('');
		if (!name || !logoFile) {
			setErr('Partner name and logo are required');
			return;
		}
		setAdding(true);
		try {
			const fd = new FormData();
			fd.append('name', name);
			fd.append('tier', tier);
			if (website) fd.append('website', website);
			fd.append('logo', logoFile);
			await onAdd(fd);
			setName('');
			setTier('sponsor');
			setWebsite('');
			setLogoFile(null);
			setIsExpanded(false);
		} catch (e) {
			setErr(e?.message || 'Failed to add partner');
		} finally {
			setAdding(false);
		}
	};

	if (!isExpanded) {
		return (
			<button
				onClick={() => setIsExpanded(true)}
				disabled={disabled}
				className="w-full p-4 border-2 border-dashed border-white/10 rounded-2xl hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 group"
			>
				<div className="flex items-center justify-center gap-3 text-gray-400 group-hover:text-purple-300">
					<Plus className="w-5 h-5" />
					<span className="font-medium">Add New Partner</span>
				</div>
			</button>
		);
	}

	return (
		<GlassCard className="p-6 animate-in fade-in duration-300">
			<div className="flex items-center justify-between mb-4">
				<h4 className="text-lg font-semibold text-white">Add New Partner</h4>
				<button
					onClick={() => setIsExpanded(false)}
					className="p-2 hover:bg-white/10 rounded-xl transition-colors"
				>
					<X className="w-4 h-4 text-gray-400" />
				</button>
			</div>

			<div className="space-y-4">
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Partner name"
					className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
					disabled={disabled}
				/>

				<div className="grid grid-cols-2 gap-4">
					<select
						value={tier}
						onChange={(e) => setTier(e.target.value)}
						className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
						disabled={disabled}
					>
						<option value="sponsor">Sponsor</option>
						<option value="collaborator">Collaborator</option>
						<option value="partner">Partner</option>
					</select>

					<input
						value={website}
						onChange={(e) => setWebsite(e.target.value)}
						placeholder="Website (optional)"
						className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
						disabled={disabled}
					/>
				</div>

				<div className="border-2 border-dashed border-white/10 rounded-2xl p-4 hover:border-purple-500/50 transition-all duration-300">
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
						className="w-full text-white file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all duration-300"
						disabled={disabled}
					/>
					{logoFile && (
						<p className="text-emerald-400 text-sm mt-2 font-medium">
							✓ Selected: {logoFile.name}
						</p>
					)}
				</div>

				{err && (
					<div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-sm font-medium">
						{err}
					</div>
				)}

				<div className="flex gap-3">
					<button
						onClick={submit}
						disabled={adding || disabled}
						className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 disabled:opacity-50 font-semibold shadow-lg shadow-emerald-500/25"
					>
						{adding ? (
							<div className="flex items-center justify-center gap-2">
								<Loader2 className="w-4 h-4 animate-spin" />
								Adding Partner...
							</div>
						) : (
							'Add Partner'
						)}
					</button>
					<button
						onClick={() => setIsExpanded(false)}
						className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 font-semibold"
					>
						Cancel
					</button>
				</div>
			</div>
		</GlassCard>
	);
});

export default PartnerQuickAdd;

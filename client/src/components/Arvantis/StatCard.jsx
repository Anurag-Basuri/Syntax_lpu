import React from 'react';
import GlassCard from './GlassCard';

const StatCard = ({ title, value, icon: Icon, trend, className = '' }) => (
	<GlassCard hover className={`p-6 ${className}`}>
		<div className="flex items-center justify-between">
			<div>
				<p className="text-gray-400 text-sm font-medium mb-2">{title}</p>
				<p className="text-2xl font-bold text-white">{value}</p>
				{trend && (
					<p
						className={`text-xs font-medium mt-1 ${
							trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
						}`}
					>
						{trend}
					</p>
				)}
			</div>
			<div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
				<Icon className="w-6 h-6 text-purple-300" />
			</div>
		</div>
	</GlassCard>
);

export default StatCard;

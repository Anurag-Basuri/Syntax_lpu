import React from 'react';
import { Sparkles } from 'lucide-react';
import GlassCard from './GlassCard';

const EmptyState = ({ title, subtitle, icon: Icon = Sparkles, action, size = 'md' }) => (
	<GlassCard className={`text-center ${size === 'lg' ? 'p-12' : 'p-8'}`}>
		<div className="flex justify-center mb-6">
			<div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl shadow-lg">
				<Icon className={`${size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'} text-purple-300`} />
			</div>
		</div>
		<h3 className={`font-semibold text-white mb-3 ${size === 'lg' ? 'text-2xl' : 'text-lg'}`}>
			{title}
		</h3>
		<p className={`text-gray-400 mb-6 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
			{subtitle}
		</p>
		{action}
	</GlassCard>
);

export default EmptyState;

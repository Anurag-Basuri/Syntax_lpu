import React from 'react';

const GlassCard = ({ children, className = '', hover = false, gradient = false }) => (
	<div
		className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ${
			gradient ? 'bg-gradient-to-br from-white/5 to-white/10' : ''
		} ${
			hover
				? 'hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all duration-300'
				: ''
		} ${className}`}
	>
		{children}
	</div>
);

export default GlassCard;

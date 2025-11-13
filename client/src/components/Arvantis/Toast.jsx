import React from 'react';
import { X } from 'lucide-react';

const Toast = ({ message, type = 'success', onDismiss }) => {
	const icons = {
		success: (
			<div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
				✓
			</div>
		),
		error: (
			<div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
				!
			</div>
		),
		warning: (
			<div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
				⚠
			</div>
		),
		info: (
			<div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
				i
			</div>
		),
	};

	const backgrounds = {
		success: 'bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/25',
		error: 'bg-gradient-to-r from-red-600 to-pink-600 shadow-lg shadow-red-500/25',
		warning: 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-500/25',
		info: 'bg-gradient-to-r from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/25',
	};

	return (
		<div
			className={`${backgrounds[type]} text-white px-6 py-4 rounded-2xl backdrop-blur-xl flex items-center gap-4 animate-in slide-in-from-right-full duration-500`}
		>
			{icons[type]}
			<span className="flex-1 font-medium text-sm">{message}</span>
			<button
				onClick={onDismiss}
				className="hover:bg-white/20 rounded-full p-1.5 transition-all duration-200"
			>
				<X className="w-4 h-4" />
			</button>
		</div>
	);
};

export default Toast;

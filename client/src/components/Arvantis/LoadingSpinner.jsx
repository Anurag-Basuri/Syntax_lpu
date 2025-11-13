import React from 'react';

const LoadingSpinner = ({ size = 'lg', text = 'Loading...', className = '' }) => (
	<div className={`flex flex-col items-center justify-center py-12 ${className}`}>
		<div
			className={`animate-spin rounded-full border-2 border-transparent border-t-purple-500 border-r-pink-500 ${
				size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-10 h-10' : 'w-16 h-16'
			}`}
		/>
		{text && <p className="mt-4 text-gray-400 text-sm font-medium animate-pulse">{text}</p>}
	</div>
);

export default LoadingSpinner;

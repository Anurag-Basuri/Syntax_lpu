const LoadingSpinner = ({ size = 'md' }) => {
	const sizes = {
		sm: 'w-6 h-6',
		md: 'w-12 h-12',
		lg: 'w-16 h-16',
	};

	const borderSizes = {
		sm: 'border-2',
		md: 'border-4',
		lg: 'border-4',
	};

	return (
		<div className="flex flex-col items-center justify-center py-12">
			<div
				className={`${sizes[size]} ${borderSizes[size]} border-blue-500 border-t-transparent rounded-full animate-spin mb-4`}
			/>
			<span className="text-blue-400 animate-pulse">Loading data...</span>
		</div>
	);
};

export default LoadingSpinner;

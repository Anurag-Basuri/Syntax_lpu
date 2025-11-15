const ErrorMessage = ({ error }) => {
	if (!error) return null;

	// Accept either string or Error-like object
	const message = typeof error === 'string' ? error : error?.message || JSON.stringify(error);

	return (
		<div
			role="alert"
			className="rounded-md p-3 bg-red-50 border border-red-200 text-red-700 flex items-start gap-3"
		>
			<svg
				className="w-5 h-5 text-red-500 flex-shrink-0"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fillRule="evenodd"
					d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.516 9.8c.75 1.333-.213 3.001-1.742 3.001H4.483c-1.53 0-2.491-1.668-1.742-3.001l5.516-9.8zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-.993.883L9 6v4a1 1 0 001.993.117L11 10V6a1 1 0 00-1-1z"
					clipRule="evenodd"
				/>
			</svg>
			<div className="text-sm">{message}</div>
		</div>
	);
};

export default ErrorMessage;

const StatusBadge = ({ status }) => {
	const statusConfig = {
		pending: {
			text: 'Pending',
			color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
		},
		approved: {
			text: 'Approved',
			color: 'bg-green-500/20 text-green-400 border-green-500/40',
		},
		rejected: {
			text: 'Rejected',
			color: 'bg-red-500/20 text-red-400 border-red-500/40',
		},
		'checked-in': {
			text: 'Checked In',
			color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
		},
		active: {
			text: 'Active',
			color: 'bg-green-500/20 text-green-400 border-green-500/40',
		},
		banned: {
			text: 'Banned',
			color: 'bg-red-500/20 text-red-400 border-red-500/40',
		},
		removed: {
			text: 'Removed',
			color: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
		},
	};

	const config = statusConfig[status] || {
		text: status,
		color: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
	};

	return (
		<span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${config.color}`}>
			{config.text}
		</span>
	);
};

export default StatusBadge;

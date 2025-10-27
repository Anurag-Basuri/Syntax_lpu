const StatsCard = ({ icon, title, value, change, color }) => {
	const colors = {
		blue: 'from-blue-900/30 to-blue-900/10',
		green: 'from-green-900/30 to-green-900/10',
		purple: 'from-purple-900/30 to-purple-900/10',
		orange: 'from-orange-900/30 to-orange-900/10',
	};

	const changeColors = {
		blue: 'bg-blue-500/20 text-blue-400',
		green: 'bg-green-500/20 text-green-400',
		purple: 'bg-purple-500/20 text-purple-400',
		orange: 'bg-orange-500/20 text-orange-400',
	};

	return (
		<div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-5 border border-gray-700`}>
			<div className="flex justify-between items-start">
				<div>
					<h3 className="text-gray-400 text-sm">{title}</h3>
					<p className="text-2xl font-bold text-white mt-1">{value}</p>
				</div>
				<div className={`p-2 rounded-lg ${changeColors[color]}`}>{icon}</div>
			</div>
			<div className={`mt-4 text-xs ${changeColors[color]} px-2 py-1 rounded inline-block`}>
				{change}
			</div>
		</div>
	);
};

export default StatsCard;

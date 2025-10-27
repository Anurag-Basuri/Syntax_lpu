import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TicketActivityTimeline = ({ tickets }) => {
	const processData = () => {
		const timeline = {};
		tickets.forEach((ticket) => {
			const date = new Date(ticket.createdAt).toISOString().split('T')[0];
			if (!timeline[date]) {
				timeline[date] = { date, created: 0, used: 0, cancelled: 0 };
			}
			timeline[date].created++;
			if (ticket.isUsed) timeline[date].used++;
			if (ticket.isCancelled) timeline[date].cancelled++;
		});
		return Object.values(timeline).sort((a, b) => new Date(a.date) - new Date(b.date));
	};

	const data = processData();

	return (
		<div className="mt-6 bg-gray-800 p-4 rounded-lg border border-gray-700">
			<h3 className="text-lg font-medium text-white mb-4">Ticket Activity Timeline</h3>
			<ResponsiveContainer width="100%" height={200}>
				<LineChart data={data}>
					<XAxis dataKey="date" tick={{ fill: '#9CA3AF' }} />
					<YAxis tick={{ fill: '#9CA3AF' }} />
					<Tooltip
						contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
						itemStyle={{ color: '#fff' }}
					/>
					<Line
						type="monotone"
						dataKey="created"
						stroke="#60A5FA"
						name="Created"
						strokeWidth={2}
					/>
					<Line
						type="monotone"
						dataKey="used"
						stroke="#34D399"
						name="Used"
						strokeWidth={2}
					/>
					<Line
						type="monotone"
						dataKey="cancelled"
						stroke="#F87171"
						name="Cancelled"
						strokeWidth={2}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default TicketActivityTimeline;

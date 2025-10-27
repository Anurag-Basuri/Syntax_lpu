import { BarChart2, Ticket, CheckCircle, XCircle, Clock } from 'lucide-react';
import TicketActivityTimeline from './TicketActivityTimeline.jsx';

const TicketStats = ({ stats, tickets }) => (
	<div>
		<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
			<div className="bg-gray-750 rounded-lg p-4 flex items-center">
				<div className="bg-blue-900/30 p-3 rounded-full mr-4">
					<Ticket className="h-6 w-6 text-blue-400" />
				</div>
				<div>
					<p className="text-gray-400 text-sm">Total Tickets</p>
					<p className="text-xl font-bold text-white">{stats.total}</p>
				</div>
			</div>

			<div className="bg-gray-750 rounded-lg p-4 flex items-center">
				<div className="bg-red-900/30 p-3 rounded-full mr-4">
					<XCircle className="h-6 w-6 text-red-400" />
				</div>
				<div>
					<p className="text-gray-400 text-sm">Cancelled</p>
					<p className="text-xl font-bold text-red-400">{stats.cancelled}</p>
				</div>
			</div>

			<div className="bg-gray-750 rounded-lg p-4 flex items-center">
				<div className="bg-purple-900/30 p-3 rounded-full mr-4">
					<BarChart2 className="h-6 w-6 text-purple-400" />
				</div>
				<div>
					<p className="text-gray-400 text-sm">Checked In</p>
					<p className="text-xl font-bold text-purple-400">{stats.used}</p>
				</div>
			</div>
		</div>
		<TicketActivityTimeline tickets={tickets} />
	</div>
);

export default TicketStats;

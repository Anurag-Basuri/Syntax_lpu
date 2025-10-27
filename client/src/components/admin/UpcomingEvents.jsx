import { CalendarDays, ArrowRight } from 'lucide-react';
import EventCard from './EventCard.jsx';

const UpcomingEvents = ({ events, eventsLoading, setActiveTab }) => {
	const upcomingEvents = events
		.filter((event) => event.status === 'upcoming' || new Date(event.date) > new Date())
		.slice(0, 3);

	return (
		<div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<CalendarDays className="h-5 w-5 text-purple-400" />
					Upcoming Events
				</h3>
				<button
					onClick={() => setActiveTab('events')}
					className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
				>
					View All <ArrowRight className="h-4 w-4" />
				</button>
			</div>

			{eventsLoading ? (
				<div className="flex justify-center py-8">
					<div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
				</div>
			) : upcomingEvents.length === 0 ? (
				<div className="text-center py-8 bg-gray-700/30 rounded-lg border border-gray-600">
					<CalendarDays className="h-12 w-12 mx-auto text-gray-500" />
					<h4 className="text-md font-semibold text-gray-400 mt-4">No upcoming events</h4>
					<p className="text-gray-500 text-sm mt-1">Create a new event to get started</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{upcomingEvents.map((event) => (
						<EventCard key={event._id} event={event} compact={true} />
					))}
				</div>
			)}
		</div>
	);
};

export default UpcomingEvents;

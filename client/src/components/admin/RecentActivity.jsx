import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { apiClient } from '../../services/api.js';

const RecentActivity = () => {
	const [activities, setActivities] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchActivities = async () => {
			setLoading(true);
			setError('');
			try {
				const res = await apiClient.get('/api/admin/recent-activity');
				setActivities(res.data?.data || []);
			} catch (err) {
				setError('Failed to load recent activity');
			} finally {
				setLoading(false);
			}
		};
		fetchActivities();
	}, []);

	return (
		<div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
			<div className="flex justify-between items-center mb-6">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<Activity className="h-5 w-5 text-cyan-400" />
					Recent Activity
				</h3>
				<button className="text-sm text-cyan-400 hover:text-cyan-300">View All</button>
			</div>
			{loading ? (
				<div className="flex justify-center py-8">
					<div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
				</div>
			) : error ? (
				<div className="text-red-400 text-sm">{error}</div>
			) : activities.length === 0 ? (
				<div className="text-center text-gray-400 py-8">No recent activity</div>
			) : (
				<div className="space-y-4">
					{activities.map((activity) => (
						<div key={activity._id || activity.id} className="flex gap-3">
							<div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
								{/* Optionally render icon based on activity.type */}
								<Activity className="h-4 w-4 text-cyan-400" />
							</div>
							<div className="flex-1">
								<p className="text-sm text-white">
									<span className="font-medium">{activity.user}</span>{' '}
									{activity.action}
									{activity.target && (
										<span className="font-medium"> for {activity.target}</span>
									)}
								</p>
								<p className="text-xs text-gray-400 mt-1">{activity.time}</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default RecentActivity;

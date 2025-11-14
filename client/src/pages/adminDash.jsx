import { useState, useEffect } from 'react';
import {
	ShieldCheck,
	Ticket,
	LogOut,
	Users,
	CalendarDays,
	LayoutDashboard,
	Sparkles,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useGetAllEvents } from '../hooks/useEvents.js';
import { useNavigate } from 'react-router-dom';
import DashboardTab from '../components/admin/DashboardTab.jsx';
import MembersTab from '../components/admin/MembersTab.jsx';
import EventsTab from '../components/admin/EventsTab.jsx';
import TicketsTab from '../components/admin/TicketsTab.jsx';
import CreateTicket from '../components/admin/CreateTicket.jsx';
import ErrorMessage from '../components/admin/ErrorMessage.jsx';
import Modal from '../components/admin/Modal.jsx';
import { useTheme } from '../hooks/useTheme.js';

const TABS = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		icon: <LayoutDashboard className="h-5 w-5" />,
	},
	{
		key: 'members',
		label: 'Members',
		icon: <Users className="h-5 w-5" />,
	},
	{
		key: 'events',
		label: 'Events',
		icon: <CalendarDays className="h-5 w-5" />,
	},
	{
		key: 'tickets',
		label: 'Tickets',
		icon: <Ticket className="h-5 w-5" />,
	},
];

const AdminDash = () => {
	// include isAuthenticated so we can guard the route properly
	const { user, loading: authLoading, logoutAdmin, token, isAuthenticated } = useAuth();
	const { theme } = useTheme();
	const isDark = theme === 'dark';
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState('dashboard');
	const [dashboardError, setDashboardError] = useState('');
	const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);

	// Events
	const { getAllEvents, events, loading: eventsLoading, error: eventsError } = useGetAllEvents();

	// fetch events on mount (include getAllEvents in deps to satisfy hooks rules)
	useEffect(() => {
		const fetchData = async () => {
			try {
				await getAllEvents();
			} catch (err) {
				setDashboardError('Failed to load dashboard data');
			}
		};
		fetchData();
	}, [getAllEvents]);

	// Redirect unauthenticated users to admin auth page and block non-admin roles
	useEffect(() => {
		if (!authLoading) {
			// If not authenticated or user is not admin, redirect to admin login
			if (!isAuthenticated || (user && user.role && user.role !== 'admin')) {
				navigate('/admin/auth', { replace: true });
			}
		}
	}, [authLoading, isAuthenticated, user, navigate]);

	// surface event errors into dashboard error UI
	useEffect(() => {
		if (eventsError) {
			setDashboardError(eventsError?.message || 'Failed to load events');
		}
	}, [eventsError]);

	const handleLogout = async () => {
		try {
			await logoutAdmin();
			navigate('/admin/secret/auth', { replace: true });
		} catch (error) {
			setDashboardError('Logout failed');
		}
	};

	if (authLoading) {
		return (
			<div
				className={`${
					isDark
						? 'flex items-center justify-center min-h-screen bg-gray-900'
						: 'flex items-center justify-center min-h-screen bg-white'
				}`}
			>
				<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
				<span
					className={`text-lg font-semibold ${
						isDark ? 'text-blue-400' : 'text-blue-600'
					} animate-pulse`}
				>
					Loading Dashboard...
				</span>
			</div>
		);
	}

	const rootBg = isDark
		? 'bg-gradient-to-br from-gray-900 to-gray-800'
		: 'bg-gradient-to-br from-white to-gray-100';
	const sidebarBg = isDark
		? 'bg-gray-900 border-r border-gray-800'
		: 'bg-white border-r border-gray-200';
	const headerBg = isDark
		? 'bg-gray-900/90 backdrop-blur border-b border-gray-800'
		: 'bg-white/80 backdrop-blur border-b border-gray-200';
	const mainPanelBg = isDark
		? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80'
		: 'bg-white/80';

	return (
		<div className={`min-h-screen ${rootBg}`}>
			{/* Fixed Sidebar */}
			<aside className={`fixed left-0 top-0 bottom-0 w-64 ${sidebarBg} z-40 flex flex-col`}>
				<div
					className={`flex items-center gap-3 px-6 py-6 border-b ${
						isDark ? 'border-gray-800' : 'border-gray-200'
					}`}
				>
					<ShieldCheck
						className={`h-8 w-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
					/>
					<span
						className={`text-2xl font-bold ${
							isDark
								? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400'
								: 'text-gray-900'
						}`}
					>
						Admin
					</span>
				</div>

				<nav className="flex-1 py-4 overflow-y-auto">
					{TABS.map((tab) => (
						<button
							key={tab.key}
							className={`w-full flex items-center gap-3 px-6 py-3 text-lg font-medium transition text-left ${
								activeTab === tab.key
									? `${
											isDark
												? 'bg-blue-900/30 text-blue-400'
												: 'bg-blue-100 text-blue-700'
									  }`
									: `${
											isDark
												? 'text-gray-300 hover:bg-gray-800 hover:text-white'
												: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
									  }`
							}`}
							onClick={() => setActiveTab(tab.key)}
						>
							{tab.icon}
							{tab.label}
						</button>
					))}
				</nav>

				<div
					className={`px-6 py-4 border-t ${
						isDark ? 'border-gray-800' : 'border-gray-200'
					}`}
				>
					<button
						onClick={handleLogout}
						className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg ${
							isDark
								? 'bg-red-700/80 text-white hover:bg-red-600'
								: 'bg-red-100 text-red-700 hover:bg-red-200'
						} transition`}
					>
						<LogOut className="h-5 w-5" />
						Logout
					</button>
				</div>
			</aside>

			{/* Fixed Header */}
			<header
				className={`fixed left-64 right-0 top-0 z-30 ${headerBg} h-16 flex items-center justify-between px-6`}
			>
				<div className="flex items-center gap-3">
					<span
						className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
					>
						{TABS.find((t) => t.key === activeTab)?.label || 'Dashboard'}
					</span>
				</div>

				<div className="flex items-center gap-4">
					<div
						className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
							isDark ? 'bg-gray-700/50' : 'bg-gray-100'
						}`}
					>
						<span className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
							{user?.fullname || user?.name || 'Admin'}
						</span>
					</div>

					{activeTab === 'tickets' && (
						<button
							onClick={() => setShowCreateTicketModal(true)}
							className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
								isDark
									? 'bg-blue-700/80 text-white hover:bg-blue-600'
									: 'bg-blue-600 text-white hover:bg-blue-500'
							} transition`}
						>
							<Ticket className="h-5 w-5" />
							Create Ticket
						</button>
					)}
				</div>
			</header>

			{/* Content area */}
			<main className="pt-16 pl-64">
				<div className={`min-h-screen p-4 md:p-8 ${mainPanelBg}`}>
					{dashboardError && (
						<div className="mb-4">
							<ErrorMessage error={dashboardError} />
						</div>
					)}

					{/* Main Tab Content */}
					{activeTab === 'dashboard' && (
						<DashboardTab
							events={events}
							eventsLoading={eventsLoading}
							setActiveTab={setActiveTab}
						/>
					)}
					{activeTab === 'members' && (
						<MembersTab token={token} setDashboardError={setDashboardError} />
					)}
					{activeTab === 'events' && (
						<EventsTab
							events={events}
							eventsLoading={eventsLoading}
							eventsError={eventsError}
							token={token}
							setDashboardError={setDashboardError}
							getAllEvents={getAllEvents}
						/>
					)}
					{activeTab === 'tickets' && (
						<TicketsTab
							token={token}
							events={events}
							setDashboardError={setDashboardError}
						/>
					)}
					{activeTab === 'arvantis' && (
						<ArvantisTab token={token} setDashboardError={setDashboardError} />
					)}
				</div>
			</main>

			{/* Create Ticket Modal */}
			{showCreateTicketModal && (
				<Modal
					title="Create Ticket"
					onClose={() => setShowCreateTicketModal(false)}
					size="lg"
				>
					<CreateTicket
						token={token}
						events={events}
						onClose={() => setShowCreateTicketModal(false)}
					/>
				</Modal>
			)}
		</div>
	);
};

export default AdminDash;

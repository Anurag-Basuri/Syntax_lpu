import React, { useState, useEffect, useRef } from 'react';
import {
	Home,
	Calendar,
	Mail,
	UserPlus,
	LogIn,
	LayoutDashboard,
	Menu,
	X,
	User,
	LogOut,
	ChevronDown,
	QrCode,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import logo from '../assets/logo.png';

// Navigation sections config
const navSections = [
	{
		items: [
			{ name: 'Home', icon: Home, path: '/', color: '#00d9ff' },
			{ name: 'Events', icon: Calendar, path: '/event', color: '#7c3aed' },
			{ name: 'Team', icon: User, path: '/team', color: '#7c3aed' },
			{ name: 'Contact', icon: Mail, path: '/contact', color: '#0284c7' },
		],
	},
];

// Map path to nav name
const pathToNavName = (pathname) => {
	if (pathname === '/') return 'Home';
	if (pathname.startsWith('/event')) return 'Events';
	if (pathname.startsWith('/team')) return 'Team';
	if (pathname.startsWith('/contact')) return 'Contact';
	return 'Home';
};

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [activeLink, setActiveLink] = useState('Home');
	const { user, isAuthenticated, loading, logoutMember, logoutAdmin } = useAuth();
	const [isScrolled, setIsScrolled] = useState(false);
	const [showNavbar, setShowNavbar] = useState(true);
	const [isUserOpen, setIsUserOpen] = useState(false);
	const userRef = useRef(null);
	const menuButtonRef = useRef(null);
	const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
	const navigate = useNavigate();
	const location = useLocation();
	const drawerRef = useRef(null);

	// Determine if user is member or admin
	const isMember = Boolean(user?.memberID);
	const isAdmin = Boolean(user && !user.memberID);

	// Sync active link with route
	useEffect(() => {
		setActiveLink(pathToNavName(location.pathname));
	}, [location.pathname]);

	// Hide/show navbar on scroll
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			if (currentScrollY <= 0) {
				setShowNavbar(true);
			} else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
				setShowNavbar(false);
			} else if (currentScrollY < lastScrollY.current - 2) {
				setShowNavbar(true);
			}
			lastScrollY.current = currentScrollY;
			setIsScrolled(currentScrollY > 20);
		};
		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close user dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (
				userRef.current &&
				!userRef.current.contains(event.target) &&
				menuButtonRef.current &&
				!menuButtonRef.current.contains(event.target)
			) {
				setIsUserOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('touchstart', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, []);

	// Prevent background scroll when drawer is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
			document.body.style.touchAction = 'none';
		} else {
			document.body.style.overflow = '';
			document.body.style.touchAction = '';
		}
		return () => {
			document.body.style.overflow = '';
			document.body.style.touchAction = '';
		};
	}, [isOpen]);

	// Close drawer when clicked outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (drawerRef.current && !drawerRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			document.addEventListener('touchstart', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('touchstart', handleClickOutside);
		};
	}, [isOpen]);

	// Navigation handlers
	const handleLinkClick = (name) => {
		setActiveLink(name);
		setIsOpen(false);
		setIsUserOpen(false);

		if (name === 'QR Scanner') {
			navigate('/vib/qrscanner');
			return;
		}

		const found = navSections.flatMap((s) => s.items).find((item) => item.name === name);
		if (found) {
			navigate(found.path);
		}
	};

	const handleLogoClick = () => {
		navigate('/');
		setActiveLink('Home');
		setIsOpen(false);
		setIsUserOpen(false);
	};

	const handleLogout = () => {
		if (user) {
			try {
				if (isMember) {
					logoutMember();
				} else {
					logoutAdmin();
				}
			} catch {
				logoutMember();
			}
		} else {
			logoutMember();
		}
		setIsUserOpen(false);
		setIsOpen(false);
		navigate('/auth');
	};

	const handleDashboardClick = () => {
		setIsUserOpen(false);
		setIsOpen(false);
		if (isMember) {
			navigate('/member/dashboard');
		} else {
			navigate('/admin/dashboard');
		}
	};

	const handleQRScannerClick = () => {
		setIsUserOpen(false);
		setIsOpen(false);
		navigate('/vib/qrscanner');
	};

	const handleAlreadyMember = () => {
		setIsOpen(false);
		setIsUserOpen(false);
		navigate('/auth', { state: { tab: 'login' } });
	};

	const handleJoinClub = () => {
		setIsOpen(false);
		setIsUserOpen(false);
		navigate('/auth', { state: { tab: 'register' } });
	};

	if (loading) return null;

	return (
		<>
			<style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(-100%); }
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.5); }
                    70% { box-shadow: 0 0 0 10px rgba(6, 182, 212, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
                }
                @keyframes smokeMove {
                    0% { background-position: 0% 0%, 100% 100%; }
                    100% { background-position: 100% 100%, 0% 0%; }
                }
                @keyframes smokeMove2 {
                    0% { background-position: 100% 0%, 0% 100%; }
                    100% { background-position: 0% 100%, 100% 0%; }
                }
                @keyframes backdropFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .navbar {
                    transition: transform 0.4s ease, background 0.4s, box-shadow 0.4s, backdrop-filter 0.4s;
                }
                .nav-link {
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    position: relative;
                    overflow: hidden;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 50%;
                    width: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #06b6d4, #6366f1);
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    transform: translateX(-50%);
                }
                .nav-link:hover::after,
                .nav-link.active::after {
                    width: 70%;
                }
                .logo-float {
                    animation: float 4s ease-in-out infinite;
                }
                .drawer-open {
                    animation: slideIn 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                .drawer-close {
                    animation: fadeOut 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                .fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                .nav-glow {
                    box-shadow: 0 0 25px rgba(6, 182, 212, 0.15);
                }
                .logo-glow {
                    filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.5));
                }
                .logo-container {
                    animation: pulse-glow 3s infinite;
                    transition: all 0.3s ease;
                }
                .logo-container:hover {
                    transform: scale(1.05);
                    animation: none;
                }
                .backdrop-fade-in {
                    animation: backdropFadeIn 0.3s ease-out forwards;
                }
                .mobile-nav-item {
                    touch-action: manipulation;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #0891b2, #0d9488);
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 6px;
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #0891b2 rgba(0, 0, 0, 0.2);
                }
                @media (max-width: 1024px) {
                    .navbar {
                        padding-left: 0 !important;
                        padding-right: 0 !important;
                    }
                }
            `}</style>

			<div data-navbar>
				<nav
					className={`fixed top-0 left-0 w-full z-50 navbar bg-[#0a1120]/80 backdrop-blur-xl`}
					style={{
						height: '5rem',
						boxShadow: '0 8px 32px 0 rgba(10,17,32,0.18), 0 1.5px 8px 0 #1e293b',
						borderBottom: '1px solid rgba(255,255,255,0.06)',
						background:
							'linear-gradient(90deg, rgba(10,17,32,0.92) 60%, rgba(30,41,59,0.85) 100%)',
						backdropFilter: 'blur(16px)',
						transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
						transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
						opacity: showNavbar ? 1 : 0,
						pointerEvents: showNavbar ? 'auto' : 'none',
					}}
				>
					<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex items-center justify-between h-full w-full">
						{/* Brand */}
						<button
							onClick={handleLogoClick}
							className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative select-none"
						>
							<div
								className="logo-container w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg border border-blue-900/40 bg-[#0a1120]/90 relative overflow-hidden"
								style={{
									boxShadow: '0 4px 24px 0 #0ea5e9cc, 0 1.5px 8px 0 #1e293b',
								}}
							>
								{/* Animated smoky background */}
								<div className="absolute inset-0 pointer-events-none z-0">
									<div
										style={{
											position: 'absolute',
											inset: 0,
											background:
												'radial-gradient(circle at 60% 40%, #38bdf8 12%, transparent 70%), radial-gradient(circle at 30% 70%, #6366f1 12%, transparent 70%)',
											opacity: 0.38,
											filter: 'blur(10px)',
											animation: 'smokeMove 7s linear infinite alternate',
											zIndex: 1,
										}}
									/>
									<div
										style={{
											position: 'absolute',
											inset: 0,
											background:
												'radial-gradient(circle at 70% 60%, #0ea5e9 10%, transparent 70%), radial-gradient(circle at 40% 80%, #818cf8 10%, transparent 70%)',
											opacity: 0.22,
											filter: 'blur(16px)',
											animation:
												'smokeMove2 9s linear infinite alternate-reverse',
											zIndex: 2,
										}}
									/>
								</div>
								<img
									src={logo}
									alt="Vibranta Logo"
									loading="lazy"
									decoding="async"
									className="relative z-10"
									style={{
										background: '#0a0e17',
										borderRadius: '0.75rem',
										width: '80%',
										height: '80%',
										objectFit: 'contain',
										boxShadow: '0 2px 12px #0ea5e944',
									}}
								/>
							</div>
							<h1
								className="text-white font-extrabold text-lg sm:text-xl md:text-2xl lg:text-3xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-wide text-shadow navbar-brand"
								style={{
									letterSpacing: '0.04em',
									textShadow: '0 2px 12px #1e293b',
								}}
							>
								Vibranta
							</h1>
						</button>

						{/* Navigation Links */}
						<div className="hidden lg:flex items-center gap-1 xl:gap-2">
							{navSections.flatMap((section) =>
								section.items.map((item) => (
									<button
										key={item.name}
										onClick={() => handleLinkClick(item.name)}
										className={`nav-link flex items-center gap-2 px-2 md:px-3 xl:px-4 py-2.5 rounded-xl font-medium text-sm xl:text-base transition-all duration-300 ${
											activeLink === item.name
												? 'active text-white'
												: 'text-slate-200 hover:text-white'
										}`}
									>
										<item.icon
											size={18}
											className={`transition-all duration-300 ${
												activeLink === item.name ? 'text-cyan-400' : ''
											}`}
										/>
										<span className="whitespace-nowrap">{item.name}</span>
										{activeLink === item.name && (
											<div className="w-1 h-1 bg-cyan-400 rounded-full ml-1 animate-pulse" />
										)}
									</button>
								))
							)}
						</div>

						{/* Right Side Actions */}
						<div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
							{isAuthenticated ? (
								<div className="relative" ref={userRef}>
									<button
										onClick={() => setIsUserOpen((v) => !v)}
										className="flex items-center gap-2 sm:gap-3 glass-effect px-2 sm:px-3 md:px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300 group"
									>
										<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
											<User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
										</div>
										<span className="hidden sm:block text-white font-medium text-xs sm:text-sm">
											{isMember ? 'Member' : 'Admin'}
										</span>
										<ChevronDown
											className={`h-4 w-4 text-white transition-transform duration-300 ${isUserOpen ? 'rotate-180' : ''}`}
										/>
									</button>
									{/* User Dropdown */}
									{isUserOpen && (
										<div className="absolute right-0 mt-3 w-56 sm:w-64 md:w-72 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-white/20 shadow-2xl overflow-hidden z-50">
											<div className="py-2">
												<button
													onClick={handleDashboardClick}
													className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all duration-300 text-white group"
												>
													<LayoutDashboard className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
													<span>
														{isMember
															? 'Member Dashboard'
															: 'Admin Dashboard'}
													</span>
												</button>
												<button
													onClick={() => {
														navigate('/show');
													}}
													className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all duration-300 text-white group"
												>
													<QrCode className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
													<span>Show</span>
												</button>
												<button
													onClick={handleQRScannerClick}
													className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all duration-300 text-white group"
												>
													<QrCode className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
													<span>QR Scanner</span>
												</button>
											</div>
											<div className="p-3 border-t border-white/10">
												<button
													className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-medium"
													onClick={handleLogout}
												>
													<LogOut className="h-4 w-4" />
													<span>Log Out</span>
												</button>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="hidden sm:flex gap-1 sm:gap-2 items-center">
									<button
										onClick={handleAlreadyMember}
										className="flex items-center justify-center gap-2 px-3 py-2 border border-cyan-600/50 rounded-xl text-cyan-200 font-semibold bg-transparent hover:bg-cyan-800/40 hover:text-white transition-all duration-300 shadow-none text-xs sm:text-sm"
									>
										<LogIn className="h-4 w-4" />
										<span>Already a member</span>
									</button>
									<button
										onClick={handleJoinClub}
										className="flex items-center justify-center gap-2 px-3 py-2 border border-cyan-600/50 rounded-xl text-cyan-200 font-semibold bg-transparent hover:bg-cyan-800/40 hover:text-white transition-all duration-300 shadow-none text-xs sm:text-sm"
									>
										<UserPlus className="h-4 w-4" />
										<span>Join Club</span>
									</button>
								</div>
							)}
							<button
								ref={menuButtonRef}
								className="lg:hidden p-2 sm:p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
								onClick={() => setIsOpen(true)}
								aria-label="Open menu"
								style={{ zIndex: 60 }}
							>
								<Menu className="w-6 h-6 sm:w-7 sm:h-7" />
							</button>
						</div>
					</div>
				</nav>
			</div>
			{/* Mobile Drawer */}
			{isOpen && (
				<div className="fixed inset-0 z-[100] lg:hidden">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-black/60 backdrop-blur-sm backdrop-fade-in"
						onClick={() => setIsOpen(false)}
						style={{ zIndex: 90 }}
					/>
					{/* Drawer */}
					<div
						ref={drawerRef}
						className="fixed top-0 left-0 h-[100dvh] w-72 max-w-[90vw] bg-cyan-900/95 backdrop-blur-lg border-r border-white/20 shadow-2xl overflow-hidden z-[100] drawer-open"
					>
						<div className="h-full flex flex-col">
							{/* Header */}
							<div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
										<LayoutDashboard size={22} />
									</div>
									<h1 className="text-white font-bold text-lg sm:text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
										Vibranta
									</h1>
								</div>
								<button
									className="p-2 rounded-xl glass-effect border border-white/20 text-white hover:bg-white/10 transition-all duration-300"
									onClick={() => setIsOpen(false)}
									aria-label="Close menu"
								>
									<X size={20} />
								</button>
							</div>
							{/* Navigation */}
							<div className="flex-1 overflow-y-auto p-3 sm:p-6 custom-scrollbar">
								<div className="space-y-6">
									{navSections.map((section, idx) => (
										<div key={section.title || idx}>
											<ul className="space-y-2">
												{section.items.map((item) => (
													<button
														key={item.name}
														onClick={() => handleLinkClick(item.name)}
														className={`mobile-nav-item w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl text-left transition-all duration-300 ${
															activeLink === item.name
																? 'active text-white'
																: 'text-slate-300 hover:text-white'
														}`}
													>
														<div
															className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
																activeLink === item.name
																	? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
																	: 'bg-white/5 border border-white/10'
															}`}
														>
															<item.icon
																size={20}
																className={
																	activeLink === item.name
																		? 'text-cyan-400'
																		: ''
																}
															/>
														</div>
														<span className="font-medium">
															{item.name}
														</span>
													</button>
												))}
											</ul>
										</div>
									))}
								</div>
							</div>
							{/* Auth Section for Mobile */}
							{!isAuthenticated && (
								<div className="p-4 sm:p-6 border-t border-white/10 space-y-3 bg-gradient-to-r from-cyan-900/40 to-purple-900/40">
									<button
										onClick={handleAlreadyMember}
										className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-cyan-600/50 rounded-xl text-cyan-200 font-semibold bg-[#0a1120]/80 hover:bg-cyan-800/40 hover:text-white transition-all duration-300 shadow text-sm"
									>
										<LogIn className="h-4 w-4" />
										<span>Already a member</span>
									</button>
									<button
										onClick={handleJoinClub}
										className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 shadow text-sm"
									>
										<UserPlus className="h-4 w-4" />
										<span>Join Club</span>
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default Navbar;

import './App.css';
import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ReactLenis } from 'lenis/react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes.jsx';
import Navbar from './components/Navbar.jsx';
import Background3D from './components/Background3D.jsx';

function App() {
	const location = useLocation();
	const [scrollProgress, setScrollProgress] = useState(0);
	const [showNavbar, setShowNavbar] = useState(true);
	const lastScrollY = useRef(0);
	const scrollTimeout = useRef(null);

	// Hide navbar for specific routes
	const hideNavbar = [
		'/auth',
		'/admin/auth',
		'/terms',
		'/refund',
		'/policy',
		'/privacy',
		'/cookie',
	].some((path) => location.pathname.startsWith(path));

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const progress = (currentScrollY / Math.max(docHeight, 1)) * 100;

			// Update scroll progress
			setScrollProgress(Math.min(100, Math.max(0, progress)));

			// Smart navbar show/hide logic
			if (currentScrollY < 100) {
				setShowNavbar(true);
			} else if (currentScrollY > lastScrollY.current + 20) {
				setShowNavbar(false);
			} else if (currentScrollY < lastScrollY.current - 20) {
				setShowNavbar(true);
			}

			lastScrollY.current = currentScrollY;

			// Reset scroll timeout
			if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
			scrollTimeout.current = setTimeout(() => setShowNavbar(true), 1000);
		};

		if (!hideNavbar) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			return () => {
				window.removeEventListener('scroll', handleScroll);
				if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
			};
		}
	}, [hideNavbar]);

	return (
		<ReactLenis
			root
			options={{
				lerp: 0.1,
				duration: 1.2,
				smoothWheel: true,
				smoothTouch: true,
				touchMultiplier: 2,
				infinite: false,
			}}
		>
			<Toaster
				position="top-right"
				toastOptions={{
					duration: 4000,
					className: '!bg-transparent !border-0 !shadow-none',
					style: { background: 'transparent' },
				}}
			/>

			{!hideNavbar && (
				<header
					className="fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-out-expo"
					style={{
						transform: `translateY(${showNavbar ? '0' : '-100%'})`,
						opacity: showNavbar ? 1 : 0,
					}}
				>
					{/* Progress bar */}
					<div
						className="absolute top-0 left-0 h-[2px] transition-all duration-300"
						style={{
							width: `${scrollProgress}%`,
							background: 'linear-gradient(90deg, var(--accent-1), var(--accent-2))',
							boxShadow: '0 0 20px var(--accent-1)',
						}}
					/>
					<Navbar />
				</header>
			)}

			<Background3D />

			<main
				id="main"
				className={`relative z-10 transition-all duration-300 ${
					!hideNavbar ? 'pt-20' : ''
				}`}
			>
				{/* Page transition wrapper */}
				<div className="page-transition-wrapper">
					<AppRoutes />
				</div>
			</main>

			{/* Scroll progress indicator (optional) */}
			<div
				className="fixed right-4 bottom-4 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center font-mono text-sm"
				style={{ opacity: scrollProgress > 2 ? 0.8 : 0 }}
			>
				{Math.round(scrollProgress)}%
			</div>
		</ReactLenis>
	);
}

export default App;

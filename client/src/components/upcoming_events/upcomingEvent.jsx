import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { publicClient } from '../../services/api.js';
import TicketForm from './ticketForm.jsx';
import handlePayment from '../../utils/paymentHandler.js';
import logo1 from '../../assets/smp.png';
import logo2 from '../../assets/whiteHeaven.png';
import logo3 from '../../assets/cabNest.png';
import Footer from '../Footer.jsx';

// Custom hook to prevent background scroll when modal is open
const usePreventBodyScroll = (preventScroll) => {
	useEffect(() => {
		if (preventScroll) {
			const originalOverflow = document.body.style.overflow;
			const originalPaddingRight = document.body.style.paddingRight;
			const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

			document.body.style.overflow = 'hidden';
			document.body.style.paddingRight = `${scrollBarWidth}px`;

			return () => {
				document.body.style.overflow = originalOverflow;
				document.body.style.paddingRight = originalPaddingRight;
			};
		}
	}, [preventScroll]);
};

const BloodDrips = ({ bloodDrips, setBloodDrips }) => (
	<div className="fixed inset-0 pointer-events-none z-0">
		{bloodDrips.map((drip) => (
			<motion.div
				key={drip.id}
				className="absolute top-0 w-2 h-8 bg-red-600 rounded-b-full"
				style={{ left: `${drip.x}%` }}
				initial={{ height: 0, opacity: 0 }}
				animate={{
					height: ['0px', '50px', '50px', '100px'],
					opacity: [0, 1, 1, 0],
					y: [0, '80vh'],
				}}
				transition={{
					duration: drip.duration,
					delay: drip.delay,
					times: [0, 0.3, 0.7, 1],
				}}
				onAnimationComplete={() => {
					setBloodDrips((prev) => prev.filter((d) => d.id !== drip.id));
				}}
			>
				<motion.div
					className="absolute bottom-0 w-4 h-4 bg-red-700 rounded-full"
					animate={{
						scale: [0, 1.5, 1],
						y: [0, 10, 20],
					}}
					transition={{
						duration: drip.duration * 0.3,
						delay: drip.duration * 0.7,
					}}
				/>
			</motion.div>
		))}
	</div>
);

const HorrorRaveYardPage = () => {
	const [spotsLeft, setSpotsLeft] = useState(0);
	const [totalSpots, setTotalSpots] = useState(0);
	const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
	const [eyesBlinking, setEyesBlinking] = useState(false);
	const [ghostAppears, setGhostAppears] = useState(false);
	const [bloodDrips, setBloodDrips] = useState([]);
	const [eventData, setEventData] = useState(null);
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const [showStartingSoon, setShowStartingSoon] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [isMobile, setIsMobile] = useState(false);

	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		phone: '',
		amount: '400',
		lpuId: '',
		gender: '',
		hosteler: '',
		hostel: '',
		course: '',
		club: '',
		eventId: '68859a199ec482166f0e8523',
	});

	// Responsive check
	useEffect(() => {
		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Prevent scroll when modal is open
	usePreventBodyScroll(showPaymentForm || showStartingSoon);

	// Fetch event data
	useEffect(() => {
		const fetchEventData = async () => {
			try {
				const response = await publicClient.get(
					'api/events/by-id/68859a199ec482166f0e8523'
				);
				const event = response.data?.data || response.data;

				if (event) {
					// Add default tags if missing
					if (!event.tags) {
						event.tags = [
							'DJ Anshika',
							'Freshers Exclusive',
							'Horror Theme',
							'VIP Access',
							'Underground Experience',
						];
					}

					setEventData(event);
					setTotalSpots(event.totalSpots || 0);

					const registrations = Array.isArray(event.registrations)
						? event.registrations.length
						: 0;

					setSpotsLeft((event.totalSpots || 0) + 200 - registrations);

					setFormData((f) => ({
						...f,
						amount: event.ticketPrice ? String(event.ticketPrice) : '400',
					}));
				}
			} catch (error) {
				setError('Failed to fetch event data.');
				console.error('Error fetching event data:', error);
			}
		};

		fetchEventData();
	}, []);

	// Countdown timer
	useEffect(() => {
		if (!eventData?.date) return;
		const targetDate = new Date(eventData.date);

		// If eventData.time exists, try to set the time
		if (eventData.time) {
			const [hours, minutes] = eventData.time.split(':').map(Number);
			// targetDate.setHours(hours || 0, minutes || 0, 0, 0);
			targetDate.setHours(17, 0, 0, 0);
		}

		const updateCountdown = () => {
			const now = new Date();
			const diff = targetDate - now;

			if (diff <= 0) {
				setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
				return;
			}

			const days = Math.floor(diff / (1000 * 60 * 60 * 24));
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const seconds = Math.floor((diff / 1000) % 60);

			setCountdown({ days, hours, minutes, seconds });
		};

		updateCountdown();
		const interval = setInterval(updateCountdown, 1000);
		return () => clearInterval(interval);
	}, [eventData]);

	// Eyes blinking animation
	useEffect(() => {
		const interval = setInterval(
			() => {
				setEyesBlinking(true);
				setTimeout(() => setEyesBlinking(false), 150 + Math.random() * 200);
			},
			1500 + Math.random() * 2000
		);

		return () => clearInterval(interval);
	}, []);

	// Ghost appears animation
	useEffect(() => {
		const interval = setInterval(
			() => {
				setGhostAppears(true);
				setTimeout(() => setGhostAppears(false), 2000);
			},
			6000 + Math.random() * 8000
		);

		return () => clearInterval(interval);
	}, []);

	// Blood drips animation
	useEffect(() => {
		const interval = setInterval(() => {
			if (bloodDrips.length < 20) {
				const newDrip = {
					id: Date.now(),
					x: Math.random() * 100,
					delay: Math.random() * 3,
					duration: 3 + Math.random() * 5,
				};
				setBloodDrips((prev) => [...prev, newDrip]);
			}
		}, 500);

		return () => clearInterval(interval);
	}, [bloodDrips]);

	// Event highlights
	const eventHighlights = [
		{
			title: 'Headlining Performance by DJ Anshika',
			description: 'Nationally renowned DJ bringing an exclusive high-energy haunted set.',
			icon: '🎧',
		},
		{
			title: 'Curated Freshers Experience',
			description: 'First event to welcome the incoming batch — from the other side!',
			icon: '👻',
		},
		{
			title: 'Haunted Glow Setup',
			description: 'Lasers, fog, UV-reactive horror decor, props, and more.',
			icon: '💀',
		},
		{
			title: 'Limited Access Entry',
			description: 'Entry via branded wristbands. VIP zones for contest winners.',
			icon: '🎟️',
		},
		{
			title: 'Security & Emergency Preparedness',
			description: 'Security with crowd flow control. Emergency medical setup.',
			icon: '🚨',
		},
		{
			title: 'Refreshment Zone @ RaveYard',
			description: 'Dedicated food & beverage stalls near venue entry/exit.',
			icon: '🍔',
		},
	];

	const partners = [
		{ title: 'SML', logo: logo1, desc: 'In collaboration with SML' },
		{ title: 'White Heaven', logo: logo2, desc: 'Entertainment Partner' },
		{ title: 'CABNEST', logo: logo3, desc: 'Travel Partner' },
	];

	// Open payment form
	const openPaymentForm = useCallback(() => {
		setError('');
		setShowPaymentForm(true);
	}, []);

	// Payment submit handler
	const onPaymentSubmit = useCallback(() => {
		handlePayment({
			formData,
			eventData,
			setLoading,
			setError,
			setShowPaymentForm,
			onSuccess: (orderData) => {
				console.log('Payment initiated successfully:', orderData);
			},
			onFailure: (error) => {
				console.error('Payment failed:', error);
			},
		});
	}, [formData, eventData]);

	// Rust particles and flakes state
	const [rustParticles] = useState(
		[...Array(15)].map((_, i) => ({
			left: Math.random() * 100,
			top: Math.random() * 100,
			direction: Math.random() > 0.5 ? 1 : -1,
			rotate: Math.random() * 360,
			delay: i * 0.5,
		}))
	);

	const [rustFlakes] = useState(
		[...Array(30)].map(() => ({
			width: Math.random() * 6 + 1,
			height: Math.random() * 6 + 1,
			top: Math.random() * 100,
			left: Math.random() * 100,
		}))
	);

	const [floatingRustFlakes] = useState(
		[...Array(15)].map(() => ({
			width: Math.random() * 10 + 2,
			height: Math.random() * 10 + 2,
			top: Math.random() * 100,
			left: Math.random() * 100,
		}))
	);

	return (
		<div className="min-h-screen bg-black text-white font-sans relative overflow-hidden">
			<BloodDrips bloodDrips={bloodDrips} setBloodDrips={setBloodDrips} />

			{/* Rust particles and flakes */}
			{rustParticles.map((p, i) => (
				<motion.div
					key={i}
					className="absolute text-xl text-red-800 opacity-50"
					style={{
						left: `${p.left}%`,
						top: `${p.top}%`,
					}}
					animate={{
						y: [0, -10, 0],
						x: [0, p.direction * 5, 0],
						rotate: [0, p.rotate],
					}}
					transition={{
						duration: 8 + Math.random() * 10,
						repeat: Infinity,
						delay: p.delay,
					}}
				>
					•
				</motion.div>
			))}
			{rustFlakes.map((f, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full"
					style={{
						width: `${f.width}px`,
						height: `${f.height}px`,
						background: `radial-gradient(circle, #8B4513, #5D2919)`,
						opacity: 0.7,
						top: `${f.top}%`,
						left: `${f.left}%`,
					}}
					animate={{
						y: [0, Math.random() * 20 - 10],
						x: [0, Math.random() * 20 - 10],
					}}
					transition={{
						duration: Math.random() * 5 + 5,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
			))}
			{floatingRustFlakes.map((f, i) => (
				<motion.div
					key={i}
					className="absolute rounded-full"
					style={{
						width: `${f.width}px`,
						height: `${f.height}px`,
						background: `radial-gradient(circle, #8B4513, #5D2919)`,
						opacity: 0.7,
						top: `${f.top}%`,
						left: `${f.left}%`,
					}}
					animate={{
						y: [0, Math.random() * 50 - 25],
						x: [0, Math.random() * 40 - 20],
					}}
					transition={{
						duration: Math.random() * 5 + 5,
						repeat: Infinity,
						repeatType: 'reverse',
					}}
				/>
			))}

			{/* Hero Section - Improved padding */}
			<div className="min-h-screen w-full flex flex-col justify-center items-center p-4 md:p-8 overflow-hidden relative">
				{/* Rust texture background */}
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `url("https://www.transparenttextures.com/patterns/rust.png"), radial-gradient(circle at 30% 40%, #3d1f1a 0%, #2a0f06 40%, #1a0904 70%, #0a0015 100%)`,
						backgroundBlendMode: 'overlay',
						opacity: 0.8,
					}}
				></div>

				{/* Rusty metal border */}
				<div
					className="absolute inset-2 border-4 pointer-events-none"
					style={{
						borderImage: `linear-gradient(45deg, #8B4513, #5D2919, #3a180d) 1`,
						borderStyle: 'solid',
						boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.8)',
						backgroundImage: `url("https://www.transparenttextures.com/patterns/rust.png")`,
						backgroundBlendMode: 'overlay',
					}}
				></div>

				<div className="relative z-10 text-center max-w-6xl w-full px-4">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 1, ease: 'easeOut' }}
					>
						{/* Rusty Metal Text Effect */}
						<motion.div
							className="relative mb-6"
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.8, ease: 'backOut' }}
						>
							<motion.h1
								className={`glitch ${isMobile ? 'text-6xl' : 'text-8xl'} font-black mb-0 relative tracking-tighter`}
								data-text="RAVEYARD"
								style={{
									fontFamily:
										"'Share Tech Mono', 'Bebas Neue', monospace, sans-serif",
									letterSpacing: '0.05em',
									background: 'linear-gradient(45deg, #e25822, #a04000, #e25822)',
									WebkitBackgroundClip: 'text',
									backgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
								}}
								animate={{
									textShadow: [
										'2px 2px 0 #8B4513, 4px 4px 0 #5D2919, 0 0 10px rgba(255, 0, 0, 0.3), 2px 0 #00fff9, -2px 0 #ff00c8',
										'1px 1px 0 #8B4513, 2px 2px 0 #5D2919, 0 0 5px rgba(255, 0, 0, 0.3), 1px 0 #00fff9, -1px 0 #ff00c8',
										'2px 2px 0 #8B4513, 4px 4px 0 #5D2919, 0 0 10px rgba(255, 0, 0, 0.3), 2px 0 #00fff9, -2px 0 #ff00c8',
										'3px 3px 0 #8B4513, 6px 6px 0 #5D2919, 0 0 15px rgba(255, 0, 0, 0.3), 3px 0 #00fff9, -3px 0 #ff00c8',
									],
								}}
								transition={{
									duration: 6,
									repeat: Infinity,
									repeatType: 'reverse',
								}}
							>
								RAVEYARD
							</motion.h1>

							<div className="absolute -bottom-3 left-0 right-0 h-1.5 bg-gradient-to-r from-red-800 via-red-600 to-red-800 rounded-full"></div>

							{/* Rust corrosion effect under text */}
							<div className="absolute -bottom-6 left-1/4 w-1/2 h-2 bg-gradient-to-r from-transparent via-red-900 to-transparent"></div>
						</motion.div>

						<motion.h2
							className={`${isMobile ? 'text-xl' : 'text-3xl'} text-red-300 mb-8 font-medium relative pb-4 tracking-wide`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
							style={{
								textShadow: '0 0 8px rgba(255, 50, 50, 0.7)',
								fontFamily: "'Rajdhani', sans-serif",
								fontWeight: 500,
							}}
						>
							Not your average EDM Night... It's curse of Beats
							<div className="absolute bottom-0 left-0 right-0 flex justify-center">
								{[...Array(5)].map((_, i) => (
									<motion.div
										key={i}
										className="w-1 h-6 mx-1 bg-gradient-to-b from-red-500 to-transparent"
										animate={{
											y: [0, 20, 40, 60],
											opacity: [1, 1, 1, 0],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											delay: i * 0.3,
											ease: 'easeInOut',
										}}
									/>
								))}
							</div>
						</motion.h2>

						{/* Feature Highlights */}
						<motion.div
							className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-6 mt-10 max-w-4xl mx-auto`}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 1, duration: 1, ease: 'easeOut' }}
						>
							{[
								{ icon: '🎧', title: 'DJ Anshika' },
								{ icon: '👻', title: 'GraveWalk - Fashion Show' },
								{ icon: '🍔', title: 'Refreshment Zone' },
								{ icon: '🎟️', title: 'Raveyard Traitor Hunt' },
							].map((item, index) => (
								<motion.div
									key={index}
									className="relative flex flex-col items-center p-5 rounded-2xl group transition-all duration-300"
									style={{
										background: 'rgba(90, 35, 25, 0.55)',
										border: '1.5px solid rgba(205, 133, 63, 0.4)',
										boxShadow:
											'0 6px 24px 0 rgba(220,38,38,0.12), 0 1.5px 0 #a04000',
										backgroundImage: `url("https://www.transparenttextures.com/patterns/rust.png")`,
										backgroundBlendMode: 'overlay',
										overflow: 'hidden',
									}}
									whileHover={{
										scale: 1.08,
										boxShadow:
											'0 0 32px 8px rgba(220,38,38,0.25), 0 2px 0 #a04000',
										borderColor: '#e25822',
									}}
									transition={{
										duration: 0.35,
										ease: 'easeInOut',
									}}
								>
									{/* Animated border glow */}
									<motion.div
										className="absolute inset-0 rounded-2xl pointer-events-none"
										style={{
											border: '2px solid transparent',
											boxShadow: '0 0 0 0 rgba(255, 80, 80, 0.0)',
										}}
										animate={{
											boxShadow: [
												'0 0 0 0 rgba(255, 80, 80, 0.0)',
												'0 0 16px 4px rgba(255, 80, 80, 0.15)',
												'0 0 0 0 rgba(255, 80, 80, 0.0)',
											],
										}}
										transition={{
											duration: 2.5,
											repeat: Infinity,
											repeatType: 'loop',
											ease: 'easeInOut',
										}}
									/>
									{/* Icon with metallic shine */}
									<span
										className="text-5xl mb-3 relative z-10 group-hover:animate-pulse"
										style={{
											filter: 'drop-shadow(0 2px 8px #a04000)',
											transition: 'filter 0.3s',
										}}
									>
										{item.icon}
										{/* Shine effect */}
										<span
											className="absolute left-1/2 top-1/2 w-10 h-10 rounded-full pointer-events-none"
											style={{
												background:
													'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
												transform: 'translate(-50%, -60%)',
												zIndex: 1,
											}}
										/>
									</span>
									<span className="text-lg font-bold text-red-200 tracking-wide drop-shadow-sm text-center z-10">
										{item.title}
									</span>
								</motion.div>
							))}
						</motion.div>

						{/* Rusty Metal Button */}
						<motion.div
							className="mt-10"
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 1.2, duration: 0.8, ease: 'backOut' }}
						>
							<motion.button
								whileHover={{
									scale: 1.05,
									boxShadow: '0 0 30px rgba(220, 38, 38, 0.8)',
								}}
								whileTap={{ scale: 0.95 }}
								onClick={() => window.open('https://vibranta.org', '_blank')}
								className="px-10 py-5 relative rounded-xl font-bold text-xl shadow-lg overflow-hidden"
								style={{
									background: `linear-gradient(145deg, #8B4513, #5D2919), url("https://www.transparenttextures.com/patterns/rust.png")`,
									backgroundBlendMode: 'overlay',
									boxShadow: `0 4px 0 #3a180d, inset 0 2px 4px rgba(255, 100, 100, 0.4)`,
									border: '1px solid #5D2919',
									textShadow: '0 0 8px rgba(255, 50, 50, 0.7)',
									fontFamily: "'Rajdhani', sans-serif",
								}}
								transition={{
									duration: 0.3,
									ease: 'easeInOut',
								}}
							>
								<div className="relative z-10 flex items-center gap-3">
									<span>Register Here</span>
								</div>

								{/* Rust corrosion spots on button */}
								<div className="absolute inset-0 flex justify-around items-start pointer-events-none">
									{[...Array(5)].map((_, i) => (
										<div
											key={i}
											className="w-3 h-3 rounded-full bg-red-900 opacity-70"
											style={{
												top: `${10 + i * 15}%`,
												left: `${10 + i * 20}%`,
											}}
										></div>
									))}
								</div>
							</motion.button>
						</motion.div>
					</motion.div>
				</div>

				{/* Floating rust particles */}
				{[...Array(15)].map((_, i) => (
					<motion.div
						key={i}
						className="absolute rounded-full"
						style={{
							width: `${Math.random() * 10 + 2}px`,
							height: `${Math.random() * 10 + 2}px`,
							background: `radial-gradient(circle, #8B4513, #5D2919)`,
							opacity: 0.7,
							top: `${Math.random() * 100}%`,
							left: `${Math.random() * 100}%`,
						}}
						animate={{
							y: [0, Math.random() * 50 - 25],
							x: [0, Math.random() * 40 - 20],
						}}
						transition={{
							duration: Math.random() * 5 + 5,
							repeat: Infinity,
							repeatType: 'reverse',
						}}
					/>
				))}

				<style jsx global>{`
					@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap');
					@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

					.glitch {
						font-family:
							'Share Tech Mono', 'Bebas Neue', monospace, sans-serif !important;
						position: relative;
						color: #e25822;
						letter-spacing: 0.05em;
						text-shadow:
							2px 2px 0 #8b4513,
							4px 4px 0 #5d2919,
							0 0 10px rgba(255, 0, 0, 0.3),
							2px 0 #00fff9,
							-2px 0 #ff00c8;
						animation: glitch 2s infinite linear alternate-reverse;
					}
					.glitch::before,
					.glitch::after {
						content: attr(data-text);
						position: absolute;
						left: 0;
						top: 0;
						width: 100%;
						overflow: hidden;
						color: #fff;
						opacity: 0.7;
						pointer-events: none;
					}
					.glitch::before {
						left: 2px;
						text-shadow: -2px 0 #00fff9;
						animation: glitchTop 2s infinite linear alternate-reverse;
					}
					.glitch::after {
						left: -2px;
						text-shadow: -2px 0 #ff00c8;
						animation: glitchBot 1.5s infinite linear alternate-reverse;
					}
					@keyframes glitchTop {
						0% {
							clip-path: inset(0 0 80% 0);
						}
						20% {
							clip-path: inset(0 0 60% 0);
						}
						40% {
							clip-path: inset(0 0 40% 0);
						}
						60% {
							clip-path: inset(0 0 20% 0);
						}
						80% {
							clip-path: inset(0 0 60% 0);
						}
						100% {
							clip-path: inset(0 0 80% 0);
						}
					}
					@keyframes glitchBot {
						0% {
							clip-path: inset(80% 0 0 0);
						}
						20% {
							clip-path: inset(60% 0 0 0);
						}
						40% {
							clip-path: inset(40% 0 0 0);
						}
						60% {
							clip-path: inset(20% 0 0 0);
						}
						80% {
							clip-path: inset(60% 0 0 0);
						}
						100% {
							clip-path: inset(80% 0 0 0);
						}
					}
					@keyframes glitch {
						0% {
							transform: translate(0);
						}
						20% {
							transform: translate(-2px, 2px);
						}
						40% {
							transform: translate(-2px, -2px);
						}
						60% {
							transform: translate(2px, 2px);
						}
						80% {
							transform: translate(2px, -2px);
						}
						100% {
							transform: translate(0);
						}
					}
				`}</style>
			</div>

			{/* Countdown timer */}
			<section className="py-12 px-4 md:px-8 bg-black">
				<div className="max-w-2xl mx-auto text-center">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5, duration: 0.8 }}
						className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
					>
						{Object.entries(countdown).map(([unit, value], index) => (
							<motion.div
								key={unit}
								className="relative bg-gradient-to-b from-gray-900 to-black border-b-4 border-red-900 rounded-xl p-4 overflow-hidden"
								style={{
									boxShadow: 'inset 0 0 10px rgba(139, 0, 0, 0.5)',
								}}
								whileHover={{ scale: 1.05 }}
							>
								<div className="absolute top-2 right-2 w-3 h-3 bg-red-900 rounded-full"></div>
								<div className="absolute bottom-2 left-2 w-4 h-4 bg-red-900 rounded-full opacity-70"></div>
								<div className="text-3xl md:text-4xl font-black text-red-400 mb-1 relative z-10">
									{String(value).padStart(2, '0')}
								</div>
								<div className="text-sm text-red-300 uppercase font-medium relative z-10">
									{unit}
								</div>
							</motion.div>
						))}
					</motion.div>
					<div className="flex justify-center gap-8 mb-4">
						<span className="text-red-400 font-bold">{spotsLeft} SOULS LEFT</span>
						<span className="text-red-400 font-bold">{totalSpots} TOTAL</span>
					</div>
					<div className="w-full bg-gray-900/50 h-3 rounded-full overflow-hidden mb-4">
						<div
							className="h-full bg-gradient-to-r from-red-600 to-red-800"
							style={{
								width: totalSpots > 0 ? `${(spotsLeft / totalSpots) * 100}%` : '0%',
							}}
						></div>
					</div>
				</div>
			</section>

			{/* Event Highlights */}
			<section className="py-24 px-4 md:px-8 bg-gradient-to-b from-black via-red-900/10 to-black">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl md:text-5xl font-bold text-red-500 mb-6">
							EVENT HIGHLIGHTS
						</h2>
						<p className="text-xl text-red-300 max-w-3xl mx-auto">
							Discover what makes RaveYard 2025 unforgettable
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{eventHighlights.map((item, index) => (
							<motion.div
								key={index}
								className="bg-gradient-to-br from-red-900 to-black backdrop-blur-sm border border-red-600/50 rounded-xl p-8 relative overflow-hidden"
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.15, duration: 0.8 }}
								whileHover={{ y: -10 }}
							>
								<div className="text-5xl mb-4">{item.icon}</div>
								<h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
								<p className="text-red-200">{item.description}</p>
								{item.title === 'Security & Emergency Preparedness' && (
									<motion.div
										className="absolute bottom-4 right-4"
										animate={{ x: [0, -10, 0], rotate: [0, 15, 0] }}
										transition={{ repeat: Infinity, duration: 2 }}
									>
										<span className="text-3xl">🐕‍🦺</span>
									</motion.div>
								)}
								<motion.div
									className="absolute top-4 right-4 w-6 h-6 bg-red-600 rounded-full"
									animate={{
										y: [0, 15, 0],
										scale: [1, 1.2, 1],
										opacity: [0.7, 1, 0.7],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										delay: index * 0.2,
									}}
								/>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Event Details Section - Improved poster presentation */}
			<section className="py-24 px-4 md:px-8">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
						{/* Left column - Event details */}
						<div>
							<h2 className="text-3xl md:text-4xl font-bold text-red-400 mb-8">
								EVENT DETAILS
							</h2>
							<div className="space-y-6 mb-10">
								<div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-red-600/30">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
										<span>📅</span>
									</div>
									<div>
										<div className="text-sm text-red-300 font-medium">
											DATE & TIME
										</div>
										<div className="text-white text-xl font-medium">
											{eventData?.date
												? (() => {
														const eventDate = new Date(eventData.date);
														const dateStr =
															eventDate.toLocaleDateString(
																undefined,
																{
																	weekday: 'long',
																	year: 'numeric',
																	month: 'short',
																	day: 'numeric',
																}
															);
														const timeStr =
															eventData.time ||
															eventDate.toLocaleTimeString(
																undefined,
																{
																	hour: '2-digit',
																	minute: '2-digit',
																}
															);
														return `${dateStr} • ${timeStr}`;
													})()
												: '-- • --'}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-red-600/30">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
										<span>📍</span>
									</div>
									<div>
										<div className="text-sm text-red-300 font-medium">
											LOCATION
										</div>
										<div className="text-white text-xl font-medium">
											{eventData?.venue || '--'}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl border border-red-600/30">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
										<span>🎟️</span>
									</div>
									<div>
										<div className="text-sm text-red-300 font-medium">
											TICKET PRICE
										</div>
										<div className="text-white text-xl font-medium">
											{eventData?.ticketPrice
												? `₹${eventData.ticketPrice}`
												: '₹1'}
										</div>
									</div>
								</div>
							</div>
							<div className="mb-6">
								<div className="flex justify-between mb-2">
									<span className="text-red-400 font-bold">
										{spotsLeft} SOULS LEFT
									</span>
									<span className="text-red-400 font-bold">
										{totalSpots} TOTAL
									</span>
								</div>
								<div className="w-full bg-gray-900/50 h-3 rounded-full overflow-hidden">
									<div
										className="h-full bg-gradient-to-r from-red-600 to-red-800"
										style={{
											width:
												totalSpots > 0
													? `${(spotsLeft / totalSpots) * 100}%`
													: '0%',
										}}
									></div>
								</div>
							</div>
							{eventData?.tags && eventData.tags.length > 0 && (
								<div className="flex flex-wrap gap-3 mb-8">
									{eventData.tags.map((tag, index) => (
										<span
											key={index}
											className="px-3 py-1.5 rounded-full text-sm bg-red-900/50 text-red-300"
										>
											{tag}
										</span>
									))}
								</div>
							)}
						</div>
						{/* Right column - Posters */}
						<div className="w-full">
							{eventData?.posters && eventData.posters.length > 0 ? (
								<div className="flex gap-8 overflow-x-auto pb-8 hide-scrollbar">
									{eventData.posters.map((poster, idx) => (
										<div
											key={poster.public_id || poster.url || idx}
											className="relative flex-shrink-0 rounded-2xl border border-red-800 bg-black/70"
											style={{ width: 320, minWidth: 220, maxWidth: 420 }}
										>
											<a
												href={poster.url}
												target="_blank"
												rel="noopener noreferrer"
												className="block"
											>
												<div className="aspect-[2/3] overflow-hidden flex items-center justify-center bg-black rounded-2xl">
													<img
														src={poster.url}
														alt={
															poster.alt || `Event Poster ${idx + 1}`
														}
														className="w-full h-full object-contain rounded-2xl"
														style={{
															background: '#181818',
															borderRadius: 'inherit',
														}}
													/>
												</div>
											</a>
											{/* Poster index badge */}
											<div className="absolute top-2 left-2 bg-red-700/90 text-xs text-white px-3 py-1 rounded-full shadow">
												#{idx + 1}
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full w-full py-16 border-2 border-dashed border-red-700/30 rounded-xl bg-black/40">
									<div className="text-6xl mb-4">🖼️</div>
									<h3 className="text-xl font-bold text-white mb-2">
										Posters Coming Soon
									</h3>
									<p className="text-red-200 text-center max-w-md">
										Creepy visuals are being conjured in the underworld.
										<br />
										Stay tuned for the reveal!
									</p>
								</div>
							)}
							<style>{`
								.hide-scrollbar::-webkit-scrollbar {
									display: none;
								}
								.hide-scrollbar {
									-ms-overflow-style: none;
									scrollbar-width: none;
								}
							`}</style>
						</div>
					</div>
				</div>
			</section>

			{/*
			Redirect to vibranta.org
			*/}
			{/* {typeof window !== "undefined" && window.location.replace("https://vibranta.org")}} */}
			<footer className="py-16 px-4 md:px-8 bg-gradient-to-t from-red-900/20 to-black border-t border-red-800/30">
				<div className="max-w-6xl mx-auto">
					<div className="text-center space-y-6">
						<div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
							RaveYard 2025
						</div>
						<div className="flex justify-center gap-8 text-red-300">
							{[
								{ icon: '📱', text: '#RaveYard2025' },
								{ icon: '👻', text: '@raveyard_official' },
								{ icon: '💀', text: 'Join the Undead' },
							].map((item, index) => (
								<div key={index} className="flex items-center gap-2">
									<span>{item.icon}</span>
									<span className="font-medium">{item.text}</span>
								</div>
							))}
						</div>
						<div className="border-t border-red-800/30 pt-8 space-y-2">
							<p className="text-red-300">
								© 2025 RaveYard. All rights reserved to the underworld.
							</p>
							<p className="text-red-400 text-sm opacity-80">
								A ghostly rite of passage for the undead students of tomorrow
							</p>
						</div>
					</div>
				</div>
			</footer>

			{/* Animated effects */}
			<AnimatePresence>
				{eyesBlinking && (
					<motion.div
						className="fixed inset-0 pointer-events-none z-20"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						{[...Array(8)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute text-5xl"
								style={{
									left: `${5 + i * 12}%`,
									top: `${15 + (i % 3) * 25}%`,
								}}
								animate={{ scaleY: [1, 0.05, 1] }}
								transition={{ duration: 0.3 }}
							>
								👁️
							</motion.div>
						))}
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{ghostAppears && (
					<div className="fixed inset-0 pointer-events-none z-20">
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								className="absolute text-6xl"
								style={{
									left: `${i * 30}%`,
									top: `${20 + (i % 2) * 40}%`,
								}}
								initial={{ opacity: 0, scale: 0 }}
								animate={{
									opacity: [0, 1, 0.7, 0],
									scale: [0, 1.5, 1.2, 0],
									y: [0, -50, -30, -100],
								}}
								exit={{ opacity: 0, scale: 0 }}
								transition={{ duration: 2 }}
							>
								👻
							</motion.div>
						))}
					</div>
				)}
			</AnimatePresence>

			{/* Payment Form Modal */}
			<AnimatePresence>
				{showPaymentForm && (
					<>
						<TicketForm
							eventData={eventData}
							formData={formData}
							setFormData={setFormData}
							loading={loading}
							error={error}
							onClose={() => setShowPaymentForm(false)}
							onSubmit={onPaymentSubmit}
						/>
						<div id="cashfree-dropin-container" className="w-full min-h-[500px]"></div>
					</>
				)}
			</AnimatePresence>

			{/* Starting Soon Modal */}
			<AnimatePresence>
				{showStartingSoon && (
					<motion.div
						className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setShowStartingSoon(false)}
					>
						<motion.div
							className="bg-gradient-to-br from-red-900/95 to-black/95 border border-red-700/60 shadow-2xl rounded-2xl max-w-xs w-full p-8 text-center flex flex-col items-center"
							initial={{ scale: 0.85, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.85, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="text-5xl mb-4 animate-bounce">⏳</div>
							<h2 className="text-2xl font-bold text-red-300 mb-2">
								Registration Starting Soon
							</h2>
							<p className="text-red-200 mb-6">
								Stay tuned! Registration for this event will open soon.
							</p>
							<button
								onClick={() => setShowStartingSoon(false)}
								className="mt-2 px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 rounded-lg font-semibold text-white hover:from-red-700 hover:to-red-900 transition"
							>
								Close
							</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
			<Footer />
		</div>
	);
};

export default HorrorRaveYardPage;

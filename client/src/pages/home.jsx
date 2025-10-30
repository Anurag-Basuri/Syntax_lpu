import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import ClubDescription from '../components/ClubDescription.jsx';
import EventsPreview from '../components/EventsPreview.jsx';
import TeamPreview from '../components/TeamPreview.jsx';
import Testimonials from '../components/Testimonials.jsx';
import Footer from '../components/Footer.jsx';
import Logo from '../assets/logo.png';
import AboutSyntax from '../components/AboutSyntax.jsx'; // NEW

const Home = () => {
	return (
		<div className="relative min-h-screen bg-gradient-to-b from-[#0a0e17] to-[#1a1f3a] text-white overflow-x-hidden">
			{/* Fixed background elements */}
			<div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
				{/* Grid */}
				<div className="absolute inset-0 bg-grid-white/[0.03] bg-[length:20px_20px]" />
				{/* Logo: optimized for long, white PNG */}
				<motion.div
					className="absolute inset-0 flex items-start justify-center pt-[12vh] md:pt-[14vh] lg:pt-[16vh]"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 0.06, scale: 1 }}
					transition={{ duration: 1.2, ease: 'easeOut' }}
				>
					<img
						src={Logo}
						alt="Syntax Club Logo"
						className="w-[85vw] max-w-[900px] md:w-[70vw] md:max-w-[820px] h-auto object-contain"
						loading="eager"
						decoding="async"
					/>
				</motion.div>
				{/* Blur shapes */}
				<div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-blue-500/10 filter blur-3xl animate-pulse-slow" />
				<div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full bg-indigo-500/15 filter blur-3xl animate-pulse-slow" />
				<div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-purple-500/12 filter blur-3xl animate-pulse-slow" />
			</div>

			{/* Content */}
			<div className="relative z-10">
				<Hero />
				<AboutSyntax />
				<ClubDescription />
				<EventsPreview />
				<TeamPreview />
				<Testimonials />
				<Footer />
			</div>
		</div>
	);
};

export default Home;

import React from 'react';
import { useTheme } from '../hooks/useTheme.js';
import logo from '../assets/logo.png';

const NavLogo = ({ onClick, elevated }) => {
	const { mode } = useTheme();
	const isLight = mode === 'light';

	// Responsive, prominent sizing (shrinks slightly when elevated)
	const logoHeight = `clamp(${elevated ? 36 : 40}px, 5.2vw, ${elevated ? 48 : 56}px)`;

	return (
		<button
			onClick={onClick}
			aria-label="Go to home"
			className="relative group inline-flex items-center px-2 sm:px-3 py-1.5 md:py-2 select-none"
			style={{ borderRadius: 12 }}
		>
			<div className="relative inline-flex items-center justify-center">
				{/* Ambient halo (very subtle, theme-aware) */}
				<div
					aria-hidden="true"
					className="absolute -inset-2 sm:-inset-3 rounded-[18px] pointer-events-none transition-all duration-500"
					style={{
						background: isLight
							? 'radial-gradient(80% 60% at 0% 50%, rgba(0,0,0,0.07), transparent 70%)'
							: 'radial-gradient(80% 60% at 0% 50%, rgba(0,200,255,0.16), transparent 70%)',
						filter: 'blur(12px)',
						opacity: elevated ? 0.55 : 0.8,
						transform: 'translateZ(0)',
					}}
				/>

				{/* Main white logo (kept natural aspect) */}
				<img
					src={logo}
					alt="Logo"
					draggable="false"
					decoding="async"
					className="relative z-10 block w-auto"
					style={{
						height: logoHeight,
						// Dark outline for white logo in light mode, cyan glow in dark mode
						filter: isLight
							? 'drop-shadow(0 1px 0 rgba(0,0,0,0.20)) drop-shadow(0 3px 8px rgba(0,0,0,0.18))'
							: 'drop-shadow(0 3px 10px rgba(0,200,255,0.28)) drop-shadow(0 8px 26px rgba(0,150,255,0.18))',
						transition: 'filter .3s ease, transform .3s ease',
						transform: elevated ? 'translateY(0)' : 'translateY(0.5px)',
					}}
				/>

				{/* Edge-following glow, masked to logo shape */}
				<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
					<div
						className="w-full h-full transition-all duration-400"
						style={{
							WebkitMaskImage: `url(${logo})`,
							maskImage: `url(${logo})`,
							WebkitMaskRepeat: 'no-repeat',
							maskRepeat: 'no-repeat',
							WebkitMaskSize: 'contain',
							maskSize: 'contain',
							WebkitMaskPosition: 'left center',
							maskPosition: 'left center',
							background: isLight
								? 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.20) 28%, rgba(0,0,0,0.20) 72%, rgba(0,0,0,0) 100%)'
								: 'linear-gradient(90deg, rgba(0,200,255,0.00) 0%, rgba(0,200,255,0.32) 30%, rgba(0,150,255,0.32) 70%, rgba(0,150,255,0.00) 100%)',
							filter: `blur(${isLight ? 5 : 7}px)`,
							opacity: elevated ? 0.48 : 0.72,
							transform: 'scale(1.05)',
						}}
					/>
				</div>

				{/* Sheen sweep on hover (subtle) */}
				<div
					aria-hidden="true"
					className="absolute inset-y-0 -left-8 w-10 skew-x-12 opacity-0 group-hover:opacity-40 transition-opacity duration-300"
					style={{
						background: isLight
							? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)'
							: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
						filter: 'blur(6px)',
						animation: 'none',
					}}
				/>
			</div>
		</button>
	);
};

export default NavLogo;

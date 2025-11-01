import React from 'react';
import { useTheme } from '../hooks/useTheme.js';
import logo from '../assets/logo.png';

const NavLogo = ({ onClick, elevated }) => {
	const { mode } = useTheme();
	const isLight = mode === 'light';

	return (
		<button
			onClick={onClick}
			className="relative px-3 py-2 transition-all duration-300 select-none"
			aria-label="Go to home"
		>
			<div className="relative inline-flex items-center">
				{/* Logo wrapper with invert filter for light mode */}
				<div
					className="relative transform-gpu transition-transform duration-300 hover:scale-[1.02]"
					style={{
						filter: isLight ? 'brightness(0.15) contrast(1.2)' : 'none',
					}}
				>
					<img
						src={logo}
						alt="Logo"
						className="h-9 sm:h-10 md:h-11 w-auto relative z-10"
						style={{
							filter: `drop-shadow(0 4px ${isLight ? '8px' : '12px'} ${
								isLight ? 'rgba(0,0,0,0.2)' : 'rgba(0,200,255,0.3)'
							})`,
							transition: 'filter 0.3s ease',
						}}
					/>

					{/* Theme-aware glow effect */}
					<div
						className="absolute inset-0 pointer-events-none"
						style={{
							WebkitMaskImage: `url(${logo})`,
							maskImage: `url(${logo})`,
							WebkitMaskSize: 'contain',
							maskSize: 'contain',
							WebkitMaskRepeat: 'no-repeat',
							maskRepeat: 'no-repeat',
							WebkitMaskPosition: 'center',
							maskPosition: 'center',
							background: isLight
								? 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0) 100%)'
								: 'linear-gradient(90deg, rgba(0,200,255,0) 0%, rgba(0,200,255,0.35) 30%, rgba(0,150,255,0.35) 70%, rgba(0,200,255,0) 100%)',
							filter: `blur(${isLight ? '6px' : '8px'})`,
							opacity: elevated ? 0.6 : 0.8,
							transform: 'scale(1.1)',
							transition: 'opacity 0.35s ease, transform 0.35s ease',
						}}
					/>
				</div>
			</div>
		</button>
	);
};

export default NavLogo;

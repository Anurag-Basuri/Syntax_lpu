import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import Logo from '../assets/logo.png';

const Background3D = () => {
	const gridRef = useRef(null);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		if (prefersReducedMotion || !gridRef.current) return;
		const onMove = (e) => {
			const { clientX, clientY } = e;
			const { innerWidth: w, innerHeight: h } = window;
			const nx = (clientX / w) * 2 - 1;
			const ny = (clientY / h) * 2 - 1;
			gridRef.current.style.setProperty('--tiltY', `${nx * -3}deg`);
			gridRef.current.style.setProperty('--lift', `${ny * -5}px`);
			gridRef.current.style.setProperty('--grid-x', `${nx * -25}px`);
			gridRef.current.style.setProperty('--grid-y', `${ny * -25}px`);
		};
		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, [prefersReducedMotion]);

	return (
		<div className="bg-3d-container fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
			{/* Next-like layered background */}
			<div className="absolute inset-0 bg-next-base" />
			<div className="absolute inset-0 next-spotlights" />
			<div className="absolute inset-0 next-vignette" />

			{/* Gradient-masked logo watermark (center-top) */}
			<div className="absolute inset-x-0 top-0 flex items-start justify-center pt-[10vh] sm:pt-[12vh] lg:pt-[14vh]">
				<div
					className={`logo-mask ${prefersReducedMotion ? '' : 'animate'}`}
					style={{
						WebkitMaskImage: `url(${Logo})`,
						maskImage: `url(${Logo})`,
						width: 'min(82vw, 860px)',
						aspectRatio: '2.1 / 1',
					}}
				/>
			</div>

			{/* 3D stage */}
			<div className="bg-3d-stage">
				<div ref={gridRef} className="bg-3d-grid" />
				<div className="bg-3d-horizon" />
			</div>

			{/* Motto ticker (blended, low-contrast) */}
			<div className="motto-track">
				<div className="motto-ticker text-[clamp(12px,1.8vw,16px)]">
					Create • Collaborate • Ship • Empower builders • Learn in public • Create •
					Collaborate • Ship • Empower builders • Learn in public •
				</div>
			</div>
		</div>
	);
};

export default Background3D;

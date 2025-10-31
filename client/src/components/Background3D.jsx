import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const Background3D = () => {
	const gridRef = useRef(null);
	const stageRef = useRef(null);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		if (prefersReducedMotion) return;

		const onMove = (e) => {
			const w = window.innerWidth;
			const h = window.innerHeight;
			const nx = e.clientX / w - 0.5; // [-0.5, 0.5]
			const ny = e.clientY / h - 0.5;

			// Subtle tilt with mouse
			const tiltZ = nx * 4; // deg
			const tiltY = nx * 4; // deg
			const lift = ny * 10; // px

			if (gridRef.current) {
				gridRef.current.style.setProperty('--tiltZ', `${tiltZ}deg`);
				gridRef.current.style.setProperty('--lift', `${lift}px`);
				gridRef.current.style.setProperty('--tiltY', `${tiltY}deg`);
				// Drift grid lines slightly
				gridRef.current.style.setProperty('--grid-x', `${nx * 30}px`);
				gridRef.current.style.setProperty('--grid-y', `${ny * 30}px`);
			}
		};

		window.addEventListener('pointermove', onMove);
		return () => window.removeEventListener('pointermove', onMove);
	}, [prefersReducedMotion]);

	return (
		<div className="bg3d fixed inset-0 -z-50 pointer-events-none" aria-hidden="true">
			{/* Next-like base gradient */}
			<div className="absolute inset-0 bg-next-base" />
			{/* Subtle spotlights */}
			<div className="absolute inset-0 next-spotlights" />
			{/* Vignette */}
			<div className="absolute inset-0 next-vignette" />
			{/* 3D stage with perspective */}
			<div ref={stageRef} className="bg-3d-stage">
				<div ref={gridRef} className="bg-3d-grid" />
				<div className="bg-3d-horizon" />
			</div>
		</div>
	);
};

export default Background3D;

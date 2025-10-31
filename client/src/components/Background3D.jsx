import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const Background3D = () => {
	const gridRef = useRef(null);
	const prefersReducedMotion = useReducedMotion();

	useEffect(() => {
		if (prefersReducedMotion || !gridRef.current) return;

		const onMove = (e) => {
			const { clientX, clientY } = e;
			const { innerWidth: w, innerHeight: h } = window;
			const nx = (clientX / w) * 2 - 1; // -1 to 1
			const ny = (clientY / h) * 2 - 1; // -1 to 1

			gridRef.current.style.setProperty('--tiltY', `${nx * -3}deg`);
			gridRef.current.style.setProperty('--lift', `${ny * -5}px`);
			gridRef.current.style.setProperty('--grid-x', `${nx * -25}px`);
			gridRef.current.style.setProperty('--grid-y', `${ny * -25}px`);
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		return () => window.removeEventListener('pointermove', onMove);
	}, [prefersReducedMotion]);

	return (
		<div className="bg-3d-container" aria-hidden="true">
			<div className="bg-3d-glow" />
			<div className="bg-3d-grid">
				<div ref={gridRef} className="bg-3d-grid-inner" />
			</div>
		</div>
	);
};

export default Background3D;

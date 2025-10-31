import React, { useEffect, useRef, useState } from 'react';
import logo from '../assets/logo.png';

const Background3D = ({ logoUrl = '/logo.png' }) => {
	const canvasRef = useRef(null);
	const mousePos = useRef({ x: 0.5, y: 0.5 });
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		setPrefersReducedMotion(mediaQuery.matches);

		const handleChange = (e) => setPrefersReducedMotion(e.matches);
		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	}, []);

	useEffect(() => {
		if (prefersReducedMotion) return;

		const handleMouseMove = (e) => {
			mousePos.current = {
				x: e.clientX / window.innerWidth,
				y: e.clientY / window.innerHeight,
			};
		};

		window.addEventListener('mousemove', handleMouseMove, { passive: true });
		return () => window.removeEventListener('mousemove', handleMouseMove);
	}, [prefersReducedMotion]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		let animationId;
		let time = 0;

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener('resize', resize);

		const drawGrid = () => {
			const { width, height } = canvas;
			const gridSize = 50;
			const perspective = 600;
			const horizonY = height * 0.65;

			ctx.clearRect(0, 0, width, height);

			// Mouse parallax effect
			const offsetX = prefersReducedMotion ? 0 : (mousePos.current.x - 0.5) * 40;
			const offsetY = prefersReducedMotion ? 0 : (mousePos.current.y - 0.5) * 20;
			const waveTime = prefersReducedMotion ? 0 : time * 0.0005;

			// Draw grid lines
			ctx.strokeStyle = 'rgba(0, 200, 255, 0.15)';
			ctx.lineWidth = 1;

			// Vertical lines
			for (let i = -10; i <= 10; i++) {
				const x = width / 2 + i * gridSize + offsetX;

				ctx.beginPath();
				ctx.moveTo(x, horizonY);

				for (let j = 0; j < 20; j++) {
					const y = horizonY + j * gridSize;
					const depth = j / 20;
					const scale = perspective / (perspective + depth * 500);
					const wave = prefersReducedMotion
						? 0
						: Math.sin(waveTime + i * 0.3 + j * 0.2) * 3;

					const projX = width / 2 + (x - width / 2) * scale + wave + offsetX * depth;
					const projY = horizonY + (y - horizonY) * scale + offsetY * depth;

					ctx.lineTo(projX, projY);
				}
				ctx.stroke();
			}

			// Horizontal lines
			for (let j = 0; j < 20; j++) {
				const depth = j / 20;
				const scale = perspective / (perspective + depth * 500);
				const alpha = 0.15 * (1 - depth * 0.5);

				ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
				ctx.beginPath();

				for (let i = -10; i <= 10; i++) {
					const x = width / 2 + i * gridSize;
					const y = horizonY + j * gridSize;
					const wave = prefersReducedMotion
						? 0
						: Math.sin(waveTime + i * 0.3 + j * 0.2) * 3;

					const projX = width / 2 + (x - width / 2) * scale + wave + offsetX * depth;
					const projY = horizonY + (y - horizonY) * scale + offsetY * depth;

					if (i === -10) {
						ctx.moveTo(projX, projY);
					} else {
						ctx.lineTo(projX, projY);
					}
				}
				ctx.stroke();
			}

			// Glowing dots at intersections
			if (!prefersReducedMotion) {
				ctx.fillStyle = 'rgba(0, 200, 255, 0.6)';
				for (let i = -10; i <= 10; i += 2) {
					for (let j = 0; j < 20; j += 2) {
						const x = width / 2 + i * gridSize;
						const y = horizonY + j * gridSize;
						const depth = j / 20;
						const scale = perspective / (perspective + depth * 500);
						const wave = Math.sin(waveTime + i * 0.3 + j * 0.2) * 3;

						const projX = width / 2 + (x - width / 2) * scale + wave + offsetX * depth;
						const projY = horizonY + (y - horizonY) * scale + offsetY * depth;
						const pulse = Math.sin(time * 0.003 + i + j) * 0.5 + 0.5;

						ctx.beginPath();
						ctx.arc(projX, projY, 1.5 * pulse, 0, Math.PI * 2);
						ctx.fill();
					}
				}
			}

			if (!prefersReducedMotion) {
				time++;
				animationId = requestAnimationFrame(drawGrid);
			}
		};

		drawGrid();
		if (prefersReducedMotion) {
			// Draw once for static version
			drawGrid();
		}

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
		};
	}, [prefersReducedMotion]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
			{/* Base gradient background */}
			<div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

			{/* Radial gradient spotlight */}
			<div
				className="absolute inset-0 opacity-40"
				style={{
					background:
						'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(0, 200, 255, 0.15), transparent)',
				}}
			/>

			{/* Canvas for 3D grid */}
			<canvas
				ref={canvasRef}
				className="absolute inset-0 w-full h-full"
				style={{ mixBlendMode: 'screen' }}
			/>

			{/* Logo watermark */}
			<div className="absolute inset-0 flex items-start justify-center pt-16 sm:pt-20 lg:pt-24">
				<div
					className="relative w-[min(85vw,900px)] aspect-[2.1/1] opacity-[0.03]"
					style={{
						WebkitMaskImage: `url(${logoUrl})`,
						maskImage: `url(${logoUrl})`,
						WebkitMaskSize: 'contain',
						maskSize: 'contain',
						WebkitMaskRepeat: 'no-repeat',
						maskRepeat: 'no-repeat',
						WebkitMaskPosition: 'center',
						maskPosition: 'center',
						background:
							'linear-gradient(180deg, rgba(0, 200, 255, 1) 0%, rgba(0, 150, 255, 0.6) 100%)',
					}}
				/>
			</div>

			{/* Floating particles */}
			{!prefersReducedMotion && (
				<div className="absolute inset-0">
					{[...Array(20)].map((_, i) => (
						<div
							key={i}
							className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-float"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 5}s`,
								animationDuration: `${10 + Math.random() * 10}s`,
							}}
						/>
					))}
				</div>
			)}

			{/* Bottom fade */}
			<div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

			{/* CSS Animations */}
			<style jsx>{`
				@keyframes float {
					0%,
					100% {
						transform: translateY(0) translateX(0);
						opacity: 0;
					}
					10% {
						opacity: 0.3;
					}
					90% {
						opacity: 0.3;
					}
					50% {
						transform: translateY(-100px) translateX(50px);
					}
				}

				.animate-float {
					animation: float linear infinite;
				}
			`}</style>
		</div>
	);
};

export default Background3D;

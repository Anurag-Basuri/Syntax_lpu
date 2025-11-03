import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../assets/logo.png';

const Background3D = () => {
	const canvasRef = useRef(null);
	const mousePos = useRef({ x: 0.5, y: 0.5 });
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
	const location = useLocation();

	const isAuthPage =
		location.pathname.startsWith('/login') || location.pathname.startsWith('/join');

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
		let nodes = [];
		const nodeCount = window.innerWidth < 768 ? 60 : 100;
		const maxDist = 200; // Max distance to draw a line between nodes

		class Node {
			constructor() {
				this.x = Math.random() * canvas.width;
				this.y = Math.random() * canvas.height;
				this.vx = (Math.random() - 0.5) * 0.5; // Velocity X
				this.vy = (Math.random() - 0.5) * 0.5; // Velocity Y
				this.radius = Math.random() * 1.5 + 1;
			}

			update() {
				this.x += this.vx;
				this.y += this.vy;

				// Bounce off edges
				if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
				if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
			}

			draw() {
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
				ctx.fillStyle = 'rgba(14, 165, 233, 0.8)'; // accent-1
				ctx.fill();
			}
		}

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			nodes = [];
			for (let i = 0; i < nodeCount; i++) {
				nodes.push(new Node());
			}
		};

		const drawLines = () => {
			for (let i = 0; i < nodes.length; i++) {
				for (let j = i + 1; j < nodes.length; j++) {
					const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
					if (dist < maxDist) {
						const opacity = 1 - dist / maxDist;
						ctx.beginPath();
						ctx.moveTo(nodes[i].x, nodes[i].y);
						ctx.lineTo(nodes[j].x, nodes[j].y);
						ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.5})`; // accent-2
						ctx.lineWidth = 0.5;
						ctx.stroke();
					}
				}
			}
		};

		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Parallax effect on the entire canvas
			const targetX = (0.5 - mousePos.current.x) * 20;
			const targetY = (0.5 - mousePos.current.y) * 20;
			ctx.save();
			ctx.translate(targetX, targetY);

			nodes.forEach((node) => {
				node.update();
				node.draw();
			});
			drawLines();

			ctx.restore();
			animationId = requestAnimationFrame(animate);
		};

		resize();
		window.addEventListener('resize', resize);

		if (!prefersReducedMotion && !isAuthPage) {
			animate();
		} else {
			// Draw a static frame for auth pages or reduced motion
			nodes.forEach((node) => node.draw());
			drawLines();
		}

		return () => {
			cancelAnimationFrame(animationId);
			window.removeEventListener('resize', resize);
		};
	}, [prefersReducedMotion, isAuthPage]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
			{/* Base gradient layers */}
			<div className="absolute inset-0 bg-bg-base" />
			<div
				className="absolute inset-0 opacity-25"
				style={{
					background:
						'radial-gradient(ellipse 80% 50% at 50% 40%, var(--accent-1), transparent)',
				}}
			/>

			{/* Constellation Canvas */}
			<canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-50" />

			{/* Logo watermark - refined for better blending */}
			<div className="absolute inset-0 flex items-center justify-center">
				<div
					className="relative w-[min(80vw,800px)] aspect-[2/1] opacity-5"
					style={{
						WebkitMaskImage: `url(${logo})`,
						maskImage: `url(${logo})`,
						WebkitMaskSize: 'contain',
						maskSize: 'contain',
						WebkitMaskRepeat: 'no-repeat',
						WebkitMaskPosition: 'center',
						maskPosition: 'center',
						background: 'linear-gradient(45deg, var(--accent-1), var(--accent-2))',
					}}
				/>
			</div>

			{/* Bottom fade to blend with content */}
			<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg-base to-transparent" />
		</div>
	);
};

export default Background3D;

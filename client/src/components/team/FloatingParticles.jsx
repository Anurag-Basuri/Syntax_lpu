import React, { useEffect, useRef } from 'react';

const FloatingParticles = () => {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Adjust particle count based on screen size
		const isMobile = window.innerWidth < 768;
		const particleCount = isMobile
			? Math.min(window.innerWidth / 30, 30)
			: Math.min(window.innerWidth / 20, 70);

		const particles = [];

		// More modern color palette
		const colors = [
			'rgba(79, 70, 229, alpha)', // indigo-600
			'rgba(99, 102, 241, alpha)', // indigo-500
			'rgba(59, 130, 246, alpha)', // blue-500
			'rgba(37, 99, 235, alpha)', // blue-600
			'rgba(147, 51, 234, alpha)', // purple-600
		];

		for (let i = 0; i < particleCount; i++) {
			const color = colors[Math.floor(Math.random() * colors.length)];
			const opacity = Math.random() * 0.5 + 0.1;
			particles.push({
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				radius: Math.random() * (isMobile ? 1.5 : 2) + 1,
				color: color.replace('alpha', opacity),
				speedX: Math.random() * 0.3 - 0.15,
				speedY: Math.random() * 0.3 - 0.15,
				opacity,
			});
		}

		const connectParticles = () => {
			const connectionDistance = isMobile ? 100 : 150;
			for (let i = 0; i < particles.length; i++) {
				for (let j = i; j < particles.length; j++) {
					const dx = particles[i].x - particles[j].x;
					const dy = particles[i].y - particles[j].y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < connectionDistance) {
						const opacity = 0.15 * (1 - distance / connectionDistance);
						ctx.beginPath();
						// Create gradient lines
						const gradient = ctx.createLinearGradient(
							particles[i].x,
							particles[i].y,
							particles[j].x,
							particles[j].y
						);
						gradient.addColorStop(
							0,
							particles[i].color.replace(particles[i].opacity, opacity)
						);
						gradient.addColorStop(
							1,
							particles[j].color.replace(particles[j].opacity, opacity)
						);

						ctx.strokeStyle = gradient;
						ctx.lineWidth = 0.6;
						ctx.moveTo(particles[i].x, particles[i].y);
						ctx.lineTo(particles[j].x, particles[j].y);
						ctx.stroke();
					}
				}
			}
		};

		let animationId;
		const animate = () => {
			animationId = requestAnimationFrame(animate);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			particles.forEach((p) => {
				p.x += p.speedX;
				p.y += p.speedY;

				if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
				if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

				// Add glow effect
				const glow = 5;
				const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius + glow);
				radGrad.addColorStop(0, p.color);
				radGrad.addColorStop(1, p.color.replace(p.opacity, 0));

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius + glow, 0, Math.PI * 2);
				ctx.fillStyle = radGrad;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
				ctx.fillStyle = p.color;
				ctx.fill();
			});

			connectParticles();
		};

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener('resize', handleResize);
		animate();

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationId);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 z-0 pointer-events-none"
			style={{ background: 'transparent' }}
		/>
	);
};

export default FloatingParticles;

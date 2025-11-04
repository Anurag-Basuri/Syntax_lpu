import React, { useEffect, useMemo, useRef, useState } from 'react';
import logo from '../assets/logo.png';

// Theme hook (unchanged)
const useTheme = () => {
	const [theme, setTheme] = React.useState(
		document.documentElement.getAttribute('data-theme') || 'dark'
	);
	useEffect(() => {
		const observer = new MutationObserver(() => {
			setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme'],
		});
		return () => observer.disconnect();
	}, []);
	return theme;
};

// Breakpoints hook (unchanged)
const useResponsive = () => {
	const [breakpoint, setBreakpoint] = useState('desktop');
	useEffect(() => {
		const update = () => {
			const w = window.innerWidth;
			if (w < 640) setBreakpoint('mobile');
			else if (w < 1024) setBreakpoint('tablet');
			else setBreakpoint('desktop');
		};
		update();
		window.addEventListener('resize', update);
		return () => window.removeEventListener('resize', update);
	}, []);
	return breakpoint;
};

// Helpers
const readCssVar = (name) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';

const toRgb = (input) => {
	// supports #rgb, #rrggbb, rgb(), rgba()
	if (!input) return '0,0,0';
	if (input.startsWith('rgb')) {
		const m = input.match(/rgba?\(([^)]+)\)/i);
		return m
			? m[1]
					.split(',')
					.slice(0, 3)
					.map((v) => parseInt(v.trim(), 10))
					.join(',')
			: '0,0,0';
	}
	let c = input.replace('#', '');
	if (c.length === 3)
		c = c
			.split('')
			.map((x) => x + x)
			.join('');
	const n = parseInt(c, 16);
	const r = (n >> 16) & 255,
		g = (n >> 8) & 255,
		b = n & 255;
	return `${r},${g},${b}`;
};

// Cloth-like wire mesh (SVG + filter displacement)
const ClothWireMesh = ({ breakpoint, theme }) => {
	const a1 = toRgb(readCssVar('--accent-1'));
	const a2 = toRgb(readCssVar('--accent-2'));
	const isLight = theme === 'light';

	// Size/position: below the centered logo, not full-screen
	const meshTop = breakpoint === 'mobile' ? '62%' : breakpoint === 'tablet' ? '60%' : '60%';
	const meshWidth =
		breakpoint === 'mobile'
			? 'min(86vw, 680px)'
			: breakpoint === 'tablet'
			? 'min(72vw, 860px)'
			: 'min(60vw, 1000px)';

	// Grid density (bigger squares on larger screens)
	const step = breakpoint === 'mobile' ? 95 : breakpoint === 'tablet' ? 105 : 120;

	// ViewBox grid dimensions
	const vbW = 1000;
	const vbH = 500;

	const verticals = Array.from({ length: Math.floor(vbW / step) + 1 }, (_, i) => i * step);
	const horizontals = Array.from({ length: Math.floor(vbH / step) + 1 }, (_, i) => i * step);

	const stroke = `rgba(${a1}, ${isLight ? 0.16 : 0.22})`;
	const weaveColor = `rgba(${a2}, ${isLight ? 0.05 : 0.07})`;

	return (
		<div
			aria-hidden="true"
			className="absolute pointer-events-none"
			style={{
				top: meshTop,
				left: '50%',
				transform: 'translate(-50%, -50%)',
				width: meshWidth,
				aspectRatio: '2 / 1', // keep it shallow, not full-screen
				opacity: isLight ? 0.9 : 0.95, // overall subtlety
				filter: `drop-shadow(0 10px 30px rgba(${a1}, ${isLight ? 0.06 : 0.08}))`,
			}}
		>
			<svg
				viewBox={`0 0 ${vbW} ${vbH}`}
				width="100%"
				height="100%"
				preserveAspectRatio="xMidYMid slice"
			>
				<defs>
					{/* Soft cloth-like displacement */}
					<filter id="clothDisplace" x="-20%" y="-30%" width="140%" height="160%">
						<feTurbulence
							type="fractalNoise"
							baseFrequency="0.006"
							numOctaves="2"
							seed="3"
							result="noise"
						>
							<animate
								attributeName="baseFrequency"
								values="0.005;0.008;0.005"
								dur="14s"
								repeatCount="indefinite"
							/>
						</feTurbulence>
						<feDisplacementMap
							in="SourceGraphic"
							in2="noise"
							scale="10"
							xChannelSelector="R"
							yChannelSelector="G"
						>
							<animate
								attributeName="scale"
								values="8;12;8"
								dur="14s"
								repeatCount="indefinite"
							/>
						</feDisplacementMap>
					</filter>

					{/* Subtle weave pattern */}
					<pattern id="weave" width="10" height="10" patternUnits="userSpaceOnUse">
						<rect width="10" height="10" fill="transparent" />
						<line x1="0" y1="0" x2="10" y2="0" stroke={weaveColor} strokeWidth="0.6" />
						<line x1="0" y1="5" x2="10" y2="5" stroke={weaveColor} strokeWidth="0.6" />
						<line x1="0" y1="0" x2="0" y2="10" stroke={weaveColor} strokeWidth="0.6" />
						<line x1="5" y1="0" x2="5" y2="10" stroke={weaveColor} strokeWidth="0.6" />
					</pattern>

					{/* Soft fade at edges */}
					<linearGradient id="fadeY" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0%" stopColor="white" stopOpacity="0" />
						<stop offset="15%" stopColor="white" stopOpacity="1" />
						<stop offset="85%" stopColor="white" stopOpacity="1" />
						<stop offset="100%" stopColor="white" stopOpacity="0" />
					</linearGradient>
					<mask id="softMask">
						<rect width="100%" height="100%" fill="url(#fadeY)" />
					</mask>
				</defs>

				<g filter="url(#clothDisplace)" mask="url(#softMask)">
					{/* Weave underlay (very subtle) */}
					<rect
						width={vbW}
						height={vbH}
						fill="url(#weave)"
						opacity={isLight ? 0.06 : 0.08}
					/>

					{/* Wire grid */}
					<g stroke={stroke} strokeWidth="1.2" fill="none">
						{verticals.map((x) => (
							<line key={`v-${x}`} x1={x} y1="0" x2={x} y2={vbH} />
						))}
						{horizontals.map((y) => (
							<line key={`h-${y}`} x1="0" y1={y} x2={vbW} y2={y} />
						))}
					</g>
				</g>
			</svg>
		</div>
	);
};

const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();
	const containerRef = useRef(null);

	// Pointer-driven spotlight (subtle) + throttled parallax
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		let rafId = 0;
		let last = { x: 50, y: 0 };

		const apply = (x, y) => {
			el.style.setProperty('--spot-x', `${x.toFixed(2)}%`);
			el.style.setProperty('--spot-y', `${Math.max(0, y - 20).toFixed(2)}%`);

			// Lightweight parallax for logo (respects reduced motion)
			const relX = x / 100 - 0.5;
			const relY = y / 100 - 0.5;
			const prefReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			const strength = prefReduce ? 0 : breakpoint === 'mobile' ? 6 : 10;
			el.style.setProperty('--logo-ox', `${(relX * strength).toFixed(2)}px`);
			el.style.setProperty('--logo-oy', `${(relY * strength).toFixed(2)}px`);
		};

		const onMove = (e) => {
			const rect = el.getBoundingClientRect();
			last.x = ((e.clientX - rect.left) / rect.width) * 100;
			last.y = ((e.clientY - rect.top) / rect.height) * 100;
			if (!rafId) {
				rafId = requestAnimationFrame(() => {
					apply(last.x, last.y);
					rafId = 0;
				});
			}
		};

		const onLeave = () => {
			apply(50, 0);
			el.style.setProperty('--logo-ox', '0px');
			el.style.setProperty('--logo-oy', '0px');
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerleave', onLeave, { passive: true });

		// initial
		apply(50, 0);

		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerleave', onLeave);
			if (rafId) cancelAnimationFrame(rafId);
		};
	}, [breakpoint]);

	// Theme-aware styles (very subtle)
	const styles = useMemo(() => {
		const accent1 = readCssVar('--accent-1');
		const accent2 = readCssVar('--accent-2');
		const bgBase = readCssVar('--bg-base');
		const bgSoft = readCssVar('--bg-soft');

		const a1 = toRgb(accent1);
		const a2 = toRgb(accent2);

		const isLight = theme === 'light';

		// Responsive, center-aligned logo sizing (slightly larger, safely capped)
		const logoWidth =
			breakpoint === 'mobile'
				? 'min(70vw, 30vh, 420px)'
				: breakpoint === 'tablet'
				? 'min(44vw, 34vh, 560px)'
				: 'min(32vw, 36vh, 640px)';

		return {
			// Base radial wash
			baseGradient: `radial-gradient(ellipse 120% 70% at 50% -15%, ${bgSoft} 0%, ${bgBase} 60%)`,
			// Next.js-like spotlight from the top, reacts to pointer via CSS vars
			spotlight: `radial-gradient(800px 520px at var(--spot-x, 50%) var(--spot-y, 0%), rgba(${a1}, ${
				isLight ? 0.05 : 0.08
			}), transparent 65%)`,
			// Secondary aura for depth
			aura: `radial-gradient(1100px 800px at 105% -10%, rgba(${a2}, ${
				isLight ? 0.03 : 0.045
			}), transparent 70%)`,
			// Grid config
			gridColor: isLight ? 'rgba(15, 23, 42, 0.012)' : 'rgba(203, 213, 225, 0.012)',
			gridSize: breakpoint === 'mobile' ? '32px 32px' : '36px 36px',
			gridMask: 'radial-gradient(ellipse 80% 65% at 50% -10%, black 25%, transparent 85%)',
			gridOpacity: isLight ? 0.2 : 0.24,
			// Vignette to de-emphasize edges
			vignette:
				'radial-gradient(ellipse 120% 85% at 50% 50%, transparent 55%, rgba(0,0,0,0.08) 100%)',
			// Ultra subtle film grain
			noiseOpacity: isLight ? 0.005 : 0.007,

			// Logo presentation (centered, subtle, responsive)
			logoOpacity: isLight ? 0.16 : 0.22,
			logoTop: '50%',
			logoWidth,
			logoShadow: `drop-shadow(0 6px 28px rgba(${a1}, ${isLight ? 0.08 : 0.1}))`,
		};
	}, [theme, breakpoint]);

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 -z-10 overflow-hidden"
			aria-hidden="true"
			style={{ background: styles.baseGradient }}
		>
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.spotlight, opacity: 0.5 }}
			/>
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.aura, opacity: 0.35 }}
			/>

			{/* NEW: Wavy cloth wire mesh under the logo */}
			<ClothWireMesh breakpoint={breakpoint} theme={theme} />

			{/* Centered logo */}
			<img
				src={logo}
				alt=""
				aria-hidden="true"
				decoding="async"
				loading="lazy"
				draggable="false"
				className="absolute select-none pointer-events-none"
				style={{
					top: styles.logoTop,
					left: '50%',
					width: styles.logoWidth,
					height: 'auto',
					opacity: styles.logoOpacity,
					transform:
						'translate(-50%, -50%) translate(var(--logo-ox, 0px), var(--logo-oy, 0px))',
					filter: styles.logoShadow,
					transition: 'transform 220ms ease-out, opacity 220ms ease',
					willChange: 'transform',
				}}
			/>

			<div
				className="absolute inset-0 pointer-events-none animate-grid-flow"
				style={{
					backgroundImage: `
                        linear-gradient(to right, ${styles.gridColor} 1px, transparent 1px),
                        linear-gradient(to bottom, ${styles.gridColor} 1px, transparent 1px)
                    `,
					backgroundSize: styles.gridSize,
					maskImage: styles.gridMask,
					WebkitMaskImage: styles.gridMask,
					opacity: styles.gridOpacity,
				}}
			/>

			<div
				className="absolute inset-0 pointer-events-none"
				style={{ background: styles.vignette, opacity: 0.9 }}
			/>
			<div
				className="absolute inset-0 pointer-events-none mix-blend-overlay"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
					opacity: styles.noiseOpacity,
				}}
			/>
			<div
				className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
				style={{
					background: `linear-gradient(to top, var(--bg-base) 35%, transparent 100%)`,
				}}
			/>
		</div>
	);
};

export default Background3D;

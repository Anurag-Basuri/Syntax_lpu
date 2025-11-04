import React, { useRef, Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../assets/logo.png';

// Helper to get CSS variable and convert to THREE.Color
const getThemeColor = (varName) => {
	const colorStr = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	return new THREE.Color(colorStr || '#000');
};

// Hook to detect current theme
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

// Responsive breakpoints hook
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

/* =========================
   Logo (clean, no background)
   ========================= */
const Logo3D = () => {
	const meshRef = useRef();
	const groupRef = useRef();
	const texture = useTexture(logo);
	const { gl } = useThree();
	const breakpoint = useResponsive();

	useEffect(() => {
		if (!texture) return;
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = gl.capabilities.getMaxAnisotropy?.() || 8;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		texture.generateMipmaps = true;
		texture.needsUpdate = true;
	}, [texture, gl]);

	const aspect = texture?.image ? texture.image.width / texture.image.height : 1;

	const { scale, yPosition, opacity } = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { scale: 3.5, yPosition: 0.5, opacity: 0.85 };
			case 'tablet':
				return { scale: 5.0, yPosition: 0.85, opacity: 0.88 };
			default:
				return { scale: 6.5, yPosition: 1.2, opacity: 0.9 };
		}
	}, [breakpoint]);

	useFrame((state) => {
		const t = state.clock.elapsedTime;
		const dt = state.clock.getDelta();
		const p = state.pointer ?? { x: 0, y: 0 };

		if (meshRef.current) {
			const targetY = (p.x * Math.PI) / 20;
			const targetX = (-p.y * Math.PI) / 24;
			meshRef.current.rotation.y = THREE.MathUtils.damp(
				meshRef.current.rotation.y,
				targetY,
				5,
				dt
			);
			meshRef.current.rotation.x = THREE.MathUtils.damp(
				meshRef.current.rotation.x,
				targetX,
				5,
				dt
			);
			meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.008;
		}
		if (groupRef.current) {
			groupRef.current.position.y = yPosition + Math.sin(t * 0.5) * 0.04;
			const s = 1 + Math.sin(t * 0.35) * 0.008;
			groupRef.current.scale.set(s, s, 1);
		}
	});

	return (
		<Float
			speed={1.0}
			rotationIntensity={0.05}
			floatIntensity={0.08}
			floatingRange={[-0.015, 0.015]}
		>
			<group ref={groupRef} position={[0, yPosition, 0]}>
				<mesh ref={meshRef} scale={[scale * aspect, scale, 1]} renderOrder={10}>
					<planeGeometry />
					<meshBasicMaterial
						map={texture}
						transparent
						alphaTest={0.1}
						opacity={opacity}
						side={THREE.DoubleSide}
						depthWrite={false}
					/>
				</mesh>
			</group>
		</Float>
	);
};

/* =========================
   Scene
   ========================= */
const SceneContent = () => {
	return <Logo3D />;
};

const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();

	const styles = useMemo(() => {
		const accent1 = getComputedStyle(document.documentElement)
			.getPropertyValue('--accent-1')
			.trim();
		const bgBase = getComputedStyle(document.documentElement)
			.getPropertyValue('--bg-base')
			.trim();
		const bgSoft = getComputedStyle(document.documentElement)
			.getPropertyValue('--bg-soft')
			.trim();

		const c1 = new THREE.Color(accent1)
			.toArray()
			.map((c) => Math.round(c * 255))
			.join(',');

		// Refined Next.js-inspired theme
		if (theme === 'light') {
			return {
				baseGradient: `radial-gradient(ellipse 100% 60% at 50% -20%, ${bgSoft}, ${bgBase})`,
				spotlight: `radial-gradient(circle 900px at 50% -10%, rgba(${c1}, 0.12), transparent 65%)`,
				gridColor: 'rgba(15, 23, 42, 0.035)',
				gridSize: '36px 36px',
				gridMask:
					'radial-gradient(ellipse 80% 70% at 50% -10%, black 15%, transparent 80%)',
			};
		}
		return {
			baseGradient: `radial-gradient(ellipse 100% 60% at 50% -20%, ${bgSoft}, ${bgBase})`,
			spotlight: `radial-gradient(circle 900px at 50% -10%, rgba(${c1}, 0.2), transparent 65%)`,
			gridColor: 'rgba(203, 213, 225, 0.025)',
			gridSize: '36px 36px',
			gridMask: 'radial-gradient(ellipse 80% 70% at 50% -10%, black 15%, transparent 80%)',
		};
	}, [theme]);

	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 2, 15], fov: 65 };
			case 'tablet':
				return { position: [0, 2.5, 14], fov: 58 };
			default:
				return { position: [0, 3, 13], fov: 52 };
		}
	}, [breakpoint]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Base gradient */}
			<div
				className="absolute inset-0 transition-all duration-700 ease-out"
				style={{ background: styles.baseGradient }}
			/>

			{/* Top spotlight */}
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.spotlight }}
			/>

			{/* Animated grid with mask */}
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
					opacity: theme === 'light' ? 0.8 : 1,
				}}
			/>

			{/* Subtle noise texture */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
				}}
			/>

			<Suspense fallback={null}>
				<Canvas
					camera={{
						position: cameraConfig.position,
						fov: cameraConfig.fov,
						near: 0.1,
						far: 100,
					}}
					style={{ pointerEvents: 'none' }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						toneMapping: THREE.ACESFilmicToneMapping,
						toneMappingExposure: theme === 'light' ? 1.0 : 1.15,
					}}
					dpr={[1, 2]}
				>
					<SceneContent />
				</Canvas>
			</Suspense>

			{/* Bottom fade */}
			<div
				className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
				style={{
					background: `linear-gradient(to top, var(--bg-base) 10%, transparent 100%)`,
				}}
			/>
		</div>
	);
};

export default Background3D;

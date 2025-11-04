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
   Logo (no background, simple)
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
				return { scale: 3.2, yPosition: 0.4, opacity: 0.78 }; // increased
			case 'tablet':
				return { scale: 4.6, yPosition: 0.75, opacity: 0.82 }; // increased
			default:
				return { scale: 6.2, yPosition: 1.0, opacity: 0.86 }; // increased
		}
	}, [breakpoint]);

	useFrame((state) => {
		const t = state.clock.elapsedTime;
		const dt = state.clock.getDelta();
		const p = state.pointer ?? { x: 0, y: 0 };

		if (meshRef.current) {
			const targetY = (p.x * Math.PI) / 18;
			const targetX = (-p.y * Math.PI) / 22;
			meshRef.current.rotation.y = THREE.MathUtils.damp(
				meshRef.current.rotation.y,
				targetY,
				4,
				dt
			);
			meshRef.current.rotation.x = THREE.MathUtils.damp(
				meshRef.current.rotation.x,
				targetX,
				4,
				dt
			);
			meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.01;
		}
		if (groupRef.current) {
			groupRef.current.position.y = yPosition + Math.sin(t * 0.4) * 0.05;
			const s = 1 + Math.sin(t * 0.3) * 0.01;
			groupRef.current.scale.set(s, s, 1);
		}
	});

	return (
		<Float
			speed={0.9}
			rotationIntensity={0.06}
			floatIntensity={0.1}
			floatingRange={[-0.02, 0.02]}
		>
			<group ref={groupRef} position={[0, yPosition, 0]}>
				<mesh ref={meshRef} scale={[scale * aspect, scale, 1]} renderOrder={10}>
					<planeGeometry />
					{/* Transparent PNG: no background. alphaTest removes halo edges. */}
					<meshBasicMaterial
						map={texture}
						transparent
						alphaTest={0.08}
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
   Cloth mesh (bigger squares, wavy, clean)
   ========================= */
const ClothMesh = ({ segments }) => {
	const meshRef = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	const uniforms = useMemo(() => {
		const base = getThemeColor('--bg-soft');
		const warp = getThemeColor('--accent-1'); // thread 1
		const weft = getThemeColor('--accent-2'); // thread 2
		return {
			uTime: { value: 0 },
			uAmp: { value: breakpoint === 'mobile' ? 0.45 : 0.55 }, // gentle height
			uFreq: { value: 0.012 }, // larger waves
			uSpeed: { value: 0.07 },
			uWeaveDensity: { value: breakpoint === 'mobile' ? 38.0 : 46.0 }, // bigger squares (lower = bigger)
			uBase: { value: base },
			uWarp: { value: warp },
			uWeft: { value: weft },
			uAlpha: { value: theme === 'light' ? 0.38 : 0.5 },
		};
	}, [theme, breakpoint]);

	useFrame((state) => {
		const t = state.clock.elapsedTime;
		uniforms.uTime.value = t;
		// subtle responsiveness
		const k = Math.min(0.6, (Math.abs(state.pointer.x) + Math.abs(state.pointer.y)) * 0.2);
		const base = breakpoint === 'mobile' ? 0.45 : 0.55;
		uniforms.uAmp.value = THREE.MathUtils.lerp(uniforms.uAmp.value, base + k, 0.08);
	});

	const size = useMemo(
		() => (breakpoint === 'mobile' ? 280 : breakpoint === 'tablet' ? 340 : 420),
		[breakpoint]
	);

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -9, 0]}>
			<planeGeometry args={[size, size, segments, segments]} />
			<shaderMaterial
				transparent
				depthWrite={false}
				side={THREE.DoubleSide}
				uniforms={uniforms}
				vertexShader={`
                    uniform float uTime;
                    uniform float uAmp;
                    uniform float uFreq;
                    uniform float uSpeed;
                    varying float vH;

                    void main() {
                        vec3 p = position;

                        // Multi-axial low-frequency waves (cloth drape)
                        float w1 = sin(p.x * uFreq + uTime * uSpeed);
                        float w2 = sin(p.y * uFreq * 0.85 + uTime * uSpeed * 0.75);
                        float w3 = cos((p.x + p.y) * uFreq * 0.6 + uTime * uSpeed * 0.5);

                        vH = (w1 * 0.5 + w2 * 0.35 + w3 * 0.25);
                        p.z += vH * uAmp;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                    }
                `}
				fragmentShader={`
                    uniform float uTime;
                    uniform float uWeaveDensity;
                    uniform vec3 uBase;
                    uniform vec3 uWarp;
                    uniform vec3 uWeft;
                    uniform float uAlpha;
                    varying float vH;

                    // simple weave pattern: two oriented sine gates
                    float weaveLine(float v) {
                        // thin thread lines (anti-aliased)
                        float s = sin(v);
                        float a = smoothstep(0.96, 1.0, s); // peak selection
                        return a;
                    }

                    void main() {
                        // Use NDC-alike tiling via gl_FragCoord to keep grid uniform
                        // but keep it cheap by relying on density only.
                        vec2 uv = gl_FragCoord.xy / 1000.0 * uWeaveDensity;

                        // Warp along X, Weft along Y
                        float warpLines = weaveLine(uv.x);
                        float weftLines = weaveLine(uv.y);

                        // Mix warp/weft threads
                        vec3 threadColor = mix(uWarp, uWeft, 0.5 + 0.5 * sin(uTime * 0.15));
                        vec3 threads = mix(uBase, threadColor, clamp(warpLines + weftLines, 0.0, 1.0) * 0.45);

                        // Subtle shading from wave height
                        float shade = 0.5 + vH * 0.25;
                        vec3 color = mix(uBase, threads, 0.6) * shade;

                        // Gentle fade near top to avoid overlaps with content
                        float fade = 1.0;
                        // optional vertical fade can be applied if needed on UV
                        gl_FragColor = vec4(color, uAlpha * fade);
                    }
                `}
			/>
		</mesh>
	);
};

/* =========================
   Scene
   ========================= */
const SceneContent = () => {
	const breakpoint = useResponsive();
	// segments tuned for smooth cloth while staying light
	const segments = useMemo(
		() => (breakpoint === 'mobile' ? 64 : breakpoint === 'tablet' ? 84 : 104),
		[breakpoint]
	);

	return (
		<>
			<Logo3D />
			<ClothMesh segments={segments} />
		</>
	);
};

const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();

	const styles = useMemo(() => {
		const accent1 = getComputedStyle(document.documentElement)
			.getPropertyValue('--accent-1')
			.trim();
		const accent2 = getComputedStyle(document.documentElement)
			.getPropertyValue('--accent-2')
			.trim();
		const bgBase = getComputedStyle(document.documentElement)
			.getPropertyValue('--bg-base')
			.trim();
		const bgSoft = getComputedStyle(document.documentElement)
			.getPropertyValue('--bg-soft')
			.trim();
		const bgSofter = getComputedStyle(document.documentElement)
			.getPropertyValue('--bg-softer')
			.trim();

		const c1 = new THREE.Color(accent1)
			.toArray()
			.map((c) => Math.round(c * 255))
			.join(',');
		const c2 = new THREE.Color(accent2)
			.toArray()
			.map((c) => Math.round(c * 255))
			.join(',');

		// Next.js-like: subtle gradient + top spotlight + faint grid
		if (theme === 'light') {
			return {
				baseGradient: `linear-gradient(180deg, ${bgBase} 0%, ${bgSoft} 55%, ${bgSofter} 100%)`,
				spotlight: `radial-gradient(600px 420px at 50% -10%, rgba(${c1},.35), transparent 60%)`,
				aura: `radial-gradient(900px 700px at 110% 0%, rgba(${c2},.12), transparent 70%)`,
				gridColor: 'rgba(15, 23, 42, 0.06)', // Slate-900 @ 6%
				gridSize: '28px 28px',
				gridMask: 'radial-gradient(ellipse 60% 55% at 50% 0%, black 35%, transparent 90%)',
				bottomFade: `linear-gradient(to top, ${bgBase} 0%, transparent 45%)`,
				topFade: `linear-gradient(to bottom, ${bgBase} 0%, transparent 25%)`,
			};
		}
		return {
			baseGradient: `linear-gradient(180deg, ${bgBase} 0%, ${bgSoft} 55%, ${bgSofter} 100%)`,
			spotlight: `radial-gradient(600px 420px at 50% -10%, rgba(${c1},.45), transparent 60%)`,
			aura: `radial-gradient(900px 700px at 110% 0%, rgba(${c2},.18), transparent 70%)`,
			gridColor: 'rgba(241, 245, 249, 0.06)', // Slate-100 @ 6%
			gridSize: '28px 28px',
			gridMask: 'radial-gradient(ellipse 60% 55% at 50% 0%, black 35%, transparent 90%)',
			bottomFade: `linear-gradient(to top, ${bgBase} 0%, transparent 45%)`,
			topFade: `linear-gradient(to bottom, ${bgBase} 0%, transparent 25%)`,
		};
	}, [theme]);

	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 2, 16], fov: 62 };
			case 'tablet':
				return { position: [0, 2.4, 14.5], fov: 56 };
			default:
				return { position: [0, 3, 13.5], fov: 52 };
		}
	}, [breakpoint]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Base gradient */}
			<div
				className="absolute inset-0 transition-all duration-700 ease-in-out"
				style={{ background: styles.baseGradient }}
			/>
			{/* Next.js-style spotlight and aura */}
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.spotlight }}
			/>
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.aura }}
			/>
			{/* Subtle grid overlay with radial mask */}
			<div
				className="absolute inset-0 pointer-events-none transition-opacity duration-700"
				style={{
					backgroundImage: `linear-gradient(to right, ${styles.gridColor} 1px, transparent 1px),
                                      linear-gradient(to bottom, ${styles.gridColor} 1px, transparent 1px)`,
					backgroundSize: styles.gridSize,
					maskImage: styles.gridMask,
					WebkitMaskImage: styles.gridMask,
					opacity: theme === 'light' ? 0.55 : 0.5,
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
						toneMappingExposure: theme === 'light' ? 1.02 : 1.18,
					}}
					dpr={[1, 2]}
				>
					<SceneContent />
				</Canvas>
			</Suspense>
		</div>
	);
};

export default Background3D;

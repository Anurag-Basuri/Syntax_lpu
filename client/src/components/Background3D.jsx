import React, { Suspense, useMemo, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../assets/logo.png';

useTexture.preload?.(logo);

// --- Hooks & Helpers ---
const useTheme = () => {
	const [theme, setTheme] = React.useState(
		typeof document !== 'undefined'
			? document.documentElement.getAttribute('data-theme') || 'dark'
			: 'dark'
	);
	useEffect(() => {
		if (typeof document === 'undefined') return;
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

const readCssVar = (name) =>
	typeof document !== 'undefined'
		? getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000'
		: '#000';

const isWebGLAvailable = () => {
	if (typeof document === 'undefined') return false;
	try {
		const canvas = document.createElement('canvas');
		return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
	} catch {
		return false;
	}
};

// --- R3F Scene Components ---

// Professional Next.js-style cloth grid positioned below logo
const Grid = ({ theme, breakpoint }) => {
	const meshRef = useRef();
	const materialRef = useRef();

	const prefersReduced = useMemo(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}, []);

	const uniforms = useMemo(() => {
		const isLight = theme === 'light';
		// Next.js inspired subtle colors
		const minorHex = isLight ? '#e5e7eb' : '#374151';
		const majorHex = isLight ? '#d1d5db' : '#4b5563';

		// Responsive grid sizing
		const gridSize = breakpoint === 'mobile' ? 24.0 : breakpoint === 'tablet' ? 26.0 : 28.0;

		return {
			uTime: { value: 0 },
			uMinorColor: { value: new THREE.Color(minorHex) },
			uMajorColor: { value: new THREE.Color(majorHex) },
			uMinorSize: { value: gridSize },
			uMajorEvery: { value: 5.0 },
			uMinorWidth: { value: 0.015 },
			uMajorWidth: { value: 0.028 },
			uFadeNear: { value: 0.15 },
			uFadeFar: { value: 0.85 },
			uMinorAlpha: { value: isLight ? 0.25 : 0.35 },
			uMajorAlpha: { value: isLight ? 0.45 : 0.55 },
			uSpeed: { value: prefersReduced ? 0.0 : 0.012 },
			// Enhanced cloth texture
			uClothFreq: { value: 1.2 },
			uClothAmp: { value: 0.08 },
			// Smooth wave motion
			uWaveAmp: { value: breakpoint === 'mobile' ? 0.25 : 0.4 },
			uWaveFreq: { value: 0.18 },
			uWaveSpeed: { value: prefersReduced ? 0.0 : 0.4 },
		};
	}, [theme, prefersReduced, breakpoint]);

	useFrame((state) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
		}
	});

	return (
		<mesh ref={meshRef} position={[0, -2, -14]} renderOrder={-2}>
			<planeGeometry args={[100, 100, 256, 256]} />
			<shaderMaterial
				ref={materialRef}
				transparent
				depthWrite={false}
				uniforms={uniforms}
				vertexShader={`
          uniform float uTime;
          uniform float uSpeed;
          uniform float uClothFreq;
          uniform float uClothAmp;
          uniform float uWaveAmp;
          uniform float uWaveFreq;
          uniform float uWaveSpeed;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vUv = uv;
            
            // Cloth-like texture displacement
            vec3 pos = position;
            float cloth = sin(pos.x * uClothFreq + uTime * uSpeed) * 
                         cos(pos.y * uClothFreq + uTime * uSpeed) * uClothAmp;
            
            // Wavy motion
            float wave = sin(pos.x * uWaveFreq + uTime * uWaveSpeed) * 
                        cos(pos.y * uWaveFreq * 0.8 + uTime * uWaveSpeed * 1.2) * uWaveAmp;
            
            pos.z += cloth + wave;
            vPosition = pos;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
				fragmentShader={`
          uniform vec3 uMinorColor;
          uniform vec3 uMajorColor;
          uniform float uMinorSize;
          uniform float uMajorEvery;
          uniform float uMinorWidth;
          uniform float uMajorWidth;
          uniform float uFadeNear;
          uniform float uFadeFar;
          uniform float uMinorAlpha;
          uniform float uMajorAlpha;
          
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            vec2 coord = vPosition.xy;
            
            // Calculate grid lines
            vec2 grid = abs(fract(coord / uMinorSize - 0.5) - 0.5) * 2.0;
            float minor = min(grid.x, grid.y) / uMinorWidth;
            minor = 1.0 - min(minor, 1.0);
            
            vec2 majorCoord = coord / (uMinorSize * uMajorEvery);
            vec2 majorGrid = abs(fract(majorCoord - 0.5) - 0.5) * 2.0;
            float major = min(majorGrid.x, majorGrid.y) / uMajorWidth;
            major = 1.0 - min(major, 1.0);
            
            // Center fade
            float distFromCenter = length(vUv - 0.5);
            float fade = 1.0 - smoothstep(uFadeNear, uFadeFar, distFromCenter);
            
            // Combine colors
            vec3 color = mix(uMinorColor, uMajorColor, major);
            float alpha = (minor * uMinorAlpha + major * uMajorAlpha) * fade;
            
            gl_FragColor = vec4(color, alpha);
          }
        `}
			/>
		</mesh>
	);
};

// Radial glow shaders
const RadialGlow = ({
	position = [0, 0, -30],
	size = [120, 120],
	color = '#fff',
	opacity = 0.1,
}) => {
	const uniforms = useMemo(
		() => ({
			uColor: { value: new THREE.Color(color) },
			uOpacity: { value: opacity },
		}),
		[color, opacity]
	);

	return (
		<mesh position={position} renderOrder={-3}>
			<planeGeometry args={size} />
			<shaderMaterial
				transparent
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				uniforms={uniforms}
				vertexShader={`
          varying vec2 vUv;
          void main(){
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
				fragmentShader={`
          uniform vec3 uColor;
          uniform float uOpacity;
          varying vec2 vUv;
          void main(){
            vec2 p = vUv - 0.5;
            float d = length(p) * 2.0;
            float a = smoothstep(1.0, 0.0, d);
            gl_FragColor = vec4(uColor, a * uOpacity);
          }
        `}
			/>
		</mesh>
	);
};

const Glows = ({ theme }) => {
	const accent1 = useMemo(() => readCssVar('--accent-1'), [theme]);
	const accent2 = useMemo(() => readCssVar('--accent-2'), [theme]);
	const isLight = theme === 'light';
	return (
		<>
			<RadialGlow
				position={[0, 5, -28]}
				size={[140, 140]}
				color={accent1}
				opacity={isLight ? 0.14 : 0.16}
			/>
			<RadialGlow
				position={[42, 12, -36]}
				size={[180, 180]}
				color={accent2}
				opacity={isLight ? 0.08 : 0.1}
			/>
		</>
	);
};

// Centered, responsive logo with halo + sheen
const EnhancedLogo = ({ breakpoint }) => {
	const base = useRef();
	const anim = useRef();
	const texture = useTexture(logo);
	const theme = useTheme();
	const isLight = theme === 'light';

	useEffect(() => {
		if (!texture) return;
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = 8;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = true;
		texture.needsUpdate = true;
	}, [texture]);

	const [aspect, setAspect] = useState(1);
	useEffect(() => {
		if (texture?.image?.width && texture?.image?.height) {
			setAspect(texture.image.width / texture.image.height);
		}
	}, [texture]);

	const { camera } = useThree();
	const targetZ = -15;
	const frac = breakpoint === 'mobile' ? 0.36 : breakpoint === 'tablet' ? 0.32 : 0.28;
	const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
	const scaleXY = useMemo(() => {
		const dist = Math.abs(targetZ - (camera?.position?.z ?? 5));
		const worldH = 2 * Math.tan(THREE.MathUtils.degToRad((camera?.fov ?? 60) / 2)) * dist;
		const h = clamp(worldH * frac, 8, 24);
		return [h * aspect, h];
	}, [camera?.fov, camera?.position?.z, aspect, frac]);

	useEffect(() => {
		if (base.current) base.current.scale.set(scaleXY[0], scaleXY[1], 1);
	}, [scaleXY]);

	const prefersReduced =
		typeof window !== 'undefined' && window.matchMedia
			? window.matchMedia('(prefers-reduced-motion: reduce)').matches
			: false;

	useFrame((state) => {
		if (!anim.current) return;
		const { pointer, clock } = state;
		const t = clock.elapsedTime;

		const px = prefersReduced ? 0 : (breakpoint === 'mobile' ? 0.18 : 0.3) * pointer.x;
		const py = prefersReduced ? 0 : (breakpoint === 'mobile' ? 0.18 : 0.3) * pointer.y;

		anim.current.position.x = THREE.MathUtils.damp(anim.current.position.x, px, 4, 0.12);
		anim.current.position.y = THREE.MathUtils.damp(anim.current.position.y, py, 4, 0.12);

		const tiltX = prefersReduced ? 0 : THREE.MathUtils.degToRad(py * 2.2);
		const tiltY = prefersReduced ? 0 : THREE.MathUtils.degToRad(px * -2.8);
		anim.current.rotation.x = THREE.MathUtils.damp(anim.current.rotation.x, tiltX, 4, 0.12);
		anim.current.rotation.y = THREE.MathUtils.damp(anim.current.rotation.y, tiltY, 4, 0.12);

		const s = 1 + (prefersReduced ? 0 : Math.sin(t * 0.35) * 0.008);
		anim.current.scale.set(s, s, 1);
	});

	const haloColor = readCssVar('--accent-1');

	const uniforms = useMemo(
		() => ({
			uMap: { value: texture ?? null },
			uTime: { value: 0 },
			uOpacity: { value: isLight ? 0.12 : 0.14 },
			uSheen: { value: prefersReduced ? 0.0 : 0.12 },
		}),
		[texture, isLight, prefersReduced]
	);

	useFrame((state) => {
		if (uniforms.uTime) {
			uniforms.uTime.value = state.clock.elapsedTime;
		}
	});

	return (
		<group ref={base} position={[0, 0, 0]} renderOrder={-1}>
			<group ref={anim}>
				<mesh position={[0, 0, targetZ - 0.8]}>
					<planeGeometry args={[1.25, 1.25]} />
					<shaderMaterial
						transparent
						blending={THREE.AdditiveBlending}
						depthWrite={false}
						uniforms={{
							uColor: { value: new THREE.Color(haloColor) },
							uOpacity: { value: isLight ? 0.1 : 0.12 },
						}}
						vertexShader={`
              varying vec2 vUv;
              void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
						fragmentShader={`
              uniform vec3 uColor;
              uniform float uOpacity;
              varying vec2 vUv;
              void main(){
                vec2 p = vUv - 0.5;
                float r = length(p) * 2.0;
                float a = smoothstep(1.0, 0.0, r);
                gl_FragColor = vec4(uColor, a * uOpacity);
              }
            `}
					/>
				</mesh>

				<mesh position={[0, 0, targetZ]}>
					<planeGeometry args={[1, 1]} />
					<shaderMaterial
						transparent
						depthWrite={false}
						uniforms={uniforms}
						vertexShader={`
              varying vec2 vUv;
              void main(){
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
						fragmentShader={`
              precision mediump float;
              uniform sampler2D uMap;
              uniform float uTime;
              uniform float uOpacity;
              uniform float uSheen;
              varying vec2 vUv;

              float band(float x, float c, float w){
                return smoothstep(c - w, c, x) * (1.0 - smoothstep(c, c + w, x));
              }

              void main(){
                vec4 tex = texture2D(uMap, vUv);
                if (tex.a < 0.01) discard;

                vec2 p = vUv - 0.5;
                float r = length(p) * 2.0;
                float edge = smoothstep(1.05, 0.7, r);

                float sweepCenter = fract(uTime * 0.045);
                float diag = (vUv.x + vUv.y) * 0.5;
                float sweep = band(diag, sweepCenter, 0.05);
                vec3 color = tex.rgb + uSheen * sweep;

                gl_FragColor = vec4(color, tex.a * edge * uOpacity);
              }
            `}
					/>
				</mesh>
			</group>
		</group>
	);
};

// Main component orchestrator with fallback + ready fade
const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();

	const [webglOk, setWebglOk] = useState(true);
	const [ctxLost, setCtxLost] = useState(false);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setWebglOk(isWebGLAvailable());
		const t = setTimeout(() => setReady(true), 700);
		return () => clearTimeout(t);
	}, []);

	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 0, 5], fov: 75 };
			default:
				return { position: [0, 0, 5], fov: 60 };
		}
	}, [breakpoint]);

	const baseGradient =
		'radial-gradient(ellipse 120% 70% at 50% -15%, var(--bg-soft) 0%, var(--bg-base) 60%)';

	const showFallback = !webglOk || ctxLost;
	const cssPreviewOpacity = showFallback ? 0.9 : ready ? 0.25 : 0.6;

	return (
		<div
			className="fixed inset-0 -z-10 overflow-hidden"
			aria-hidden="true"
			style={{ background: baseGradient }}
		>
			{/* Instant CSS preview */}
			<div
				className="absolute inset-0 pointer-events-none transition-opacity duration-500 ease-out"
				style={{ opacity: cssPreviewOpacity }}
			>
				<div
					className="absolute inset-0"
					style={{
						background:
							'radial-gradient(900px 600px at 50% 0%, color-mix(in srgb, var(--accent-1) 10%, transparent), transparent 65%)',
					}}
				/>
				<div
					className="absolute inset-0 pointer-events-none animate-grid-flow"
					style={{
						backgroundImage: `
              linear-gradient(to right, ${
					theme === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(241, 245, 249, 0.06)'
				} 1px, transparent 1px),
              linear-gradient(to bottom, ${
					theme === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(241, 245, 249, 0.06)'
				} 1px, transparent 1px)
            `,
						backgroundSize: '36px 36px',
						maskImage:
							'radial-gradient(ellipse 80% 65% at 50% -10%, black 25%, transparent 85%)',
						WebkitMaskImage:
							'radial-gradient(ellipse 80% 65% at 50% -10%, black 25%, transparent 85%)',
					}}
				/>
			</div>

			{/* WebGL scene */}
			{!showFallback && (
				<Canvas
					camera={cameraConfig}
					style={{ position: 'absolute', inset: 0 }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						precision: 'highp',
					}}
					dpr={
						typeof window !== 'undefined'
							? Math.min(1.5, window.devicePixelRatio || 1)
							: 1
					}
					eventSource={typeof window !== 'undefined' ? document.body : undefined}
					eventPrefix="client"
					onCreated={({ gl }) => {
						gl.setClearColor(0x000000, 0);
						gl.outputColorSpace = THREE.SRGBColorSpace;
						requestAnimationFrame(() => setReady(true));
						const el = gl.domElement;
						const onLost = (e) => {
							e.preventDefault();
							setCtxLost(true);
						};
						const onRestored = () => setCtxLost(false);
						el.addEventListener('webglcontextlost', onLost, { passive: false });
						el.addEventListener('webglcontextrestored', onRestored, { passive: true });
						return () => {
							el.removeEventListener('webglcontextlost', onLost);
							el.removeEventListener('webglcontextrestored', onRestored);
						};
					}}
				>
					<color attach="background" args={[0x000000]} />
					<Glows theme={theme} />
					<Grid theme={theme} breakpoint={breakpoint} />
					<Suspense fallback={null}>
						<EnhancedLogo breakpoint={breakpoint} />
					</Suspense>
				</Canvas>
			)}

			{/* Bottom fade + noise */}
			<div
				className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
				style={{
					background: 'linear-gradient(to top, var(--bg-base) 35%, transparent 100%)',
				}}
			/>
			<div
				className="absolute inset-0 pointer-events-none mix-blend-overlay"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
					opacity: theme === 'light' ? 0.005 : 0.007,
				}}
			/>
		</div>
	);
};

export default Background3D;

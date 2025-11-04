import React, { useRef, Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture, PerformanceMonitor } from '@react-three/drei';
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
		const updateBreakpoint = () => {
			const width = window.innerWidth;
			if (width < 640) setBreakpoint('mobile');
			else if (width < 1024) setBreakpoint('tablet');
			else setBreakpoint('desktop');
		};

		updateBreakpoint();
		window.addEventListener('resize', updateBreakpoint);
		return () => window.removeEventListener('resize', updateBreakpoint);
	}, []);

	return breakpoint;
};

// Enhanced 3D Logo with better visibility and animations
const Logo3D = () => {
	const meshRef = useRef();
	const groupRef = useRef();
	const texture = useTexture(logo);
	const { gl } = useThree();
	const breakpoint = useResponsive();

	useEffect(() => {
		if (!texture) return;
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = gl.capabilities.getMaxAnisotropy?.() || 16;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.generateMipmaps = true;
		texture.needsUpdate = true;
	}, [texture, gl]);

	const aspect = texture?.image ? texture.image.width / texture.image.height : 1;

	const { scale, yPosition } = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { scale: 3.2, yPosition: 0.4 };
			case 'tablet':
				return { scale: 4.5, yPosition: 0.7 };
			default:
				return { scale: 6.0, yPosition: 1.0 };
		}
	}, [breakpoint]);

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const t = state.clock.elapsedTime;
		const dt = state.clock.getDelta();

		if (meshRef.current) {
			// Smooth parallax effect
			const targetY = (pointer.x * Math.PI) / 12;
			const targetX = (-pointer.y * Math.PI) / 16;
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

			// Gentle continuous rotation
			meshRef.current.rotation.z = Math.sin(t * 0.2) * 0.015;
		}

		if (groupRef.current) {
			// Smooth floating
			groupRef.current.position.y = yPosition + Math.sin(t * 0.4) * 0.06;

			// Subtle breathing
			const breathe = 1 + Math.sin(t * 0.3) * 0.01;
			groupRef.current.scale.set(breathe, breathe, 1);
		}
	});

	return (
		<Float
			speed={1.0}
			rotationIntensity={0.08}
			floatIntensity={0.12}
			floatingRange={[-0.02, 0.02]}
		>
			<group ref={groupRef} position={[0, yPosition, 0]}>
				<group ref={meshRef}>
					<mesh scale={[scale * aspect, scale, 1]} renderOrder={10}>
						<planeGeometry />
						<shaderMaterial
							transparent
							depthTest={false}
							depthWrite={false}
							side={THREE.DoubleSide}
							uniforms={{
								uMap: { value: texture },
								uOpacity: { value: 0.85 },
								uAlphaTest: { value: 0.1 },
							}}
							vertexShader={`
                                varying vec2 vUv;
                                void main() {
                                    vUv = uv;
                                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                                }
                            `}
							fragmentShader={`
                                varying vec2 vUv;
                                uniform sampler2D uMap;
                                uniform float uOpacity;
                                uniform float uAlphaTest;

                                void main() {
                                    vec4 texColor = texture2D(uMap, vUv);
                                    if (texColor.a < uAlphaTest) discard;
                                    gl_FragColor = vec4(texColor.rgb, texColor.a * uOpacity);
                                }
                            `}
						/>
					</mesh>
				</group>
			</group>
		</Float>
	);
};

// Clean wireframe mesh with smooth waves
const WireframeMesh = ({ segments }) => {
	const meshRef = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	const uniforms = useMemo(() => {
		const accent1 = getThemeColor('--accent-1');
		const accent2 = getThemeColor('--accent-2');

		return {
			uTime: { value: 0 },
			uAmplitude: { value: breakpoint === 'mobile' ? 0.5 : 0.75 },
			uFrequency: { value: 0.018 },
			uSpeed: { value: 0.08 },
			uColorStart: { value: accent1 },
			uColorEnd: { value: accent2 },
			uLineOpacity: { value: theme === 'light' ? 0.18 : 0.28 },
		};
	}, [theme, breakpoint]);

	useFrame((state) => {
		uniforms.uTime.value = state.clock.elapsedTime;

		// Responsive wave amplitude
		const pointerInfluence = (Math.abs(state.pointer.x) + Math.abs(state.pointer.y)) * 0.2;
		const targetAmp = (breakpoint === 'mobile' ? 0.5 : 0.75) + pointerInfluence;
		uniforms.uAmplitude.value = THREE.MathUtils.lerp(
			uniforms.uAmplitude.value,
			targetAmp,
			0.05
		);
	});

	const size = breakpoint === 'mobile' ? 220 : 300;

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]}>
			<planeGeometry args={[size, size, segments, segments]} />
			<shaderMaterial
				transparent
				side={THREE.DoubleSide}
				uniforms={uniforms}
				depthWrite={false}
				wireframe={true}
				vertexShader={`
                    uniform float uTime;
                    uniform float uAmplitude;
                    uniform float uFrequency;
                    uniform float uSpeed;
                    
                    varying vec2 vUv;
                    varying float vElevation;

                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        
                        // Smooth, flowing waves
                        float wave1 = sin(pos.x * uFrequency + uTime * uSpeed);
                        float wave2 = sin(pos.y * uFrequency * 0.8 + uTime * uSpeed * 0.7);
                        float wave3 = cos((pos.x + pos.y) * uFrequency * 0.5 + uTime * uSpeed * 0.5);
                        
                        vElevation = (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2) * uAmplitude;
                        pos.z += vElevation;
                        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
				fragmentShader={`
                    varying vec2 vUv;
                    varying float vElevation;
                    uniform vec3 uColorStart;
                    uniform vec3 uColorEnd;
                    uniform float uLineOpacity;

                    void main() {
                        // Smooth color gradient
                        float mixFactor = clamp(vElevation * 0.5 + 0.5, 0.0, 1.0);
                        vec3 color = mix(uColorStart, uColorEnd, mixFactor);
                        
                        // Edge fade with smooth falloff
                        float edgeFadeY = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
                        float edgeFadeX = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
                        float edgeFade = edgeFadeY * edgeFadeX;
                        
                        gl_FragColor = vec4(color, uLineOpacity * edgeFade);
                    }
                `}
			/>
		</mesh>
	);
};

// Refined particle field
const ParticleField = ({ count, radius }) => {
	const ref = useRef();
	const theme = useTheme();

	const { positions, sizes } = useMemo(() => {
		const pos = new Float32Array(count * 3);
		const siz = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = radius * Math.cbrt(Math.random());

			pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			pos[i * 3 + 2] = r * Math.cos(phi);

			siz[i] = 0.012 * (0.6 + Math.random() * 1.4);
		}
		return { positions: pos, sizes: siz };
	}, [count, radius]);

	useFrame((state, delta) => {
		if (!ref.current) return;
		ref.current.rotation.y += delta * 0.01;
		ref.current.rotation.x += delta * 0.005;
	});

	const color = useMemo(() => getThemeColor('--accent-1'), [theme]);

	return (
		<points ref={ref}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={count}
					array={positions}
					itemSize={3}
				/>
				<bufferAttribute
					attach="attributes-size"
					count={count}
					array={sizes}
					itemSize={1}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.012}
				transparent
				color={color}
				opacity={theme === 'light' ? 0.3 : 0.45}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</points>
	);
};

// Optimized lighting
const SceneLights = () => {
	const theme = useTheme();
	const lightRef = useRef();

	const accent1 = useMemo(() => getThemeColor('--accent-1'), [theme]);
	const accent2 = useMemo(() => getThemeColor('--accent-2'), [theme]);

	useFrame((state) => {
		if (lightRef.current) {
			const t = state.clock.elapsedTime;
			lightRef.current.intensity = (theme === 'light' ? 0.9 : 1.2) + Math.sin(t * 0.5) * 0.15;
		}
	});

	return (
		<>
			<ambientLight intensity={theme === 'light' ? 1.0 : 0.75} />
			<hemisphereLight
				skyColor={accent1}
				groundColor={accent2}
				intensity={theme === 'light' ? 0.7 : 0.5}
			/>
			<spotLight
				ref={lightRef}
				position={[0, 10, 10]}
				angle={0.3}
				penumbra={1}
				intensity={theme === 'light' ? 0.9 : 1.2}
				color={accent1}
			/>
		</>
	);
};

// Scene content with performance tiers
const SceneContent = ({ perfLevel }) => {
	const breakpoint = useResponsive();

	const { segments, particleCount, particleRadius } = useMemo(() => {
		const isMobile = breakpoint === 'mobile';
		if (perfLevel === 'low') {
			return {
				segments: isMobile ? 35 : 45,
				particleCount: isMobile ? 120 : 200,
				particleRadius: 22,
			};
		}
		if (perfLevel === 'medium') {
			return {
				segments: isMobile ? 55 : 75,
				particleCount: isMobile ? 250 : 450,
				particleRadius: 28,
			};
		}
		return {
			segments: isMobile ? 75 : 110,
			particleCount: isMobile ? 400 : 750,
			particleRadius: 32,
		};
	}, [perfLevel, breakpoint]);

	return (
		<>
			<SceneLights />
			<Logo3D />
			<WireframeMesh segments={segments} />
			<ParticleField count={particleCount} radius={particleRadius} />
		</>
	);
};

const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();
	const [perfLevel, setPerfLevel] = useState('high');

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

		if (theme === 'light') {
			return {
				baseGradient: `linear-gradient(180deg, ${bgBase} 0%, ${bgSoft} 50%, ${bgSofter} 100%)`,
				radial1: `radial-gradient(ellipse 70% 50% at 50% 15%, rgba(${c1},.1), transparent 70%)`,
				radial2: `radial-gradient(circle at 15% 85%, rgba(${c2},.08), transparent 60%)`,
				fog: bgSofter,
				bottomFade: `linear-gradient(to top, ${bgBase} 0%, transparent 45%)`,
				topFade: `linear-gradient(to bottom, ${bgBase} 0%, transparent 25%)`,
			};
		}
		return {
			baseGradient: `linear-gradient(180deg, ${bgBase} 0%, ${bgSoft} 50%, ${bgSofter} 100%)`,
			radial1: `radial-gradient(ellipse 70% 50% at 50% 15%, rgba(${c1},.15), transparent 70%)`,
			radial2: `radial-gradient(circle at 15% 85%, rgba(${c2},.12), transparent 60%)`,
			fog: bgBase,
			bottomFade: `linear-gradient(to top, ${bgBase} 0%, transparent 45%)`,
			topFade: `linear-gradient(to bottom, ${bgBase} 0%, transparent 25%)`,
		};
	}, [theme]);

	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 1.8, 16], fov: 65 };
			case 'tablet':
				return { position: [0, 2.2, 14], fov: 58 };
			default:
				return { position: [0, 2.8, 13], fov: 50 };
		}
	}, [breakpoint]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Gradient background */}
			<div
				className="absolute inset-0 transition-all duration-700 ease-in-out"
				style={{ background: styles.baseGradient }}
			/>

			{/* Radial accent overlays */}
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.radial1 }}
			/>
			<div
				className="absolute inset-0 transition-opacity duration-700"
				style={{ background: styles.radial2 }}
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
						toneMappingExposure: theme === 'light' ? 1.05 : 1.25,
					}}
					dpr={[1, 2]}
					frameloop="always"
				>
					<PerformanceMonitor
						onIncline={() => setPerfLevel('high')}
						onDecline={() => setPerfLevel('low')}
					>
						<fog
							attach="fog"
							args={[styles.fog, 18, breakpoint === 'mobile' ? 55 : 65]}
						/>
						<SceneContent perfLevel={perfLevel} />
					</PerformanceMonitor>
				</Canvas>
			</Suspense>

			{/* Edge fades */}
			<div
				className="absolute inset-x-0 bottom-0 h-56 pointer-events-none transition-all duration-700"
				style={{ background: styles.bottomFade }}
			/>
			<div
				className="absolute inset-x-0 top-0 h-28 pointer-events-none transition-all duration-700"
				style={{ background: styles.topFade }}
			/>
		</div>
	);
};

export default Background3D;

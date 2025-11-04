import React, { useRef, Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../assets/logo.png';

// Helper to get CSS variable and convert to THREE.Color
const getThemeColor = (varName) => {
	const colorStr = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	return new THREE.Color(colorStr);
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

// Clean 3D Logo - No background effects, just the logo (with chroma-key removal fallback)
const Logo3D = () => {
	const meshRef = useRef();
	const groupRef = useRef();
	const texture = useTexture(logo);
	const { gl } = useThree();
	const breakpoint = useResponsive();
	const theme = useTheme();

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

	// Adjusted scale and lowered position for navbar
	const { scale, yPosition } = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { scale: 3.6, yPosition: 0.45 };
			case 'tablet':
				return { scale: 4.8, yPosition: 0.75 };
			default:
				return { scale: 6.2, yPosition: 0.95 };
		}
	}, [breakpoint]);

	// Pointer + subtle breathing
	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const t = state.clock.elapsedTime;

		if (meshRef.current) {
			const targetY = (pointer.x * Math.PI) / 12;
			const targetX = (-pointer.y * Math.PI) / 16;
			meshRef.current.rotation.y = THREE.MathUtils.damp(
				meshRef.current.rotation.y,
				targetY,
				6,
				state.clock.getDelta()
			);
			meshRef.current.rotation.x = THREE.MathUtils.damp(
				meshRef.current.rotation.x,
				targetX,
				6,
				state.clock.getDelta()
			);
			meshRef.current.rotation.z = Math.sin(t * 0.25) * 0.01;
		}
		if (groupRef.current) {
			groupRef.current.position.y = yPosition + Math.sin(t * 0.5) * 0.06;
			const s = 1 + Math.sin(t * 0.8) * 0.01;
			groupRef.current.scale.set(s, s, 1);
		}
	});

	// Chroma-key fallback removes solid bg if PNG lacks alpha (white in light mode, black in dark mode)
	const keyColor = useMemo(
		() => (theme === 'light' ? new THREE.Color(0xffffff) : new THREE.Color(0x000000)),
		[theme]
	);
	const tolerance = theme === 'light' ? 0.35 : 0.25; // widen for white bg, tighten for black

	return (
		<Float
			speed={1.4}
			rotationIntensity={0.15}
			floatIntensity={0.2}
			floatingRange={[-0.05, 0.05]}
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
								uKeyColor: { value: keyColor },
								uTolerance: { value: tolerance },
								uSmoothness: { value: 0.08 },
								uAlphaCutoff: { value: 0.05 },
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
                                uniform vec3 uKeyColor;
                                uniform float uTolerance;
                                uniform float uSmoothness;
                                uniform float uAlphaCutoff;

                                void main() {
                                    vec4 tex = texture2D(uMap, vUv);

                                    // Chroma key: make pixels near the key color transparent
                                    float keyDist = distance(tex.rgb, uKeyColor);
                                    float nearKey = 1.0 - smoothstep(uTolerance - uSmoothness, uTolerance + uSmoothness, keyDist);

                                    // Keep alpha channel if present, otherwise cut based on key color proximity
                                    float alpha = tex.a * (1.0 - nearKey);

                                    if (alpha < uAlphaCutoff) discard;
                                    gl_FragColor = vec4(tex.rgb, alpha);
                                }
                            `}
						/>
					</mesh>
				</group>
			</group>
		</Float>
	);
};

// Optimized wave mesh with theme-synced colors
const WaveMesh = ({ segments }) => {
	const meshRef = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	const uniforms = useMemo(() => {
		const accent1 = getThemeColor('--accent-1');
		const accent2 = getThemeColor('--accent-2');
		const base = getThemeColor('--bg-soft');

		return {
			uTime: { value: 0 },
			uAmplitude: { value: breakpoint === 'mobile' ? 0.9 : 1.35 },
			uFreq1: { value: 0.06 },
			uFreq2: { value: 0.035 },
			uFreq3: { value: 0.025 },
			uSpeed1: { value: 0.45 },
			uSpeed2: { value: 0.28 },
			uSpeed3: { value: 0.18 },
			uDir1: { value: new THREE.Vector2(1.0, 0.2).normalize() },
			uDir2: { value: new THREE.Vector2(-0.6, 1.0).normalize() },
			uDir3: { value: new THREE.Vector2(0.2, -1.0).normalize() },
			uColorBase: { value: base },
			uColorAccent1: { value: accent1 },
			uColorAccent2: { value: accent2 },
		};
	}, [theme, breakpoint]);

	useFrame((state) => {
		uniforms.uTime.value = state.clock.elapsedTime;
		// Slightly react to pointer with amplitude
		const targetAmp =
			(breakpoint === 'mobile' ? 0.8 : 1.2) +
			Math.abs(state.pointer.x) * 0.2 +
			Math.abs(state.pointer.y) * 0.2;
		uniforms.uAmplitude.value = THREE.MathUtils.damp(
			uniforms.uAmplitude.value,
			targetAmp,
			2.5,
			state.clock.getDelta()
		);
	});

	const geometryArgs = useMemo(() => {
		const size = breakpoint === 'mobile' ? 110 : 160;
		return [size, size, segments, segments];
	}, [breakpoint, segments]);

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -7, 0]}>
			<planeGeometry args={geometryArgs} />
			<shaderMaterial
				transparent
				side={THREE.DoubleSide}
				uniforms={uniforms}
				depthWrite={false}
				vertexShader={`
                    uniform float uTime;
                    uniform float uAmplitude;
                    uniform float uFreq1, uFreq2, uFreq3;
                    uniform float uSpeed1, uSpeed2, uSpeed3;
                    uniform vec2 uDir1, uDir2, uDir3;

                    varying vec2 vUv;
                    varying float vElevation;

                    float wave(vec2 dir, float freq, float speed, vec2 pos) {
                        return sin(dot(dir, pos) * freq + uTime * speed);
                    }

                    void main() {
                        vUv = uv;
                        vec3 pos = position;

                        float w1 = wave(uDir1, uFreq1, uSpeed1, pos.xy);
                        float w2 = wave(uDir2, uFreq2, uSpeed2, pos.xy + vec2(8.0, -4.0));
                        float w3 = wave(uDir3, uFreq3, uSpeed3, pos.xy + vec2(-12.0, 6.0));

                        vElevation = (w1 * 0.55 + w2 * 0.3 + w3 * 0.25) * uAmplitude;
                        pos.z += vElevation;

                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
				fragmentShader={`
                    varying vec2 vUv;
                    varying float vElevation;
                    uniform vec3 uColorBase;
                    uniform vec3 uColorAccent1;
                    uniform vec3 uColorAccent2;

                    void main() {
                        // Soft grid
                        vec2 g = abs(fract(vUv * 22.0 - 0.5) - 0.5);
                        float line = min(g.x, g.y);
                        float grid = 1.0 - smoothstep(0.0, 0.12, line);

                        // Elevation-based gradient
                        float e = clamp(vElevation * 0.45 + 0.5, 0.0, 1.0);
                        vec3 c = mix(uColorBase, uColorAccent1, smoothstep(0.0, 0.7, e));
                        c = mix(c, uColorAccent2, smoothstep(0.55, 1.0, e));

                        // Center focus + vertical fade
                        float center = 1.0 - smoothstep(0.25, 0.68, distance(vUv, vec2(0.5)));
                        float vfade = smoothstep(0.1, 0.9, vUv.y);

                        float alpha = (0.28 + vfade * 0.26) * center;
                        alpha *= mix(0.65, 1.0, grid * 0.35);

                        gl_FragColor = vec4(c, alpha);
                    }
                `}
			/>
		</mesh>
	);
};

// Optimized particle system with theme-synced colors
const ParticleNebula = ({ count, radius }) => {
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

			siz[i] = 0.025 * (0.5 + Math.random() * 1.5);
		}
		return { positions: pos, sizes: siz };
	}, [count, radius]);

	useFrame((state, delta) => {
		if (!ref.current) return;
		ref.current.rotation.y += delta * 0.03;
		ref.current.rotation.x += delta * 0.01;
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
				size={0.025}
				transparent
				color={color}
				opacity={theme === 'light' ? 0.55 : 0.7}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</points>
	);
};

// Interactive cursor glow - tiny fix to color update
const CursorGlow = () => {
	const glowRef = useRef();
	const theme = useTheme();
	const color = useMemo(() => getThemeColor('--accent-1'), [theme]);

	useFrame(({ viewport, pointer }) => {
		if (!glowRef.current) return;
		const { width, height } = viewport.getCurrentViewport();
		glowRef.current.position.set((pointer.x * width) / 2, (pointer.y * height) / 2, -5);
		glowRef.current.material.color.copy(color);
	});

	return (
		<mesh ref={glowRef}>
			<sphereGeometry args={[8, 32, 32]} />
			<meshBasicMaterial
				color={color}
				transparent
				opacity={0.07}
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</mesh>
	);
};

// Optimized dynamic lights with theme-synced colors
const DynamicLights = () => {
	const spot1 = useRef();
	const theme = useTheme();

	const lightColors = useMemo(() => {
		return {
			ambient: theme === 'light' ? 0.9 : 0.6,
			hemisphere: {
				sky: getThemeColor('--accent-1'),
				ground: getThemeColor('--accent-2'),
			},
			spot1: getThemeColor('--accent-1'),
		};
	}, [theme]);

	useFrame((state) => {
		const time = state.clock.elapsedTime;
		if (spot1.current) {
			spot1.current.intensity = (theme === 'light' ? 1.6 : 2.0) + Math.sin(time * 0.5) * 0.3;
			spot1.current.position.x = Math.sin(time * 0.3) * 3;
		}
	});

	return (
		<>
			<ambientLight intensity={lightColors.ambient} />
			<hemisphereLight
				skyColor={lightColors.hemisphere.sky}
				groundColor={lightColors.hemisphere.ground}
				intensity={theme === 'light' ? 1.2 : 0.8}
			/>
			<spotLight
				ref={spot1}
				position={[0, 15, 10]}
				angle={0.4}
				penumbra={1}
				intensity={theme === 'light' ? 1.6 : 2.0}
				color={lightColors.spot1}
			/>
		</>
	);
};

// Scene content with adaptive performance
const SceneContent = ({ perfLevel }) => {
	const breakpoint = useResponsive();

	const { segments, particleCount, particleRadius } = useMemo(() => {
		const isMobile = breakpoint === 'mobile';
		if (perfLevel === 'low') {
			return {
				segments: isMobile ? 40 : 50,
				particleCount: isMobile ? 300 : 500,
				particleRadius: 30,
			};
		}
		if (perfLevel === 'medium') {
			return {
				segments: isMobile ? 60 : 80,
				particleCount: isMobile ? 600 : 1000,
				particleRadius: 35,
			};
		}
		return {
			segments: isMobile ? 80 : 120,
			particleCount: isMobile ? 1000 : 1800,
			particleRadius: 40,
		};
	}, [perfLevel, breakpoint]);

	return (
		<>
			<DynamicLights />
			<CursorGlow />
			<Logo3D />
			<WaveMesh segments={segments} />
			<ParticleNebula count={particleCount} radius={particleRadius} />
		</>
	);
};

const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();
	const [perfLevel, setPerfLevel] = useState('high');

	// Gradients and colors are now derived from CSS variables for consistency
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

		const accent1Rgb = new THREE.Color(accent1)
			.toArray()
			.map((c) => Math.round(c * 255))
			.join(',');
		const accent2Rgb = new THREE.Color(accent2)
			.toArray()
			.map((c) => Math.round(c * 255))
			.join(',');

		if (theme === 'light') {
			return {
				baseGradient: `linear-gradient(to bottom, ${bgBase} 0%, ${bgSoft} 50%, ${bgSofter} 100%)`,
				radial1: `radial-gradient(ellipse 85% 75% at 50% 35%, rgba(${accent1Rgb},.15), transparent)`,
				radial2: `radial-gradient(circle at 20% 80%, rgba(${accent2Rgb},.1), transparent 60%)`,
				fog: bgSofter,
				bottomFade: `linear-gradient(to top, ${bgBase}, transparent)`,
				topFade: `linear-gradient(to bottom, ${bgBase}, transparent)`,
			};
		}
		return {
			baseGradient: `linear-gradient(to bottom, ${bgBase} 0%, ${bgSoft} 50%, ${bgSofter} 100%)`,
			radial1: `radial-gradient(ellipse 85% 75% at 50% 35%, rgba(${accent1Rgb},.2), transparent)`,
			radial2: `radial-gradient(circle at 20% 80%, rgba(${accent2Rgb},.15), transparent 60%)`,
			fog: bgBase,
			bottomFade: `linear-gradient(to top, ${bgBase}, transparent)`,
			topFade: `linear-gradient(to bottom, ${bgBase}, transparent)`,
		};
	}, [theme]);

	// Adjusted camera position to account for lowered logo
	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 1.5, 16], fov: 60 };
			case 'tablet':
				return { position: [0, 2, 14], fov: 56 };
			default:
				return { position: [0, 2.5, 13], fov: 52 };
		}
	}, [breakpoint]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Base gradient from theme */}
			<div
				className="absolute inset-0 transition-all duration-700 ease-in-out"
				style={{ background: styles.baseGradient }}
			/>

			{/* Radial gradient overlays from theme */}
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-700"
				style={{ background: styles.radial1 }}
			/>
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-700"
				style={{ background: styles.radial2 }}
			/>

			<Suspense fallback={null}>
				<Canvas
					camera={{
						position: cameraConfig.position,
						fov: cameraConfig.fov,
						near: 0.1,
						far: 120,
					}}
					style={{ pointerEvents: 'auto' }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						toneMapping: THREE.ACESFilmicToneMapping,
						toneMappingExposure: theme === 'light' ? 1.15 : 1.35,
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
							args={[styles.fog, 15, breakpoint === 'mobile' ? 50 : 60]}
						/>
						<SceneContent perfLevel={perfLevel} />
					</PerformanceMonitor>
				</Canvas>
			</Suspense>

			{/* Fades from theme */}
			<div
				className="absolute inset-x-0 bottom-0 h-[28rem] pointer-events-none transition-all duration-700"
				style={{ background: styles.bottomFade }}
			/>
			<div
				className="absolute inset-x-0 top-0 h-48 pointer-events-none transition-all duration-700"
				style={{ background: styles.topFade }}
			/>
		</div>
	);
};

export default Background3D;

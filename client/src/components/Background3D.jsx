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

// Clean 3D Logo - No background effects, just the logo
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

	// Adjusted position - lowered to account for navbar
	const { scale, yPosition } = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { scale: 3.5, yPosition: 0.5 };
			case 'tablet':
				return { scale: 4.5, yPosition: 0.8 };
			default:
				return { scale: 6.0, yPosition: 1.0 };
		}
	}, [breakpoint]);

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const time = state.clock.elapsedTime;

		if (meshRef.current) {
			const targetRotationY = (pointer.x * Math.PI) / 12;
			const targetRotationX = (-pointer.y * Math.PI) / 16;
			meshRef.current.rotation.y = THREE.MathUtils.lerp(
				meshRef.current.rotation.y,
				targetRotationY,
				0.06
			);
			meshRef.current.rotation.x = THREE.MathUtils.lerp(
				meshRef.current.rotation.x,
				targetRotationX,
				0.06
			);
			meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.01;
		}

		if (groupRef.current) {
			groupRef.current.position.y = yPosition + Math.sin(time * 0.4) * 0.08;
		}
	});

	return (
		<Float
			speed={1.5}
			rotationIntensity={0.15}
			floatIntensity={0.2}
			floatingRange={[-0.05, 0.05]}
		>
			<group ref={groupRef} position={[0, yPosition, 0]}>
				<group ref={meshRef}>
					{/* Clean logo - no glow layers */}
					<mesh scale={[scale * aspect, scale, 1]} renderOrder={10}>
						<planeGeometry />
						<meshBasicMaterial
							map={texture}
							transparent={true}
							alphaTest={0.1}
							side={THREE.DoubleSide}
							depthTest={false}
							depthWrite={false}
							opacity={1.0}
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
		const bgSoft = getThemeColor('--bg-soft');

		return {
			uTime: { value: 0 },
			uAmplitude: { value: breakpoint === 'mobile' ? 1.0 : 1.5 },
			uFrequency: { value: 0.04 },
			uColorBase: { value: bgSoft },
			uColorAccent1: { value: accent1 },
			uColorAccent2: { value: accent2 },
		};
	}, [theme, breakpoint]);

	useFrame((state) => {
		uniforms.uTime.value = state.clock.elapsedTime * 0.7;
	});

	const geometryArgs = useMemo(() => {
		const size = breakpoint === 'mobile' ? 100 : 140;
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
                    uniform float uFrequency;
                    varying vec2 vUv;
                    varying float vElevation;

                    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
                    
                    float snoise(vec2 v) {
                        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                        vec2 i  = floor(v + dot(v, C.yy));
                        vec2 x0 = v - i + dot(i, C.xx);
                        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                        vec4 x12 = x0.xyxy + C.xxzz;
                        x12.xy -= i1;
                        i = mod289(i);
                        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                        m = m*m; m = m*m;
                        vec3 x = 2.0 * fract(p * C.www) - 1.0;
                        vec3 h = abs(x) - 0.5;
                        vec3 ox = floor(x + 0.5);
                        vec3 a0 = x - ox;
                        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                        vec3 g;
                        g.x  = a0.x  * x0.x  + h.x  * x0.y;
                        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                        return 130.0 * dot(m, g);
                    }

                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        
                        float noise = snoise(pos.xy * 0.03 + uTime * 0.1) * 1.5;
                        float wave = sin(pos.x * uFrequency + uTime * 0.2) * uAmplitude;
                        
                        vElevation = (noise + wave) * 0.8;
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
                        vec2 grid = abs(fract(vUv * 20.0 - 0.5) - 0.5);
                        float line = min(grid.x, grid.y);
                        float gridPattern = 1.0 - min(line * 2.0, 1.0);
                        
                        float elevationFactor = clamp(vElevation * 0.5 + 0.5, 0.0, 1.0);
                        
                        vec3 color = mix(uColorBase, uColorAccent1, smoothstep(0.0, 0.6, elevationFactor));
                        color = mix(color, uColorAccent2, smoothstep(0.6, 1.0, elevationFactor));
                        
                        float centerDist = distance(vUv, vec2(0.5));
                        float edgeFade = 1.0 - smoothstep(0.25, 0.65, centerDist);
                        float verticalGradient = smoothstep(0.1, 0.9, vUv.y) * 0.35;
                        
                        float alpha = gridPattern * edgeFade * (0.35 + verticalGradient);
                        
                        gl_FragColor = vec4(color, alpha * 0.85);
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

// Interactive cursor glow
const CursorGlow = () => {
	const glowRef = useRef();
	const theme = useTheme();
	const color = useMemo(() => getThemeColor('--accent-1'), [theme]);

	useFrame(({ viewport, pointer }) => {
		if (glowRef.current) {
			const { width, height } = viewport.getCurrentViewport();
			glowRef.current.position.set((pointer.x * width) / 2, (pointer.y * height) / 2, -5);
			glowRef.current.material.color = color;
		}
	});

	return (
		<mesh ref={glowRef}>
			<sphereGeometry args={[8, 32, 32]} />
			<meshBasicMaterial
				color={color}
				transparent
				opacity={0.08}
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

import React, { useRef, Suspense, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../assets/logo.png';

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

// Enhanced 3D Logo with improved placement and animation
const Logo3D = () => {
	const ref = useRef();
	const groupRef = useRef();
	const texture = useTexture(logo);
	const { gl } = useThree();
	const theme = useTheme();
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

	// Responsive scale and position - improved placement
	const { scale, yPosition } = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { scale: 2.8, yPosition: 1.2 };
			case 'tablet':
				return { scale: 3.8, yPosition: 1.5 };
			default:
				return { scale: 5.0, yPosition: 2.0 };
		}
	}, [breakpoint]);

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const time = state.clock.elapsedTime;

		if (ref.current) {
			// Smoother, more fluid rotation
			const rotationIntensity = breakpoint === 'mobile' ? 0.06 : 0.1;
			ref.current.rotation.y = THREE.MathUtils.lerp(
				ref.current.rotation.y,
				(pointer.x * Math.PI) / 8,
				rotationIntensity
			);
			ref.current.rotation.x = THREE.MathUtils.lerp(
				ref.current.rotation.x,
				(-pointer.y * Math.PI) / 12,
				rotationIntensity
			);

			// Subtle breathing animation
			ref.current.rotation.z = Math.sin(time * 0.15) * 0.03;
		}

		if (groupRef.current) {
			// Gentle floating animation
			groupRef.current.position.y = yPosition + Math.sin(time * 0.4) * 0.15;
		}
	});

	return (
		<Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
			<group ref={groupRef} position={[0, yPosition, 0]}>
				<group ref={ref}>
					{/* Main logo mesh */}
					<mesh scale={[scale * aspect, scale, 1]} renderOrder={10}>
						<planeGeometry />
						<meshPhysicalMaterial
							map={texture}
							transparent={true}
							metalness={theme === 'light' ? 0.6 : 0.9}
							roughness={theme === 'light' ? 0.3 : 0.2}
							clearcoat={theme === 'light' ? 0.9 : 1.0}
							clearcoatRoughness={0.15}
							reflectivity={theme === 'light' ? 0.6 : 0.85}
							ior={1.5}
							transmission={theme === 'light' ? 0.03 : 0.1}
							thickness={0.8}
							depthTest={false}
							envMapIntensity={theme === 'light' ? 1.4 : 1.8}
						/>
					</mesh>

					{/* Glow effect behind logo */}
					<mesh
						scale={[scale * aspect * 1.3, scale * 1.3, 1]}
						position={[0, 0, -0.1]}
						renderOrder={9}
					>
						<planeGeometry />
						<meshBasicMaterial
							transparent
							opacity={theme === 'light' ? 0.15 : 0.25}
							color={theme === 'light' ? '#8b5cf6' : '#60a5fa'}
							blending={THREE.AdditiveBlending}
							depthTest={false}
						/>
					</mesh>
				</group>
			</group>
		</Float>
	);
};

// Dramatically enhanced wave mesh with much larger amplitude
const WaveMesh = () => {
	const meshRef = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uAmplitude: { value: breakpoint === 'mobile' ? 2.5 : 3.5 }, // Increased amplitude
			uFrequency: { value: 0.4 }, // Adjusted frequency for larger waves
		}),
		[breakpoint]
	);

	useFrame((state) => {
		uniforms.uTime.value = state.clock.elapsedTime;
	});

	// Enhanced theme-aware colors with better contrast
	const colors = useMemo(() => {
		if (theme === 'light') {
			return {
				base: 'vec3(0.58, 0.62, 0.96)', // Soft periwinkle
				highlight: 'vec3(0.35, 0.82, 0.98)', // Bright cyan
				deep: 'vec3(0.30, 0.42, 0.90)', // Rich blue
				ambient: 'vec3(0.82, 0.85, 0.98)', // Very light lavender
				accent: 'vec3(0.55, 0.36, 0.96)', // Purple accent
			};
		}
		return {
			base: 'vec3(0.10, 0.22, 0.52)', // Deep blue
			highlight: 'vec3(0.25, 0.75, 0.96)', // Bright cyan
			deep: 'vec3(0.52, 0.55, 0.96)', // Lavender
			ambient: 'vec3(0.06, 0.15, 0.42)', // Very dark blue
			accent: 'vec3(0.38, 0.74, 0.98)', // Sky blue accent
		};
	}, [theme]);

	// Responsive geometry with higher detail
	const geometryArgs = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return [100, 100, 120, 120];
			case 'tablet':
				return [120, 120, 150, 150];
			default:
				return [140, 140, 180, 180];
		}
	}, [breakpoint]);

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -6, 0]}>
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
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;

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
                        m = m*m;
                        m = m*m;
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
                        
                        // Enhanced large-scale waves
                        float noise1 = snoise(pos.xy * 0.05 + uTime * 0.12) * 1.8;
                        float noise2 = snoise(pos.xy * 0.1 - uTime * 0.08) * 1.2;
                        float noise3 = snoise(pos.xy * 0.18 + uTime * 0.15) * 0.8;
                        
                        // Dramatic wave patterns
                        float wave1 = sin(pos.x * uFrequency * 0.08 + uTime * 0.25) * uAmplitude * 1.2;
                        float wave2 = cos(pos.y * uFrequency * 0.06 + uTime * 0.2) * uAmplitude * 1.4;
                        float wave3 = sin((pos.x + pos.y) * uFrequency * 0.04 - uTime * 0.18) * uAmplitude * 0.9;
                        
                        // Large circular ripples
                        float ripple = sin(length(pos.xy) * 0.1 - uTime * 0.3) * 1.2;
                        
                        // Combine all wave effects for dramatic height
                        vElevation = (noise1 + noise2 + noise3 + wave1 + wave2 + wave3 + ripple) * 0.85;
                        pos.z += vElevation;
                        
                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        vViewPosition = -mvPosition.xyz;
                        vNormal = normalize(normalMatrix * normal);
                        
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
				fragmentShader={`
                    varying vec2 vUv;
                    varying float vElevation;
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;
                    
                    void main() {
                        // Refined grid pattern
                        vec2 grid = abs(fract(vUv * 35.0 - 0.5) - 0.5) / fwidth(vUv * 35.0);
                        float line = min(grid.x, grid.y);
                        float gridPattern = 1.0 - min(line, 1.0);
                        
                        // Enhanced theme-aware colors
                        vec3 baseColor = ${colors.base};
                        vec3 highlightColor = ${colors.highlight};
                        vec3 deepColor = ${colors.deep};
                        vec3 ambientColor = ${colors.ambient};
                        vec3 accentColor = ${colors.accent};
                        
                        // Dynamic color based on wave height
                        float elevationFactor = clamp(vElevation * 0.5 + 0.5, 0.0, 1.0);
                        vec3 color = mix(ambientColor, baseColor, elevationFactor);
                        color = mix(color, deepColor, clamp(vElevation * 0.35, 0.0, 1.0));
                        color = mix(color, highlightColor, clamp(vElevation * 0.8, 0.0, 0.7));
                        
                        // Add accent color on peaks
                        float peakIntensity = smoothstep(0.6, 1.0, elevationFactor);
                        color = mix(color, accentColor, peakIntensity * 0.4);
                        
                        // Enhanced Fresnel effect
                        vec3 viewDir = normalize(vViewPosition);
                        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
                        color = mix(color, highlightColor, fresnel * 0.4);
                        
                        // Smooth edge fade
                        float centerDist = distance(vUv, vec2(0.5));
                        float edgeFade = 1.0 - smoothstep(0.15, 0.7, centerDist);
                        
                        // Vertical gradient for depth
                        float verticalGradient = smoothstep(0.0, 1.0, vUv.y) * 0.4;
                        
                        // Enhanced alpha with wave peaks
                        float baseAlpha = 0.4 + verticalGradient;
                        float waveAlpha = smoothstep(-0.5, 1.0, vElevation) * 0.3;
                        float alpha = (gridPattern * edgeFade * baseAlpha) + waveAlpha;
                        
                        // Grid line glow on peaks
                        alpha += gridPattern * fresnel * peakIntensity * 0.2;
                        
                        gl_FragColor = vec4(color, alpha);
                    }
                `}
			/>
		</mesh>
	);
};

// Enhanced particles with improved distribution
const ParticleNebula = ({
	count = 1500,
	size = 0.03,
	color = '#5881b3',
	speed = 0.5,
	radius = 40,
}) => {
	const ref = useRef();
	const theme = useTheme();

	const { positions, sizes, colors } = useMemo(() => {
		const pos = new Float32Array(count * 3);
		const siz = new Float32Array(count);
		const col = new Float32Array(count * 3);

		const baseColor = new THREE.Color(color);
		const accentColor = new THREE.Color(theme === 'light' ? '#8b5cf6' : '#60a5fa');
		const secondaryAccent = new THREE.Color(theme === 'light' ? '#ec4899' : '#38bdf8');

		for (let i = 0; i < count; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = radius * Math.cbrt(Math.random());

			pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			pos[i * 3 + 2] = r * Math.cos(phi);

			siz[i] = size * (0.4 + Math.random() * 1.8);

			// Multi-color variation
			const colorChoice = Math.random();
			let mixColor;
			if (colorChoice > 0.8) mixColor = accentColor;
			else if (colorChoice > 0.6) mixColor = secondaryAccent;
			else mixColor = baseColor;

			col[i * 3 + 0] = mixColor.r;
			col[i * 3 + 1] = mixColor.g;
			col[i * 3 + 2] = mixColor.b;
		}
		return { positions: pos, sizes: siz, colors: col };
	}, [count, radius, size, color, theme]);

	useFrame((state, delta) => {
		if (!ref.current) return;

		ref.current.rotation.y += delta * 0.05 * speed;
		ref.current.rotation.x += delta * 0.02 * speed;

		ref.current.rotation.x = THREE.MathUtils.lerp(
			ref.current.rotation.x,
			state.pointer.y * 0.1,
			0.04
		);
		ref.current.rotation.y += THREE.MathUtils.lerp(0, state.pointer.x * 0.04, 0.04);
	});

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
				<bufferAttribute
					attach="attributes-color"
					count={count}
					array={colors}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={size}
				vertexColors
				transparent
				opacity={theme === 'light' ? 0.55 : 0.7}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</points>
	);
};

// Enhanced dynamic lights
const DynamicLights = () => {
	const spot1 = useRef();
	const spot2 = useRef();
	const spot3 = useRef();
	const point1 = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	useFrame((state) => {
		const time = state.clock.elapsedTime;

		if (spot1.current) {
			spot1.current.intensity = (theme === 'light' ? 1.2 : 1.5) + Math.sin(time * 0.6) * 0.4;
			spot1.current.position.x = Math.sin(time * 0.35) * 6 + 12;
			spot1.current.position.y = 16 + Math.sin(time * 0.25) * 2;
		}

		if (spot2.current) {
			spot2.current.intensity = (theme === 'light' ? 0.9 : 1.1) + Math.cos(time * 0.5) * 0.3;
			spot2.current.position.x = Math.cos(time * 0.3) * 6 - 12;
			spot2.current.position.y = 14 + Math.cos(time * 0.3) * 2;
		}

		if (spot3.current) {
			spot3.current.intensity = (theme === 'light' ? 0.7 : 0.8) + Math.sin(time * 0.7) * 0.25;
			spot3.current.position.z = Math.sin(time * 0.25) * 4;
		}

		if (point1.current) {
			point1.current.intensity = (theme === 'light' ? 0.6 : 0.7) + Math.sin(time * 0.8) * 0.2;
			point1.current.position.y = 6 + Math.sin(time * 0.5) * 2;
		}
	});

	const lightColors = useMemo(() => {
		if (theme === 'light') {
			return {
				hemisphere: { sky: '#7c3aed', ground: '#fef3c7' },
				ambient: 0.9,
				spot1: '#60a5fa',
				spot2: '#a78bfa',
				spot3: '#f472b6',
				point: '#c084fc',
			};
		}
		return {
			hemisphere: { sky: '#38bdf8', ground: '#083344' },
			ambient: 0.6,
			spot1: '#38bdf8',
			spot2: '#818cf8',
			spot3: '#ec4899',
			point: '#a78bfa',
		};
	}, [theme]);

	const intensityMultiplier = breakpoint === 'mobile' ? 0.85 : 1.0;

	return (
		<>
			<ambientLight intensity={lightColors.ambient * intensityMultiplier} />
			<hemisphereLight
				skyColor={lightColors.hemisphere.sky}
				groundColor={lightColors.hemisphere.ground}
				intensity={(theme === 'light' ? 1.2 : 0.8) * intensityMultiplier}
			/>
			<spotLight
				ref={spot1}
				position={[12, 16, 12]}
				angle={0.4}
				penumbra={1}
				intensity={lightColors.ambient * intensityMultiplier}
				color={lightColors.spot1}
				castShadow
			/>
			<spotLight
				ref={spot2}
				position={[-12, 14, 6]}
				angle={0.45}
				penumbra={1}
				intensity={(theme === 'light' ? 0.9 : 1.1) * intensityMultiplier}
				color={lightColors.spot2}
			/>
			<spotLight
				ref={spot3}
				position={[0, 12, -10]}
				angle={0.5}
				penumbra={1}
				intensity={(theme === 'light' ? 0.7 : 0.8) * intensityMultiplier}
				color={lightColors.spot3}
			/>
			<pointLight
				ref={point1}
				position={[0, 6, -6]}
				intensity={(theme === 'light' ? 0.6 : 0.7) * intensityMultiplier}
				color={lightColors.point}
				distance={25}
			/>
		</>
	);
};

const Background3D = () => {
	const theme = useTheme();
	const breakpoint = useResponsive();

	// Enhanced theme-aware gradients
	const gradients = useMemo(() => {
		if (theme === 'light') {
			return {
				radial1:
					'radial-gradient(ellipse 75% 65% at 50% 35%, rgba(139,92,246,.22), transparent)',
				radial2:
					'radial-gradient(circle at 20% 80%, rgba(96,165,250,.18), transparent 60%)',
				radial3:
					'radial-gradient(circle at 80% 20%, rgba(244,114,182,.15), transparent 55%)',
				fog: '#ede9fe',
				bottomFade:
					'linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.75), transparent)',
			};
		}
		return {
			radial1:
				'radial-gradient(ellipse 75% 65% at 50% 35%, rgba(129,140,248,.25), transparent)',
			radial2: 'radial-gradient(circle at 20% 80%, rgba(56,189,248,.18), transparent 60%)',
			radial3: 'radial-gradient(circle at 80% 20%, rgba(236,72,153,.15), transparent 55%)',
			fog: '#0a1628',
			bottomFade:
				'linear-gradient(to top, rgba(3,7,18,0.98), rgba(3,7,18,0.88), transparent)',
		};
	}, [theme]);

	// Responsive particle configuration
	const particleConfig = useMemo(() => {
		const baseConfig = {
			mobile: [
				{ count: 700, size: 0.028, color: '#818cf8', speed: 0.35, radius: 32 },
				{ count: 500, size: 0.035, color: '#38bdf8', speed: 0.55, radius: 22 },
				{ count: 350, size: 0.04, color: '#a78bfa', speed: 0.75, radius: 16 },
			],
			tablet: [
				{ count: 1000, size: 0.028, color: '#818cf8', speed: 0.35, radius: 35 },
				{ count: 750, size: 0.035, color: '#38bdf8', speed: 0.55, radius: 25 },
				{ count: 500, size: 0.04, color: '#a78bfa', speed: 0.75, radius: 18 },
			],
			desktop: [
				{ count: 1400, size: 0.028, color: '#818cf8', speed: 0.35, radius: 38 },
				{ count: 1000, size: 0.035, color: '#38bdf8', speed: 0.55, radius: 28 },
				{ count: 700, size: 0.04, color: '#a78bfa', speed: 0.75, radius: 20 },
			],
		};
		return baseConfig[breakpoint];
	}, [breakpoint]);

	// Responsive camera configuration - adjusted for better logo visibility
	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 2, 14], fov: 60 };
			case 'tablet':
				return { position: [0, 2.5, 12], fov: 56 };
			default:
				return { position: [0, 3, 11], fov: 52 };
		}
	}, [breakpoint]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Enhanced base gradient */}
			<div
				className="absolute inset-0 transition-all duration-500"
				style={{
					background:
						theme === 'light'
							? 'linear-gradient(to bottom, #ffffff, #faf5ff, #f3e8ff, #ede9fe)'
							: 'linear-gradient(to bottom, #030712, #0b1220, #0f172a, #1e293b)',
				}}
			/>

			{/* Enhanced radial gradients */}
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-500"
				style={{ background: gradients.radial1 }}
			/>
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-500"
				style={{ background: gradients.radial2 }}
			/>
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-500"
				style={{ background: gradients.radial3 }}
			/>

			{/* Noise texture overlay */}
			<div
				className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
				}}
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
					dpr={[1, Math.min(window.devicePixelRatio, 2)]}
				>
					<fog
						attach="fog"
						args={[gradients.fog, 12, breakpoint === 'mobile' ? 50 : 60]}
					/>

					<DynamicLights />
					<Logo3D />
					<WaveMesh />

					{/* Responsive particle layers */}
					{particleConfig.map((config, index) => (
						<ParticleNebula key={index} {...config} />
					))}
				</Canvas>
			</Suspense>

			{/* Enhanced bottom fade */}
			<div
				className="absolute inset-x-0 bottom-0 h-96 pointer-events-none transition-all duration-500"
				style={{ background: gradients.bottomFade }}
			/>

			{/* Top subtle fade */}
			<div
				className="absolute inset-x-0 top-0 h-40 pointer-events-none transition-all duration-500"
				style={{
					background:
						theme === 'light'
							? 'linear-gradient(to bottom, rgba(255,255,255,0.7), transparent)'
							: 'linear-gradient(to bottom, rgba(3,7,18,0.6), transparent)',
				}}
			/>
		</div>
	);
};

export default Background3D;

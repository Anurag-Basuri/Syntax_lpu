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

// Enhanced 3D Logo with theme-aware materials
const Logo3D = () => {
	const ref = useRef();
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

	// Responsive scale and position
	const { scale, yPosition } = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { scale: 2.2, yPosition: 0.5 };
			case 'tablet':
				return { scale: 3.0, yPosition: 0.8 };
			default:
				return { scale: 4.0, yPosition: 1.0 };
		}
	}, [breakpoint]);

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const time = state.clock.elapsedTime;

		if (ref.current) {
			const rotationIntensity = breakpoint === 'mobile' ? 0.05 : 0.08;
			ref.current.rotation.y = THREE.MathUtils.lerp(
				ref.current.rotation.y,
				(pointer.x * Math.PI) / 10,
				rotationIntensity
			);
			ref.current.rotation.x = THREE.MathUtils.lerp(
				ref.current.rotation.x,
				(-pointer.y * Math.PI) / 10,
				rotationIntensity
			);
			ref.current.rotation.z = Math.sin(time * 0.1) * 0.02;
		}
	});

	return (
		<Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.7}>
			<group ref={ref} position={[0, yPosition, 0]}>
				<mesh scale={[scale * aspect, scale, 1]} renderOrder={10}>
					<planeGeometry />
					<meshPhysicalMaterial
						map={texture}
						transparent={true}
						metalness={theme === 'light' ? 0.5 : 0.85}
						roughness={theme === 'light' ? 0.4 : 0.25}
						clearcoat={theme === 'light' ? 0.8 : 1.0}
						clearcoatRoughness={0.2}
						reflectivity={theme === 'light' ? 0.5 : 0.75}
						ior={1.5}
						transmission={theme === 'light' ? 0.02 : 0.08}
						thickness={0.5}
						depthTest={false}
						envMapIntensity={theme === 'light' ? 1.2 : 1.5}
					/>
				</mesh>
			</group>
		</Float>
	);
};

// Enhanced theme-aware cloth mesh with better light mode support
const WaveMesh = () => {
	const meshRef = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uAmplitude: { value: breakpoint === 'mobile' ? 1.0 : 1.5 },
			uFrequency: { value: 0.5 },
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
				base: 'vec3(0.62, 0.64, 0.98)', // Soft periwinkle
				highlight: 'vec3(0.40, 0.85, 0.99)', // Bright cyan
				deep: 'vec3(0.35, 0.45, 0.92)', // Rich blue
				ambient: 'vec3(0.85, 0.87, 0.99)', // Very light lavender
			};
		}
		return {
			base: 'vec3(0.12, 0.25, 0.55)', // Deep blue
			highlight: 'vec3(0.30, 0.78, 0.98)', // Bright cyan
			deep: 'vec3(0.55, 0.58, 0.98)', // Lavender
			ambient: 'vec3(0.08, 0.18, 0.45)', // Very dark blue
		};
	}, [theme]);

	// Responsive geometry
	const geometryArgs = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return [80, 80, 100, 100];
			case 'tablet':
				return [90, 90, 125, 125];
			default:
				return [100, 100, 150, 150];
		}
	}, [breakpoint]);

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
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
                        
                        float noise1 = snoise(pos.xy * 0.08 + uTime * 0.15) * 1.2;
                        float noise2 = snoise(pos.xy * 0.15 - uTime * 0.1) * 0.8;
                        float noise3 = snoise(pos.xy * 0.25 + uTime * 0.2) * 0.5;
                        
                        float wave1 = sin(pos.x * uFrequency * 0.1 + uTime * 0.3) * uAmplitude * 0.6;
                        float wave2 = cos(pos.y * uFrequency * 0.08 + uTime * 0.25) * uAmplitude * 0.8;
                        float ripple = sin(length(pos.xy) * 0.15 - uTime * 0.4) * 0.6;
                        
                        vElevation = (noise1 + noise2 + noise3 + wave1 + wave2 + ripple) * 0.7;
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
                        // Enhanced grid with thinner, more refined lines
                        vec2 grid = abs(fract(vUv * 30.0 - 0.5) - 0.5) / fwidth(vUv * 30.0);
                        float line = min(grid.x, grid.y);
                        float gridPattern = 1.0 - min(line, 1.0);
                        
                        // Theme-aware colors with better depth
                        vec3 baseColor = ${colors.base};
                        vec3 highlightColor = ${colors.highlight};
                        vec3 deepColor = ${colors.deep};
                        vec3 ambientColor = ${colors.ambient};
                        
                        // Enhanced depth-based coloring
                        float elevationFactor = clamp(vElevation * 0.6 + 0.5, 0.0, 1.0);
                        vec3 color = mix(ambientColor, baseColor, elevationFactor);
                        color = mix(color, deepColor, clamp(vElevation * 0.4, 0.0, 1.0));
                        color = mix(color, highlightColor, clamp(vElevation * 0.9, 0.0, 0.6));
                        
                        // Fresnel effect for rim lighting
                        vec3 viewDir = normalize(vViewPosition);
                        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
                        color = mix(color, highlightColor, fresnel * 0.3);
                        
                        // Enhanced edge fade with smoother gradient
                        float centerDist = distance(vUv, vec2(0.5));
                        float edgeFade = 1.0 - smoothstep(0.2, 0.65, centerDist);
                        
                        // Vertical gradient for depth
                        float verticalGradient = smoothstep(0.0, 1.0, vUv.y) * 0.35;
                        
                        // Combine effects
                        float baseAlpha = 0.35 + verticalGradient;
                        float alpha = gridPattern * edgeFade * baseAlpha;
                        
                        // Add subtle glow on grid lines
                        alpha += gridPattern * fresnel * 0.15;
                        
                        gl_FragColor = vec4(color, alpha);
                    }
                `}
			/>
		</mesh>
	);
};

// Enhanced particles with better theme support
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

		for (let i = 0; i < count; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = radius * Math.cbrt(Math.random());

			pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			pos[i * 3 + 2] = r * Math.cos(phi);

			siz[i] = size * (0.5 + Math.random() * 1.5);

			// Color variation
			const mixColor = Math.random() > 0.7 ? accentColor : baseColor;
			col[i * 3 + 0] = mixColor.r;
			col[i * 3 + 1] = mixColor.g;
			col[i * 3 + 2] = mixColor.b;
		}
		return { positions: pos, sizes: siz, colors: col };
	}, [count, radius, size, color, theme]);

	useFrame((state, delta) => {
		if (!ref.current) return;

		ref.current.rotation.y += delta * 0.04 * speed;
		ref.current.rotation.x += delta * 0.015 * speed;

		ref.current.rotation.x = THREE.MathUtils.lerp(
			ref.current.rotation.x,
			state.pointer.y * 0.08,
			0.03
		);
		ref.current.rotation.y += THREE.MathUtils.lerp(0, state.pointer.x * 0.03, 0.03);
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
				opacity={theme === 'light' ? 0.5 : 0.65}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</points>
	);
};

// Enhanced dynamic lights with better theme support
const DynamicLights = () => {
	const spot1 = useRef();
	const spot2 = useRef();
	const spot3 = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	useFrame((state) => {
		const time = state.clock.elapsedTime;

		if (spot1.current) {
			spot1.current.intensity = (theme === 'light' ? 1.0 : 1.3) + Math.sin(time * 0.5) * 0.3;
			spot1.current.position.x = Math.sin(time * 0.3) * 5 + 10;
		}

		if (spot2.current) {
			spot2.current.intensity = (theme === 'light' ? 0.7 : 0.9) + Math.cos(time * 0.4) * 0.2;
			spot2.current.position.x = Math.cos(time * 0.25) * 5 - 10;
		}

		if (spot3.current) {
			spot3.current.intensity = (theme === 'light' ? 0.5 : 0.6) + Math.sin(time * 0.6) * 0.2;
			spot3.current.position.z = Math.sin(time * 0.2) * 3;
		}
	});

	const lightColors = useMemo(() => {
		if (theme === 'light') {
			return {
				hemisphere: { sky: '#7c3aed', ground: '#fef3c7' },
				ambient: 0.8,
				spot1: '#60a5fa',
				spot2: '#a78bfa',
				spot3: '#f472b6',
				point: '#c084fc',
			};
		}
		return {
			hemisphere: { sky: '#38bdf8', ground: '#083344' },
			ambient: 0.5,
			spot1: '#38bdf8',
			spot2: '#818cf8',
			spot3: '#ec4899',
			point: '#a78bfa',
		};
	}, [theme]);

	// Adjust light intensity based on screen size
	const intensityMultiplier = breakpoint === 'mobile' ? 0.8 : 1.0;

	return (
		<>
			<ambientLight intensity={lightColors.ambient * intensityMultiplier} />
			<hemisphereLight
				skyColor={lightColors.hemisphere.sky}
				groundColor={lightColors.hemisphere.ground}
				intensity={(theme === 'light' ? 1.0 : 0.7) * intensityMultiplier}
			/>
			<spotLight
				ref={spot1}
				position={[10, 15, 10]}
				angle={0.35}
				penumbra={1}
				intensity={lightColors.ambient * intensityMultiplier}
				color={lightColors.spot1}
				castShadow
			/>
			<spotLight
				ref={spot2}
				position={[-10, 12, 5]}
				angle={0.4}
				penumbra={1}
				intensity={(theme === 'light' ? 0.8 : 0.9) * intensityMultiplier}
				color={lightColors.spot2}
			/>
			<spotLight
				ref={spot3}
				position={[0, 10, -8]}
				angle={0.5}
				penumbra={1}
				intensity={(theme === 'light' ? 0.6 : 0.7) * intensityMultiplier}
				color={lightColors.spot3}
			/>
			<pointLight
				position={[0, 5, -5]}
				intensity={(theme === 'light' ? 0.5 : 0.6) * intensityMultiplier}
				color={lightColors.point}
				distance={20}
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
					'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(139,92,246,.18), transparent)',
				radial2:
					'radial-gradient(circle at 25% 75%, rgba(96,165,250,.15), transparent 55%)',
				radial3:
					'radial-gradient(circle at 75% 25%, rgba(244,114,182,.12), transparent 50%)',
				fog: '#ede9fe',
				bottomFade:
					'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0.7), transparent)',
			};
		}
		return {
			radial1:
				'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(129,140,248,.2), transparent)',
			radial2: 'radial-gradient(circle at 25% 75%, rgba(56,189,248,.15), transparent 55%)',
			radial3: 'radial-gradient(circle at 75% 25%, rgba(236,72,153,.12), transparent 50%)',
			fog: '#0a1628',
			bottomFade:
				'linear-gradient(to top, rgba(3,7,18,0.98), rgba(3,7,18,0.85), transparent)',
		};
	}, [theme]);

	// Responsive particle configuration
	const particleConfig = useMemo(() => {
		const baseConfig = {
			mobile: [
				{ count: 600, size: 0.025, color: '#818cf8', speed: 0.3, radius: 30 },
				{ count: 400, size: 0.03, color: '#38bdf8', speed: 0.5, radius: 20 },
				{ count: 300, size: 0.035, color: '#a78bfa', speed: 0.7, radius: 15 },
			],
			tablet: [
				{ count: 900, size: 0.025, color: '#818cf8', speed: 0.3, radius: 32 },
				{ count: 650, size: 0.03, color: '#38bdf8', speed: 0.5, radius: 22 },
				{ count: 450, size: 0.035, color: '#a78bfa', speed: 0.7, radius: 16 },
			],
			desktop: [
				{ count: 1200, size: 0.025, color: '#818cf8', speed: 0.3, radius: 35 },
				{ count: 900, size: 0.03, color: '#38bdf8', speed: 0.5, radius: 25 },
				{ count: 600, size: 0.035, color: '#a78bfa', speed: 0.7, radius: 18 },
			],
		};
		return baseConfig[breakpoint];
	}, [breakpoint]);

	// Responsive camera configuration
	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 1.5, 12], fov: 55 };
			case 'tablet':
				return { position: [0, 2, 11], fov: 52 };
			default:
				return { position: [0, 2, 10], fov: 50 };
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
							? 'linear-gradient(to bottom, #ffffff, #faf5ff, #f3e8ff)'
							: 'linear-gradient(to bottom, #030712, #0b1220, #0f172a)',
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

			{/* Noise texture overlay for depth */}
			<div
				className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
					style={{ pointerEvents: 'auto' }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						toneMapping: THREE.ACESFilmicToneMapping,
						toneMappingExposure: theme === 'light' ? 1.1 : 1.3,
					}}
					dpr={[1, Math.min(window.devicePixelRatio, 2)]}
				>
					<fog
						attach="fog"
						args={[gradients.fog, 10, breakpoint === 'mobile' ? 45 : 55]}
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

			{/* Enhanced bottom fade with gradient */}
			<div
				className="absolute inset-x-0 bottom-0 h-80 pointer-events-none transition-all duration-500"
				style={{ background: gradients.bottomFade }}
			/>

			{/* Top subtle fade for better integration */}
			<div
				className="absolute inset-x-0 top-0 h-32 pointer-events-none transition-all duration-500"
				style={{
					background:
						theme === 'light'
							? 'linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)'
							: 'linear-gradient(to bottom, rgba(3,7,18,0.5), transparent)',
				}}
			/>
		</div>
	);
};

export default Background3D;

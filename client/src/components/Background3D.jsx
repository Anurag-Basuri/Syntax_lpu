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

// Enhanced 3D Logo with transparent background - Industry standard
const Logo3D = () => {
	const meshRef = useRef();
	const groupRef = useRef();
	const glowRef = useRef();
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
				return { scale: 3.2, yPosition: 1.8 };
			case 'tablet':
				return { scale: 4.2, yPosition: 2.2 };
			default:
				return { scale: 5.5, yPosition: 2.8 };
		}
	}, [breakpoint]);

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const time = state.clock.elapsedTime;

		if (meshRef.current) {
			// Ultra-smooth rotation with parallax
			const targetRotationY = (pointer.x * Math.PI) / 10;
			const targetRotationX = (-pointer.y * Math.PI) / 14;

			meshRef.current.rotation.y = THREE.MathUtils.lerp(
				meshRef.current.rotation.y,
				targetRotationY,
				0.08
			);
			meshRef.current.rotation.x = THREE.MathUtils.lerp(
				meshRef.current.rotation.x,
				targetRotationX,
				0.08
			);

			// Subtle breathing rotation
			meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.02;
		}

		if (groupRef.current) {
			// Gentle floating with sine wave
			groupRef.current.position.y = yPosition + Math.sin(time * 0.5) * 0.12;
		}

		if (glowRef.current) {
			// Pulsing glow effect
			const glowIntensity = 0.5 + Math.sin(time * 0.8) * 0.15;
			glowRef.current.scale.setScalar(1 + glowIntensity * 0.15);
			glowRef.current.material.opacity = (theme === 'light' ? 0.2 : 0.35) * glowIntensity;
		}
	});

	return (
		<Float
			speed={1.8}
			rotationIntensity={0.25}
			floatIntensity={0.4}
			floatingRange={[-0.08, 0.08]}
		>
			<group ref={groupRef} position={[0, yPosition, 0]}>
				<group ref={meshRef}>
					{/* Outer glow layer */}
					<mesh
						ref={glowRef}
						scale={[scale * aspect * 1.4, scale * 1.4, 1]}
						position={[0, 0, -0.2]}
						renderOrder={8}
					>
						<planeGeometry />
						<meshBasicMaterial
							transparent
							opacity={theme === 'light' ? 0.2 : 0.35}
							color={theme === 'light' ? '#8b5cf6' : '#60a5fa'}
							blending={THREE.AdditiveBlending}
							depthTest={false}
						/>
					</mesh>

					{/* Subtle ambient glow */}
					<mesh
						scale={[scale * aspect * 1.2, scale * 1.2, 1]}
						position={[0, 0, -0.15]}
						renderOrder={9}
					>
						<planeGeometry />
						<meshBasicMaterial
							transparent
							opacity={theme === 'light' ? 0.12 : 0.2}
							color={theme === 'light' ? '#a78bfa' : '#38bdf8'}
							blending={THREE.AdditiveBlending}
							depthTest={false}
						/>
					</mesh>

					{/* Main logo mesh - transparent background */}
					<mesh scale={[scale * aspect, scale, 1]} renderOrder={10}>
						<planeGeometry />
						<meshStandardMaterial
							map={texture}
							transparent={true}
							alphaTest={0.01} // Remove background artifacts
							side={THREE.DoubleSide}
							metalness={theme === 'light' ? 0.4 : 0.7}
							roughness={theme === 'light' ? 0.4 : 0.3}
							envMapIntensity={theme === 'light' ? 1.2 : 1.6}
							depthTest={false}
							depthWrite={false}
						/>
					</mesh>
				</group>
			</group>
		</Float>
	);
};

// Enhanced wave mesh with larger wavelengths and smoother transitions
const WaveMesh = () => {
	const meshRef = useRef();
	const theme = useTheme();
	const breakpoint = useResponsive();

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uAmplitude: { value: breakpoint === 'mobile' ? 1.2 : 1.8 },
			uFrequency: { value: 0.035 }, // Decreased for larger wavelengths
		}),
		[breakpoint]
	);

	useFrame((state) => {
		uniforms.uTime.value = state.clock.elapsedTime * 0.8; // Slower animation
	});

	// Enhanced theme-aware colors
	const colors = useMemo(() => {
		if (theme === 'light') {
			return {
				base: 'vec3(0.60, 0.64, 0.98)',
				highlight: 'vec3(0.38, 0.84, 0.99)',
				deep: 'vec3(0.32, 0.44, 0.92)',
				ambient: 'vec3(0.84, 0.87, 0.99)',
				accent: 'vec3(0.56, 0.38, 0.96)',
			};
		}
		return {
			base: 'vec3(0.12, 0.24, 0.54)',
			highlight: 'vec3(0.27, 0.77, 0.97)',
			deep: 'vec3(0.54, 0.57, 0.97)',
			ambient: 'vec3(0.08, 0.17, 0.44)',
			accent: 'vec3(0.40, 0.76, 0.99)',
		};
	}, [theme]);

	// Higher resolution geometry for smoother waves
	const geometryArgs = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return [120, 120, 140, 140];
			case 'tablet':
				return [140, 140, 170, 170];
			default:
				return [160, 160, 200, 200];
		}
	}, [breakpoint]);

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
                    varying vec3 vNormal;
                    varying vec3 vViewPosition;

                    // Simplex noise function
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
                        
                        // Large-scale smooth noise layers
                        float noise1 = snoise(pos.xy * 0.025 + uTime * 0.08) * 1.5;
                        float noise2 = snoise(pos.xy * 0.04 - uTime * 0.06) * 1.0;
                        float noise3 = snoise(pos.xy * 0.06 + uTime * 0.1) * 0.6;
                        
                        // Gentle, large wavelength patterns
                        float wave1 = sin(pos.x * uFrequency * 1.0 + uTime * 0.15) * uAmplitude * 1.0;
                        float wave2 = cos(pos.y * uFrequency * 0.8 + uTime * 0.12) * uAmplitude * 1.2;
                        float wave3 = sin((pos.x + pos.y) * uFrequency * 0.6 - uTime * 0.1) * uAmplitude * 0.8;
                        
                        // Smooth circular ripples
                        float dist = length(pos.xy);
                        float ripple1 = sin(dist * 0.06 - uTime * 0.2) * 1.0;
                        float ripple2 = cos(dist * 0.04 + uTime * 0.15) * 0.6;
                        
                        // Combine all effects with smooth blending
                        float combinedNoise = (noise1 + noise2 + noise3) * 0.5;
                        float combinedWaves = (wave1 + wave2 + wave3) * 0.6;
                        float combinedRipples = (ripple1 + ripple2) * 0.4;
                        
                        vElevation = (combinedNoise + combinedWaves + combinedRipples) * 0.9;
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
                        // Ultra-refined grid pattern - wider spacing
                        vec2 grid = abs(fract(vUv * 25.0 - 0.5) - 0.5) / fwidth(vUv * 25.0);
                        float line = min(grid.x, grid.y);
                        float gridPattern = 1.0 - min(line, 1.0);
                        
                        // Smooth grid lines
                        gridPattern = smoothstep(0.0, 0.5, gridPattern);
                        
                        // Enhanced theme-aware colors
                        vec3 baseColor = ${colors.base};
                        vec3 highlightColor = ${colors.highlight};
                        vec3 deepColor = ${colors.deep};
                        vec3 ambientColor = ${colors.ambient};
                        vec3 accentColor = ${colors.accent};
                        
                        // Smooth elevation-based coloring
                        float elevationFactor = clamp(vElevation * 0.45 + 0.5, 0.0, 1.0);
                        elevationFactor = smoothstep(0.0, 1.0, elevationFactor);
                        
                        vec3 color = mix(ambientColor, baseColor, elevationFactor);
                        color = mix(color, deepColor, smoothstep(0.3, 0.7, elevationFactor));
                        color = mix(color, highlightColor, smoothstep(0.6, 1.0, elevationFactor) * 0.6);
                        
                        // Subtle accent on peaks
                        float peakIntensity = smoothstep(0.7, 1.0, elevationFactor);
                        color = mix(color, accentColor, peakIntensity * 0.3);
                        
                        // Smooth Fresnel effect
                        vec3 viewDir = normalize(vViewPosition);
                        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);
                        fresnel = smoothstep(0.0, 1.0, fresnel);
                        color = mix(color, highlightColor, fresnel * 0.35);
                        
                        // Gentle edge fade
                        float centerDist = distance(vUv, vec2(0.5));
                        float edgeFade = 1.0 - smoothstep(0.2, 0.75, centerDist);
                        edgeFade = smoothstep(0.0, 1.0, edgeFade);
                        
                        // Smooth vertical gradient
                        float verticalGradient = smoothstep(0.0, 1.0, vUv.y) * 0.35;
                        
                        // Refined alpha calculation
                        float baseAlpha = 0.35 + verticalGradient;
                        float waveAlpha = smoothstep(-0.3, 1.0, vElevation) * 0.25;
                        float alpha = (gridPattern * edgeFade * baseAlpha) + waveAlpha;
                        
                        // Subtle grid glow
                        alpha += gridPattern * fresnel * peakIntensity * 0.15;
                        
                        // Smooth alpha transition
                        alpha = smoothstep(0.0, 1.0, alpha);
                        
                        gl_FragColor = vec4(color, alpha * 0.85);
                    }
                `}
			/>
		</mesh>
	);
};

// Refined particle system
const ParticleNebula = ({
	count = 1500,
	size = 0.025,
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

			siz[i] = size * (0.5 + Math.random() * 1.5);

			const colorChoice = Math.random();
			let mixColor;
			if (colorChoice > 0.85) mixColor = accentColor;
			else if (colorChoice > 0.65) mixColor = secondaryAccent;
			else mixColor = baseColor;

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
				opacity={theme === 'light' ? 0.6 : 0.75}
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
			spot1.current.intensity = (theme === 'light' ? 1.3 : 1.6) + Math.sin(time * 0.5) * 0.3;
			spot1.current.position.x = Math.sin(time * 0.3) * 5 + 14;
			spot1.current.position.y = 18 + Math.sin(time * 0.2) * 2;
		}

		if (spot2.current) {
			spot2.current.intensity = (theme === 'light' ? 1.0 : 1.2) + Math.cos(time * 0.4) * 0.25;
			spot2.current.position.x = Math.cos(time * 0.25) * 5 - 14;
			spot2.current.position.y = 16 + Math.cos(time * 0.25) * 2;
		}

		if (spot3.current) {
			spot3.current.intensity = (theme === 'light' ? 0.8 : 0.9) + Math.sin(time * 0.6) * 0.2;
			spot3.current.position.z = Math.sin(time * 0.2) * 3;
		}

		if (point1.current) {
			point1.current.intensity =
				(theme === 'light' ? 0.7 : 0.8) + Math.sin(time * 0.7) * 0.15;
			point1.current.position.y = 8 + Math.sin(time * 0.4) * 1.5;
		}
	});

	const lightColors = useMemo(() => {
		if (theme === 'light') {
			return {
				hemisphere: { sky: '#7c3aed', ground: '#fef3c7' },
				ambient: 1.0,
				spot1: '#60a5fa',
				spot2: '#a78bfa',
				spot3: '#f472b6',
				point: '#c084fc',
			};
		}
		return {
			hemisphere: { sky: '#38bdf8', ground: '#083344' },
			ambient: 0.7,
			spot1: '#38bdf8',
			spot2: '#818cf8',
			spot3: '#ec4899',
			point: '#a78bfa',
		};
	}, [theme]);

	const intensityMultiplier = breakpoint === 'mobile' ? 0.9 : 1.0;

	return (
		<>
			<ambientLight intensity={lightColors.ambient * intensityMultiplier} />
			<hemisphereLight
				skyColor={lightColors.hemisphere.sky}
				groundColor={lightColors.hemisphere.ground}
				intensity={(theme === 'light' ? 1.3 : 0.9) * intensityMultiplier}
			/>
			<spotLight
				ref={spot1}
				position={[14, 18, 14]}
				angle={0.35}
				penumbra={1}
				intensity={(theme === 'light' ? 1.3 : 1.6) * intensityMultiplier}
				color={lightColors.spot1}
				castShadow
			/>
			<spotLight
				ref={spot2}
				position={[-14, 16, 8]}
				angle={0.4}
				penumbra={1}
				intensity={(theme === 'light' ? 1.0 : 1.2) * intensityMultiplier}
				color={lightColors.spot2}
			/>
			<spotLight
				ref={spot3}
				position={[0, 14, -12]}
				angle={0.45}
				penumbra={1}
				intensity={(theme === 'light' ? 0.8 : 0.9) * intensityMultiplier}
				color={lightColors.spot3}
			/>
			<pointLight
				ref={point1}
				position={[0, 8, -8]}
				intensity={(theme === 'light' ? 0.7 : 0.8) * intensityMultiplier}
				color={lightColors.point}
				distance={30}
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
					'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(139,92,246,.18), transparent)',
				radial2:
					'radial-gradient(circle at 15% 85%, rgba(96,165,250,.15), transparent 65%)',
				radial3:
					'radial-gradient(circle at 85% 15%, rgba(244,114,182,.12), transparent 60%)',
				fog: '#f3e8ff',
				bottomFade:
					'linear-gradient(to top, rgba(255,255,255,0.98), rgba(255,255,255,0.8), transparent)',
			};
		}
		return {
			radial1:
				'radial-gradient(ellipse 80% 70% at 50% 30%, rgba(129,140,248,.22), transparent)',
			radial2: 'radial-gradient(circle at 15% 85%, rgba(56,189,248,.16), transparent 65%)',
			radial3: 'radial-gradient(circle at 85% 15%, rgba(236,72,153,.13), transparent 60%)',
			fog: '#0f172a',
			bottomFade: 'linear-gradient(to top, rgba(3,7,18,0.98), rgba(3,7,18,0.9), transparent)',
		};
	}, [theme]);

	// Optimized particle configuration
	const particleConfig = useMemo(() => {
		const baseConfig = {
			mobile: [
				{ count: 800, size: 0.025, color: '#818cf8', speed: 0.3, radius: 34 },
				{ count: 550, size: 0.03, color: '#38bdf8', speed: 0.5, radius: 24 },
				{ count: 400, size: 0.035, color: '#a78bfa', speed: 0.7, radius: 17 },
			],
			tablet: [
				{ count: 1100, size: 0.025, color: '#818cf8', speed: 0.3, radius: 37 },
				{ count: 800, size: 0.03, color: '#38bdf8', speed: 0.5, radius: 27 },
				{ count: 550, size: 0.035, color: '#a78bfa', speed: 0.7, radius: 19 },
			],
			desktop: [
				{ count: 1500, size: 0.025, color: '#818cf8', speed: 0.3, radius: 40 },
				{ count: 1100, size: 0.03, color: '#38bdf8', speed: 0.5, radius: 30 },
				{ count: 750, size: 0.035, color: '#a78bfa', speed: 0.7, radius: 22 },
			],
		};
		return baseConfig[breakpoint];
	}, [breakpoint]);

	// Optimized camera configuration
	const cameraConfig = useMemo(() => {
		switch (breakpoint) {
			case 'mobile':
				return { position: [0, 3, 15], fov: 62 };
			case 'tablet':
				return { position: [0, 3.5, 13], fov: 58 };
			default:
				return { position: [0, 4, 12], fov: 54 };
		}
	}, [breakpoint]);

	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Enhanced base gradient */}
			<div
				className="absolute inset-0 transition-all duration-700 ease-in-out"
				style={{
					background:
						theme === 'light'
							? 'linear-gradient(to bottom, #ffffff 0%, #faf5ff 30%, #f3e8ff 70%, #ede9fe 100%)'
							: 'linear-gradient(to bottom, #030712 0%, #0b1220 30%, #0f172a 70%, #1e293b 100%)',
				}}
			/>

			{/* Refined radial gradients */}
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-700"
				style={{ background: gradients.radial1 }}
			/>
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-700"
				style={{ background: gradients.radial2 }}
			/>
			<div
				className="absolute inset-0 opacity-100 transition-opacity duration-700"
				style={{ background: gradients.radial3 }}
			/>

			{/* Subtle noise texture */}
			<div
				className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
					backgroundSize: '200px 200px',
				}}
			/>

			<Suspense fallback={null}>
				<Canvas
					camera={{
						position: cameraConfig.position,
						fov: cameraConfig.fov,
						near: 0.1,
						far: 150,
					}}
					style={{ pointerEvents: 'auto' }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						toneMapping: THREE.ACESFilmicToneMapping,
						toneMappingExposure: theme === 'light' ? 1.2 : 1.4,
					}}
					dpr={[1, Math.min(window.devicePixelRatio, 2)]}
				>
					<fog
						attach="fog"
						args={[gradients.fog, 15, breakpoint === 'mobile' ? 55 : 65]}
					/>

					<DynamicLights />
					<Logo3D />
					<WaveMesh />

					{particleConfig.map((config, index) => (
						<ParticleNebula key={index} {...config} />
					))}
				</Canvas>
			</Suspense>

			{/* Enhanced bottom fade */}
			<div
				className="absolute inset-x-0 bottom-0 h-[30rem] pointer-events-none transition-all duration-700"
				style={{ background: gradients.bottomFade }}
			/>

			{/* Refined top fade */}
			<div
				className="absolute inset-x-0 top-0 h-48 pointer-events-none transition-all duration-700"
				style={{
					background:
						theme === 'light'
							? 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.4), transparent)'
							: 'linear-gradient(to bottom, rgba(3,7,18,0.7), rgba(3,7,18,0.3), transparent)',
				}}
			/>
		</div>
	);
};

export default Background3D;

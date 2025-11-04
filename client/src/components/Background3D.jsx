import { useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../assets/logo.png';

// Enhanced 3D Logo with premium material
const Logo3D = () => {
	const ref = useRef();
	const texture = useTexture(logo);
	const { gl } = useThree();

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
	const scale = 4.5; // Slightly increased scale for more presence

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const time = state.clock.elapsedTime;

		if (ref.current) {
			// Smooth mouse tracking
			ref.current.rotation.y = THREE.MathUtils.lerp(
				ref.current.rotation.y,
				(pointer.x * Math.PI) / 10,
				0.08
			);
			ref.current.rotation.x = THREE.MathUtils.lerp(
				ref.current.rotation.x,
				(-pointer.y * Math.PI) / 10,
				0.08
			);
			// Subtle continuous rotation
			ref.current.rotation.z = Math.sin(time * 0.1) * 0.02;
		}
	});

	return (
		<Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.7}>
			{/* The Y position is raised to lift the logo higher in the viewport */}
			<group ref={ref} position={[0, 1.2, 0]}>
				<mesh scale={[scale * aspect, scale, 1]} renderOrder={10}>
					<planeGeometry />
					<meshPhysicalMaterial
						map={texture}
						transparent={true}
						metalness={0.9}
						roughness={0.2}
						clearcoat={1.0}
						clearcoatRoughness={0.2}
						reflectivity={0.8}
						ior={1.5}
						transmission={0.1}
						thickness={0.5}
						depthTest={false}
					/>
				</mesh>
			</group>
		</Float>
	);
};

// Advanced cloth simulation with Perlin noise
const WaveMesh = () => {
	const meshRef = useRef();
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uAmplitude: { value: 1.5 },
			uFrequency: { value: 0.5 },
		}),
		[]
	);

	useFrame((state) => {
		uniforms.uTime.value = state.clock.elapsedTime;
	});

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
			<planeGeometry args={[100, 100, 150, 150]} />
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

                    // Improved noise function for organic movement
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
                        
                        // Multi-layered noise for realistic cloth movement
                        float noise1 = snoise(pos.xy * 0.08 + uTime * 0.15) * 1.2;
                        float noise2 = snoise(pos.xy * 0.15 - uTime * 0.1) * 0.8;
                        float noise3 = snoise(pos.xy * 0.25 + uTime * 0.2) * 0.5;
                        
                        // Combine waves for billowing effect
                        float wave1 = sin(pos.x * uFrequency * 0.1 + uTime * 0.3) * uAmplitude * 0.6;
                        float wave2 = cos(pos.y * uFrequency * 0.08 + uTime * 0.25) * uAmplitude * 0.8;
                        float ripple = sin(length(pos.xy) * 0.15 - uTime * 0.4) * 0.6;
                        
                        vElevation = (noise1 + noise2 + noise3 + wave1 + wave2 + ripple) * 0.7;
                        pos.z += vElevation;
                        
                        // Calculate normal for better lighting
                        vNormal = normalize(normalMatrix * normal);
                        
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
				fragmentShader={`
                    varying vec2 vUv;
                    varying float vElevation;
                    varying vec3 vNormal;
                    
                    void main() {
                        // Grid pattern
                        vec2 grid = abs(fract(vUv * 25.0 - 0.5) - 0.5) / fwidth(vUv * 25.0);
                        float line = min(grid.x, grid.y);
                        float gridPattern = 1.0 - min(line, 1.0);
                        
                        // Dynamic color based on elevation and lighting
                        vec3 baseColor = vec3(0.05, 0.35, 0.75);
                        vec3 highlightColor = vec3(0.15, 0.65, 1.0);
                        vec3 deepColor = vec3(0.02, 0.2, 0.5);
                        
                        // Mix colors based on elevation
                        vec3 color = mix(deepColor, baseColor, clamp(vElevation * 0.5 + 0.5, 0.0, 1.0));
                        color = mix(color, highlightColor, clamp(vElevation * 0.8, 0.0, 1.0));
                        
                        // Edge fade with smoother transition
                        float edgeFade = 1.0 - smoothstep(0.25, 0.55, distance(vUv, vec2(0.5)));
                        
                        // Add subtle gradient based on position
                        float gradient = smoothstep(0.0, 1.0, vUv.y) * 0.3;
                        
                        float alpha = gridPattern * edgeFade * (0.3 + gradient);
                        
                        gl_FragColor = vec4(color, alpha);
                    }
                `}
			/>
		</mesh>
	);
};

// Enhanced particle system with twinkling effect
const ParticleNebula = ({
	count = 1500,
	size = 0.03,
	color = '#5881b3',
	speed = 0.5,
	radius = 40,
}) => {
	const ref = useRef();

	const { positions, sizes, randoms } = useMemo(() => {
		const pos = new Float32Array(count * 3);
		const siz = new Float32Array(count);
		const rand = new Float32Array(count);

		for (let i = 0; i < count; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = radius * Math.cbrt(Math.random());

			pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			pos[i * 3 + 2] = r * Math.cos(phi);

			// Varied particle sizes
			siz[i] = size * (0.5 + Math.random() * 1.5);
			rand[i] = Math.random() * Math.PI * 2;
		}
		return { positions: pos, sizes: siz, randoms: rand };
	}, [count, radius, size]);

	useFrame((state, delta) => {
		if (!ref.current) return;

		// Gentle rotation
		ref.current.rotation.y += delta * 0.04 * speed;
		ref.current.rotation.x += delta * 0.015 * speed;

		// Subtle parallax effect
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
			</bufferGeometry>
			<pointsMaterial
				size={size}
				color={color}
				transparent
				opacity={0.65}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				vertexColors={false}
			/>
		</points>
	);
};

// Dynamic animated lights
const DynamicLights = () => {
	const spot1 = useRef();
	const spot2 = useRef();

	useFrame((state) => {
		const time = state.clock.elapsedTime;

		if (spot1.current) {
			spot1.current.intensity = 1.2 + Math.sin(time * 0.5) * 0.3;
			spot1.current.position.x = Math.sin(time * 0.3) * 5 + 10;
		}

		if (spot2.current) {
			spot2.current.intensity = 0.8 + Math.cos(time * 0.4) * 0.2;
			spot2.current.position.x = Math.cos(time * 0.25) * 5 - 10;
		}
	});

	return (
		<>
			<ambientLight intensity={0.4} />
			<hemisphereLight skyColor="#0ea5e9" groundColor="#030712" intensity={0.6} />
			<spotLight
				ref={spot1}
				position={[10, 15, 10]}
				angle={0.35}
				penumbra={1}
				intensity={1.2}
				color="#0ea5e9"
				castShadow
			/>
			<spotLight
				ref={spot2}
				position={[-10, 12, 5]}
				angle={0.4}
				penumbra={1}
				intensity={0.8}
				color="#2563eb"
			/>
			<pointLight position={[0, 5, -5]} intensity={0.5} color="#60a5fa" distance={20} />
		</>
	);
};

const Background3D = () => {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Enhanced gradient layers */}
			<div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-soft to-bg-base" />
			<div
				className="absolute inset-0 opacity-25"
				style={{
					background:
						'radial-gradient(ellipse 65% 55% at 50% 45%, rgba(14,165,233,.18), transparent)',
				}}
			/>
			<div
				className="absolute inset-0 opacity-15"
				style={{
					background:
						'radial-gradient(circle at 20% 80%, rgba(59,130,246,.12), transparent 50%)',
				}}
			/>

			<Suspense fallback={null}>
				<Canvas
					camera={{ position: [0, 2, 10], fov: 50, near: 0.1, far: 100 }}
					style={{ pointerEvents: 'auto' }}
					gl={{
						antialias: true,
						alpha: true,
						powerPreference: 'high-performance',
						toneMapping: THREE.ACESFilmicToneMapping,
						toneMappingExposure: 1.2,
					}}
					dpr={[1, 2]}
				>
					<fog attach="fog" args={['#030712', 8, 55]} />

					<DynamicLights />

					<Logo3D />
					<WaveMesh />

					{/* Optimized particle layers with better distribution */}
					<ParticleNebula
						count={1200}
						size={0.02}
						color="#3b82f6"
						speed={0.3}
						radius={35}
					/>
					<ParticleNebula
						count={900}
						size={0.028}
						color="#0ea5e9"
						speed={0.5}
						radius={25}
					/>
					<ParticleNebula
						count={600}
						size={0.035}
						color="#60a5fa"
						speed={0.7}
						radius={18}
					/>
				</Canvas>
			</Suspense>

			{/* Enhanced bottom fade */}
			<div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg-base via-bg-base/90 to-transparent pointer-events-none" />
		</div>
	);
};

export default Background3D;

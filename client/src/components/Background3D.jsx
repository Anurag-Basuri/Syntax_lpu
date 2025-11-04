import { useRef, Suspense, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import logo from '../assets/logo.png';

// Enhanced 3D Logo using your PNG texture
const Logo3D = () => {
	const ref = useRef();
	const glowRef = useRef();
	const texture = useTexture(logo);
	const { gl } = useThree();

	// Configure texture for crispness and correct color space
	useEffect(() => {
		if (!texture) return;
		texture.colorSpace = THREE.SRGBColorSpace;
		texture.anisotropy = gl.capabilities.getMaxAnisotropy?.() || 8;
		texture.minFilter = THREE.LinearMipmapLinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.needsUpdate = true;
	}, [texture, gl]);

	const aspect = texture?.image ? texture.image.width / texture.image.height : 1;
	const scale = 3.6;

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		const time = state.clock.elapsedTime;

		if (ref.current) {
			ref.current.rotation.y = THREE.MathUtils.lerp(
				ref.current.rotation.y,
				(pointer.x * Math.PI) / 12,
				0.06
			);
			ref.current.rotation.x = THREE.MathUtils.lerp(
				ref.current.rotation.x,
				(-pointer.y * Math.PI) / 12,
				0.06
			);
		}
		if (glowRef.current) {
			glowRef.current.material.opacity = 0.28 + Math.sin(time * 0.6) * 0.14;
		}
	});

	return (
		<Float speed={1.15} rotationIntensity={0.35} floatIntensity={0.65}>
			<group ref={ref} position={[0, 0.55, 0]}>
				{/* Main logo plane (physical material for better highlights) */}
				<mesh scale={[scale * aspect, scale, 0.02]} renderOrder={2}>
					<planeGeometry />
					<meshPhysicalMaterial
						map={texture}
						transparent
						metalness={0.85}
						roughness={0.28}
						clearcoat={0.6}
						clearcoatRoughness={0.4}
						ior={1.2}
						depthTest
						depthWrite
					/>
				</mesh>

				{/* Soft halo behind logo (no post-processing) */}
				<mesh
					ref={glowRef}
					scale={[scale * aspect * 1.18, scale * 1.18, 1]}
					position={[0, 0, -0.12]}
					renderOrder={1}
				>
					<planeGeometry />
					<meshBasicMaterial
						color="#0ea5e9"
						transparent
						opacity={0.3}
						blending={THREE.AdditiveBlending}
						depthWrite={false}
					/>
				</mesh>
			</group>
		</Float>
	);
};

// Dynamic, reactive wave mesh (shader)
const WaveMesh = () => {
	const meshRef = useRef();
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uMouse: { value: new THREE.Vector2(0, 0) },
		}),
		[]
	);

	useFrame((state) => {
		const pointer = state.pointer ?? { x: 0, y: 0 };
		uniforms.uTime.value = state.clock.elapsedTime;
		uniforms.uMouse.value.lerp(new THREE.Vector2(pointer.x, pointer.y), 0.05);
	});

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
			<planeGeometry args={[80, 80, 128, 128]} />
			<shaderMaterial
				transparent
				side={THREE.DoubleSide}
				uniforms={uniforms}
				vertexShader={`
                    #extension GL_OES_standard_derivatives : enable
                    uniform float uTime;
                    uniform vec2 uMouse;
                    varying vec2 vUv;
                    varying float vElevation;
                    void main() {
                        vUv = uv;
                        vec3 pos = position;
                        float wave1 = sin(pos.x * 0.30 + uTime * 0.50) * 0.50;
                        float wave2 = sin(pos.y * 0.22 + uTime * 0.35) * 0.45;
                        float wave3 = sin((pos.x + pos.y) * 0.16 + uTime * 0.42) * 0.30;
                        vec2 mouseInfluence = uMouse * 10.0;
                        float mouseDist = distance(pos.xy, mouseInfluence);
                        float mouseWave = sin(mouseDist * 0.5 - uTime * 2.0) * exp(-mouseDist * 0.1) * 2.0;
                        vElevation = wave1 + wave2 + wave3 + mouseWave;
                        pos.z += vElevation;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
				fragmentShader={`
                    #extension GL_OES_standard_derivatives : enable
                    varying vec2 vUv;
                    varying float vElevation;
                    void main() {
                        vec2 g = abs(fract(vUv * 20.0 - 0.5) - 0.5) / fwidth(vUv * 20.0);
                        float line = min(g.x, g.y);
                        float gridPattern = 1.0 - min(line, 1.0);
                        vec3 color1 = vec3(0.05, 0.40, 0.80);
                        vec3 color2 = vec3(0.10, 0.60, 1.00);
                        vec3 color = mix(color1, color2, clamp(vElevation * 0.5 + 0.5, 0.0, 1.0));
                        float edgeFade = 1.0 - smoothstep(0.3, 0.52, distance(vUv, vec2(0.5)));
                        float alpha = gridPattern * edgeFade * 0.35;
                        gl_FragColor = vec4(color, alpha);
                    }
                `}
			/>
		</mesh>
	);
};

// Multi-layered particle field for depth
const ParticleNebula = ({
	count = 2200,
	size = 0.035,
	color = '#5881b3',
	speed = 0.5,
	radius = 45,
}) => {
	const ref = useRef();
	const positions = useMemo(() => {
		const pos = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const r = radius * Math.cbrt(Math.random());
			pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
			pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
			pos[i * 3 + 2] = r * Math.cos(phi);
		}
		return pos;
	}, [count, radius]);

	useFrame((state, delta) => {
		if (!ref.current) return;
		ref.current.rotation.y += delta * 0.06 * speed;
		ref.current.rotation.x += delta * 0.02 * speed;
		// Parallax
		ref.current.rotation.x = THREE.MathUtils.lerp(
			ref.current.rotation.x,
			state.pointer.y * 0.1,
			0.05
		);
		ref.current.rotation.y += THREE.MathUtils.lerp(0, state.pointer.x * 0.05, 0.05);
	});

	return (
		<points ref={ref}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={positions.length / 3}
					array={positions}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={size}
				color={color}
				transparent
				opacity={0.6}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
				depthWrite={false}
			/>
		</points>
	);
};

// Subtle floating orbs for extra depth cues
const FloatingOrbs = () => {
	const orbs = useMemo(
		() =>
			Array.from({ length: 8 }, () => ({
				position: [
					(Math.random() - 0.5) * 20,
					Math.random() * 10 - 2,
					(Math.random() - 0.5) * 20,
				],
				scale: Math.random() * 0.3 + 0.1,
				speed: Math.random() * 0.5 + 0.3,
			})),
		[]
	);

	return (
		<>
			{orbs.map((o, i) => (
				<Float key={i} speed={o.speed} rotationIntensity={0.2} floatIntensity={1}>
					<mesh position={o.position} scale={o.scale} renderOrder={0}>
						<sphereGeometry args={[1, 16, 16]} />
						<meshStandardMaterial
							color="#0ea5e9"
							emissive="#0ea5e9"
							emissiveIntensity={0.4}
							transparent
							opacity={0.28}
							roughness={0.25}
							metalness={0.75}
							depthWrite={false}
							blending={THREE.AdditiveBlending}
						/>
					</mesh>
				</Float>
			))}
		</>
	);
};

const Background3D = () => {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
			{/* Base gradients */}
			<div className="absolute inset-0 bg-gradient-to-b from-bg-base via-bg-soft to-bg-base" />
			<div
				className="absolute inset-0 opacity-30"
				style={{
					background:
						'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(14,165,233,.15), transparent)',
				}}
			/>

			<Suspense fallback={null}>
				<Canvas
					camera={{ position: [0, 2, 10], fov: 50, near: 0.1, far: 100 }}
					style={{ pointerEvents: 'auto' }}
					gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
					dpr={[1, 2]}
					shadows
				>
					<fog attach="fog" args={['#030712', 5, 50]} />

					{/* Lighting rig */}
					<ambientLight intensity={0.35} />
					<hemisphereLight skyColor="#0ea5e9" groundColor="#030712" intensity={0.5} />
					<spotLight
						position={[10, 15, 10]}
						angle={0.32}
						penumbra={1}
						intensity={1.4}
						castShadow
					/>
					<pointLight position={[-10, 5, -10]} intensity={0.45} color="#2563eb" />

					{/* Scene content */}
					<Logo3D />
					<WaveMesh />
					<FloatingOrbs />
					<ParticleNebula
						count={1800}
						size={0.025}
						color="#3b82f6"
						speed={0.35}
						radius={38}
					/>
					<ParticleNebula
						count={1400}
						size={0.032}
						color="#0ea5e9"
						speed={0.55}
						radius={28}
					/>
					<ParticleNebula
						count={900}
						size={0.04}
						color="#5881b3"
						speed={0.75}
						radius={22}
					/>
				</Canvas>
			</Suspense>

			<div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent pointer-events-none" />
		</div>
	);
};

export default Background3D;

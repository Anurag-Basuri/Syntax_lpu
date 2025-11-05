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
	try {
		const canvas = document.createElement('canvas');
		return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'));
	} catch {
		return false;
	}
};

// --- R3F Scene Components ---

// Faint, anti-aliased animated grid (Next.js vibe)
const Grid = ({ theme }) => {
	const meshRef = useRef();

	const prefersReduced = useMemo(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return false;
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	}, []);

	const uniforms = useMemo(() => {
		const isLight = theme === 'light';
		// Cloth-like colors with higher contrast
		const minorHex = isLight ? '#64748b' : '#cbd5e1';
		const majorHex = isLight ? '#334155' : '#e2e8f0';

		return {
			uTime: { value: 0 },
			uMinorColor: { value: new THREE.Color(minorHex) },
			uMajorColor: { value: new THREE.Color(majorHex) },
			uMinorSize: { value: 28.0 },
			uMajorEvery: { value: 6.0 },
			uMinorWidth: { value: 0.018 },
			uMajorWidth: { value: 0.032 },
			uFadeNear: { value: 0.28 },
			uFadeFar: { value: 0.9 },
			uMinorAlpha: { value: isLight ? 0.38 : 0.42 },
			uMajorAlpha: { value: isLight ? 0.72 : 0.78 },
			uSpeed: { value: prefersReduced ? 0.0 : 0.018 },
			// Cloth texture parameters
			uClothFreq: { value: 0.8 },
			uClothAmp: { value: 0.15 },
			// Wave parameters
			uWaveAmp: { value: 0.35 },
			uWaveFreq: { value: 0.25 },
			uWaveSpeed: { value: prefersReduced ? 0.0 : 0.5 },
		};
	}, [theme, prefersReduced]);

	useFrame((state) => {
		const { clock, pointer } = state;
		uniforms.uTime.value = clock.elapsedTime;

		// Smooth 3D parallax tilt with cloth-like sway
		if (meshRef.current && !prefersReduced) {
			const targetRotY = THREE.MathUtils.degToRad(5 * (pointer.x || 0));
			const targetRotZ = THREE.MathUtils.degToRad(3.5 * (pointer.y || 0));

			// Add subtle wave motion for cloth effect
			const wave = Math.sin(clock.elapsedTime * 0.3) * 0.008;

			meshRef.current.rotation.y = THREE.MathUtils.damp(
				meshRef.current.rotation.y,
				targetRotY + wave,
				3.2,
				0.016
			);
			meshRef.current.rotation.z = THREE.MathUtils.damp(
				meshRef.current.rotation.z,
				targetRotZ,
				3.2,
				0.016
			);
		}
	});

	return (
		<mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -10, 0]} renderOrder={-2}>
			<planeGeometry args={[1000, 1000, 64, 64]} />
			<shaderMaterial
				transparent
				depthWrite={false}
				extensions={{ derivatives: true }}
				uniforms={uniforms}
				vertexShader={`
                    uniform float uTime;
                    uniform float uWaveAmp;
                    uniform float uWaveFreq;
                    uniform float uWaveSpeed;
                    varying vec3 vWorldPosition;
                    varying vec3 vNormal;
                    
                    void main() {
                        vec3 pos = position;
                        
                        // Cloth wave deformation
                        float wave1 = sin(pos.x * uWaveFreq + uTime * uWaveSpeed) * uWaveAmp;
                        float wave2 = cos(pos.y * uWaveFreq * 0.8 + uTime * uWaveSpeed * 0.7) * uWaveAmp * 0.6;
                        pos.z += wave1 + wave2;
                        
                        // Calculate normal for lighting
                        vec3 tangent = vec3(1.0, 0.0, cos(pos.x * uWaveFreq + uTime * uWaveSpeed) * uWaveAmp * uWaveFreq);
                        vec3 bitangent = vec3(0.0, 1.0, -sin(pos.y * uWaveFreq * 0.8 + uTime * uWaveSpeed * 0.7) * uWaveAmp * 0.6 * uWaveFreq * 0.8);
                        vNormal = normalize(cross(tangent, bitangent));
                        
                        vWorldPosition = (modelMatrix * vec4(pos, 1.0)).xyz;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                    }
                `}
				fragmentShader={`
                    #ifdef GL_OES_standard_derivatives
                    #extension GL_OES_standard_derivatives : enable
                    #endif
                    precision mediump float;
                    
                    varying vec3 vWorldPosition;
                    varying vec3 vNormal;
                    uniform float uTime;
                    uniform vec3  uMinorColor;
                    uniform vec3  uMajorColor;
                    uniform float uMinorSize;
                    uniform float uMajorEvery;
                    uniform float uMinorWidth;
                    uniform float uMajorWidth;
                    uniform float uFadeNear;
                    uniform float uFadeFar;
                    uniform float uMinorAlpha;
                    uniform float uMajorAlpha;
                    uniform float uSpeed;
                    uniform float uClothFreq;
                    uniform float uClothAmp;

                    // Simple noise for cloth texture
                    float hash(vec2 p) {
                        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
                    }

                    float noise(vec2 p) {
                        vec2 i = floor(p);
                        vec2 f = fract(p);
                        f = f * f * (3.0 - 2.0 * f);
                        float a = hash(i);
                        float b = hash(i + vec2(1.0, 0.0));
                        float c = hash(i + vec2(0.0, 1.0));
                        float d = hash(i + vec2(1.0, 1.0));
                        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                    }

                    // Anti-aliased line function
                    float aafLine(float v, float width) {
                        float dv = fwidth(v);
                        float d = abs(fract(v) - 0.5);
                        return 1.0 - smoothstep(0.5 - width - dv, 0.5 + width + dv, d);
                    }

                    void main() {
                        // Minor grid UV with animation
                        vec2 uvMinor = vWorldPosition.xz / uMinorSize;
                        uvMinor.y += uTime * uSpeed;

                        // Add cloth texture variation
                        float clothNoise = noise(uvMinor * uClothFreq + uTime * 0.05);
                        float clothVariation = clothNoise * uClothAmp;

                        // Minor grid lines with cloth texture
                        float gxMinor = aafLine(uvMinor.x, uMinorWidth + clothVariation * 0.003);
                        float gyMinor = aafLine(uvMinor.y, uMinorWidth + clothVariation * 0.003);
                        float minorGrid = max(gxMinor, gyMinor);

                        // Major grid UV (weave pattern)
                        vec2 uvMajor = vWorldPosition.xz / (uMinorSize * uMajorEvery);
                        uvMajor.y += uTime * uSpeed;

                        // Major grid lines (cloth weave)
                        float gxMajor = aafLine(uvMajor.x, uMajorWidth + clothVariation * 0.005);
                        float gyMajor = aafLine(uvMajor.y, uMajorWidth + clothVariation * 0.005);
                        float majorGrid = max(gxMajor, gyMajor);

                        // Cloth texture overlay with wave-based variation
                        float clothPattern = noise(vWorldPosition.xz * 0.15 + uTime * 0.02) * 0.12;
                        
                        // Simple lighting from wave normal
                        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
                        float lighting = max(0.0, dot(vNormal, lightDir)) * 0.3 + 0.7;

                        // Distance-based fade (keep center clear for logo)
                        float dist = length(vWorldPosition.xz) / 140.0;
                        float fade = 1.0 - smoothstep(uFadeNear, uFadeFar, dist);

                        // Compose colors with cloth texture and lighting
                        vec3 color = (uMinorColor * (minorGrid * uMinorAlpha + clothPattern * 0.3) + 
                                      uMajorColor * (majorGrid * uMajorAlpha + clothPattern * 0.2)) * lighting;
                        
                        float alpha = max(
                            minorGrid * uMinorAlpha + clothPattern * 0.15,
                            majorGrid * uMajorAlpha + clothPattern * 0.12
                        ) * fade * lighting;

                        if (alpha <= 0.003) discard;
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
		uniforms.uTime.value = state.clock.elapsedTime;
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
					gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
					dpr={[1, Math.min(1.5, window.devicePixelRatio || 1)]}
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
					}}
				>
					<Glows theme={theme} />
					<Grid theme={theme} />
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

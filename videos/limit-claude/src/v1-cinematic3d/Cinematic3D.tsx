import {Environment, Lightformer} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN_OUT, EASE_OUT, f, prog, rand, WORD} from '../shared/timing';

const AMBER = new THREE.Color('#ff8a3d');
const AMBER_DEEP = new THREE.Color('#d9571f');

// ---------- helpers ----------
const kf = (frame: number, frames: number[], values: number[], easing = EASE_IN_OUT) =>
	interpolate(frame, frames, values, {...clamp, easing});

const useHaloTexture = () =>
	useMemo(() => {
		const c = document.createElement('canvas');
		c.width = c.height = 256;
		const g = c.getContext('2d')!;
		const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
		grd.addColorStop(0, 'rgba(255,255,255,1)');
		grd.addColorStop(0.25, 'rgba(255,255,255,0.45)');
		grd.addColorStop(0.6, 'rgba(255,255,255,0.08)');
		grd.addColorStop(1, 'rgba(255,255,255,0)');
		g.fillStyle = grd;
		g.fillRect(0, 0, 256, 256);
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		return t;
	}, []);

const Halo: React.FC<{
	position: [number, number, number];
	size: number;
	opacity: number;
	color?: THREE.Color | string;
	tex: THREE.Texture;
}> = ({position, size, opacity, color = AMBER, tex}) => (
	<sprite position={position} scale={[size, size, 1]}>
		<spriteMaterial
			map={tex}
			color={color}
			transparent
			opacity={opacity}
			blending={THREE.AdditiveBlending}
			depthWrite={false}
		/>
	</sprite>
);

// ---------- camera ----------
const CameraRig: React.FC<{frame: number}> = ({frame}) => {
	const {camera} = useThree();
	const F = [0, 92, 116, 156, 184, 292, 300, 336, 356, 449];
	const px = kf(frame, F, [0.9, 0.25, 0.1, 0.0, 1.7, -1.6, -1.0, 0.0, -0.9, 0.8]);
	const py = kf(frame, F, [0.3, 0.1, 0.1, 0.0, 1.9, 1.65, 1.5, 1.3, 0.1, 0.2]);
	const pz = kf(frame, F, [7.6, 6.9, 7.1, 9.2, 5.0, 4.9, 4.6, 4.15, 7.4, 6.9]);
	const tx = kf(frame, F, [0, 0, 0, 0, 0, 0, 0, 0, -0.2, 0.2]);
	const ty = kf(frame, F, [-0.24, -0.24, -0.24, -0.15, 0.78, 0.78, 0.82, 0.9, -0.85, -0.85]);
	const tz = kf(frame, F, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	const roll = kf(frame, [0, 90, 118], [-0.06, -0.015, 0]);
	useLayoutEffect(() => {
		camera.position.set(px, py, pz);
		camera.up.set(Math.sin(roll), Math.cos(roll), 0);
		camera.lookAt(tx, ty, tz);
		camera.updateProjectionMatrix();
	}, [camera, px, py, pz, tx, ty, tz, roll]);
	return null;
};

// ---------- objects ----------
const glass = {
	transmission: 1,
	thickness: 0.6,
	roughness: 0.06,
	ior: 1.45,
	metalness: 0,
	clearcoat: 1,
	clearcoatRoughness: 0.05,
	attenuationColor: new THREE.Color('#ffd9c2'),
	attenuationDistance: 3,
	transparent: true,
} as const;

const Capsule: React.FC<{frame: number; tex: THREE.Texture}> = ({frame, tex}) => {
	// drains on "habis", vanishes into the split on B2
	const fill = kf(frame, [0, f(WORD.limit), f(WORD.habis) + 4, f(WORD.menggunakannya) + 14], [0.92, 0.88, 0.22, 0.06], EASE_OUT);
	const flicker = frame > f(WORD.habis) && frame < 96 ? 0.85 + 0.15 * rand(frame) : 1;
	const exist = 1 - prog(frame, 112, 140, EASE_IN_OUT);
	const spin = frame * 0.004 + 0.3;
	const H = 1.5;
	if (exist <= 0.001) return null;
	return (
		<group position={[0, 0, 0]} scale={[exist, exist, exist]} rotation={[0.08, spin, 0]}>
			<mesh>
				<capsuleGeometry args={[0.44, H, 16, 64]} />
				<meshPhysicalMaterial {...glass} envMapIntensity={3} color="#f3e6dc" />
			</mesh>
			{/* liquid core, anchored to the bottom */}
			<mesh position={[0, -H / 2 + (H * fill) / 2 - 0.05, 0]} scale={[1, Math.max(fill, 0.02), 1]}>
				<cylinderGeometry args={[0.31, 0.31, H, 48]} />
				<meshStandardMaterial color={AMBER_DEEP} emissive={AMBER} emissiveIntensity={1.15 * flicker} roughness={0.3} />
			</mesh>
			<mesh position={[0, -H / 2 + H * fill - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
				<circleGeometry args={[0.31, 48]} />
				<meshBasicMaterial color={'#ffb98a'} transparent opacity={0.75 * flicker} />
			</mesh>
			{/* metal caps */}
			{[1, -1].map((s) => (
				<mesh key={s} position={[0, s * (H / 2 + 0.03), 0]}>
					<cylinderGeometry args={[0.452, 0.452, 0.05, 64]} />
					<meshStandardMaterial color="#c9c9cf" metalness={1} roughness={0.25} />
				</mesh>
			))}
			<Halo tex={tex} position={[0, -H / 2 + H * fill * 0.5, 0.2]} size={1.4 + fill * 1.6} opacity={0.32 * flicker * (0.25 + fill)} />
		</group>
	);
};

const SEG = 5;
const Ring: React.FC<{frame: number; tex: THREE.Texture}> = ({frame, tex}) => {
	const appear = prog(frame, 118, 150, EASE_OUT);
	if (frame < 116 || frame > 362) return null;
	const leave = prog(frame, 338, 360, EASE_IN_OUT);
	const yFly = interpolate(appear, [0, 1], [0.0, 1.15]) + leave * 1.6;
	const sx = interpolate(appear, [0, 1], [0.08, 0.62]) * (1 - leave * 0.4);
	// segments consumed during "setiap periode 5 jam" and refilled on "reset"
	const consumeStart = f(WORD.yaitu1);
	const consumeEnd = f(WORD.selesai) + 6;
	const refillStart = f(WORD.limit2) - 2;
	const sweep = prog(frame, refillStart, refillStart + 26, EASE_IN_OUT);
	const flash = interpolate(frame, [refillStart + 20, refillStart + 26, refillStart + 44], [0, 1, 0], clamp);
	return (
		<group position={[0, yFly, 0]} scale={[sx, sx, sx]} rotation={[0, 0, frame * 0.0025]}>
			{Array.from({length: SEG}).map((_, i) => {
				const a0 = Math.PI / 2 - (i * 2 * Math.PI) / SEG;
				const segT0 = consumeStart + ((consumeEnd - consumeStart) / SEG) * i;
				const used = prog(frame, segT0, segT0 + 10, EASE_OUT);
				const refill = sweep * SEG > i ? Math.min(1, sweep * SEG - i) : 0;
				const level = frame < refillStart ? 1 - used * 0.94 : 0.06 + refill * 0.94;
				return (
					<group key={i} rotation={[0, 0, a0 - (2 * Math.PI) / SEG + 0.06]}>
						<mesh>
							<torusGeometry args={[1, 0.07, 24, 80, (2 * Math.PI) / SEG - 0.12]} />
							<meshStandardMaterial color="#120c09" emissive={AMBER} emissiveIntensity={0.03 + level * 1.5} roughness={0.35} metalness={0.4} />
						</mesh>
						<mesh>
							<torusGeometry args={[1, 0.2, 16, 60, (2 * Math.PI) / SEG - 0.12]} />
							<meshBasicMaterial color={AMBER} transparent opacity={0.05 * level} blending={THREE.AdditiveBlending} depthWrite={false} />
						</mesh>
					</group>
				);
			})}
			{/* outer glass bezel */}
			<mesh>
				<torusGeometry args={[1, 0.125, 32, 160]} />
				<meshPhysicalMaterial {...glass} thickness={0.2} roughness={0.02} envMapIntensity={1.4} />
			</mesh>
			{/* sweep arc */}
			{sweep > 0 && sweep < 1 ? (
				<group rotation={[0, 0, Math.PI / 2 - sweep * Math.PI * 2]}>
					<mesh position={[1, 0, 0.1]}>
						<sphereGeometry args={[0.07, 16, 16]} />
						<meshBasicMaterial color="#fff2e2" />
					</mesh>
					<Halo tex={tex} position={[1, 0, 0.2]} size={1.1} opacity={0.9} color="#ffe1c4" />
				</group>
			) : null}
			<Halo tex={tex} position={[0, 0, -0.2]} size={3.6} opacity={0.06 + flash * 0.45} />
			<mesh>
				<sphereGeometry args={[0.11, 32, 32]} />
				<meshStandardMaterial color="#2a1a12" emissive={AMBER} emissiveIntensity={0.35 + flash * 2.2} />
			</mesh>
		</group>
	);
};

const DAYS = 7;
const Pillars: React.FC<{frame: number; tex: THREE.Texture}> = ({frame, tex}) => {
	const appear = prog(frame, 118, 152, EASE_OUT);
	if (frame < 116) return null;
	const y = interpolate(appear, [0, 1], [-0.3, -1.55]);
	const s = interpolate(appear, [0, 1], [0.08, 1]);
	const lightStart = f(WORD.weekly);
	const lightEnd = f(WORD.reset2);
	return (
		<group position={[0, y, 0]} scale={[s, s, s]}>
			{Array.from({length: DAYS}).map((_, i) => {
				const ang = interpolate(i, [0, DAYS - 1], [-0.42, 0.42]);
				const x = (i - 3) * 0.33;
				const z = -((i - 3) ** 2) * 0.045;
				const t0 = lightStart + ((lightEnd - lightStart) / DAYS) * i;
				const lit = prog(frame, t0, t0 + 9, EASE_OUT);
				const h = 0.95 + 0.06 * Math.sin(i * 1.7);
				return (
					<group key={i} position={[x, 0, z]} rotation={[0, -ang, 0]}>
						<mesh position={[0, h / 2, 0]}>
							<boxGeometry args={[0.24, h, 0.24]} />
							<meshPhysicalMaterial {...glass} thickness={0.3} envMapIntensity={2.5} color="#e9ddd3" />
						</mesh>
						<mesh position={[0, (h * 0.8 * (0.15 + lit * 0.85)) / 2 + 0.08, 0]} scale={[1, 0.15 + lit * 0.85, 1]}>
							<boxGeometry args={[0.12, h * 0.8, 0.12]} />
							<meshStandardMaterial color="#1a1310" emissive={AMBER} emissiveIntensity={0.12 + lit * 1.3} />
						</mesh>
						<Halo tex={tex} position={[0, h * 0.5, 0.15]} size={0.9} opacity={0.03 + lit * 0.16} />
					</group>
				);
			})}
			{/* reset cycle: a thin ring that turns above the arc */}
			<group position={[0, 1.22, 0.1]} rotation={[0.15, 0, -frame * 0.03]} scale={prog(frame, f(WORD.jadwal) - 6, f(WORD.jadwal) + 10)}>
				<mesh>
					<torusGeometry args={[0.16, 0.014, 12, 64, Math.PI * 1.6]} />
					<meshStandardMaterial color="#1a1310" emissive={AMBER} emissiveIntensity={1.1} />
				</mesh>
				<mesh position={[0.16, 0, 0]} rotation={[0, 0, 0]}>
					<coneGeometry args={[0.04, 0.08, 16]} />
					<meshStandardMaterial color="#1a1310" emissive={AMBER} emissiveIntensity={1.1} />
				</mesh>
			</group>
		</group>
	);
};

const Dust: React.FC<{frame: number}> = ({frame}) => {
	const geo = useMemo(() => {
		const n = 420;
		const p = new Float32Array(n * 3);
		for (let i = 0; i < n; i++) {
			p[i * 3] = (rand(i) - 0.5) * 9;
			p[i * 3 + 1] = (rand(i + 99) - 0.5) * 10;
			p[i * 3 + 2] = (rand(i + 199) - 0.5) * 8 - 1;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(p, 3));
		return g;
	}, []);
	return (
		<points geometry={geo} position={[0, frame * 0.0035, 0]} rotation={[0, frame * 0.0015, 0]}>
			<pointsMaterial size={0.018} color="#ffcfa6" transparent opacity={0.55} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
		</points>
	);
};

/** Out-of-focus bokeh discs that sell depth of field. */
const Bokeh: React.FC<{frame: number; tex: THREE.Texture}> = ({frame, tex}) => (
	<group>
		{Array.from({length: 14}).map((_, i) => (
			<Halo
				key={i}
				tex={tex}
				position={[(rand(i * 3) - 0.5) * 5, (rand(i * 5) - 0.5) * 7 + Math.sin(frame / 60 + i) * 0.2, i % 2 ? 1.8 : -4.5]}
				size={0.35 + rand(i * 7) * 0.7}
				opacity={0.04 + rand(i * 11) * 0.05}
				color={i % 3 ? '#ff9a5a' : '#ffe2c8'}
			/>
		))}
	</group>
);

const LightShaft: React.FC<{frame: number}> = ({frame}) => (
	<mesh position={[0.4, 3.2, -1.2]} rotation={[0, 0, 0.18]}>
		<coneGeometry args={[2.6, 9, 48, 1, true]} />
		<meshBasicMaterial
			color="#ffb07a"
			transparent
			opacity={0.035 + 0.01 * Math.sin(frame / 20)}
			side={THREE.DoubleSide}
			blending={THREE.AdditiveBlending}
			depthWrite={false}
		/>
	</mesh>
);

const Scene: React.FC = () => {
	const frame = useCurrentFrame();
	const tex = useHaloTexture();
	const rimI = kf(frame, [0, 30, 96], [0.6, 1.4, 1.1]);
	return (
		<>
			<color attach="background" args={['#050403']} />
			<fog attach="fog" args={['#050403', 6, 16]} />
			<CameraRig frame={frame} />
			<ambientLight intensity={0.08} />
			<spotLight position={[4, 6, 3]} angle={0.5} penumbra={1} intensity={60 * rimI} color="#ffe6d1" />
			<spotLight position={[-5, 2, -3]} angle={0.6} penumbra={1} intensity={40} color="#ff7a2e" />
			<pointLight position={[0, -1.2, 2]} intensity={3} color="#ff8a3d" distance={6} />
			<spotLight position={[0, 2, -4]} angle={0.7} penumbra={1} intensity={45} color="#ffd9bd" />
			<Environment resolution={256} frames={1}>
				<Lightformer form="rect" intensity={3} position={[3, 3, 3]} scale={[4, 1, 1]} color="#fff1e6" />
				<Lightformer form="rect" intensity={2.5} position={[-3, 0, 3]} scale={[0.4, 6, 1]} color="#ffffff" />
				<Lightformer form="rect" intensity={1.4} position={[-4, 1, -2]} scale={[1, 6, 1]} color="#ff9450" />
				<Lightformer form="ring" intensity={0.8} position={[0, -3, 4]} scale={3} color="#ffd2b0" />
			</Environment>
			<LightShaft frame={frame} />
			<Capsule frame={frame} tex={tex} />
			<Ring frame={frame} tex={tex} />
			<Pillars frame={frame} tex={tex} />
			<Dust frame={frame} />
			<Bokeh frame={frame} tex={tex} />
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.56, 0]}>
				<planeGeometry args={[40, 40]} />
				<meshStandardMaterial color="#0b0807" metalness={0.6} roughness={0.42} />
			</mesh>
		</>
	);
};

// ---------- typography (Apple-like, sparse) ----------
const Caption: React.FC<{
	from: number;
	to: number;
	eyebrow?: string;
	title: string;
	sub?: string;
	top?: number;
}> = ({from, to, eyebrow, title, sub, top = 1340}) => {
	const frame = useCurrentFrame();
	if (frame < from - 2 || frame > to + 2) return null;
	const inP = prog(frame, from, from + 16);
	const outP = prog(frame, to - 10, to, EASE_IN_OUT);
	const o = inP * (1 - outP);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top, textAlign: 'center', opacity: o, filter: `blur(${(1 - inP) * 10 + outP * 8}px)`, translate: `0 ${(1 - inP) * 26 - outP * 14}px`}}>
			{eyebrow ? (
				<div style={{fontFamily: FONT.tight, fontWeight: 500, fontSize: 30, letterSpacing: 10, color: '#ff9a5a', marginBottom: 22}}>{eyebrow}</div>
			) : null}
			<div style={{fontFamily: FONT.tight, fontWeight: 600, fontSize: 92, letterSpacing: -2.5, color: '#f5efe9', lineHeight: 1.02}}>{title}</div>
			{sub ? (
				<div style={{fontFamily: FONT.tight, fontWeight: 300, fontSize: 42, color: 'rgba(245,239,233,0.68)', marginTop: 22, letterSpacing: -0.3}}>{sub}</div>
			) : null}
		</div>
	);
};

const Meter: React.FC = () => {
	const frame = useCurrentFrame();
	if (frame > 100) return null;
	const pct = Math.round(kf(frame, [0, f(WORD.limit), f(WORD.habis) + 4, f(WORD.menggunakannya) + 14], [92, 88, 22, 0], EASE_OUT));
	const o = prog(frame, 4, 18) * (1 - prog(frame, 88, 100));
	return (
		<div style={{position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center', opacity: o}}>
			<div style={{fontFamily: FONT.tight, fontSize: 28, letterSpacing: 9, color: 'rgba(255,255,255,0.55)'}}>CLAUDE · USAGE LEFT</div>
			<div style={{fontFamily: FONT.tight, fontWeight: 300, fontSize: 132, color: pct < 10 ? '#ff6a3d' : '#f5efe9', letterSpacing: -4, fontVariantNumeric: 'tabular-nums'}}>{pct}%</div>
		</div>
	);
};

const Grade: React.FC = () => {
	const frame = useCurrentFrame();
	const fadeOut = interpolate(frame, [438, 449], [0, 1], clamp);
	const fadeIn = interpolate(frame, [0, 10], [1, 0], clamp);
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)'}} />
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.7) 100%)'}} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(fadeIn, fadeOut)}} />
		</>
	);
};

export const Cinematic3D: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<AbsoluteFill style={{backgroundColor: '#050403'}}>
			<ThreeCanvas width={width} height={height} camera={{fov: 34, near: 0.1, far: 60, position: [0.9, 0.5, 6.4]}} gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.95}}>
				<Scene />
			</ThreeCanvas>
			<Grade />
			<Meter />
			<Caption from={f(WORD.padahal) - 4} to={96} title="Limit habis." sub="Padahal baru sebentar dipakai." top={1480} />
			<Caption from={100} to={166} eyebrow="SEBENARNYA ADA" title="2 batas." sub="Dua cara limit dihitung." top={1490} />
			<Caption from={176} to={294} eyebrow="01 · CURRENT SESSION" title="Per 5 jam." sub="Satu sesi, satu jatah." top={1440} />
			<Caption from={300} to={338} title="Reset otomatis." top={1480} />
			<Caption from={346} to={446} eyebrow="02 · WEEKLY LIMIT" title="Per minggu." sub="Jadwal reset-nya sendiri." top={230} />
			<VO />
			<SfxTrack
				cues={[
					{at: 0, name: 'drone', vol: 0.5},
					{at: f(WORD.habis) - 1, name: 'subhit', vol: 0.55},
					{at: 108, name: 'whoosh', vol: 0.32},
					{at: 150, name: 'subhit', vol: 0.3},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(f(WORD.yaitu1) + ((f(WORD.selesai) + 6 - f(WORD.yaitu1)) / 5) * i), name: 'tick' as const, vol: 0.28})),
					{at: f(WORD.limit2) - 30, name: 'riser', vol: 0.22},
					{at: f(WORD.limit2) + 18, name: 'shimmer', vol: 0.3},
					{at: 342, name: 'whoosh', vol: 0.25},
					{at: 420, name: 'subhit', vol: 0.35},
				]}
			/>
		</AbsoluteFill>
	);
};

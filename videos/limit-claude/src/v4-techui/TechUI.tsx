import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useLayoutEffect, useMemo} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN, EASE_IN_OUT, EASE_OUT, f, prog, rand, WORD} from '../shared/timing';

const CYAN = '#5CE1FF';
const VIOLET = '#8B6CFF';
const RED = '#FF3B5C';
const BG = '#03050d';

const HABIS = f(WORD.habis);
const RESET = f(WORD.direset) - 3;

// ---------- 3D background ----------
const Rig: React.FC<{frame: number}> = ({frame}) => {
	const {camera} = useThree();
	const z = interpolate(frame, [0, 450], [9, 3.4], clamp);
	const y = interpolate(frame, [0, 168, 296, 450], [0.4, 0.9, 0.6, 1.4], {...clamp, easing: EASE_IN_OUT});
	const shake = frame > HABIS && frame < HABIS + 14 ? (rand(frame) - 0.5) * 0.12 : 0;
	useLayoutEffect(() => {
		camera.position.set(Math.sin(frame / 90) * 0.6 + shake, y, z);
		camera.lookAt(0, 0.2, -6);
	}, [camera, frame, y, z, shake]);
	return null;
};

const Field: React.FC<{frame: number}> = ({frame}) => {
	const geo = useMemo(() => {
		const n = 2600;
		const p = new Float32Array(n * 3);
		const c = new Float32Array(n * 3);
		const a = new THREE.Color(CYAN);
		const b = new THREE.Color(VIOLET);
		for (let i = 0; i < n; i++) {
			const r = 2 + rand(i) * 9;
			const t = rand(i + 7) * Math.PI * 2;
			p[i * 3] = Math.cos(t) * r;
			p[i * 3 + 1] = Math.sin(t) * r * 0.6 + 1;
			p[i * 3 + 2] = -rand(i + 13) * 40 + 8;
			const m = a.clone().lerp(b, rand(i + 21));
			c[i * 3] = m.r;
			c[i * 3 + 1] = m.g;
			c[i * 3 + 2] = m.b;
		}
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.BufferAttribute(p, 3));
		g.setAttribute('color', new THREE.BufferAttribute(c, 3));
		return g;
	}, []);
	const alarm = interpolate(frame, [HABIS, HABIS + 4, 96], [0, 1, 0], clamp);
	return (
		<points geometry={geo} rotation={[0, 0, frame * 0.0012]}>
			<pointsMaterial size={0.045} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} color={new THREE.Color('#ffffff').lerp(new THREE.Color(RED), alarm)} />
		</points>
	);
};

const Core: React.FC<{frame: number}> = ({frame}) => {
	const alarm = frame > HABIS && frame < 100 ? 1 : 0;
	const pulse = 1 + Math.sin(frame / 6) * 0.03;
	const vis = (1 - prog(frame, 104, 124, EASE_IN_OUT)) * 1.9 + prog(frame, 300, 330) * 1.9;
	const col = alarm ? RED : frame >= RESET ? '#7CFFC4' : CYAN;
	return (
		<group position={[0, 0.9, -2]} scale={vis * pulse} rotation={[frame * 0.01, frame * 0.017, 0]}>
			<mesh>
				<icosahedronGeometry args={[1.1, 1]} />
				<meshBasicMaterial color={col} wireframe transparent opacity={0.16} />
			</mesh>
			<mesh rotation={[0.4, 0.2, 0]}>
				<icosahedronGeometry args={[0.7, 0]} />
				<meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.14} />
			</mesh>
			<mesh>
				<sphereGeometry args={[0.32, 24, 24]} />
				<meshBasicMaterial color={col} transparent opacity={0.08} blending={THREE.AdditiveBlending} />
			</mesh>
		</group>
	);
};

const Floor: React.FC<{frame: number}> = ({frame}) => {
	const grid = useMemo(() => new THREE.GridHelper(80, 80, VIOLET, '#1b2a55'), []);
	return <primitive object={grid} position={[0, -2.2, -10 + ((frame * 0.05) % 1)]} />;
};

const Background: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<color attach="background" args={[BG]} />
			<fog attach="fog" args={[BG, 6, 30]} />
			<Rig frame={frame} />
			<Field frame={frame} />
			<Core frame={frame} />
			<Floor frame={frame} />
		</>
	);
};

// ---------- HUD primitives ----------
const glass: React.CSSProperties = {
	position: 'absolute',
	background: 'linear-gradient(160deg, rgba(120,170,255,0.16), rgba(40,60,140,0.08))',
	border: '1.5px solid rgba(140,200,255,0.35)',
	borderRadius: 28,
	backdropFilter: 'blur(18px) saturate(140%)',
	boxShadow: '0 0 0 1px rgba(255,255,255,0.04) inset, 0 30px 80px rgba(0,0,0,0.45), 0 0 40px rgba(92,225,255,0.08)',
	overflow: 'hidden',
};

const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; weight?: number}> = ({size = 26, color = CYAN, children, style, weight = 500}) => (
	<div style={{fontFamily: FONT.mono, fontWeight: weight, fontSize: size, color, letterSpacing: 2, ...style}}>{children}</div>
);

/** Text that types on, character by character. */
const Typed: React.FC<{at: number; text: string; cps?: number; size?: number; color?: string; style?: React.CSSProperties}> = ({at, text, cps = 1.6, size, color, style}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const n = Math.min(text.length, Math.floor((frame - at) * cps));
	const caret = n < text.length || Math.floor(frame / 8) % 2 ? '▍' : ' ';
	return (
		<Mono size={size} color={color} style={style}>
			{text.slice(0, n)}
			<span style={{opacity: 0.8}}>{caret}</span>
		</Mono>
	);
};

const Brackets: React.FC<{color?: string}> = ({color = CYAN}) => {
	const c = (pos: React.CSSProperties, rot: number) => (
		<div style={{position: 'absolute', width: 40, height: 40, borderTop: `3px solid ${color}`, borderLeft: `3px solid ${color}`, rotate: `${rot}deg`, ...pos}} />
	);
	return (
		<>
			{c({left: 40, top: 60}, 0)}
			{c({right: 40, top: 60}, 90)}
			{c({right: 40, bottom: 60}, 180)}
			{c({left: 40, bottom: 60}, 270)}
		</>
	);
};

const Scanlines: React.FC = () => (
	<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 5px)', mixBlendMode: 'overlay'}} />
);

// ---------- B1: usage gauge ----------
const Gauge: React.FC<{size: number; value: number; color: string; label: string; sub?: string}> = ({size, value, color, label, sub}) => {
	const r = size / 2 - 22;
	const c = 2 * Math.PI * r;
	return (
		<div style={{position: 'relative', width: size, height: size}}>
			<svg width={size} height={size} style={{position: 'absolute', rotate: '-90deg'}}>
				<circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(140,200,255,0.12)" strokeWidth={22} />
				<circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={22} strokeDasharray={`${(c * value) / 100} ${c}`} strokeLinecap="round" style={{filter: `drop-shadow(0 0 14px ${color})`}} />
				{Array.from({length: 60}).map((_, i) => {
					const a = (i / 60) * Math.PI * 2;
					const r1 = r - 34;
					const r2 = r - (i % 5 ? 42 : 52);
					return <line key={i} x1={size / 2 + Math.cos(a) * r1} y1={size / 2 + Math.sin(a) * r1} x2={size / 2 + Math.cos(a) * r2} y2={size / 2 + Math.sin(a) * r2} stroke="rgba(140,200,255,0.35)" strokeWidth={2} />;
				})}
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
				<Mono size={26} color="rgba(200,230,255,0.7)">{label}</Mono>
				<div style={{fontFamily: FONT.tight, fontWeight: 800, fontSize: size * 0.24, color: '#EAF6FF', letterSpacing: -4, fontVariantNumeric: 'tabular-nums'}}>{Math.round(value)}%</div>
				{sub ? <Mono size={22} color={color}>{sub}</Mono> : null}
			</div>
		</div>
	);
};

const Hook: React.FC = () => {
	const frame = useCurrentFrame();
	const v = interpolate(frame, [8, HABIS - 4, HABIS + 2], [41, 72, 100], {...clamp, easing: EASE_IN});
	const alarm = frame >= HABIS;
	const inP = prog(frame, 4, 22);
	const blink = alarm && Math.floor(frame / 4) % 2 === 0;
	const reqs = Math.min(12, Math.floor(interpolate(frame, [44, 80], [0, 12], clamp)));
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 70, top: 130}}>
				<Typed at={0} text="> claude.usage --live" size={30} />
				<Typed at={14} text="  session ......... active" size={24} color="rgba(200,230,255,0.6)" style={{marginTop: 10}} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center', opacity: inP, scale: interpolate(inP, [0, 1], [0.85, 1])}}>
				<Gauge size={640} value={v} color={alarm ? RED : CYAN} label="USAGE · CURRENT" sub={alarm ? 'LIMIT REACHED' : 'normal'} />
			</div>
			{alarm ? (
				<div style={{...glass, left: 110, right: 110, top: 1080, padding: '28px 34px', borderColor: 'rgba(255,59,92,0.7)', background: 'linear-gradient(160deg, rgba(255,59,92,0.22), rgba(120,20,40,0.12))', translate: `${(1 - prog(frame, HABIS, HABIS + 8)) * 60}px 0`, opacity: prog(frame, HABIS, HABIS + 6)}}>
					<Mono size={34} color={RED} weight={700} style={{opacity: blink ? 1 : 0.55}}>⚠ LIMIT REACHED</Mono>
					<Mono size={24} color="rgba(255,220,225,0.8)" style={{marginTop: 10}}>pesan berikutnya ditahan sampai reset</Mono>
				</div>
			) : null}
			{frame >= 40 ? (
				<div style={{...glass, left: 110, right: 110, top: 1290, padding: '28px 34px', opacity: prog(frame, 40, 50), translate: `0 ${(1 - prog(frame, 40, 52)) * 40}px`}}>
					<div style={{display: 'flex', justifyContent: 'space-between'}}>
						<Mono size={24} color="rgba(200,230,255,0.7)">requests_today</Mono>
						<Mono size={24} color="#EAF6FF">{reqs}</Mono>
					</div>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, marginTop: 18}}>
						{Array.from({length: 24}).map((_, i) => {
							const h = i < 18 ? 6 : 10 + rand(i) * 70;
							const on = prog(frame, 44 + i, 50 + i);
							return <div key={i} style={{flex: 1, height: h * on + 4, backgroundColor: i < 18 ? 'rgba(140,200,255,0.25)' : CYAN, borderRadius: 3}} />;
						})}
					</div>
					<Mono size={24} color={VIOLET} style={{marginTop: 16}}>“belum banyak dipakai…?”</Mono>
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- B2: two limit cards ----------
const Card: React.FC<{at: number; top: number; id: string; title: string; meta: string; accent: string}> = ({at, top, id, title, meta, accent}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, at + 16, EASE_OUT);
	const pulse = interpolate(frame, [f(WORD.pahami) - 2, f(WORD.pahami) + 4, f(WORD.pahami) + 14], [0, 1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: 90, right: 90, top, perspective: 1600}}>
			<div style={{...glass, position: 'relative', height: 420, padding: 44, rotate: `x ${(1 - p) * 55}deg`, scale: interpolate(p, [0, 1], [0.7, 1]), opacity: p, borderColor: `rgba(140,200,255,${0.35 + pulse * 0.6})`}}>
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<Mono size={26} color={accent}>{id}</Mono>
					<Mono size={22} color="rgba(200,230,255,0.55)">● monitored</Mono>
				</div>
				<div style={{fontFamily: FONT.tight, fontWeight: 800, fontSize: 112, color: '#EAF6FF', letterSpacing: -3, marginTop: 50, lineHeight: 1}}>{title}</div>
				<Mono size={28} color="rgba(200,230,255,0.75)" style={{marginTop: 24}}>{meta}</Mono>
				<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: `linear-gradient(90deg, ${accent}, transparent)`}} />
			</div>
		</div>
	);
};

const Setup: React.FC = () => (
	<AbsoluteFill>
		<div style={{position: 'absolute', left: 90, top: 190}}>
			<Typed at={96} text="> scan limits" size={30} />
			<Typed at={f(WORD.dua) - 4} text="  2 found" size={56} color="#EAF6FF" style={{marginTop: 16}} cps={1.2} />
		</div>
		<Card at={f(WORD.dua)} top={520} id="LIMIT_01" title="Session" meta="window: 5h · rolling" accent={CYAN} />
		<Card at={f(WORD.penggunaan)} top={1000} id="LIMIT_02" title="Weekly" meta="window: 7d · scheduled" accent={VIOLET} />
	</AbsoluteFill>
);

// ---------- B3/B4: session dial ----------
const SessionDial: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.yaitu1);
	const b = f(WORD.selesai) + 4;
	const used = interpolate(frame, [a, b], [0, 5], {...clamp, easing: EASE_IN_OUT});
	const refill = prog(frame, RESET, RESET + 20, EASE_IN_OUT);
	const size = 760;
	const R = 300;
	const cx = size / 2;
	const segs = Array.from({length: 5});
	const left = frame < RESET ? 5 * 3600 * (1 - used / 5) : 5 * 3600 * refill;
	const p = (n: number) => String(Math.floor(n)).padStart(2, '0');
	const done = frame >= RESET + 10;
	return (
		<div style={{position: 'absolute', left: (1080 - size) / 2, top: 470, width: size, height: size}}>
			<svg width={size} height={size}>
				{segs.map((_, i) => {
					const s0 = (i / 5) * Math.PI * 2 - Math.PI / 2 + 0.05;
					const s1 = ((i + 1) / 5) * Math.PI * 2 - Math.PI / 2 - 0.05;
					const usedFrac = Math.min(1, Math.max(0, used - i));
					const lit = frame < RESET ? 1 - usedFrac : Math.min(1, Math.max(0, refill * 5 - i));
					const arc = (r: number) => `M ${cx + Math.cos(s0) * r} ${cx + Math.sin(s0) * r} A ${r} ${r} 0 0 1 ${cx + Math.cos(s1) * r} ${cx + Math.sin(s1) * r}`;
					const mid = (s0 + s1) / 2;
					return (
						<g key={i}>
							<path d={arc(R)} stroke="rgba(140,200,255,0.12)" strokeWidth={46} fill="none" />
							<path d={arc(R)} stroke={done ? '#7CFFC4' : CYAN} strokeWidth={46} fill="none" opacity={0.15 + lit * 0.85} style={{filter: `drop-shadow(0 0 ${lit * 16}px ${CYAN})`}} />
							<text x={cx + Math.cos(mid) * (R + 62)} y={cx + Math.sin(mid) * (R + 62) + 9} fill="rgba(200,230,255,0.7)" fontFamily={FONT.mono} fontSize={26} textAnchor="middle">
								H{i + 1}
							</text>
						</g>
					);
				})}
				{/* sweeping hand */}
				<line x1={cx + Math.cos((used / 5) * Math.PI * 2 - Math.PI / 2) * (R - 44)} y1={cx + Math.sin((used / 5) * Math.PI * 2 - Math.PI / 2) * (R - 44)} x2={cx + Math.cos((used / 5) * Math.PI * 2 - Math.PI / 2) * (R + 30)} y2={cx + Math.sin((used / 5) * Math.PI * 2 - Math.PI / 2) * (R + 30)} stroke={VIOLET} strokeWidth={6} strokeLinecap="round" opacity={frame < RESET ? 1 : 0} style={{filter: `drop-shadow(0 0 10px ${VIOLET})`}} />
			</svg>
			<div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
				<Mono size={24} color="rgba(200,230,255,0.65)">{done ? 'RESET ✓' : 'TIME LEFT'}</Mono>
				<div style={{fontFamily: FONT.mono, fontWeight: 700, fontSize: 92, color: done ? '#7CFFC4' : '#EAF6FF', fontVariantNumeric: 'tabular-nums'}}>
					{p(left / 3600)}:{p((left % 3600) / 60)}:{p(left % 60)}
				</div>
			</div>
		</div>
	);
};

const ScanBeam: React.FC = () => {
	const frame = useCurrentFrame();
	if (frame < RESET - 4 || frame > RESET + 22) return null;
	const y = interpolate(frame, [RESET - 4, RESET + 22], [-100, 1960], {...clamp, easing: EASE_IN_OUT});
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, height: 160, background: 'linear-gradient(180deg, transparent, rgba(124,255,196,0.35) 70%, #7CFFC4 72%, transparent 76%)', mixBlendMode: 'screen'}} />
	);
};

const FirstLimit: React.FC = () => {
	const frame = useCurrentFrame();
	const z = prog(frame, 168, 186, EASE_OUT);
	return (
		<AbsoluteFill style={{scale: interpolate(z, [0, 1], [1.5, 1]), opacity: z}}>
			<div style={{position: 'absolute', left: 90, top: 190}}>
				<Mono size={26} color={CYAN}>LIMIT_01 · 01/02</Mono>
				<div style={{fontFamily: FONT.tight, fontWeight: 800, fontSize: 104, color: '#EAF6FF', letterSpacing: -3, marginTop: 14, lineHeight: 1}}>Current session</div>
			</div>
			<SessionDial />
			<div style={{...glass, left: 90, right: 90, top: 1330, padding: '28px 34px'}}>
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<Mono size={24} color="rgba(200,230,255,0.7)">window</Mono>
					<Mono size={24} color="#EAF6FF">5 jam / periode</Mono>
				</div>
				<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 14}}>
					<Mono size={24} color="rgba(200,230,255,0.7)">on expire</Mono>
					<Mono size={24} color={frame >= RESET + 10 ? '#7CFFC4' : '#EAF6FF'}>auto-reset</Mono>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- B5: weekly ----------
const DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const Weekly: React.FC = () => {
	const frame = useCurrentFrame();
	const z = prog(frame, 340, 360, EASE_OUT);
	const a = f(WORD.yaitu2);
	const b = f(WORD.jadwal);
	return (
		<AbsoluteFill style={{scale: interpolate(z, [0, 1], [1.4, 1]), opacity: z}}>
			<div style={{position: 'absolute', left: 90, top: 190}}>
				<Mono size={26} color={VIOLET}>LIMIT_02 · 02/02</Mono>
				<div style={{fontFamily: FONT.tight, fontWeight: 800, fontSize: 104, color: '#EAF6FF', letterSpacing: -3, marginTop: 14, lineHeight: 1}}>Weekly limit</div>
			</div>
			<div style={{...glass, left: 90, right: 90, top: 520, height: 700, padding: 44}}>
				<div style={{display: 'flex', justifyContent: 'space-between'}}>
					<Mono size={24} color="rgba(200,230,255,0.7)">usage / 7 hari</Mono>
					<Mono size={24} color={VIOLET}>{Math.round(interpolate(frame, [a, b], [0, 64], clamp))}%</Mono>
				</div>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 22, height: 460, marginTop: 40}}>
					{DAYS.map((d, i) => {
						const h = [0.42, 0.7, 0.35, 0.88, 0.55, 0.24, 0.62][i];
						const p = prog(frame, a + ((b - a) / 7) * i, a + ((b - a) / 7) * i + 12, EASE_OUT);
						return (
							<div key={d} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
								<div style={{width: '100%', height: 400 * h * p, borderRadius: 10, background: `linear-gradient(180deg, ${VIOLET}, rgba(92,225,255,0.55))`, boxShadow: `0 0 24px rgba(139,108,255,${0.5 * p})`}} />
								<Mono size={22} color="rgba(200,230,255,0.75)">{d}</Mono>
							</div>
						);
					})}
				</div>
			</div>
			<div style={{...glass, left: 90, right: 90, top: 1290, padding: '30px 34px', opacity: prog(frame, f(WORD.jadwal) - 4, f(WORD.jadwal) + 8), translate: `0 ${(1 - prog(frame, f(WORD.jadwal) - 4, f(WORD.jadwal) + 10)) * 50}px`, borderColor: 'rgba(139,108,255,0.6)'}}>
				<Mono size={24} color="rgba(200,230,255,0.7)">next_reset</Mono>
				<div style={{fontFamily: FONT.tight, fontWeight: 600, fontSize: 52, color: '#EAF6FF', marginTop: 10}}>Jadwal reset tersendiri</div>
				<Mono size={22} color={VIOLET} style={{marginTop: 8}}>terpisah dari sesi 5 jam</Mono>
			</div>
		</AbsoluteFill>
	);
};

// ---------- glitch transition ----------
const Glitch: React.FC<{at: number; len?: number; children: React.ReactNode}> = ({at, len = 8, children}) => {
	const frame = useCurrentFrame();
	const on = frame >= at - len / 2 && frame < at + len / 2;
	if (!on) return <>{children}</>;
	const k = frame - at;
	return (
		<AbsoluteFill>
			{[0, 1, 2, 3, 4].map((i) => {
				const y0 = rand(frame * 7 + i) * 90;
				const h = 6 + rand(frame * 3 + i) * 18;
				const dx = (rand(frame * 11 + i) - 0.5) * 140;
				return (
					<AbsoluteFill key={i} style={{clipPath: `inset(${y0}% 0 ${Math.max(0, 100 - y0 - h)}% 0)`, translate: `${dx}px 0`}}>
						{children}
					</AbsoluteFill>
				);
			})}
			<AbsoluteFill style={{opacity: 0.55, translate: `${8 + k}px 0`, mixBlendMode: 'screen', filter: 'hue-rotate(160deg)'}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

const HUD: React.FC = () => {
	const frame = useCurrentFrame();
	const seg = frame < 96 ? <Hook /> : frame < 168 ? <Setup /> : frame < 340 ? <FirstLimit /> : <Weekly />;
	return (
		<Glitch at={frame < 130 ? 96 : frame < 250 ? 168 : 340}>
			<AbsoluteFill>{seg}</AbsoluteFill>
		</Glitch>
	);
};

const StatusBar: React.FC = () => {
	const frame = useCurrentFrame();
	const t = `T+${(frame / 30).toFixed(2)}s`;
	return (
		<>
			<div style={{position: 'absolute', left: 70, right: 70, bottom: 92, display: 'flex', justifyContent: 'space-between'}}>
				<Mono size={20} color="rgba(200,230,255,0.45)">USAGE_OS v2.6</Mono>
				<Mono size={20} color="rgba(200,230,255,0.45)">{t}</Mono>
			</div>
			<div style={{position: 'absolute', left: 70, right: 70, bottom: 130, height: 1, backgroundColor: 'rgba(140,200,255,0.2)'}} />
		</>
	);
};

export const TechUI: React.FC = () => {
	const {width, height} = useVideoConfig();
	const frame = useCurrentFrame();
	const redFlash = interpolate(frame, [HABIS, HABIS + 2, HABIS + 12], [0, 0.35, 0], clamp);
	const endFade = interpolate(frame, [440, 449], [0, 1], clamp);
	return (
		<AbsoluteFill style={{backgroundColor: BG}}>
			<ThreeCanvas width={width} height={height} camera={{fov: 60, position: [0, 0.4, 9]}}>
				<Background />
			</ThreeCanvas>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 45%, transparent 40%, rgba(3,5,13,0.85) 100%)'}} />
			<HUD />
			<ScanBeam />
			<Brackets />
			<StatusBar />
			<Scanlines />
			<AbsoluteFill style={{backgroundColor: RED, opacity: redFlash, mixBlendMode: 'screen'}} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: endFade}} />
			<VO />
			<SfxTrack
				cues={[
					{at: 0, name: 'techbed', vol: 0.4},
					{at: 2, name: 'mouse-click', vol: 0.35},
					{at: HABIS, name: 'glitch', vol: 0.45},
					{at: HABIS + 1, name: 'subhit', vol: 0.4},
					{at: 92, name: 'glitch', vol: 0.35},
					{at: 98, name: 'mouse-click', vol: 0.3},
					{at: f(WORD.dua), name: 'switch', vol: 0.45},
					{at: f(WORD.penggunaan), name: 'switch', vol: 0.4},
					{at: 164, name: 'glitch', vol: 0.3},
					{at: 168, name: 'whoosh', vol: 0.3},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(f(WORD.yaitu1) + ((f(WORD.selesai) + 4 - f(WORD.yaitu1)) / 5) * i), name: 'tick' as const, vol: 0.25})),
					{at: RESET - 4, name: 'riser', vol: 0.2},
					{at: RESET + 10, name: 'ding', vol: 0.35},
					{at: 336, name: 'glitch', vol: 0.3},
					{at: 340, name: 'whoosh', vol: 0.3},
					...DAYS.map((_, i) => ({at: Math.round(f(WORD.yaitu2) + ((f(WORD.jadwal) - f(WORD.yaitu2)) / 7) * i), name: 'pop' as const, vol: 0.22})),
					{at: f(WORD.jadwal), name: 'mouse-click', vol: 0.35},
				]}
			/>
		</AbsoluteFill>
	);
};

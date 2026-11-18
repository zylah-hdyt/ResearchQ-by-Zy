import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {clamp, EASE_IN_OUT, EASE_OUT, prog, rand} from '../shared/timing';
import type {Pose} from '../v10-mental/Mascot';
import {MW, PHRASES} from '../v10-mental/words';
import {Narrator} from '../v11-cinematic/Narrator';

// "Kenapa mental lu makin lembek?" in the ResearchQ reference look: themed backgrounds per scene,
// kinetic subtitle on top with serif-italic keywords, white cards in the middle, mascot bottom-right.
export const REF_FRAMES = 1770;

const T = (s: number) => Math.round(s * 30);
const ORANGE = '#E8692A';
const TEAL = '#1FA37A';
const BLUE = '#3D7BE0';
const INK = '#1E1B18';
const MUTED = '#8B857B';
const CARD_BG = '#FBF9F5';

const px = (id: number, w = 900) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const IMG = {
	giveUp: px(6214833),
	lazy: px(5409046),
	teacher: px(6325934, 1200),
	confused: px(6958584),
	magnifier: px(4494642),
	hourglass: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=600&q=80&auto=format&fit=crop',
	climber: px(5907806),
	together: px(8199759, 1200),
	reader: px(9572630),
	highlight: px(8553917),
	runners: px(4604846, 1200),
	stopwatch: px(19730401),
	lamp: px(8005646),
};

// ---------- scenes ----------
type Theme = 'dark' | 'cream' | 'orange' | 'gray';
type Scene = {at: number; theme: Theme; wipe: 'steps' | 'diag'};
const SCENES: Scene[] = [
	{at: 0, theme: 'dark', wipe: 'steps'},
	{at: 5.2, theme: 'cream', wipe: 'diag'},
	{at: 8.95, theme: 'orange', wipe: 'steps'},
	{at: 14.45, theme: 'dark', wipe: 'diag'},
	{at: 18.1, theme: 'cream', wipe: 'steps'},
	{at: 25.05, theme: 'dark', wipe: 'diag'},
	{at: 29.2, theme: 'cream', wipe: 'steps'},
	{at: 36.85, theme: 'orange', wipe: 'diag'},
	{at: 38.55, theme: 'dark', wipe: 'steps'},
	{at: 41.85, theme: 'cream', wipe: 'diag'},
	{at: 49.45, theme: 'dark', wipe: 'steps'},
	{at: 54.05, theme: 'gray', wipe: 'diag'},
];
const sceneAt = (frame: number) => {
	let k = 0;
	SCENES.forEach((s, i) => {
		if (frame >= T(s.at)) k = i;
	});
	return k;
};

// ---------- backgrounds ----------
const TEXTURE = 'belajar lagi · ulangi · pahami · coba lagi · sabar · teliti · mau · '.repeat(4);
const Background: React.FC<{theme: Theme}> = ({theme}) => {
	const frame = useCurrentFrame();
	if (theme === 'dark')
		return (
			<AbsoluteFill style={{backgroundColor: '#120D0A'}}>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 45% at 50% 30%, rgba(120,62,28,0.55), transparent 70%)'}} />
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 10% 85%, rgba(232,105,42,0.16), transparent 70%)'}} />
				<div style={{position: 'absolute', left: -40, right: -40, top: 1080, bottom: 0, overflow: 'hidden', WebkitMaskImage: 'linear-gradient(180deg, transparent, #000 30%)'}}>
					{Array.from({length: 22}).map((_, i) => (
						<div key={i} style={{fontFamily: FONT.mono, fontSize: 22, lineHeight: '38px', color: 'rgba(255,255,255,0.045)', whiteSpace: 'nowrap', translate: `${-((frame * 0.6 + i * 137) % 420)}px 0`}}>
							{TEXTURE}
						</div>
					))}
				</div>
			</AbsoluteFill>
		);
	if (theme === 'cream')
		return (
			<AbsoluteFill style={{backgroundColor: '#F3EEE8'}}>
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 55% 35% at 28% 48%, rgba(246,186,140,0.5), transparent 70%)'}} />
				<AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(120,100,80,0.10) 1.5px, transparent 2px)', backgroundSize: '44px 44px', WebkitMaskImage: 'linear-gradient(180deg, #000, transparent 45%)'}} />
				<AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(135deg, rgba(150,128,105,0.13) 0 2px, transparent 2px 30px)', WebkitMaskImage: 'linear-gradient(180deg, transparent 35%, #000 75%)', translate: `${(frame * 0.4) % 42}px 0`}} />
			</AbsoluteFill>
		);
	if (theme === 'orange')
		return (
			<AbsoluteFill style={{background: 'linear-gradient(180deg, #F27A30, #E8631F)'}}>
				<AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '90px 90px'}} />
				<svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.16}}>
					{Array.from({length: 9}).map((_, i) => {
						const x1 = 80 + rand(i) * 920, y1 = 1150 + rand(i + 5) * 650, x2 = 80 + rand(i + 9) * 920, y2 = 1150 + rand(i + 13) * 650;
						return (
							<g key={i}>
								<line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={1.5} />
								<circle cx={x1} cy={y1} r={5} fill="#fff" />
							</g>
						);
					})}
				</svg>
			</AbsoluteFill>
		);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 25%, #4A4642, #2B2927 70%)'}} />
	);
};

const FG: Record<Theme, {text: string; accent: string; wm: string; wmSub: string}> = {
	dark: {text: '#FFFFFF', accent: '#F08A4B', wm: '#FFFFFF', wmSub: 'rgba(255,255,255,0.5)'},
	cream: {text: '#3B3632', accent: ORANGE, wm: '#2B2724', wmSub: MUTED},
	orange: {text: '#FFFFFF', accent: '#FFE2CC', wm: '#FFFFFF', wmSub: 'rgba(255,255,255,0.7)'},
	gray: {text: '#FFFFFF', accent: '#F08A4B', wm: 'rgba(255,255,255,0.4)', wmSub: 'rgba(255,255,255,0.3)'},
};

const Watermark: React.FC<{theme: Theme}> = ({theme}) => (
	<div style={{position: 'absolute', left: 72, top: 1480}}>
		<div style={{fontFamily: FONT.pjs, fontWeight: 800, fontSize: 34, letterSpacing: '-0.02em', color: FG[theme].wm}}>
			ResearchQ<span style={{display: 'inline-block', width: 10, height: 10, borderRadius: 5, backgroundColor: ORANGE, marginLeft: 3}} />
		</div>
		<div style={{fontFamily: FONT.mono, fontSize: 19, color: FG[theme].wmSub, marginTop: 2}}>@researchq.id</div>
	</div>
);

// ---------- subtitle ----------
const ACCENT = new Set(['teknologi', 'lembek', 'menyerah', 'malas', 'dijelaskan', 'memahami', 'mampu', 'kecerdasan', 'ketelitian', 'kesabaran', 'kemauan', 'mencoba', 'bisa', 'satu', 'dua', 'tiga', 'paham', 'masalah', 'kecepatan', 'berbeda', 'cepat', 'belajar', 'berkali-kali', 'menyimpulkan', 'berusaha', 'save', 'bermanfaat']);
const clean = (w: string) => w.toLowerCase().replace(/[,.?!]/g, '');

const Subtitle: React.FC<{theme: Theme}> = ({theme}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const ph = PHRASES.find((p) => t >= p.a && t < p.b);
	if (!ph) return null;
	const words = MW.filter((w) => w.s >= ph.a - 0.01 && w.s < ph.b - 0.01);
	const c = FG[theme];
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 330, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 18, rowGap: 4}}>
			{words.map((w, i) => {
				if (frame < T(w.s) - 1) return null;
				const p = prog(frame, T(w.s) - 1, T(w.s) + 5);
				const acc = ACCENT.has(clean(w.w));
				return (
					<span key={i} style={{display: 'inline-block', opacity: p, translate: `0 ${(1 - p) * 22}px`, fontFamily: acc ? FONT.serifItalic : FONT.pjs, fontStyle: acc ? 'italic' : 'normal', fontWeight: acc ? 400 : 800, fontSize: acc ? 76 : 62, lineHeight: 1.12, letterSpacing: acc ? 0 : '-0.02em', color: acc ? c.accent : c.text}}>
						{w.w}
					</span>
				);
			})}
		</div>
	);
};

// ---------- card kit ----------
const useEnter = (at: number) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, at + 10, EASE_OUT);
	return {visible: frame >= at, style: {opacity: p, scale: interpolate(p, [0, 1], [0.92, 1]), translate: `0 ${(1 - p) * 34}px`} as React.CSSProperties};
};

const cardStyle: React.CSSProperties = {position: 'absolute', backgroundColor: CARD_BG, borderRadius: 18, boxShadow: '0 26px 50px -20px rgba(0,0,0,0.4), 0 1px 0 rgba(0,0,0,0.04)', overflow: 'hidden'};

const Anton: React.FC<{size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size, color = INK, children, style}) => (
	<div style={{fontFamily: FONT.anton, fontSize: size, lineHeight: 1.02, color, letterSpacing: '0.005em', ...style}}>{children}</div>
);
const Mono: React.FC<{size?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties}> = ({size = 20, color = MUTED, children, style}) => (
	<div style={{fontFamily: FONT.mono, fontSize: size, letterSpacing: 3, color, textTransform: 'uppercase', ...style}}>{children}</div>
);

const Avatar: React.FC<{src: string; size?: number}> = ({src, size = 112}) => (
	<div style={{width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.18), 0 0 0 5px #fff'}}>
		<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
	</div>
);

/** List card: round photo, mono label, Anton title, coloured edge (like the model cards in the reference). */
const ListCard: React.FC<{at: number; y: number; img: string; label: string; title: string; accent: string; strikeAt?: number; dim?: boolean; x?: number; w?: number}> = ({at, y, img, label, title, accent, strikeAt, dim, x = 80, w = 920}) => {
	const frame = useCurrentFrame();
	const e = useEnter(at);
	if (!e.visible) return null;
	const sp = strikeAt ? prog(frame, strikeAt, strikeAt + 8, EASE_IN_OUT) : 0;
	return (
		<div style={{...cardStyle, left: x, top: y, width: w, height: 168, display: 'flex', alignItems: 'center', gap: 30, padding: '0 34px', ...e.style}}>
			<div style={{position: 'absolute', right: 0, top: 0, bottom: 0, width: 12, backgroundColor: accent}} />
			<Avatar src={img} />
			<div style={{position: 'relative', opacity: dim ? 0.55 : 1}}>
				<Mono>{label}</Mono>
				<Anton size={66} style={{marginTop: 4}}>
					{title}
				</Anton>
				{strikeAt ? <div style={{position: 'absolute', left: -6, top: 64, height: 10, width: `calc(${sp * 100}% + 12px)`, backgroundColor: ORANGE, borderRadius: 5}} /> : null}
			</div>
		</div>
	);
};

const PhotoCard: React.FC<{at: number; x?: number; y: number; w?: number; h: number; img: string; focus?: string; label?: string; caption?: string}> = ({at, x = 80, y, w = 920, h, img, focus = '50% 50%', label, caption}) => {
	const frame = useCurrentFrame();
	const e = useEnter(at);
	if (!e.visible) return null;
	const z = interpolate(frame, [at, at + 200], [1.08, 1.0], clamp);
	return (
		<div style={{...cardStyle, left: x, top: y, width: w, height: h, padding: 16, ...e.style}}>
			<div style={{position: 'relative', width: '100%', height: label ? h - 120 : h - 32, borderRadius: 12, overflow: 'hidden'}}>
				<Img src={img} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, scale: z}} />
			</div>
			{label ? (
				<div style={{padding: '14px 10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
					<Anton size={52}>{label}</Anton>
					{caption ? <Mono size={18}>{caption}</Mono> : null}
				</div>
			) : null}
		</div>
	);
};

const Stamp: React.FC<{at: number; text: string; x: number; y: number; bg?: string; color?: string; size?: number}> = ({at, text, x, y, bg = INK, color = '#fff', size = 46}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const k = interpolate(frame, [at, at + 4, at + 9], [1.6, 0.94, 1], {...clamp, easing: EASE_OUT});
	return <div style={{position: 'absolute', left: x, top: y, backgroundColor: bg, color, fontFamily: FONT.anton, fontSize: size, padding: '10px 26px', borderRadius: 14, scale: k, opacity: prog(frame, at, at + 3), boxShadow: '0 14px 30px -10px rgba(0,0,0,0.4)'}}>{text}</div>;
};

// ---------- scene 1 · hook ----------
const ICONS: {at: number; x: number; y: number; ring: string; label: string; d: string}[] = [
	{at: 0.82, x: 230, y: 640, ring: ORANGE, label: 'HP', d: 'M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 18h2'},
	{at: 1.54, x: 540, y: 560, ring: TEAL, label: 'LAPTOP', d: 'M4 6h16v10H4zM2 19h20'},
	{at: 2.24, x: 850, y: 660, ring: BLUE, label: 'AI', d: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'},
];
const S1: React.FC = () => {
	const frame = useCurrentFrame();
	const merge = prog(frame, T(3.3), T(3.9), EASE_IN_OUT);
	const big = interpolate(frame, [T(4.22), T(4.22) + 4, T(4.22) + 10], [1.5, 0.95, 1], {...clamp, easing: EASE_OUT});
	return (
		<>
			{ICONS.map((ic, i) => {
				if (frame < T(ic.at)) return null;
				const k = interpolate(frame, [T(ic.at), T(ic.at) + 5, T(ic.at) + 11], [0, 1.12, 1], clamp);
				const cx = interpolate(merge, [0, 1], [ic.x, 360 + i * 150]);
				const cy = interpolate(merge, [0, 1], [ic.y, 600]) + Math.sin(frame / 14 + i * 2) * 8;
				return (
					<div key={i} style={{position: 'absolute', left: cx - 78, top: cy - 78, width: 156, textAlign: 'center', scale: k}}>
						<div style={{width: 156, height: 156, borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 0 6px ${ic.ring}55, 0 0 40px ${ic.ring}88`}}>
							<svg width={74} height={74} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
								<path d={ic.d} />
							</svg>
						</div>
						<div style={{display: 'inline-block', marginTop: 14, padding: '4px 14px', borderRadius: 20, border: '1.5px solid rgba(255,255,255,0.35)', fontFamily: FONT.mono, fontSize: 18, color: '#fff', letterSpacing: 3}}>{ic.label}</div>
					</div>
				);
			})}
			{frame >= T(4.22) ? (
				<div style={{position: 'absolute', left: 80, top: 840, scale: big, transformOrigin: '0 50%'}}>
					<Anton size={92} color="#fff">MENTAL MAKIN</Anton>
					<Anton size={150} color={ORANGE} style={{textDecoration: 'underline', textDecorationThickness: 8, textUnderlineOffset: 12}}>
						LEMBEK?
					</Anton>
				</div>
			) : null}
		</>
	);
};

// ---------- scene 2 · menyerah / malas ----------
const S2: React.FC = () => {
	const frame = useCurrentFrame();
	const second = frame >= T(7.16);
	return (
		<>
			<ListCard at={T(5.34)} y={570} img={IMG.giveUp} label="01 · belum mencoba" title="SUDAH MENYERAH" accent={ORANGE} />
			<ListCard at={T(7.16)} y={760} img={IMG.lazy} label="02 · belum membaca" title="SUDAH MALAS" accent={TEAL} />
			<PhotoCard key={second ? 'b' : 'a'} at={second ? T(7.3) : T(5.6)} y={960} h={470} img={second ? IMG.lazy : IMG.giveUp} focus={second ? '50% 50%' : '50% 35%'} />
		</>
	);
};

// ---------- scene 3 · sudah dijelaskan ----------
const Row: React.FC<{at: number; y: number; label: string; ok: boolean; tag?: string}> = ({at, y, label, ok, tag}) => {
	const frame = useCurrentFrame();
	const on = frame >= at;
	const k = interpolate(frame, [at, at + 4, at + 9], [0, 1.2, 1], clamp);
	return (
		<div style={{position: 'absolute', left: 40, right: 40, top: y, height: 92, display: 'flex', alignItems: 'center', gap: 26, borderTop: '1.5px solid #E7E1D6'}}>
			<div style={{width: 58, height: 58, borderRadius: 14, border: `3px solid ${on ? (ok ? TEAL : ORANGE) : '#D9D2C6'}`, backgroundColor: on ? (ok ? TEAL : ORANGE) : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
				{on ? (
					<svg width={38} height={38} viewBox="0 0 24 24" style={{scale: k}} fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round">
						<path d={ok ? 'M5 12.5l4.5 4.5L19 7' : 'M6 6l12 12M18 6L6 18'} />
					</svg>
				) : null}
			</div>
			<div style={{fontFamily: FONT.pjs, fontWeight: 800, fontSize: 44, color: on || !ok ? INK : '#B8B0A3'}}>{label}</div>
			{tag && on ? <div style={{marginLeft: 'auto', fontFamily: FONT.mono, fontSize: 22, letterSpacing: 2, color: ORANGE, border: `2px solid ${ORANGE}`, padding: '6px 14px', borderRadius: 10}}>{tag}</div> : null}
		</div>
	);
};
const S3: React.FC = () => {
	const e = useEnter(T(9.02));
	if (!e.visible) return null;
	return (
		<div style={{...cardStyle, left: 80, top: 560, width: 920, height: 860, ...e.style}}>
			<div style={{padding: '34px 40px 0'}}>
				<Anton size={64}>SUDAH DIJELASKAN</Anton>
				<Mono style={{marginTop: 6}}>informasi · penjelasan · pemahaman</Mono>
			</div>
			<div style={{position: 'absolute', left: 40, right: 40, top: 168, height: 330, borderRadius: 14, overflow: 'hidden'}}>
				<Img src={IMG.teacher} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '35% 35%'}} />
			</div>
			<Row at={T(10.36)} y={530} label="Diberi informasi" ok />
			<Row at={T(11.16)} y={622} label="Dijelaskan" ok />
			<Row at={T(12.52)} y={714} label="Memahami" ok={false} tag="MASIH SULIT" />
		</div>
	);
};

// ---------- scene 4 · bukan berarti nggak mampu ----------
const S4: React.FC = () => {
	const frame = useCurrentFrame();
	const sp = prog(frame, T(17.54) + 2, T(17.54) + 10, EASE_IN_OUT);
	return (
		<>
			<Stamp at={T(16.72)} text="BUKAN BERARTI" x={80} y={600} bg="#fff" color={INK} size={44} />
			{frame >= T(17.26) ? (
				<div style={{position: 'absolute', left: 80, top: 700, opacity: prog(frame, T(17.26), T(17.26) + 5)}}>
					<div style={{display: 'flex', gap: 24, alignItems: 'baseline'}}>
						<Anton size={120} color="#fff">LU</Anton>
						<div style={{position: 'relative'}}>
							<Anton size={120} color="rgba(255,255,255,0.45)">NGGAK</Anton>
							<div style={{position: 'absolute', left: -6, top: 64, height: 12, width: `calc(${sp * 100}% + 12px)`, backgroundColor: ORANGE, borderRadius: 6}} />
						</div>
					</div>
					<Anton size={170} color={ORANGE}>MAMPU.</Anton>
				</div>
			) : null}
		</>
	);
};

// ---------- scene 5 · bukan kecerdasan ----------
const S5: React.FC = () => {
	const frame = useCurrentFrame();
	const e = useEnter(T(19.46));
	const sp = prog(frame, T(20.2), T(20.2) + 8, EASE_IN_OUT);
	return (
		<>
			{e.visible ? (
				<div style={{...cardStyle, left: 80, top: 560, width: 920, height: 200, padding: '30px 40px', backgroundColor: INK, ...e.style}}>
					<Mono color="rgba(255,255,255,0.55)">yang kurang itu bukan</Mono>
					<div style={{position: 'relative', display: 'inline-block', marginTop: 6}}>
						<Anton size={92} color="#fff">KECERDASAN</Anton>
						<div style={{position: 'absolute', left: -8, top: 50, height: 12, width: `calc(${sp * 100}% + 16px)`, backgroundColor: ORANGE, borderRadius: 6}} />
					</div>
				</div>
			) : null}
			<ListCard at={T(21.08)} y={800} img={IMG.magnifier} label="01 · melainkan" title="KETELITIAN" accent={ORANGE} />
			<ListCard at={T(22.26)} y={990} img={IMG.hourglass} label="02" title="KESABARAN" accent={TEAL} />
			<ListCard at={T(23.14)} y={1180} img={IMG.climber} label="03 · terus mencoba" title="KEMAUAN" accent={BLUE} />
		</>
	);
};

// ---------- scene 6 · orang lain bisa ----------
const S6: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<PhotoCard at={T(25.3)} y={560} h={600} img={IMG.together} focus="50% 40%" label="ORANG LAIN BISA" caption="faktanya" />
			{frame >= T(28.1) ? (
				<div style={{position: 'absolute', left: 80, right: 80, top: 1200, display: 'flex', alignItems: 'center', gap: 26, opacity: prog(frame, T(28.1), T(28.1) + 5)}}>
					<Anton size={150} color={ORANGE}>≠</Anton>
					<Stamp at={T(28.58)} text="LU NGGAK BISA" x={140} y={36} bg="#fff" color={INK} size={60} />
				</div>
			) : null}
		</>
	);
};

// ---------- scene 7 · 1x vs 2-3x ----------
const S7: React.FC = () => {
	const frame = useCurrentFrame();
	const e = useEnter(T(29.26));
	if (!e.visible) return null;
	const a = interpolate(frame, [T(31.38), T(31.38) + 10], [0, 0.26], {...clamp, easing: EASE_OUT});
	const b = interpolate(frame, [T(34.22), T(34.22) + 10, T(34.92), T(34.92) + 10], [0, 0.52, 0.52, 0.8], {...clamp, easing: EASE_OUT});
	const bar = (h: number, color: string, label: string, img: string, name: string) => (
		<div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%'}}>
			<Anton size={70} color={color} style={{opacity: h > 0.02 ? 1 : 0}}>
				{label}
			</Anton>
			<div style={{width: 210, height: 470 * h, backgroundColor: color, borderRadius: '6px 6px 0 0', marginTop: 8}} />
			<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
				<Avatar src={img} size={70} />
				<div style={{fontFamily: FONT.pjs, fontWeight: 800, fontSize: 30, color: INK}}>{name}</div>
			</div>
		</div>
	);
	return (
		<div style={{...cardStyle, left: 80, top: 560, width: 920, height: 860, ...e.style}}>
			<div style={{padding: '34px 40px 0'}}>
				<Anton size={60}>BERAPA KALI SAMPAI PAHAM?</Anton>
				<Mono style={{marginTop: 6}}>tiap orang punya ritme</Mono>
			</div>
			<div style={{position: 'absolute', left: 40, right: 40, top: 170, bottom: 40, display: 'flex', gap: 30, borderBottom: '0'}}>
				{bar(a, '#BDB5A8', a > 0.02 ? '1×' : '', IMG.reader, 'Orang lain')}
				{bar(b, ORANGE, b > 0.6 ? '2–3×' : b > 0.02 ? '2×' : '', IMG.highlight, 'Lu')}
			</div>
		</div>
	);
};

// ---------- scene 8 · nggak masalah ----------
const S8: React.FC = () => (
	<>
		<Stamp at={T(37.56)} text="NGGAK MASALAH ✓" x={80} y={640} bg="#fff" color={INK} size={64} />
	</>
);

// ---------- scene 9 · kecepatan ----------
const SPEED = [0.92, 0.55, 0.78, 0.4, 0.66];
const S9: React.FC = () => {
	const frame = useCurrentFrame();
	const e = useEnter(T(38.62));
	if (!e.visible) return null;
	return (
		<div style={{...cardStyle, left: 80, top: 560, width: 920, height: 860, ...e.style}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 300, overflow: 'hidden'}}>
				<Img src={IMG.runners} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 30%'}} />
			</div>
			<div style={{position: 'absolute', left: 40, top: 330}}>
				<Anton size={60}>KECEPATAN BELAJAR</Anton>
				<Mono style={{marginTop: 6}}>setiap orang berbeda</Mono>
			</div>
			{SPEED.map((v, i) => {
				const p = interpolate(frame, [T(39.88) + i * 3, T(41.0)], [0, v], {...clamp, easing: EASE_OUT});
				return (
					<div key={i} style={{position: 'absolute', left: 40, right: 40, top: 480 + i * 70, height: 52, display: 'flex', alignItems: 'center', gap: 18}}>
						<div style={{width: 30, fontFamily: FONT.mono, fontSize: 22, color: MUTED}}>{String.fromCharCode(65 + i)}</div>
						<div style={{flex: 1, height: 40, backgroundColor: '#EEE8DE', borderRadius: 6, overflow: 'hidden'}}>
							<div style={{height: '100%', width: `${p * 100}%`, backgroundColor: i === 3 ? ORANGE : '#BDB5A8', borderRadius: 6}} />
						</div>
					</div>
				);
			})}
		</div>
	);
};

// ---------- scene 10 · mau terus belajar ----------
const S10: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(47.66);
	const n = frame < a ? 0 : Math.min(7, 1 + Math.floor((frame - a) / 6));
	const e = useEnter(T(46.6));
	return (
		<>
			<ListCard at={T(42.24)} y={570} img={IMG.stopwatch} label="bukan siapa yang" title="PALING CEPAT" accent="#BDB5A8" strikeAt={T(44.6)} dim={frame >= T(44.6) + 8} />
			<ListCard at={T(45.34)} y={760} img={IMG.lamp} label="tetapi siapa yang" title="MAU TERUS BELAJAR" accent={ORANGE} />
			{e.visible ? (
				<div style={{...cardStyle, left: 80, top: 960, width: 920, height: 450, ...e.style}}>
					<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 400, overflow: 'hidden'}}>
						<Img src={IMG.lamp} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '60% 50%'}} />
					</div>
					<div style={{position: 'absolute', left: 440, top: 50}}>
						<Mono>mengulang</Mono>
						<Anton size={170} color={ORANGE}>{n ? `×${n}` : '×0'}</Anton>
						<div style={{display: 'flex', gap: 12, marginTop: 10}}>
							{Array.from({length: 7}).map((_, i) => (
								<div key={i} style={{width: 46, height: 14, borderRadius: 7, backgroundColor: i < n ? ORANGE : '#E7E1D6'}} />
							))}
						</div>
					</div>
				</div>
			) : null}
		</>
	);
};

// ---------- scene 11 · jangan buru-buru ----------
const S11: React.FC = () => {
	const frame = useCurrentFrame();
	const e = useEnter(T(49.62));
	const sp = prog(frame, T(51.6), T(51.6) + 8, EASE_IN_OUT);
	if (!e.visible) return null;
	return (
		<div style={{...cardStyle, left: 80, top: 560, width: 640, height: 470, padding: '34px 40px', ...e.style}}>
			<Mono color={ORANGE}>jangan buru-buru</Mono>
			<Anton size={84} style={{marginTop: 6}}>
				MENYIMPULKAN
			</Anton>
			{frame >= T(51.14) ? (
				<div style={{position: 'relative', display: 'inline-block', marginTop: 18, backgroundColor: INK, borderRadius: 12, padding: '8px 22px', opacity: prog(frame, T(51.14), T(51.14) + 5)}}>
					<Anton size={56} color="#fff">
						“LU NGGAK MAMPU”
					</Anton>
					<div style={{position: 'absolute', left: 10, right: 10, top: '50%', height: 10, scale: `${sp} 1`, transformOrigin: '0 50%', backgroundColor: ORANGE, borderRadius: 5}} />
				</div>
			) : null}
			{frame >= T(52.4) ? (
				<div style={{marginTop: 26, fontFamily: FONT.pjs, fontWeight: 800, fontSize: 32, lineHeight: 1.25, color: INK, opacity: prog(frame, T(52.4), T(52.4) + 6)}}>
					kalau lu sendiri belum <span style={{color: ORANGE}}>benar-benar berusaha.</span>
				</div>
			) : null}
		</div>
	);
};

// ---------- scene 12 · save ----------
const Social: React.FC<{at: number; y: number; logo: string; label: string; handle: string}> = ({at, y, logo, label, handle}) => {
	const e = useEnter(at);
	if (!e.visible) return null;
	return (
		<div style={{...cardStyle, left: 80, top: y, width: 600, height: 104, display: 'flex', alignItems: 'center', gap: 22, padding: '0 26px', ...e.style}}>
			<Img src={staticFile(`logos/${logo}.png`)} style={{width: 56, height: 56, objectFit: 'contain'}} />
			<div>
				<Mono size={16}>{label}</Mono>
				<div style={{fontFamily: FONT.pjs, fontWeight: 800, fontSize: 34, color: INK}}>{handle}</div>
			</div>
		</div>
	);
};
const S12: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(54.28);
	const fill = prog(frame, a + 12, a + 18);
	const k = interpolate(frame, [a, a + 5, a + 11], [0, 1.15, 1], clamp);
	return (
		<>
			{frame >= a ? (
				<div style={{position: 'absolute', left: 80, top: 560, display: 'flex', alignItems: 'center', gap: 34, scale: k, transformOrigin: '0 50%'}}>
					<div style={{width: 150, height: 150, borderRadius: 28, backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px -14px rgba(0,0,0,0.5)'}}>
						<svg viewBox="0 0 24 24" width={84} height={84}>
							<path d="M6 3h12v18l-6-4.5L6 21z" fill={fill > 0.5 ? ORANGE : 'none'} stroke={ORANGE} strokeWidth={2.2} strokeLinejoin="round" />
						</svg>
					</div>
					<div>
						<Anton size={120} color="#fff">SAVE</Anton>
						<Anton size={64} color={ORANGE}>VIDEO INI</Anton>
					</div>
				</div>
			) : null}
			<Social at={T(55.3)} y={800} logo="tiktok" label="tiktok" handle="@researchq.id" />
			<Social at={T(55.6)} y={924} logo="instagram" label="instagram" handle="@researchq.id" />
			<Social at={T(55.9)} y={1048} logo="youtube" label="youtube" handle="NotYourLecture" />
		</>
	);
};

const CONTENT = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12];

// ---------- mascot schedule (desk always below frame) ----------
const MASCOT: {from: number; to: number; pose: Pose; cx: number; k: number; enter?: boolean; exit?: boolean}[] = [
	{from: 0, to: T(3.4), pose: 'n_present', cx: 760, k: 1.22, exit: false},
	{from: T(3.4), to: T(5.2), pose: 'm_think', cx: 780, k: 1.3, enter: false},
	{from: T(14.45), to: T(16.72), pose: 'n_present', cx: 760, k: 1.3, exit: false},
	{from: T(16.72), to: T(18.1), pose: 'm_point', cx: 760, k: 1.38, enter: false},
	{from: T(36.85), to: T(38.55), pose: 'm_thumb', cx: 760, k: 1.38},
	{from: T(49.45), to: T(54.05), pose: 'm_warn', cx: 800, k: 1.32},
	{from: T(54.05), to: REF_FRAMES + 30, pose: 'n_wink', cx: 820, k: 1.3},
];

// ---------- scene transitions ----------
const Wipe: React.FC<{kind: 'steps' | 'diag'; p: number; children: React.ReactNode}> = ({kind, p, children}) => {
	let clip: string;
	if (kind === 'steps') {
		const cols = 8;
		const pts: string[] = ['0% 100%'];
		for (let i = 0; i < cols; i++) {
			const local = Math.min(1, Math.max(0, p * 1.6 - (i / cols) * 0.6));
			const top = 100 - local * 100;
			pts.push(`${(i / cols) * 100}% ${top}%`, `${((i + 1) / cols) * 100}% ${top}%`);
		}
		pts.push('100% 100%');
		clip = `polygon(${pts.join(',')})`;
	} else {
		const x = p * 200;
		clip = `polygon(0% 0%, ${x}% 0%, ${x - 60}% 100%, 0% 100%)`;
	}
	return <AbsoluteFill style={{clipPath: clip}}>{children}</AbsoluteFill>;
};

const SceneLayer: React.FC<{i: number}> = ({i}) => {
	const sc = SCENES[i];
	const C = CONTENT[i];
	return (
		<AbsoluteFill>
			<Background theme={sc.theme} />
			<C />
			<Watermark theme={sc.theme} />
			<Subtitle theme={sc.theme} />
		</AbsoluteFill>
	);
};

// ---------- sound (Studio Pack library, gains per SFX_CATALOG) ----------
type Cue = {at: number; s: string; v: number; rate?: number; trim?: number};
const db = (d: number) => Math.pow(10, d / 20);
const CUES: Cue[] = [
	// hook
	{at: 0.82, s: 's04', v: db(-20), rate: 0.95},
	{at: 1.54, s: 's04', v: db(-21), rate: 1.05},
	{at: 2.24, s: 's12', v: db(-24)},
	{at: 3.3, s: 's13', v: db(-22), rate: 1.4, trim: 0.3},
	{at: 4.22, s: 's01', v: db(-19), rate: 1.5, trim: 0.35},
	// cream · menyerah / malas
	{at: 5.15, s: 's13', v: db(-20), rate: 1.3, trim: 0.3},
	{at: 5.34, s: 's04', v: db(-20), rate: 1.0},
	{at: 5.6, s: 's05', v: db(-24)},
	{at: 6.38, s: 's07', v: db(-24)},
	{at: 7.16, s: 's04', v: db(-20), rate: 1.1},
	{at: 7.3, s: 's05', v: db(-24)},
	{at: 8.32, s: 's07', v: db(-24)},
	{at: 8.5, s: 's06', v: db(-26)},
	// orange · dijelaskan
	{at: 8.92, s: 's13', v: db(-20), rate: 1.2, trim: 0.3},
	{at: 9.02, s: 's04', v: db(-21)},
	{at: 10.36, s: 's02', v: db(-18), rate: 1.0},
	{at: 11.16, s: 's02', v: db(-18), rate: 1.12},
	{at: 12.52, s: 's03', v: db(-20)},
	{at: 13.56, s: 's07', v: db(-22)},
	{at: 14.0, s: 's06', v: db(-26)},
	// dark · bukan berarti nggak mampu
	{at: 14.42, s: 's13', v: db(-20), rate: 1.4, trim: 0.3},
	{at: 16.72, s: 's03', v: db(-21)},
	{at: 17.26, s: 's04', v: db(-21)},
	{at: 17.6, s: 's01', v: db(-19), rate: 1.5, trim: 0.35},
	{at: 17.62, s: 's00', v: db(-24)},
	// cream · bukan kecerdasan
	{at: 18.07, s: 's13', v: db(-20), rate: 1.3, trim: 0.3},
	{at: 19.46, s: 's04', v: db(-21)},
	{at: 20.2, s: 's01', v: db(-19), rate: 1.5, trim: 0.35},
	{at: 21.08, s: 's04', v: db(-20), rate: 0.95},
	{at: 22.26, s: 's04', v: db(-20), rate: 1.05},
	{at: 23.14, s: 's04', v: db(-20), rate: 1.15},
	{at: 24.3, s: 's02', v: db(-20), rate: 1.24},
	{at: 24.7, s: 's06', v: db(-26)},
	// dark · orang lain bisa
	{at: 25.02, s: 's13', v: db(-20), rate: 1.4, trim: 0.3},
	{at: 25.3, s: 's04', v: db(-21)},
	{at: 28.1, s: 's03', v: db(-20)},
	{at: 28.58, s: 's01', v: db(-20), rate: 1.5, trim: 0.35},
	// cream · 1x vs 2-3x
	{at: 29.17, s: 's13', v: db(-20), rate: 1.3, trim: 0.3},
	{at: 29.26, s: 's04', v: db(-21)},
	{at: 31.38, s: 's07', v: db(-21)},
	{at: 34.22, s: 's07', v: db(-21)},
	{at: 34.92, s: 's07', v: db(-20)},
	{at: 36.24, s: 's02', v: db(-19), rate: 1.12},
	{at: 36.5, s: 's06', v: db(-26)},
	// orange · nggak masalah
	{at: 36.82, s: 's13', v: db(-20), rate: 1.2, trim: 0.3},
	{at: 37.56, s: 's01', v: db(-21), rate: 1.5, trim: 0.35},
	{at: 37.7, s: 's02', v: db(-18), rate: 1.24},
	// dark · kecepatan
	{at: 38.52, s: 's13', v: db(-20), rate: 1.4, trim: 0.3},
	{at: 38.62, s: 's04', v: db(-21)},
	...[0, 1, 2, 3, 4].map((i) => ({at: 39.88 + i * 0.1, s: 's11', v: db(-28), trim: 0.07})),
	{at: 41.0, s: 's03', v: db(-21)},
	// cream · mau terus belajar
	{at: 41.82, s: 's13', v: db(-20), rate: 1.3, trim: 0.3},
	{at: 42.24, s: 's04', v: db(-21)},
	{at: 44.6, s: 's01', v: db(-20), rate: 1.5, trim: 0.35},
	{at: 45.34, s: 's04', v: db(-20), rate: 1.08},
	{at: 46.6, s: 's04', v: db(-21), rate: 0.95},
	...Array.from({length: 7}).map((_, i) => ({at: 47.66 + i * 0.2, s: 's07', v: db(-27), rate: 1 + i * 0.05})),
	{at: 49.0, s: 's06', v: db(-25)},
	// dark · jangan buru-buru
	{at: 49.42, s: 's13', v: db(-20), rate: 1.4, trim: 0.3},
	{at: 49.62, s: 's04', v: db(-21)},
	{at: 50.36, s: 's03', v: db(-21)},
	{at: 51.14, s: 's04', v: db(-21), rate: 1.1},
	{at: 51.6, s: 's01', v: db(-19), rate: 1.5, trim: 0.35},
	{at: 52.4, s: 's05', v: db(-24)},
	{at: 53.4, s: 's06', v: db(-24)},
	// CTA
	{at: 54.02, s: 's13', v: db(-20), rate: 1.2, trim: 0.3},
	{at: 54.28, s: 's04', v: db(-19)},
	{at: 54.7, s: 's03', v: db(-18)},
	{at: 55.3, s: 's04', v: db(-22), rate: 0.95},
	{at: 55.6, s: 's04', v: db(-22), rate: 1.05},
	{at: 55.9, s: 's04', v: db(-22), rate: 1.15},
	{at: 56.52, s: 's00', v: db(-22)},
	{at: 56.6, s: 's14', v: db(-26)},
];

export const MentalRef: React.FC = () => {
	const frame = useCurrentFrame();
	const idx = sceneAt(frame);
	const start = T(SCENES[idx].at);
	const p = idx === 0 ? 1 : prog(frame, start, start + 12, EASE_IN_OUT);
	return (
		<AbsoluteFill style={{backgroundColor: '#120D0A'}}>
			{p < 1 ? <SceneLayer i={idx - 1} /> : null}
			<Wipe kind={SCENES[idx].wipe} p={p}>
				<SceneLayer i={idx} />
			</Wipe>
			{MASCOT.map((m, i) => (
				<Narrator key={i} pose={m.pose} cx={m.cx} k={m.k} from={m.from} to={m.to} enter={m.enter ?? true} exit={m.exit ?? true} />
			))}
			<AbsoluteFill style={{backgroundColor: '#000', opacity: Math.max(interpolate(frame, [0, 6], [1, 0], clamp), interpolate(frame, [REF_FRAMES - 15, REF_FRAMES - 1], [0, 1], clamp))}} />
			<Audio src={staticFile('vo_mental.wav')} />
			{CUES.map((c, i) => (
				<Sequence key={i} from={T(c.at)} layout="none" name={`sfx ${c.s}`}>
					<Audio src={staticFile(`sfx/pack/${c.s}.wav`)} volume={c.v} playbackRate={c.rate ?? 1} trimAfter={c.trim ? Math.round(c.trim * 30) : undefined} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

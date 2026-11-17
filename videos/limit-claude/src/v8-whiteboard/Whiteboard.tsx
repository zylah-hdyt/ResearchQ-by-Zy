import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN_OUT, EASE_OUT, f, prog, WORD} from '../shared/timing';

// Whiteboard explainer: everything is "written" by a marker. Strokes wobble and boil on threes.
const BOARD = '#F8F6EF';
const INK = '#23221F';
const BLUE = '#2850C8';
const RED = '#DE3F28';
const GREEN = '#25936A';
const YEL = '#FFD84D';
const PINK = '#FFB5A7';
const SKY = '#A8D3F5';

// ---------- marker ----------
const Pen: React.FC<{x: number; y: number; color: string}> = ({x, y, color}) => (
	<g transform={`translate(${x} ${y}) rotate(38)`}>
		<rect x={-4} y={-170} width={34} height={150} rx={10} fill="#F2F0EA" stroke="#CFCABB" strokeWidth={2} />
		<rect x={-4} y={-170} width={34} height={42} rx={10} fill={color} />
		<path d="M-2 -20 L8 0 L20 0 L30 -20 Z" fill="#D8D4C6" />
		<circle cx={14} cy={0} r={5} fill={color} />
	</g>
);

const wob = (frame: number) => Math.floor(frame / 3) % 4;

// ---------- primitives (all draw in an SVG that fills the board) ----------
const Stroke: React.FC<{d: string; at: number; dur: number; color?: string; w?: number; fill?: string; pen?: boolean; ease?: (t: number) => number}> = ({d, at, dur, color = INK, w = 9, fill = 'none', pen = true}) => {
	const frame = useCurrentFrame();
	const len = useMemo(() => getLength(d), [d]);
	if (frame < at) return null;
	const t = interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: EASE_IN_OUT});
	const ev = evolvePath(t, d);
	const tip = getPointAtLength(d, len * t);
	return (
		<>
			<path d={d} fill={fill} stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
			{pen && tip && t > 0 && t < 1 ? <Pen x={tip.x} y={tip.y} color={color} /> : null}
		</>
	);
};

type WriteProps = {text: string; at: number; dur: number; x: number; y: number; size: number; color?: string; rot?: number; weight?: number; pen?: boolean};
const Write: React.FC<WriteProps> = ({text, at, dur, x, y, size, color = INK, rot = 0, weight = 700, pen = true}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const caps = /^[A-Z0-9%?!.]+$/.test(text.replace(/\s/g, ''));
	const w = text.length * size * (caps ? 0.66 : 0.46);
	const t = interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: (v) => v});
	const id = `clip-${at}-${x}-${y}`;
	return (
		<g transform={`rotate(${rot} ${x} ${y})`}>
			<clipPath id={id}>
				<rect x={x - 20} y={y - size} width={w * t + 20} height={size * 1.6} />
			</clipPath>
			<text x={x} y={y} fontFamily={FONT.caveat} fontWeight={weight} fontSize={size} fill={color} clipPath={`url(#${id})`}>
				{text}
			</text>
			{pen && t > 0 && t < 1 ? <Pen x={x + w * t} y={y - size * 0.18} color={color} /> : null}
		</g>
	);
};

/** Flat colour block, deliberately offset from its outline like a misregistered print. */
const Flat: React.FC<{d: string; at: number; color: string; dx?: number; dy?: number; dur?: number; origin?: [number, number]}> = ({d, at, color, dx = 10, dy = 9, dur = 6, origin}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const t = interpolate(frame, [at, at + dur], [0, 1], {...clamp, easing: EASE_OUT});
	return <path d={d} fill={color} opacity={0.9} transform={`translate(${dx} ${dy}) ${origin ? `translate(${origin[0]} ${origin[1]}) scale(${t}) translate(${-origin[0]} ${-origin[1]})` : ''}`} style={{mixBlendMode: 'multiply'}} />;
};

// ---------- scene 1: the battery ----------
const BATT = 'M250 640 H790 a30 30 0 0 1 30 30 V850 a30 30 0 0 1 -30 30 H250 a30 30 0 0 1 -30 -30 V670 a30 30 0 0 1 30 -30 Z';
const Scene1: React.FC = () => {
	const frame = useCurrentFrame();
	const drain = (i: number) => prog(frame, f(WORD.habis) + (4 - i) * 2, f(WORD.habis) + (4 - i) * 2 + 6);
	return (
		<g>
			<Write text="Pernah nggak?" at={0} dur={18} x={70} y={190} size={170} />
			<Write text="limit Claude" at={f(WORD.limit)} dur={14} x={70} y={410} size={120} color={BLUE} />
			<Stroke d={BATT} at={4} dur={14} w={12} />
			<Stroke d="M820 710 H860 V810 H820" at={16} dur={5} w={12} />
			{[0, 1, 2, 3, 4].map((i) => {
				const x = 255 + i * 108;
				const d = `M${x} 665 h92 v190 h-92 Z`;
				const gone = drain(i);
				return gone < 0.5 ? <Flat key={i} d={d} at={19 + i} color={i === 0 ? '#FF8E7A' : '#7BD1A5'} dx={4} dy={4} dur={4} origin={[x + 46, 760]} /> : null;
			})}
			{frame >= f(WORD.habis) + 2 ? <Write text="0%" at={f(WORD.habis) + 2} dur={8} x={410} y={800} size={150} color={RED} /> : null}
			<Write text="HABIS" at={f(WORD.habis)} dur={9} x={90} y={1090} size={230} color={RED} rot={-4} />
			<Stroke d="M80 1130 C 300 1170, 560 1110, 820 1150" at={f(WORD.habis) + 8} dur={6} color={RED} w={10} />
			<Write text="padahal kamu merasa" at={f(WORD.padahal)} dur={22} x={70} y={1300} size={104} color={BLUE} />
			<Write text="belum banyak" at={f(WORD.belumBanyak)} dur={12} x={70} y={1410} size={104} color={BLUE} />
			<Write text="menggunakannya?" at={f(WORD.menggunakannya)} dur={16} x={70} y={1520} size={104} color={BLUE} />
		</g>
	);
};

// ---------- scene 2: two limits ----------
const Scene2: React.FC = () => (
	<g>
		<Write text="sebenarnya ada" at={100} dur={16} x={70} y={190} size={120} />
		<Write text="2" at={f(WORD.dua)} dur={12} x={80} y={800} size={640} color={RED} />
		<Stroke d="M60 840 C 40 520, 560 480, 600 760 C 640 1000, 200 1020, 80 850" at={f(WORD.dua) + 10} dur={12} color={RED} w={9} />
		<Write text="batas" at={f(WORD.batas) + 2} dur={12} x={560} y={560} size={230} />
		<Write text="penggunaan" at={f(WORD.penggunaan) + 2} dur={20} x={560} y={720} size={120} color={BLUE} />
		{/* the two boxes, drawn as the VO says "yang perlu kamu pahami" */}
		<Stroke d="M70 1180 H500 V1500 H70 Z" at={f(4.72)} dur={10} color={INK} w={8} />
		<Flat d="M70 1180 H500 V1500 H70 Z" at={f(4.72) + 8} color={YEL} />
		<Write text="1" at={f(4.72) + 10} dur={4} x={105} y={1330} size={170} color={RED} />
		<Write text="sesi 5 jam" at={f(4.72) + 12} dur={12} x={150} y={1430} size={70} />
		<Stroke d="M580 1180 H1010 V1500 H580 Z" at={f(WORD.pahami) - 6} dur={10} color={INK} w={8} />
		<Flat d="M580 1180 H1010 V1500 H580 Z" at={f(WORD.pahami) + 2} color={SKY} />
		<Write text="2" at={f(WORD.pahami) + 2} dur={4} x={615} y={1330} size={170} color={RED} />
		<Write text="mingguan" at={f(WORD.pahami) + 4} dur={12} x={660} y={1430} size={70} />
	</g>
);

// ---------- scene 3+4: the five-hour clock ----------
const CX = 540;
const CY = 830;
const R = 260;
const wedge = (i: number) => {
	const a0 = (-90 + i * 72) * (Math.PI / 180);
	const a1 = (-90 + (i + 1) * 72) * (Math.PI / 180);
	return `M${CX} ${CY} L${CX + Math.cos(a0) * R} ${CY + Math.sin(a0) * R} A${R} ${R} 0 0 1 ${CX + Math.cos(a1) * R} ${CY + Math.sin(a1) * R} Z`;
};
const spoke = (i: number) => {
	const a = (-90 + i * 72) * (Math.PI / 180);
	return `M${CX} ${CY} L${CX + Math.cos(a) * R} ${CY + Math.sin(a) * R}`;
};
const CIRCLE = `M${CX} ${CY - R} A${R} ${R} 0 1 1 ${CX - 0.01} ${CY - R}`;

const Scene3: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.setiap);
	const b = f(WORD.selesai) + 4;
	const resetAt = f(WORD.limit2) + 2;
	return (
		<g>
			<Write text="1" at={f(WORD.pertama) + 4} dur={6} x={70} y={290} size={300} color={RED} />
			<Write text="current session" at={f(WORD.current) - 2} dur={22} x={290} y={250} size={128} color={BLUE} />
			<Write text="batas pakai tiap periode" at={f(WORD.yaitu1)} dur={26} x={70} y={420} size={92} />
			<Stroke d={CIRCLE} at={f(WORD.yaitu1) + 8} dur={16} w={11} />
			{[0, 1, 2, 3, 4].map((i) => (
				<Stroke key={i} d={spoke(i)} at={f(WORD.yaitu1) + 22 + i * 2} dur={5} w={8} pen={false} />
			))}
			{[0, 1, 2, 3, 4].map((i) => {
				const t0 = a + ((b - a) / 5) * i;
				const reset = frame >= resetAt ? 1 - prog(frame, resetAt + i * 2, resetAt + i * 2 + 5) : 1;
				return reset > 0.02 && frame >= t0 ? <Flat key={i} d={wedge(i)} at={t0} color={i % 2 ? '#FFC24D' : YEL} dx={7} dy={6} dur={8} origin={[CX, CY]} /> : null;
			})}
			{[0, 1, 2, 3, 4].map((i) => {
				const m = (-90 + (i + 0.5) * 72) * (Math.PI / 180);
				return <Write key={i} text={String(i + 1)} at={f(WORD.yaitu1) + 30 + i * 2} dur={4} x={CX + Math.cos(m) * 160 - 14} y={CY + Math.sin(m) * 160 + 24} size={80} pen={false} />;
			})}
			<Write text="5 jam" at={f(WORD.lima)} dur={12} x={80} y={1340} size={200} color={BLUE} />
			<Stroke d="M80 1375 C 300 1400, 520 1350, 640 1380" at={f(WORD.jam) + 2} dur={8} color={BLUE} w={10} pen={false} />
			{/* reset: a circular arrow around the clock, then a tick */}
			<Stroke d={`M${CX + 330} ${CY - 20} A 330 330 0 1 1 ${CX - 60} ${CY - 322}`} at={resetAt} dur={12} color={RED} w={12} />
			<Stroke d={`M${CX - 110} ${CY - 380} L${CX - 55} ${CY - 322} L${CX - 125} ${CY - 285}`} at={resetAt + 11} dur={5} color={RED} w={12} />
			<Write text="RESET" at={f(WORD.direset) - 2} dur={12} x={80} y={1580} size={210} color={RED} rot={-3} />
			<Stroke d="M700 1500 L760 1565 L890 1410" at={f(WORD.otomatis)} dur={9} color={GREEN} w={22} />
			<Write text="otomatis" at={f(WORD.otomatis) + 6} dur={12} x={80} y={1730} size={120} color={GREEN} />
		</g>
	);
};

// ---------- scene 5: the week ----------
const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const Scene5: React.FC = () => {
	const a = f(WORD.mingguan) - 4;
	const b = f(WORD.jadwal) + 2;
	return (
		<g>
			<Write text="2" at={f(WORD.kedua) + 2} dur={6} x={70} y={290} size={300} color={RED} />
			<Write text="weekly limit" at={f(WORD.weekly)} dur={20} x={290} y={250} size={140} color={GREEN} />
			<Write text="batas mingguan" at={f(WORD.yaitu2)} dur={22} x={70} y={470} size={104} />
			{DAYS.map((d, i) => {
				const x = 40 + i * 143;
				const box = `M${x} 640 H${x + 128} V790 H${x} Z`;
				const t0 = a + ((b - a) / 7) * i;
				return (
					<g key={d}>
						<Stroke d={box} at={f(WORD.yaitu2) + 10 + i} dur={6} w={7} pen={false} />
						<Flat d={box} at={t0} color={i === 3 ? PINK : YEL} dx={6} dy={6} dur={5} />
						<Write text={d} at={f(WORD.yaitu2) + 14 + i} dur={4} x={x + 22} y={738} size={64} pen={false} />
					</g>
				);
			})}
			<Stroke d="M458 600 C 380 650, 380 830, 470 840 C 580 850, 640 700, 560 620 C 530 590, 480 590, 440 620" at={f(WORD.jadwal)} dur={10} color={RED} w={9} />
			<Write text="reset di sini" at={f(WORD.jadwal) + 8} dur={14} x={420} y={960} size={90} color={RED} rot={-3} />
			<Stroke d="M560 870 C 560 900, 540 920, 520 930" at={f(WORD.jadwal) + 10} dur={5} color={RED} w={8} pen={false} />
			<Write text="jadwal reset" at={f(WORD.jadwal)} dur={14} x={70} y={1210} size={150} />
			<Write text="tersendiri" at={f(WORD.tersendiri)} dur={16} x={70} y={1390} size={190} color={BLUE} />
			<Stroke d="M70 1440 C 340 1470, 640 1420, 980 1450" at={f(WORD.tersendiri) + 14} dur={8} color={BLUE} w={11} pen={false} />
			<Stroke d="M90 1475 C 380 1500, 660 1460, 940 1490" at={f(WORD.tersendiri) + 18} dur={8} color={BLUE} w={8} pen={false} />
			<Write text="(beda dari sesi 5 jam)" at={f(WORD.tersendiri) + 20} dur={9} x={70} y={1620} size={80} color={INK} />
		</g>
	);
};

// ---------- eraser wipe ----------
const Eraser: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > at + 12) return null;
	const y = interpolate(frame, [at, at + 12], [-160, 1980], {...clamp, easing: EASE_IN_OUT});
	return (
		<div style={{position: 'absolute', left: -30, top: y, width: 1140, height: 150, rotate: '-1.2deg', filter: 'drop-shadow(0 14px 14px rgba(0,0,0,0.3))'}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: 26, backgroundColor: '#3E3B35'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 58, borderRadius: '0 0 26px 26px', backgroundColor: '#B9B4A4'}} />
		</div>
	);
};

const WipeClip: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const frame = useCurrentFrame();
	const y = interpolate(frame, [at, at + 12], [0, 1920], {...clamp, easing: EASE_IN_OUT});
	return <AbsoluteFill style={{clipPath: `inset(${y}px 0 0 0)`}}>{children}</AbsoluteFill>;
};

const Tray: React.FC = () => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 56, backgroundColor: '#C9C4B5', borderTop: '4px solid #B7B2A2'}}>
		{[INK, BLUE, RED, GREEN].map((c, i) => (
			<div key={c} style={{position: 'absolute', left: 80 + i * 90, top: -26, width: 70, height: 24, borderRadius: 12, backgroundColor: '#F2F0EA', border: '2px solid #CFCABB'}}>
				<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, borderRadius: '12px 0 0 12px', backgroundColor: c}} />
			</div>
		))}
	</div>
);

export const Whiteboard: React.FC = () => {
	const frame = useCurrentFrame();
	const seed = wob(frame);
	const layer = (children: React.ReactNode) => (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
			{children}
		</svg>
	);
	return (
		<AbsoluteFill style={{backgroundColor: BOARD}}>
			<svg width={0} height={0} style={{position: 'absolute'}}>
				<filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
					<feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed + 3} result="n" />
					<feDisplacementMap in="SourceGraphic" in2="n" scale={6} xChannelSelector="R" yChannelSelector="G" />
				</filter>
			</svg>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.7), rgba(0,0,0,0.04) 100%)'}} />
			<AbsoluteFill style={{filter: 'url(#wob)'}}>
				{frame < 100 ? <WipeClip at={88}>{layer(<Scene1 />)}</WipeClip> : null}
				{frame >= 96 && frame < 174 ? <WipeClip at={162}>{layer(<Scene2 />)}</WipeClip> : null}
				{frame >= 168 && frame < 344 ? <WipeClip at={332}>{layer(<Scene3 />)}</WipeClip> : null}
				{frame >= 336 ? layer(<Scene5 />) : null}
			</AbsoluteFill>
			<Eraser at={88} />
			<Eraser at={162} />
			<Eraser at={332} />
			<Tray />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: interpolate(frame, [442, 449], [0, 1], clamp)}} />
			<VO />
			<SfxTrack
				cues={[
					{at: 0, name: 'rustle', vol: 0.22},
					{at: f(WORD.limit), name: 'rustle', vol: 0.2},
					{at: f(WORD.habis), name: 'thump', vol: 0.5},
					{at: f(WORD.padahal), name: 'rustle', vol: 0.2},
					{at: 88, name: 'rustle', vol: 0.4},
					{at: f(WORD.dua), name: 'thump', vol: 0.45},
					{at: f(WORD.penggunaan), name: 'pop', vol: 0.3},
					{at: f(4.72), name: 'pop', vol: 0.3},
					{at: f(WORD.pahami), name: 'pop', vol: 0.3},
					{at: 162, name: 'rustle', vol: 0.4},
					{at: f(WORD.yaitu1) + 8, name: 'rustle', vol: 0.22},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(f(WORD.setiap) + ((f(WORD.selesai) + 4 - f(WORD.setiap)) / 5) * i), name: 'pop' as const, vol: 0.26})),
					{at: f(WORD.limit2) + 2, name: 'whoosh', vol: 0.25},
					{at: f(WORD.direset) - 2, name: 'thump', vol: 0.5},
					{at: f(WORD.otomatis), name: 'ding', vol: 0.4},
					{at: 332, name: 'rustle', vol: 0.4},
					{at: f(WORD.weekly), name: 'rustle', vol: 0.2},
					...[0, 1, 2, 3, 4, 5, 6].map((i) => ({at: Math.round(f(WORD.mingguan) - 4 + ((f(WORD.jadwal) + 2 - f(WORD.mingguan) + 4) / 7) * i), name: 'pop' as const, vol: 0.2})),
					{at: f(WORD.jadwal), name: 'pop', vol: 0.35},
					{at: f(WORD.tersendiri), name: 'rustle', vol: 0.25},
				]}
			/>
		</AbsoluteFill>
	);
};

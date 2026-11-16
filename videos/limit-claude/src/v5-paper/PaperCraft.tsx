import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN_OUT, EASE_OUT, f, rand, stepped, WORD} from '../shared/timing';

const u = (id: string, w = 900) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const TEX = u('1586075010923-2dd4570fb338', 1400);
const PHOTO = {
	alarm: u('1495364141860-b0d03eccd065'),
	hourglass: u('1501139083538-0139583c060f'),
	calendar: u('1506784983877-45594efa4cbe'),
};

const KRAFT = '#CDB28A';
const PAPER = '#F6F1E7';
const RED = '#D8432F';
const INK = '#23201C';
const NOTE = ['#FFE27A', '#FFB7A8', '#B9E3C6', '#A9D2F5', '#FFD08A', '#D9C2F0', '#F7F0A8'];

// ---------- stop-motion helpers ----------
/** Frame quantised to 2s (15 fps) – every animated value reads this. */
const useStep = () => stepped(useCurrentFrame(), 2);
const p = (fr: number, a: number, b: number, e = EASE_OUT) => interpolate(fr, [a, b], [0, 1], {...clamp, easing: e});
/** Hand-placed jitter: a tiny offset that changes on every step, like a re-shot cutout. */
const boil = (fr: number, seed: number, amt = 1) => ({
	x: (rand(fr * 0.37 + seed) - 0.5) * 3 * amt,
	y: (rand(fr * 0.53 + seed * 3) - 0.5) * 3 * amt,
	r: (rand(fr * 0.71 + seed * 5) - 0.5) * 0.8 * amt,
});

/** Torn-edge polygon for clip-path. */
const torn = (seed: number, teeth = 26, depth = 2.4, sides: ('top' | 'bottom')[] = ['top', 'bottom']) => {
	const pts: string[] = [];
	for (let i = 0; i <= teeth; i++) {
		const x = (i / teeth) * 100;
		pts.push(`${x}% ${sides.includes('top') ? rand(seed + i) * depth : 0}%`);
	}
	for (let i = teeth; i >= 0; i--) {
		const x = (i / teeth) * 100;
		pts.push(`${x}% ${100 - (sides.includes('bottom') ? rand(seed + 100 + i) * depth : 0)}%`);
	}
	return `polygon(${pts.join(',')})`;
};

const shadow = (lift = 1) => `drop-shadow(0 ${3 * lift}px 0 rgba(60,40,20,0.18)) drop-shadow(0 ${14 * lift}px ${18 * lift}px rgba(60,40,20,0.32))`;

const Paper: React.FC<{style?: React.CSSProperties; color?: string; seed?: number; tornEdges?: boolean; children?: React.ReactNode; lift?: number}> = ({style, color = PAPER, seed = 1, tornEdges, children, lift = 1}) => (
	<div style={{position: 'absolute', filter: shadow(lift), ...style}}>
		<div style={{position: 'relative', width: '100%', height: '100%', backgroundColor: color, clipPath: tornEdges ? torn(seed) : undefined, overflow: 'hidden'}}>
			<Img src={TEX} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.45}} />
			<div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div>
		</div>
	</div>
);

/** Label-maker tape: black embossed strip with raised white letters. */
const Dymo: React.FC<{text: string; style?: React.CSSProperties; color?: string}> = ({text, style, color = INK}) => (
	<div style={{position: 'absolute', backgroundColor: color, padding: '14px 30px', borderRadius: 6, filter: shadow(0.6), fontFamily: FONT.archivo, fontSize: 46, letterSpacing: 8, color: '#f3efe6', textShadow: '0 -1px 0 rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.35)', ...style}}>
		{text}
	</div>
);

/** A photo cut out and stuck on like a sticker. */
const Sticker: React.FC<{src: string; w: number; h: number; style?: React.CSSProperties; seed: number}> = ({src, w, h, style, seed}) => (
	<div style={{position: 'absolute', width: w, height: h, filter: shadow(1.1), ...style}}>
		<div style={{width: '100%', height: '100%', backgroundColor: '#fff', padding: 14, clipPath: torn(seed, 18, 1.6), boxSizing: 'border-box'}}>
			<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.05) saturate(0.9)'}} />
		</div>
	</div>
);

/** A hand-drawn stroke that draws itself. */
const Scribble: React.FC<{d: string; at: number; dur: number; color?: string; width?: number; style?: React.CSSProperties; vb?: string}> = ({d, at, dur, color = RED, width = 9, style, vb = '0 0 400 200'}) => {
	const s = useStep();
	const t = p(s, at, at + dur, EASE_IN_OUT);
	if (s < at) return null;
	return (
		<svg viewBox={vb} style={{position: 'absolute', overflow: 'visible', ...style}}>
			<path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />
		</svg>
	);
};

/** Handwritten words, revealed word by word on their VO hit. */
const Hand: React.FC<{at: number; text: string; size: number; color?: string; style?: React.CSSProperties; rot?: number}> = ({at, text, size, color = INK, style, rot = -2}) => {
	const s = useStep();
	if (s < at) return null;
	const words = text.split(' ');
	return (
		<div style={{position: 'absolute', fontFamily: FONT.caveat, fontWeight: 700, fontSize: size, color, rotate: `${rot}deg`, lineHeight: 1, ...style}}>
			{words.map((w, i) => (
				<span key={i} style={{opacity: s >= at + i * 2 ? 1 : 0}}>
					{w}{' '}
				</span>
			))}
		</div>
	);
};

/** Rubber stamp slam. */
const Stamp: React.FC<{at: number; text: string; style?: React.CSSProperties; size?: number; rot?: number}> = ({at, text, style, size = 150, rot = -8}) => {
	const s = useStep();
	if (s < at - 2) return null;
	const k = interpolate(s, [at - 2, at, at + 4], [1.9, 0.94, 1], clamp);
	const o = interpolate(s, [at - 2, at], [0, 1], clamp);
	return (
		<div style={{position: 'absolute', scale: k, opacity: o, rotate: `${rot}deg`, ...style}}>
			<div style={{border: `10px solid ${RED}`, borderRadius: 18, padding: '6px 34px', fontFamily: FONT.archivo, fontSize: size, color: RED, letterSpacing: 6, mixBlendMode: 'multiply', opacity: 0.88, WebkitMaskImage: `url(${TEX})`, WebkitMaskSize: 'cover', maskImage: `url(${TEX})`}}>
				{text}
			</div>
		</div>
	);
};

// ---------- B1: hook ----------
const Battery: React.FC = () => {
	const s = useStep();
	const at = f(WORD.habis) - 1;
	const b = boil(s, 3, 0.6);
	return (
		<div style={{position: 'absolute', left: 150, top: 560, width: 780, height: 300, translate: `${b.x}px ${b.y}px`, rotate: `${-3 + b.r}deg`}}>
			<Paper style={{inset: 0}} color="#3B3631" seed={4} lift={1.2}>
				<div style={{position: 'absolute', right: -1, top: 105, width: 40, height: 90, backgroundColor: '#3B3631'}} />
			</Paper>
			<div style={{position: 'absolute', right: -44, top: 100, width: 50, height: 100, backgroundColor: '#3B3631', borderRadius: 8, filter: shadow(0.6)}} />
			{Array.from({length: 5}).map((_, i) => {
				const k = 4 - i; // last chunk leaves first
				const t0 = at + k * 3;
				const fly = p(s, t0, t0 + 14, Easing.in(Easing.quad));
				return (
					<Paper
						key={i}
						seed={20 + i}
						color={i === 0 ? RED : '#F08A3C'}
						lift={0.7 + fly}
						style={{left: 30 + i * 146, top: 30, width: 128, height: 240, translate: `${fly * (260 + i * 60)}px ${-fly * (500 - i * 40) + fly * fly * 900}px`, rotate: `${fly * (i % 2 ? 180 : -140)}deg`, opacity: 1 - p(s, t0 + 10, t0 + 16)}}
					/>
				);
			})}
		</div>
	);
};

const Hook: React.FC = () => {
	const s = useStep();
	const title = 'LIMIT'.split('');
	return (
		<AbsoluteFill>
			{title.map((l, i) => {
				const d = p(s, i * 2 + 2, i * 2 + 8, Easing.out(Easing.back(2)));
				const b = boil(s, i + 40, 0.8);
				return (
					<Paper key={i} seed={i + 9} color={i % 2 ? PAPER : '#FFE27A'} style={{left: 120 + i * 172, top: 220, width: 150, height: 190, translate: `${b.x}px ${(1 - d) * -500 + b.y}px`, rotate: `${(rand(i) - 0.5) * 14 + b.r}deg`}}>
						<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: FONT.archivo, fontSize: 130, color: INK}}>{l}</div>
					</Paper>
				);
			})}
			<Hand at={f(WORD.claude) - 2} text="claude kamu..." size={70} style={{left: 140, top: 450}} rot={-3} />
			<Battery />
			<Hand at={f(WORD.habis) + 4} text="habis?!" size={150} color={RED} style={{left: 520, top: 880}} rot={-8} />
			<Scribble at={f(WORD.habis) + 8} dur={8} d="M20 150 C 120 40, 260 40, 360 120 M330 80 L365 122 L315 140" style={{left: 220, top: 900, width: 300, height: 150}} />
			{s >= f(WORD.padahal) ? (
				<Paper
					seed={77}
					color={NOTE[0]}
					lift={1.3}
					style={{left: 140, top: 1180, width: 640, height: 440, rotate: `${3 + boil(s, 7).r}deg`, scale: interpolate(s, [f(WORD.padahal), f(WORD.padahal) + 4], [1.25, 1], clamp)}}
				>
					<Hand at={f(WORD.padahal)} text="padahal kamu merasa" size={72} style={{left: 40, top: 60}} rot={-1} />
					<Hand at={f(WORD.belumBanyak)} text="belum banyak" size={72} style={{left: 40, top: 150}} rot={-1} />
					<Hand at={f(WORD.menggunakannya)} text="menggunakannya..." size={72} style={{left: 40, top: 240}} rot={-1} />
					<div style={{position: 'absolute', top: -18, left: 250, width: 160, height: 50, backgroundColor: 'rgba(255,255,255,0.55)', rotate: '-4deg'}} />
				</Paper>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- B2: two index cards ----------
const IndexCard: React.FC<{at: number; side: 'left' | 'right'; num: string; label: string; top: number; seed: number}> = ({at, side, num, label, top, seed}) => {
	const s = useStep();
	const t = p(s, at, at + 10, Easing.out(Easing.back(1.4)));
	const b = boil(s, seed, 0.7);
	const x = side === 'left' ? 90 : 230;
	return (
		<Paper
			seed={seed}
			style={{left: x, top, width: 760, height: 470, translate: `${(1 - t) * (side === 'left' ? -1100 : 1100) + b.x}px ${b.y}px`, rotate: `${(side === 'left' ? -4 : 3) + b.r}deg`}}
		>
			{Array.from({length: 7}).map((_, i) => (
				<div key={i} style={{position: 'absolute', left: 0, right: 0, top: 110 + i * 50, height: 2, backgroundColor: 'rgba(80,130,200,0.35)'}} />
			))}
			<div style={{position: 'absolute', left: 0, right: 0, top: 80, height: 3, backgroundColor: 'rgba(216,67,47,0.55)'}} />
			<Stamp at={at + 6} text={num} size={200} style={{left: 50, top: 120}} rot={-6} />
			<Hand at={at + 8} text={label} size={92} style={{left: 290, top: 190}} />
		</Paper>
	);
};

const Setup: React.FC = () => (
	<AbsoluteFill>
		<Hand at={f(WORD.sebenarnya)} text="sebenarnya ada" size={86} style={{left: 110, top: 190}} />
		<Hand at={f(WORD.dua)} text="2 batas!" size={150} color={RED} style={{left: 110, top: 290}} rot={-4} />
		<Scribble at={f(WORD.batas) + 2} dur={8} d="M10 40 C 120 20, 260 60, 390 30" style={{left: 110, top: 420, width: 520, height: 70}} width={10} />
		<IndexCard at={f(WORD.dua)} side="left" num="1" label="sesi 5 jam" top={560} seed={31} />
		<IndexCard at={f(WORD.penggunaan)} side="right" num="2" label="mingguan" top={1080} seed={47} />
		<Hand at={f(WORD.pahami) - 4} text="pahami dua-duanya" size={64} style={{left: 300, top: 1640}} rot={-2} />
	</AbsoluteFill>
);

// ---------- B3/B4: session card, paper clock ----------
const PaperClock: React.FC = () => {
	const s = useStep();
	const a = f(WORD.yaitu1);
	const b = f(WORD.selesai) + 4;
	const resetAt = f(WORD.direset) + 2;
	const R = 250;
	return (
		<div style={{position: 'absolute', left: 290, top: 690, width: 2 * R, height: 2 * R}}>
			<div style={{position: 'absolute', inset: -24, borderRadius: '50%', backgroundColor: '#3B3631', filter: shadow(1)}} />
			{Array.from({length: 5}).map((_, i) => {
				const t0 = a + ((b - a) / 5) * i;
				const gone = s < resetAt ? p(s, t0, t0 + 10, Easing.in(Easing.quad)) : 0;
				const back = p(s, resetAt + i * 2, resetAt + i * 2 + 6, Easing.out(Easing.back(2)));
				const a0 = (i / 5) * 360 - 90;
				const a1 = ((i + 1) / 5) * 360 - 90 - 3;
				const pt = (deg: number) => `${50 + Math.cos((deg * Math.PI) / 180) * 50}% ${50 + Math.sin((deg * Math.PI) / 180) * 50}%`;
				const poly = ['50% 50%', ...Array.from({length: 9}).map((_, k) => pt(a0 + ((a1 - a0) * k) / 8))].join(',');
				const mid = (((a0 + a1) / 2) * Math.PI) / 180;
				const visible = s < resetAt ? 1 - gone : back;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							inset: 0,
							clipPath: `polygon(${poly})`,
							backgroundColor: ['#F08A3C', '#FFE27A', '#F08A3C', '#FFE27A', '#F08A3C'][i],
							translate: `${Math.cos(mid) * gone * 420}px ${Math.sin(mid) * gone * 300 + gone * gone * 700}px`,
							rotate: `${gone * (i % 2 ? 90 : -70)}deg`,
							scale: s < resetAt ? 1 : interpolate(back, [0, 1], [0.4, 1]),
							opacity: visible > 0.02 ? 1 : 0,
							filter: 'drop-shadow(0 4px 2px rgba(0,0,0,0.25))',
						}}
					>
						<Img src={TEX} style={{width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.4}} />
					</div>
				);
			})}
			<div style={{position: 'absolute', left: R - 22, top: R - 22, width: 44, height: 44, borderRadius: '50%', backgroundColor: INK, filter: shadow(0.5)}} />
			<div style={{position: 'absolute', inset: 0, fontFamily: FONT.caveat, fontWeight: 700, fontSize: 64, color: '#fff'}}>
				{['1', '2', '3', '4', '5'].map((n, i) => {
					const m = (((i + 0.5) / 5) * 360 - 90) * (Math.PI / 180);
					return (
						<div key={n} style={{position: 'absolute', left: R + Math.cos(m) * (R + 62) - 18, top: R + Math.sin(m) * (R + 62) - 36, color: INK}}>
							{n}
						</div>
					);
				})}
			</div>
		</div>
	);
};

const SessionCard: React.FC = () => {
	const s = useStep();
	const flip = p(s, 168, 186, EASE_IN_OUT);
	const shake = s >= f(WORD.direset) && s < f(WORD.direset) + 16 ? Math.sin(s * 3) * 6 : 0;
	return (
		<AbsoluteFill style={{perspective: 2200}}>
			<div style={{position: 'absolute', inset: 0, rotate: `y ${(1 - flip) * -180}deg`, transformStyle: 'preserve-3d', backfaceVisibility: 'hidden'}}>
				<Paper seed={61} style={{left: 60, top: 150, width: 960, height: 1620}} lift={1.4}>
					<Dymo text="CURRENT SESSION" style={{left: 60, top: 70, rotate: '-2deg'}} />
					<Hand at={f(WORD.pertama)} text="pertama," size={96} color={RED} style={{left: 70, top: 200}} />
					<Sticker src={PHOTO.hourglass} w={290} h={380} seed={5} style={{right: 50, top: 150, rotate: '6deg'}} />
					<Hand at={f(WORD.yaitu1)} text="batas tiap periode" size={70} style={{left: 70, top: 330}} />
					<Hand at={f(WORD.lima)} text="5 jam" size={170} color={RED} style={{left: 90, top: 410}} rot={-5} />
					<PaperClock />
					<Hand at={f(WORD.setelah)} text="setelah selesai..." size={66} style={{left: 90, top: 1310}} />
					<Sticker src={PHOTO.alarm} w={170} h={170} seed={9} style={{right: 30, top: 1160, rotate: `${-8 + shake}deg`, opacity: s >= f(WORD.limit2) ? 1 : 0}} />
					<Stamp at={f(WORD.direset) - 1} text="RESET" size={130} style={{left: 90, top: 1400}} rot={-8} />
					<Hand at={f(WORD.otomatis)} text="otomatis!" size={88} color={RED} style={{left: 630, top: 1480}} rot={-6} />
				</Paper>
			</div>
		</AbsoluteFill>
	);
};

// ---------- B5: weekly ----------
const DAYS = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const WeekCard: React.FC = () => {
	const s = useStep();
	const a = f(WORD.yaitu2);
	const b = f(WORD.jadwal) + 2;
	return (
		<AbsoluteFill>
			<Paper seed={83} style={{left: 60, top: 150, width: 960, height: 1620}} lift={1.4}>
				<Dymo text="WEEKLY LIMIT" style={{left: 60, top: 70, rotate: '2deg'}} color="#1F3A5F" />
				<Hand at={f(WORD.kedua)} text="kedua," size={96} color={RED} style={{left: 70, top: 200}} />
				<Sticker src={PHOTO.calendar} w={330} h={300} seed={13} style={{right: 50, top: 140, rotate: '-5deg'}} />
				<Hand at={f(WORD.mingguan) - 4} text="batas mingguan" size={80} style={{left: 70, top: 470}} />
				{DAYS.map((d, i) => {
					const t0 = a + ((b - a) / 7) * i;
					const k = p(s, t0, t0 + 4, Easing.out(Easing.back(2)));
					if (s < t0) return null;
					const col = i % 4;
					const row = Math.floor(i / 4);
					const bb = boil(s, i + 90, 0.5);
					return (
						<Paper key={d} seed={100 + i} color={NOTE[i]} lift={0.8} style={{left: 60 + col * 215 + row * 100, top: 620 + row * 250, width: 190, height: 190, rotate: `${(rand(i * 3) - 0.5) * 12 + bb.r}deg`, scale: interpolate(k, [0, 1], [1.4, 1])}}>
							<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: FONT.caveat, fontWeight: 700, fontSize: 70, color: INK}}>{d}</div>
						</Paper>
					);
				})}
				<Hand at={f(WORD.jadwal)} text="jadwal reset" size={92} style={{left: 90, top: 1180}} />
				<Hand at={f(WORD.tersendiri)} text="sendiri" size={150} color={RED} style={{left: 420, top: 1290}} rot={-6} />
				<Scribble at={f(WORD.tersendiri) + 2} dur={8} vb="0 0 500 260" d="M60 130 C 40 40, 260 10, 420 50 C 520 90, 470 220, 260 230 C 90 238, 20 180, 70 110" style={{left: 340, top: 1240, width: 560, height: 290}} width={8} />
			</Paper>
		</AbsoluteFill>
	);
};

// ---------- transitions ----------
/** A torn sheet of paper sweeping across the frame. */
const TornWipe: React.FC<{at: number; color: string; seed: number}> = ({at, color, seed}) => {
	const s = useStep();
	if (s < at - 10 || s > at + 10) return null;
	const y = interpolate(s, [at - 10, at + 10], [1960, -2200], {...clamp, easing: EASE_IN_OUT});
	return (
		<div style={{position: 'absolute', left: -40, right: -40, top: y, height: 2200, filter: shadow(2)}}>
			<div style={{width: '100%', height: '100%', backgroundColor: color, clipPath: torn(seed, 30, 3)}}>
				<Img src={TEX} style={{width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.5}} />
			</div>
		</div>
	);
};

/** Page turn: the outgoing page folds away to the left around its spine. */
const PageTurn: React.FC<{at: number; children: React.ReactNode}> = ({at, children}) => {
	const s = useStep();
	const t = p(s, at, at + 14, EASE_IN_OUT);
	if (t >= 1) return null;
	return (
		<AbsoluteFill style={{perspective: 2400}}>
			<AbsoluteFill style={{transformOrigin: '0% 50%', rotate: `y ${-t * 100}deg`, transformStyle: 'preserve-3d'}}>
				{children}
				<AbsoluteFill style={{background: `linear-gradient(90deg, rgba(0,0,0,${t * 0.4}), transparent 60%)`}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

const Desk: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: KRAFT}}>
		<Img src={TEX} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.7}} />
		<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 40%, rgba(255,240,210,0.25), rgba(60,40,20,0.35) 100%)'}} />
	</AbsoluteFill>
);

export const PaperCraft: React.FC = () => {
	const frame = useCurrentFrame();
	const s = stepped(frame, 2);
	return (
		<AbsoluteFill>
			<Desk />
			{s < 98 ? <Hook /> : null}
			{s >= 96 && s < 176 ? <Setup /> : null}
			{s >= 168 && s < 340 ? <SessionCard /> : null}
			{s >= 340 ? <WeekCard /> : null}
			{s >= 340 && s < 356 ? (
				<PageTurn at={340}>
					<Desk />
					<SessionCardStatic />
				</PageTurn>
			) : null}
			<TornWipe at={96} color={PAPER} seed={5} />
			<TornWipe at={170} color="#FFE27A" seed={9} />
			<AbsoluteFill style={{backgroundColor: '#1c140c', opacity: interpolate(frame, [440, 449], [0, 1], clamp)}} />
			<VO />
			<SfxTrack
				cues={[
					...[0, 1, 2, 3, 4].map((i) => ({at: i * 2 + 4, name: 'rustle' as const, vol: 0.25})),
					{at: f(WORD.habis), name: 'pop', vol: 0.45},
					{at: f(WORD.habis) + 6, name: 'pop', vol: 0.35},
					{at: f(WORD.habis) + 12, name: 'pop', vol: 0.3},
					{at: f(WORD.padahal), name: 'thump', vol: 0.35},
					{at: 88, name: 'rustle', vol: 0.45},
					{at: f(WORD.dua) + 6, name: 'thump', vol: 0.55},
					{at: f(WORD.penggunaan) + 6, name: 'thump', vol: 0.5},
					{at: 162, name: 'rustle', vol: 0.45},
					{at: 172, name: 'page-turn', vol: 0.4},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(f(WORD.yaitu1) + ((f(WORD.selesai) + 4 - f(WORD.yaitu1)) / 5) * i), name: 'rustle' as const, vol: 0.3})),
					{at: f(WORD.direset) - 1, name: 'thump', vol: 0.7},
					{at: f(WORD.direset) + 2, name: 'ding', vol: 0.25},
					{at: 340, name: 'page-turn', vol: 0.5},
					...DAYS.map((_, i) => ({at: Math.round(f(WORD.yaitu2) + ((f(WORD.jadwal) + 2 - f(WORD.yaitu2)) / 7) * i), name: 'pop' as const, vol: 0.28})),
					{at: f(WORD.tersendiri) + 2, name: 'rustle', vol: 0.3},
				]}
			/>
		</AbsoluteFill>
	);
};

/** The session card frozen in its final state, used as the outgoing page. */
const SessionCardStatic: React.FC = () => <SessionCard />;

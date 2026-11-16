import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN, EASE_IN_OUT, EASE_OUT, f, prog, WORD} from '../shared/timing';

const CREAM = '#F1EBE1';
const INK = '#121110';
const ORANGE = '#FF5B1F';

// ---------- primitives ----------
type Pos = {x?: number; y: number; align?: 'left' | 'center' | 'right'; w?: number};

/** Text revealed by sliding up behind a mask; optional exit upward. */
const Mask: React.FC<
	Pos & {
		at: number;
		out?: number;
		size: number;
		font: string;
		color: string;
		children: React.ReactNode;
		dur?: number;
		italic?: boolean;
		tracking?: number;
		lh?: number;
		stroke?: boolean;
	}
> = ({at, out, size, font, color, children, x = 60, y, align = 'left', w = 960, dur = 9, tracking = 0, lh = 0.92, stroke}) => {
	const frame = useCurrentFrame();
	const i = prog(frame, at, at + dur, EASE_OUT);
	const o = out === undefined ? 0 : prog(frame, out, out + 8, EASE_IN);
	if (frame < at - 1) return null;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, overflow: 'hidden', textAlign: align, paddingBottom: size * 0.06}}>
			<div
				style={{
					fontFamily: font,
					fontSize: size,
					lineHeight: lh,
					color: stroke ? 'transparent' : color,
					WebkitTextStroke: stroke ? `${Math.max(3, size / 70)}px ${color}` : undefined,
					letterSpacing: tracking,
					whiteSpace: 'pre',
					translate: `0 ${(1 - i) * 110 - o * 110}%`,
				}}
			>
				{children}
			</div>
		</div>
	);
};

/** Words that light up as the VO says them. */
const Karaoke: React.FC<Pos & {words: {t: string; at: number}[]; size: number; out?: number}> = ({words, size, x = 60, y, w = 960, out}) => {
	const frame = useCurrentFrame();
	if (frame < words[0].at - 6) return null;
	const o = out === undefined ? 1 : 1 - prog(frame, out, out + 8);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT.serifItalic, fontSize: size, lineHeight: 1.05, opacity: o}}>
			{words.map((wd, k) => {
				const on = prog(frame, wd.at - 2, wd.at + 4);
				return (
					<span key={k} style={{color: on > 0.5 ? INK : 'rgba(18,17,16,0.18)', display: 'inline-block', marginRight: size * 0.22, translate: `0 ${(1 - on) * 10}px`}}>
						{wd.t}
					</span>
				);
			})}
		</div>
	);
};

const Bg: React.FC<{color: string}> = ({color}) => <AbsoluteFill style={{backgroundColor: color}} />;

// ---------- B1: hook ----------
const DrainWord: React.FC<{at: number; drainAt: number}> = ({at, drainAt}) => {
	const frame = useCurrentFrame();
	const letters = 'LIMIT'.split('');
	const punch = interpolate(frame, [at, at + 4, at + 12], [1.25, 0.97, 1], {...clamp, easing: EASE_OUT});
	if (frame < at - 1) return null;
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center', scale: punch}}>
			{letters.map((l, i) => {
				const rise = prog(frame, at + i * 1.2, at + i * 1.2 + 8);
				const drain = prog(frame, drainAt + i * 2, drainAt + i * 2 + 14, EASE_IN_OUT);
				return (
					<div key={i} style={{position: 'relative', overflow: 'hidden', height: 470}}>
						{/* the fill drains downward (clip from the top), leaving an outline ghost */}
						<div style={{fontFamily: FONT.anton, fontSize: 500, lineHeight: 0.94, color: INK, translate: `0 ${(1 - rise) * 100}%`, clipPath: `inset(${drain * 100}% 0 0 0)`}}>{l}</div>
						<div style={{position: 'absolute', inset: 0, fontFamily: FONT.anton, fontSize: 500, lineHeight: 0.94, color: 'transparent', WebkitTextStroke: `4px ${INK}`, opacity: Math.min(1, drain * 3), translate: `0 ${(1 - rise) * 100}%`}}>{l}</div>
					</div>
				);
			})}
		</div>
	);
};

const UsageBar: React.FC = () => {
	const frame = useCurrentFrame();
	const v = interpolate(frame, [f(WORD.habis) - 2, f(WORD.habis) + 16], [100, 0], {...clamp, easing: EASE_IN_OUT});
	const inn = prog(frame, 6, 16);
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 1170, opacity: inn}}>
			<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 30, color: INK, marginBottom: 14}}>
				<span>usage</span>
				<span style={{color: v < 5 ? ORANGE : INK}}>{Math.round(v)}% left</span>
			</div>
			<div style={{height: 16, backgroundColor: 'rgba(18,17,16,0.12)'}}>
				<div style={{height: '100%', width: `${v}%`, backgroundColor: INK}} />
			</div>
		</div>
	);
};

const Hook: React.FC = () => (
	<AbsoluteFill>
		<Bg color={CREAM} />
		<Mask at={0} size={120} font={FONT.serifItalic} color={INK} y={170}>
			pernah
		</Mask>
		<Mask at={f(WORD.nggak)} size={120} font={FONT.serifItalic} color={ORANGE} x={430} y={170} w={600}>
			nggak,
		</Mask>
		<Mask at={f(WORD.claude) - 2} size={44} font={FONT.mono} color={INK} y={330} tracking={4}>
			{'limit claude'}
		</Mask>
		<DrainWord at={f(WORD.limit)} drainAt={f(WORD.habis)} />
		<Mask at={f(WORD.habis)} size={250} font={FONT.anton} color={ORANGE} y={880} align="center">
			HABIS
		</Mask>
		<UsageBar />
		<Karaoke
			y={1330}
			size={92}
			words={[
				{t: 'padahal', at: f(WORD.padahal)},
				{t: 'kamu', at: f(1.72)},
				{t: 'merasa', at: f(1.86)},
				{t: 'belum', at: f(WORD.belumBanyak)},
				{t: 'banyak', at: f(2.28)},
				{t: 'menggunakannya.', at: f(WORD.menggunakannya)},
			]}
		/>
	</AbsoluteFill>
);

// ---------- B2: two limits ----------
const BigTwo: React.FC = () => {
	const frame = useCurrentFrame();
	const at = f(WORD.dua);
	const slam = interpolate(frame, [at, at + 5, at + 11], [1.7, 0.94, 1], {...clamp, easing: EASE_OUT});
	const move = prog(frame, at + 8, at + 22, EASE_IN_OUT);
	if (frame < at) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: interpolate(move, [0, 1], [140, 40]),
				top: interpolate(move, [0, 1], [380, 330]),
				fontFamily: FONT.anton,
				fontSize: interpolate(move, [0, 1], [1300, 760]),
				lineHeight: 0.85,
				color: INK,
				scale: slam,
				rotate: `${interpolate(frame, [at, at + 10], [-6, 0], clamp)}deg`,
				transformOrigin: '30% 60%',
			}}
		>
			2
		</div>
	);
};

const Setup: React.FC = () => (
	<AbsoluteFill>
		<Bg color={ORANGE} />
		<Mask at={f(WORD.sebenarnya) - 3} size={110} font={FONT.serifItalic} color={INK} y={150}>
			sebenarnya ada
		</Mask>
		<BigTwo />
		<Mask at={f(WORD.batas) + 6} size={190} font={FONT.anton} color={CREAM} x={450} y={560} w={600}>
			BATAS
		</Mask>
		<Mask at={f(WORD.penggunaan) + 6} size={128} font={FONT.anton} color={INK} x={450} y={760} w={620} lh={0.95}>
			{'PENG-\nGUNAAN'}
		</Mask>
		<Mask at={f(4.72)} size={84} font={FONT.serifItalic} color={INK} y={1420}>
			yang perlu kamu
		</Mask>
		<Mask at={f(WORD.pahami) - 2} size={84} font={FONT.serifItalic} color={CREAM} y={1510}>
			pahami.
		</Mask>
	</AbsoluteFill>
);

// ---------- B3: current session ----------
const Countdown: React.FC = () => {
	const frame = useCurrentFrame();
	const at = f(WORD.jam);
	const end = f(WORD.selesai) + 4;
	if (frame < at) return null;
	const total = 5 * 3600;
	const left = interpolate(frame, [at, end], [total, 0], {...clamp, easing: EASE_IN});
	const hh = Math.floor(left / 3600);
	const mm = Math.floor((left % 3600) / 60);
	const ss = Math.floor(left % 60);
	const pad = (n: number) => String(n).padStart(2, '0');
	const i = prog(frame, at, at + 8);
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 1330, fontFamily: FONT.mono, fontWeight: 700, fontSize: 132, color: left < 1 ? ORANGE : CREAM, opacity: i, letterSpacing: -2, fontVariantNumeric: 'tabular-nums'}}>
			{pad(hh)}:{pad(mm)}:{pad(ss)}
		</div>
	);
};

const Marquee: React.FC<{y: number; text: string; speed: number; color: string}> = ({y, text, speed, color}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top: y, left: 0, whiteSpace: 'nowrap', translate: `${-((((frame * speed) % 900) + 900) % 900)}px 0`, fontFamily: FONT.mono, fontSize: 30, color, letterSpacing: 6}}>
			{Array(8).fill(text).join('   ·   ')}
		</div>
	);
};

const FirstLimit: React.FC = () => {
	const frame = useCurrentFrame();
	const squeeze = prog(frame, f(WORD.lima) - 4, f(WORD.lima) + 6, EASE_IN_OUT);
	const fiveAt = f(WORD.lima);
	const five = interpolate(frame, [fiveAt, fiveAt + 5, fiveAt + 11], [1.6, 0.95, 1], {...clamp, easing: EASE_OUT});
	return (
		<AbsoluteFill>
			<Bg color={INK} />
			<Marquee y={70} text="CURRENT SESSION" speed={4} color="rgba(241,235,225,0.35)" />
			<Marquee y={1840} text="SESI 5 JAM · RESET OTOMATIS" speed={-3} color="rgba(255,91,31,0.6)" />
			<Mask at={f(WORD.pertama) - 3} out={f(WORD.lima) - 6} size={150} font={FONT.serifItalic} color={ORANGE} y={170}>
				pertama,
			</Mask>
			<div style={{position: 'absolute', inset: 0, translate: `0 ${-squeeze * 120}px`, opacity: 1 - squeeze * 0.55}}>
				<Mask at={f(WORD.current) - 2} size={300} font={FONT.anton} color={CREAM} y={360}>
					CURRENT
				</Mask>
				<Mask at={f(WORD.session) - 1} size={300} font={FONT.anton} color={CREAM} y={640} stroke>
					SESSION
				</Mask>
			</div>
			<Mask at={f(WORD.yaitu1)} out={f(WORD.lima) - 8} size={58} font={FONT.mono} color={CREAM} y={1000} lh={1.2}>
				{'batas penggunaan\nsetiap periode'}
			</Mask>
			{frame >= fiveAt ? (
				<div style={{position: 'absolute', left: 50, top: 860, display: 'flex', alignItems: 'flex-end', gap: 30, scale: five, transformOrigin: '20% 80%'}}>
					<div style={{fontFamily: FONT.anton, fontSize: 560, lineHeight: 0.82, color: ORANGE}}>5</div>
					<div style={{overflow: 'hidden'}}>
						<div style={{fontFamily: FONT.anton, fontSize: 250, lineHeight: 0.9, color: CREAM, translate: `0 ${(1 - prog(frame, f(WORD.jam), f(WORD.jam) + 8)) * 100}%`}}>JAM</div>
					</div>
				</div>
			) : null}
			<Countdown />
			<Mask at={f(WORD.setelah)} size={70} font={FONT.serifItalic} color="rgba(241,235,225,0.75)" y={1530}>
				setelah periode itu selesai,
			</Mask>
		</AbsoluteFill>
	);
};

// ---------- B4: reset ----------
const Reset: React.FC = () => {
	const frame = useCurrentFrame();
	const at = f(WORD.direset) - 3;
	const letters = 'RESET'.split('');
	const flash = interpolate(frame, [296, 299, 306], [1, 1, 0], clamp);
	return (
		<AbsoluteFill>
			<Bg color={CREAM} />
			<Mask at={f(WORD.limit2) - 1} size={110} font={FONT.serifItalic} color={INK} y={420} align="center">
				limit akan di-
			</Mask>
			<div style={{position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center', perspective: 1400}}>
				{letters.map((l, i) => {
					const p = prog(frame, at + i * 1.5, at + i * 1.5 + 14, EASE_OUT);
					return (
						<div key={i} style={{fontFamily: FONT.anton, fontSize: 380, lineHeight: 1, color: i % 2 ? ORANGE : INK, rotate: `x ${-(1 - p) * 360}deg`, opacity: frame < at + i * 1.5 ? 0 : 1}}>
							{l}
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 1060, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 110, color: INK, opacity: prog(frame, at, at + 6)}}>
				{frame < at + 10 ? '00:00:00' : '05:00:00'}
			</div>
			<Mask at={f(WORD.otomatis) - 1} size={140} font={FONT.serifItalic} color={ORANGE} y={1230} align="center">
				otomatis.
			</Mask>
			<AbsoluteFill style={{backgroundColor: '#fff', opacity: flash}} />
		</AbsoluteFill>
	);
};

// ---------- B5: weekly ----------
const DAYS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
const Week: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.mingguan) - 6;
	const b = f(WORD.jadwal);
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 1010, display: 'flex', gap: 14}}>
			{DAYS.map((d, i) => {
				const p = prog(frame, a + ((b - a) / 7) * i, a + ((b - a) / 7) * i + 6);
				const enter = prog(frame, f(WORD.limit3) + 4 + i * 1.5, f(WORD.limit3) + 12 + i * 1.5, EASE_OUT);
				return (
					<div key={i} style={{flex: 1, height: 150, border: `4px solid ${INK}`, position: 'relative', overflow: 'hidden', opacity: enter, translate: `0 ${(1 - enter) * 60}px`}}>
						<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${p * 100}%`, backgroundColor: INK}} />
						<div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.anton, fontSize: 76, color: p > 0.5 ? ORANGE : INK}}>{d}</div>
					</div>
				);
			})}
		</div>
	);
};

const Highlight: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, at + 10, EASE_IN_OUT);
	return (
		<div style={{position: 'absolute', left: 50, top: 1560, height: 190, width: p * 760, backgroundColor: INK}} />
	);
};

const SecondLimit: React.FC = () => (
	<AbsoluteFill>
		<Bg color={ORANGE} />
		<Mask at={f(WORD.kedua) - 3} size={150} font={FONT.serifItalic} color={CREAM} y={150}>
			kedua,
		</Mask>
		<Mask at={f(WORD.weekly) - 2} size={310} font={FONT.anton} color={INK} y={330}>
			WEEKLY
		</Mask>
		<Mask at={f(WORD.limit3) - 1} size={310} font={FONT.anton} color={INK} y={620} stroke>
			LIMIT
		</Mask>
		<Mask at={f(WORD.mingguan) - 8} size={64} font={FONT.mono} color={INK} y={1200} x={60}>
			{'batas mingguan →'}
		</Mask>
		<Week />
		<Mask at={f(WORD.jadwal) - 2} size={88} font={FONT.serifItalic} color={INK} y={1420}>
			dengan jadwal reset
		</Mask>
		<Highlight at={f(WORD.tersendiri) - 4} />
		<Mask at={f(WORD.tersendiri)} size={180} font={FONT.anton} color={CREAM} y={1560} x={80}>
			SENDIRI.
		</Mask>
	</AbsoluteFill>
);

// ---------- transitions (cover-style, type-driven) ----------
const PanelWipe: React.FC<{at: number; color: string; dir: 'up' | 'left'}> = ({at, color, dir}) => {
	const frame = useCurrentFrame();
	const inP = prog(frame, at - 7, at, EASE_IN);
	const outP = prog(frame, at, at + 7, EASE_OUT);
	if (frame < at - 8 || frame > at + 8) return null;
	const cover = inP - outP; // 0 → 1 → 0
	const style: React.CSSProperties =
		dir === 'up'
			? {left: 0, right: 0, bottom: frame < at ? 0 : undefined, top: frame >= at ? 0 : undefined, height: `${cover * 100}%`}
			: {top: 0, bottom: 0, right: frame < at ? 0 : undefined, left: frame >= at ? 0 : undefined, width: `${cover * 100}%`};
	return <div style={{position: 'absolute', backgroundColor: color, ...style}} />;
};

const Iris: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	if (frame < at - 10 || frame > at) return null;
	const r = interpolate(frame, [at - 10, at], [0, 2300], {...clamp, easing: EASE_IN});
	return <AbsoluteFill style={{backgroundColor: INK, clipPath: `circle(${r}px at 300px 760px)`}} />;
};

const Slats: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	if (frame < at - 10 || frame > at + 1) return null;
	return (
		<AbsoluteFill>
			{Array.from({length: 8}).map((_, i) => (
				<div key={i} style={{position: 'absolute', left: 0, top: i * 240, height: 240, width: `${prog(frame, at - 10 + i * 0.8, at - 3 + i * 0.8, EASE_IN) * 100}%`, backgroundColor: ORANGE}} />
			))}
		</AbsoluteFill>
	);
};

export const KineticType: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: CREAM}}>
			<Sequence durationInFrames={96} name="B1 Hook">
				<Hook />
			</Sequence>
			<Sequence from={96} durationInFrames={72} name="B2 Setup">
				<Shift from={96}>
					<Setup />
				</Shift>
			</Sequence>
			<Sequence from={168} durationInFrames={128} name="B3 Current session">
				<Shift from={168}>
					<FirstLimit />
				</Shift>
			</Sequence>
			<Sequence from={296} durationInFrames={44} name="B4 Reset">
				<Shift from={296}>
					<Reset />
				</Shift>
			</Sequence>
			<Sequence from={340} durationInFrames={110} name="B5 Weekly">
				<Shift from={340}>
					<SecondLimit />
				</Shift>
			</Sequence>
			<PanelWipe at={96} color={ORANGE} dir="up" />
			<Iris at={168} />
			<Slats at={340} />
			<VO />
			<SfxTrack
				cues={[
					{at: f(WORD.limit) - 1, name: 'whip', vol: 0.35},
					{at: f(WORD.habis), name: 'subhit', vol: 0.5},
					{at: 89, name: 'whoosh', vol: 0.3},
					{at: f(WORD.dua), name: 'subhit', vol: 0.6},
					{at: f(WORD.batas) + 6, name: 'mouse-click', vol: 0.5},
					{at: 158, name: 'whoosh', vol: 0.3},
					{at: f(WORD.current) - 2, name: 'whip', vol: 0.3},
					{at: f(WORD.lima), name: 'subhit', vol: 0.55},
					...Array.from({length: 10}).map((_, i) => ({at: f(WORD.jam) + i * 4, name: 'tick' as const, vol: 0.18})),
					{at: 296, name: 'switch', vol: 0.6},
					{at: f(WORD.direset) - 3, name: 'shimmer', vol: 0.35},
					{at: 331, name: 'whoosh', vol: 0.3},
					{at: f(WORD.weekly) - 2, name: 'whip', vol: 0.3},
					...DAYS.map((_, i) => ({at: Math.round(f(WORD.mingguan) - 6 + ((f(WORD.jadwal) - f(WORD.mingguan) + 6) / 7) * i), name: 'pop' as const, vol: 0.35})),
					{at: f(WORD.tersendiri), name: 'thump', vol: 0.6},
				]}
			/>
		</AbsoluteFill>
	);
};

/** Children inside a Sequence see local frames; this shifts them back to absolute frames. */
const Shift: React.FC<{from: number; children: React.ReactNode}> = ({from, children}) => (
	<Sequence from={-from} layout="none">
		{children}
	</Sequence>
);

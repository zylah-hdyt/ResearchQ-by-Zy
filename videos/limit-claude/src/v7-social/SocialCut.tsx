import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {capAt} from '../shared/captions';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_OUT, f, prog, rand, WORD} from '../shared/timing';

// Social-native cut: real photos, hard cuts, big white captions with a yellow keyword, a few flat stickers.
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1400&q=80&auto=format&fit=crop`;
const P = {
	typing: u('1550439062-609e1531270e'),
	laptopDark: u('1531297484001-80022131f5a1'),
	pointing: u('1516321318423-f06f85e504b3'),
	coffeeDesk: u('1499750310107-5fef28a66643'),
	alarm: u('1495364141860-b0d03eccd065'),
	clock: u('1508962914676-134849a727f0'),
	calendar: u('1506784983877-45594efa4cbe'),
	notebook: u('1456324504439-367cee3b3c32'),
	hourglass: u('1501139083538-0139583c060f'),
	clocks: u('1533749047139-189de3cf06d3'),
	flatlay: u('1519389950473-47ba0277781c'),
	planner: u('1435527173128-983b87201f4d'),
	notes: u('1517842645767-c639042777db'),
};

const YELLOW = '#FFE14A';
const RED = '#FF3B3B';

// ---------- shots ----------
type ShotDef = {from: number; to: number; src: string; zoom: [number, number]; pan: [number, number]; focus?: string};
const SHOTS: ShotDef[] = [
	{from: 0, to: 31, src: P.typing, zoom: [1.12, 1.22], pan: [-20, 10]},
	{from: 31, to: 47, src: P.laptopDark, zoom: [1.3, 1.18], pan: [0, 0], focus: '50% 40%'},
	{from: 47, to: 70, src: P.pointing, zoom: [1.1, 1.2], pan: [20, -10], focus: '55% 50%'},
	{from: 70, to: 96, src: P.coffeeDesk, zoom: [1.2, 1.1], pan: [-30, 0]},
	{from: 96, to: 118, src: P.alarm, zoom: [1.35, 1.15], pan: [0, 20], focus: '40% 50%'},
	{from: 168, to: 209, src: P.notebook, zoom: [1.1, 1.25], pan: [20, 20]},
	{from: 209, to: 260, src: P.hourglass, zoom: [1.35, 1.1], pan: [0, 30], focus: '50% 55%'},
	{from: 260, to: 298, src: P.clocks, zoom: [1.05, 1.25], pan: [0, 0]},
	{from: 298, to: 340, src: P.flatlay, zoom: [1.3, 1.12], pan: [-20, 20]},
	{from: 340, to: 372, src: P.planner, zoom: [1.12, 1.24], pan: [25, 0]},
	{from: 372, to: 409, src: P.calendar, zoom: [1.35, 1.15], pan: [0, -20], focus: '60% 50%'},
	{from: 409, to: 450, src: P.notes, zoom: [1.1, 1.22], pan: [-20, 10], focus: '40% 50%'},
];

const Photo: React.FC<{src: string; zoom: [number, number]; pan: [number, number]; focus?: string; t: number; seed: number; style?: React.CSSProperties}> = ({src, zoom, pan, focus = '50% 50%', t, seed, style}) => {
	const frame = useCurrentFrame();
	const z = interpolate(t, [0, 1], zoom);
	// handheld: a slow wander plus a small high-frequency shake, both derived from the frame
	const hx = Math.sin(frame / 11 + seed) * 7 + (rand(frame * 0.9 + seed) - 0.5) * 4;
	const hy = Math.cos(frame / 13 + seed * 2) * 6 + (rand(frame * 1.3 + seed) - 0.5) * 4;
	return (
		<Img src={src} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, scale: z, translate: `${pan[0] * t + hx}px ${pan[1] * t + hy}px`, filter: 'saturate(1.08) contrast(1.05)', ...style}} />
	);
};

const Shots: React.FC = () => {
	const frame = useCurrentFrame();
	const s = SHOTS.find((x) => frame >= x.from && frame < x.to);
	if (!s) return null;
	const t = (frame - s.from) / (s.to - s.from);
	const punch = interpolate(frame - s.from, [0, 5], [1.1, 1], {...clamp, easing: EASE_OUT});
	return (
		<AbsoluteFill style={{scale: punch}}>
			<Photo {...s} t={t} seed={s.from} />
		</AbsoluteFill>
	);
};

// split screen for "2 batas"
const Split: React.FC = () => {
	const frame = useCurrentFrame();
	const t = (frame - 118) / 50;
	const a = prog(frame, 118, 128);
	const b = prog(frame, f(WORD.penggunaan), f(WORD.penggunaan) + 8);
	const slam = interpolate(frame, [f(WORD.dua), f(WORD.dua) + 4, f(WORD.dua) + 9], [2.2, 0.92, 1], {...clamp, easing: EASE_OUT});
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 958, overflow: 'hidden', translate: `0 ${(1 - a) * -960}px`}}>
				<Photo src={P.clock} zoom={[1.15, 1.28]} pan={[0, 10]} t={t} seed={3} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 958, overflow: 'hidden', translate: `0 ${(1 - b) * 960}px`}}>
				<Photo src={P.calendar} zoom={[1.2, 1.1]} pan={[0, -10]} t={t} seed={9} focus="60% 50%" />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 957, height: 6, backgroundColor: '#fff'}} />
			{frame >= f(WORD.dua) ? (
				<div style={{position: 'absolute', left: 540 - 150, top: 960 - 150, width: 300, height: 300, borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.archivo, fontSize: 230, color: '#111', scale: slam, rotate: `${(slam - 1) * -20}deg`, boxShadow: '0 12px 40px rgba(0,0,0,0.4)'}}>
					2
				</div>
			) : null}
		</AbsoluteFill>
	);
};

// ---------- stickers ----------
const Sticker: React.FC<{at: number; to?: number; top: number; left?: number; rot?: number; children: React.ReactNode; bg?: string; color?: string; size?: number}> = ({at, to = 9999, top, left, rot = -4, children, bg = '#fff', color = '#111', size = 80}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame >= to) return null;
	const k = interpolate(frame, [at, at + 4, at + 9], [0, 1.15, 1], {...clamp, easing: EASE_OUT});
	return (
		<div style={{position: 'absolute', top, left: left ?? 0, right: left === undefined ? 0 : undefined, display: 'flex', justifyContent: 'center'}}>
			<div style={{backgroundColor: bg, color, fontFamily: FONT.archivo, fontSize: size, padding: '10px 36px', borderRadius: 18, rotate: `${rot}deg`, scale: k, boxShadow: '0 10px 30px rgba(0,0,0,0.35)', letterSpacing: 2}}>{children}</div>
		</div>
	);
};

const Countdown: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.setiap);
	const b = f(WORD.selesai) + 4;
	const left = interpolate(frame, [a, b], [5 * 3600, 0], {...clamp});
	const p2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
	return (
		<Sticker at={f(WORD.lima) - 2} to={298} top={300} rot={-3} bg="#111" color={YELLOW} size={120}>
			<span style={{fontVariantNumeric: 'tabular-nums'}}>{p2(left / 3600)}:{p2((left % 3600) / 60)}:{p2(left % 60)}</span>
		</Sticker>
	);
};

const Week: React.FC = () => {
	const frame = useCurrentFrame();
	const days = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
	const a = f(WORD.mingguan) - 4;
	return (
		<div style={{position: 'absolute', left: 36, right: 36, top: 330, display: 'flex', gap: 10}}>
			{days.map((d, i) => {
				const p = prog(frame, a + i * 2, a + i * 2 + 5);
				const kam = i === 3;
				return (
					<div key={d} style={{flex: 1, height: 130, borderRadius: 16, backgroundColor: kam && p > 0.5 ? YELLOW : '#fff', color: '#111', fontFamily: FONT.archivo, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: p, opacity: p, rotate: `${(i - 3) * 1.2}deg`, boxShadow: '0 8px 22px rgba(0,0,0,0.3)'}}>
						{d}
					</div>
				);
			})}
		</div>
	);
};

const Scribble: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const t = prog(frame, at, at + 10);
	if (frame < at) return null;
	return (
		<svg viewBox="0 0 800 60" style={{position: 'absolute', left: 140, top: 1432, width: 800, height: 60, overflow: 'visible'}}>
			<path d="M6 34 C 160 8, 360 52, 520 24 S 740 30, 794 18" fill="none" stroke={YELLOW} strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} />
		</svg>
	);
};

// ---------- captions ----------
const ACCENT = new Set(['LIMIT', 'CLAUDE', '2', 'BATAS', 'CURRENT', 'SESSION,', 'CURRENT', '5', 'JAM.', 'RESET', 'DI-RESET', 'OTOMATIS.', 'WEEKLY', 'LIMIT,', 'MINGGUAN', 'TERSENDIRI.', 'HABIS', 'JADWAL']);

const Caption: React.FC = () => {
	const frame = useCurrentFrame();
	const c = capAt(frame);
	if (!c) return null;
	const a = Math.round(c.a * 30);
	const d = frame - a;
	const k = interpolate(d, [0, 3, 7], [1.1, 0.97, 1], {...clamp, easing: EASE_OUT});
	const habis = c.t === 'habis';
	const words = c.t.toUpperCase().split(' ');
	const longest = Math.max(...words.map((w) => w.length));
	const size = habis ? 260 : Math.min(112, 930 / (longest * 0.66));
	return (
		<div style={{position: 'absolute', left: 50, right: 50, top: habis ? 760 : 1090, textAlign: 'center', scale: k, rotate: `${habis ? -4 : 0}deg`, opacity: d < 0 ? 0 : 1}}>
			<span style={{fontFamily: FONT.tight, fontWeight: 800, fontSize: size, lineHeight: 1.04, letterSpacing: 0, wordSpacing: size * 0.16, color: '#fff', textTransform: 'uppercase', WebkitTextStroke: `${Math.round(size * 0.1)}px #000`, paintOrder: 'stroke fill', textShadow: '0 8px 0 rgba(0,0,0,0.5)'}}>
				{words.map((w, i) => (
					<span key={i} style={{color: habis ? RED : ACCENT.has(w) ? YELLOW : '#fff'}}>
						{w}{' '}
					</span>
				))}
			</span>
		</div>
	);
};

const Scrim: React.FC = () => (
	<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 48%, rgba(0,0,0,0.55) 100%)'}} />
);

const Flash: React.FC<{at: number; color?: string; len?: number}> = ({at, color = '#fff', len = 5}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [at, at + len], [0.85, 0], clamp);
	return frame >= at && frame < at + len ? <AbsoluteFill style={{backgroundColor: color, opacity: o}} /> : null;
};

export const SocialCut: React.FC = () => {
	const frame = useCurrentFrame();
	const inSplit = frame >= 118 && frame < 168;
	const shake = frame >= 31 && frame < 41 ? (rand(frame * 3) - 0.5) * 26 : 0;
	return (
		<AbsoluteFill style={{backgroundColor: '#000', translate: `${shake}px ${shake * 0.6}px`}}>
			{inSplit ? <Split /> : <Shots />}
			<Scrim />
			<Sticker at={31} to={47} top={430} rot={-6} bg={RED} color="#fff" size={96}>LIMIT REACHED</Sticker>
			<Countdown />
			<Sticker at={f(WORD.direset) - 2} to={340} top={380} rot={-5} bg={YELLOW} color="#111" size={170}>RESET</Sticker>
			{frame >= 372 && frame < 409 ? <Week /> : null}
			{frame >= f(WORD.tersendiri) - 2 ? <Scribble at={f(WORD.tersendiri) - 2} /> : null}
			<Caption />
			<Flash at={31} color={RED} />
			<Flash at={96} />
			<Flash at={298} color={YELLOW} len={6} />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: interpolate(frame, [442, 449], [0, 1], clamp)}} />
			<VO />
			<SfxTrack
				cues={[
					{at: 31, name: 'vine-boom', vol: 0.6},
					{at: 47, name: 'whoosh', vol: 0.2},
					{at: 96, name: 'record-scratch', vol: 0.32},
					{at: 118, name: 'whip', vol: 0.25},
					{at: f(WORD.dua), name: 'thump', vol: 0.5},
					{at: 168, name: 'whoosh', vol: 0.22},
					{at: 209, name: 'whoosh', vol: 0.2},
					{at: f(WORD.lima) - 2, name: 'pop', vol: 0.4},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(f(WORD.setiap) + ((f(WORD.selesai) + 4 - f(WORD.setiap)) / 5) * i), name: 'tick' as const, vol: 0.22})),
					{at: 298, name: 'ding', vol: 0.45},
					{at: f(WORD.direset) - 2, name: 'thump', vol: 0.5},
					{at: 340, name: 'whoosh', vol: 0.22},
					{at: 372, name: 'whip', vol: 0.22},
					...[0, 1, 2, 3, 4, 5, 6].map((i) => ({at: f(WORD.mingguan) - 4 + i * 2, name: 'pop' as const, vol: 0.18})),
					{at: f(WORD.tersendiri), name: 'switch', vol: 0.3},
				]}
			/>
		</AbsoluteFill>
	);
};

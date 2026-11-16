import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN_OUT, EASE_OUT, f, prog, WORD} from '../shared/timing';

const u = (id: string, w = 1500) => `https://images.unsplash.com/photo-${id}?w=${w}&q=82&auto=format&fit=crop`;

const IMG = {
	laptopDark: u('1531297484001-80022131f5a1'),
	deskNight: u('1550439062-609e1531270e'),
	clock: u('1508962914676-134849a727f0'),
	calendar: u('1506784983877-45594efa4cbe'),
	hourglass: u('1501139083538-0139583c060f', 1800),
	clocks: u('1533749047139-189de3cf06d3'),
	planner: u('1435527173128-983b87201f4d'),
};

const GRADE = 'contrast(1.12) saturate(0.62) brightness(0.82) sepia(0.12)';

// ---------- photographic primitives ----------
/** Ken Burns with a soft blurred backplate and a sharper foreground for parallax depth. */
const Plate: React.FC<{
	src: string;
	from: number;
	to: number;
	zoom: [number, number];
	pan?: [string, string];
	focus?: string;
	parallax?: number;
	dim?: number;
}> = ({src, from, to, zoom, pan = ['0px 0px', '0px 0px'], focus = '50% 50%', parallax = 0, dim = 0}) => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [from, to], [0, 1], clamp);
	const s = interpolate(t, [0, 1], zoom);
	const tr = interpolate(t, [0, 1], [0, 1]);
	const [ax, ay] = pan[0].split(' ').map(parseFloat);
	const [bx, by] = pan[1].split(' ').map(parseFloat);
	const x = ax + (bx - ax) * tr;
	const y = ay + (by - ay) * tr;
	const img = (extra: React.CSSProperties) => (
		<Img src={src} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, filter: GRADE, ...extra}} />
	);
	return (
		<AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
			{img({scale: s * 1.06, translate: `${x * 0.6}px ${y * 0.6}px`, filter: `${GRADE} blur(6px)`})}
			{img({
				scale: s,
				translate: `${x * (1 + parallax)}px ${y * (1 + parallax)}px`,
				WebkitMaskImage: parallax ? 'radial-gradient(ellipse 62% 48% at 50% 50%, #000 55%, transparent 100%)' : undefined,
			})}
			<AbsoluteFill style={{backgroundColor: '#000', opacity: dim}} />
		</AbsoluteFill>
	);
};

const Grain: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{opacity: 0.16, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
			<svg width="100%" height="100%">
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} stitchTiles="stitch" />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="100%" height="100%" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};

const Gate: React.FC = () => {
	const frame = useCurrentFrame();
	const weave = Math.sin(frame * 1.7) * 1.2;
	return (
		<>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 50%, transparent 45%, rgba(0,0,0,0.78) 100%)'}} />
			{/* letterbox bars */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 210 + weave, backgroundColor: '#000'}} />
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 250 - weave, backgroundColor: '#000'}} />
		</>
	);
};

const Chrome: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = frame / 30;
	const tc = `00:00:${String(Math.floor(sec)).padStart(2, '0')}:${String(frame % 30).padStart(2, '0')}`;
	const o = prog(frame, 4, 20) * (1 - prog(frame, 436, 449));
	return (
		<>
			<div style={{position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.tight, fontWeight: 500, fontSize: 26, letterSpacing: 12, color: 'rgba(255,255,255,0.7)', opacity: o}}>
				BATAS YANG TAK TERLIHAT
			</div>
			<div style={{position: 'absolute', top: 140, left: 0, right: 0, textAlign: 'center', fontFamily: FONT.playfair, fontSize: 28, color: 'rgba(255,255,255,0.45)', opacity: o}}>
				episode satu
			</div>
			<div style={{position: 'absolute', bottom: 90, left: 70, fontFamily: FONT.mono, fontSize: 24, color: 'rgba(255,255,255,0.45)', opacity: o}}>{tc}</div>
			<div style={{position: 'absolute', bottom: 90, right: 70, fontFamily: FONT.mono, fontSize: 24, color: 'rgba(255,90,60,0.8)', opacity: o * (Math.floor(frame / 15) % 2 ? 1 : 0.3)}}>● REC</div>
		</>
	);
};

// ---------- subtitles ----------
const SUBS: {a: number; b: number; t: string}[] = [
	{a: 0.0, b: 1.32, t: 'Pernah nggak, limit Claude habis'},
	{a: 1.36, b: 3.15, t: 'padahal kamu merasa belum banyak menggunakannya?'},
	{a: 3.22, b: 5.58, t: 'Sebenarnya ada dua batas penggunaan\nyang perlu kamu pahami.'},
	{a: 5.64, b: 6.92, t: 'Pertama, current session,'},
	{a: 6.94, b: 8.66, t: 'yaitu batas penggunaan\nsetiap periode 5\u00a0jam.'},
	{a: 8.68, b: 9.88, t: 'Setelah periode itu selesai,'},
	{a: 9.92, b: 11.34, t: 'limit akan di-reset otomatis.'},
	{a: 11.4, b: 12.42, t: 'Kedua, weekly limit,'},
	{a: 12.44, b: 15.0, t: 'yaitu batas penggunaan mingguan\ndengan jadwal reset tersendiri.'},
];

const Subtitles: React.FC = () => {
	const frame = useCurrentFrame();
	const s = SUBS.find((x) => frame >= f(x.a) && frame < f(x.b));
	if (!s) return null;
	const o = prog(frame, f(s.a), f(s.a) + 3) * (1 - prog(frame, f(s.b) - 3, f(s.b)));
	return (
		<div style={{position: 'absolute', left: 80, right: 80, bottom: 290, textAlign: 'center', fontFamily: FONT.inter, fontWeight: 600, fontSize: 46, lineHeight: 1.28, color: '#fff', whiteSpace: 'pre-line', opacity: o, textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 24px rgba(0,0,0,0.6)'}}>
			{s.t}
		</div>
	);
};

// ---------- chapter card ----------
const Chapter: React.FC<{from: number; to: number; num: string; title: string; kicker: string}> = ({from, to, num, title, kicker}) => {
	const frame = useCurrentFrame();
	if (frame < from || frame >= to) return null;
	const i = prog(frame, from + 2, from + 16);
	const line = prog(frame, from + 4, from + 20, EASE_IN_OUT);
	const out = prog(frame, to - 6, to);
	return (
		<AbsoluteFill style={{backgroundColor: '#070707', alignItems: 'center', justifyContent: 'center', opacity: 1 - out}}>
			<div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 10, color: '#c9a77a', opacity: i}}>{kicker}</div>
			<div style={{width: 380 * line, height: 2, backgroundColor: '#c9a77a', margin: '34px 0'}} />
			<div style={{fontFamily: FONT.playfairRoman, fontWeight: 600, fontSize: 210, color: '#efe6da', lineHeight: 1, opacity: i, letterSpacing: interpolate(frame, [from, to], [12, 0], clamp)}}>{num}</div>
			<div style={{fontFamily: FONT.playfair, fontSize: 92, color: '#efe6da', marginTop: 20, opacity: i, translate: `0 ${(1 - i) * 20}px`}}>{title}</div>
		</AbsoluteFill>
	);
};

// ---------- scene pieces ----------
const Fade: React.FC<{from: number; to: number; inDur?: number; outDur?: number; children: React.ReactNode; blurIn?: boolean}> = ({from, to, inDur = 8, outDur = 0, children, blurIn}) => {
	const frame = useCurrentFrame();
	if (frame < from || frame >= to) return null;
	const i = inDur ? prog(frame, from, from + inDur, EASE_IN_OUT) : 1;
	const o = outDur ? 1 - prog(frame, to - outDur, to, EASE_IN_OUT) : 1;
	return <AbsoluteFill style={{opacity: i * o, filter: blurIn ? `blur(${(1 - i) * 14}px)` : undefined}}>{children}</AbsoluteFill>;
};

const Diptych: React.FC = () => {
	const frame = useCurrentFrame();
	const a = prog(frame, f(WORD.dua) - 6, f(WORD.dua) + 10, EASE_OUT);
	const b = prog(frame, f(WORD.batas), f(WORD.batas) + 14, EASE_OUT);
	const pan = interpolate(frame, [96, 168], [0, 1], clamp);
	const panel = (src: string, p: number, fromLeft: boolean, label: string, top: number) => (
		<div style={{position: 'absolute', left: 60, right: 60, top, height: 640, overflow: 'hidden', translate: `${(1 - p) * (fromLeft ? -1200 : 1200)}px 0`}}>
			<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter: GRADE, scale: 1.12 - pan * 0.08}} />
			<div style={{position: 'absolute', left: 28, bottom: 22, fontFamily: FONT.playfairRoman, fontWeight: 600, fontSize: 84, color: '#efe6da', textShadow: '0 2px 12px rgba(0,0,0,0.7)'}}>{label}</div>
		</div>
	);
	return (
		<AbsoluteFill style={{backgroundColor: '#0b0b0b'}}>
			<Img src={IMG.clock} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', filter: `${GRADE} blur(30px) brightness(0.4)`}} />
			{panel(IMG.clock, a, true, 'I', 240)}
			{panel(IMG.calendar, b, false, 'II', 900)}
		</AbsoluteFill>
	);
};

/** Big timecode burned over the hourglass, running down the 5 hours. */
const SessionClock: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.lima) - 10;
	const b = f(WORD.selesai) + 6;
	if (frame < a) return null;
	const left = interpolate(frame, [a, b], [5 * 3600, 0], {...clamp, easing: EASE_IN_OUT});
	const p = (n: number) => String(Math.floor(n)).padStart(2, '0');
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', opacity: prog(frame, a, a + 10)}}>
			<div style={{fontFamily: FONT.mono, fontSize: 26, letterSpacing: 8, color: '#e2c08f', textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>SESI · JENDELA 5 JAM</div>
			<div style={{fontFamily: FONT.playfairRoman, fontWeight: 600, fontSize: 120, color: '#efe6da', fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 30px rgba(0,0,0,0.6)'}}>
				{p(left / 3600)}:{p((left % 3600) / 60)}:{p(left % 60)}
			</div>
		</div>
	);
};

/** Film burn at the reset cut: warm light blooming through the frame. */
const FilmBurn: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	if (frame < at - 6 || frame > at + 16) return null;
	const p = interpolate(frame, [at - 6, at, at + 16], [0, 1, 0], clamp);
	return (
		<AbsoluteFill style={{mixBlendMode: 'screen', opacity: p}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 50% at 20% 40%, rgba(255,170,90,1) 0%, rgba(255,90,30,0.7) 35%, transparent 70%)'}} />
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 50% 40% at 85% 75%, rgba(255,230,180,0.9) 0%, transparent 70%)'}} />
		</AbsoluteFill>
	);
};

const WeekTicks: React.FC = () => {
	const frame = useCurrentFrame();
	const days = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
	const a = f(WORD.mingguan) - 6;
	const b = f(WORD.tersendiri) + 4;
	return (
		<div style={{position: 'absolute', left: 70, right: 70, top: 330, display: 'flex', justifyContent: 'space-between'}}>
			{days.map((d, i) => {
				const p = prog(frame, a + ((b - a) / 7) * i, a + ((b - a) / 7) * i + 8);
				return (
					<div key={d} style={{textAlign: 'center', opacity: 0.25 + p * 0.75}}>
						<div style={{fontFamily: FONT.mono, fontSize: 24, color: '#efe6da', letterSpacing: 3}}>{d}</div>
						<div style={{width: 92, height: 4, marginTop: 12, backgroundColor: p > 0.5 ? '#c9a77a' : 'rgba(255,255,255,0.3)'}} />
					</div>
				);
			})}
		</div>
	);
};

export const Documentary: React.FC = () => {
	const frame = useCurrentFrame();
	const glowDim = interpolate(frame, [f(WORD.habis) - 2, f(WORD.habis) + 10], [0, 0.55], clamp);
	const endFade = interpolate(frame, [438, 449], [0, 1], clamp);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* S1 · the screen goes dim as the limit runs out */}
			<Fade from={0} to={46} inDur={10}>
				<Plate src={IMG.laptopDark} from={0} to={46} zoom={[1.08, 1.22]} pan={['0 20', '0 -10']} dim={glowDim} />
			</Fade>
			{/* S2 · someone still at the desk at night */}
			<Fade from={40} to={100} inDur={8} blurIn>
				<Plate src={IMG.deskNight} from={40} to={100} zoom={[1.18, 1.05]} pan={['-30 0', '20 10']} parallax={0.4} />
			</Fade>
			{/* S3 · two limits, a diptych */}
			<Fade from={96} to={168} inDur={6}>
				<Diptych />
			</Fade>
			<Chapter from={168} to={198} kicker="BAB I" num="I." title="current session" />
			{/* S4 · hourglass, 5 hours */}
			<Fade from={196} to={298} inDur={6}>
				<Plate src={IMG.hourglass} from={196} to={298} zoom={[1.32, 1.08]} pan={['0 60', '0 -20']} parallax={0.6} focus="50% 55%" />
				<SessionClock />
			</Fade>
			{/* S5 · the wall of clocks, reset */}
			<Fade from={296} to={342} inDur={0}>
				<Plate src={IMG.clocks} from={296} to={342} zoom={[1.0, 1.28]} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 340, textAlign: 'center', fontFamily: FONT.playfair, fontSize: 96, color: '#efe6da', opacity: prog(frame, f(WORD.otomatis) - 4, f(WORD.otomatis) + 6), textShadow: '0 4px 30px rgba(0,0,0,0.8)'}}>
					reset.
				</div>
			</Fade>
			<Chapter from={340} to={372} kicker="BAB II" num="II." title="weekly limit" />
			{/* S6 · the planner, a week at a time */}
			<Fade from={370} to={450} inDur={8}>
				<Plate src={IMG.planner} from={370} to={450} zoom={[1.25, 1.1]} pan={['0 -60', '0 30']} parallax={0.3} dim={0.45} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 200, height: 320, background: 'linear-gradient(180deg, rgba(0,0,0,0.75), transparent)'}} />
				<WeekTicks />
			</Fade>
			<FilmBurn at={296} />
			<Grain />
			<Gate />
			<Chrome />
			<Subtitles />
			<AbsoluteFill style={{backgroundColor: '#000', opacity: endFade}} />
			<VO />
			<SfxTrack
				cues={[
					{at: 0, name: 'projector', vol: 0.35},
					{at: 0, name: 'drone', vol: 0.3},
					{at: f(WORD.habis), name: 'subhit', vol: 0.35},
					{at: 40, name: 'whoosh', vol: 0.18},
					{at: f(WORD.dua) - 6, name: 'shutter-old', vol: 0.4},
					{at: f(WORD.batas), name: 'shutter-old', vol: 0.35},
					{at: 166, name: 'whoosh', vol: 0.3},
					{at: 170, name: 'subhit', vol: 0.4},
					...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({at: f(WORD.lima) - 10 + i * 6, name: 'tick' as const, vol: 0.16})),
					{at: 290, name: 'riser', vol: 0.25},
					{at: 296, name: 'shutter-modern', vol: 0.45},
					{at: f(WORD.otomatis), name: 'shimmer', vol: 0.25},
					{at: 338, name: 'whoosh', vol: 0.3},
					{at: 342, name: 'subhit', vol: 0.4},
					{at: 372, name: 'page-turn', vol: 0.3},
				]}
			/>
		</AbsoluteFill>
	);
};


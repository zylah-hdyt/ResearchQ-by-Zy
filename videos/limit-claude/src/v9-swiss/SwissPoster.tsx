import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN, EASE_IN_OUT, EASE_OUT, f, prog, WORD} from '../shared/timing';

// Swiss poster: one grid, one accent colour, halftone photos, hard cuts between "posters".
const PAPER = '#F1EEE6';
const BLACK = '#0F0F0E';
const RED = '#E5352B';

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1400&q=80&auto=format&fit=crop`;
const IMG = {
	laptop: u('1531297484001-80022131f5a1'),
	clock: u('1508962914676-134849a727f0'),
	hourglass: u('1501139083538-0139583c060f'),
};

const M = 60; // page margin
const T = (s: number) => Math.round(s * 30);

// ---------- primitives ----------
/** Left→right clip reveal. */
const Clip: React.FC<{at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode; dir?: 'x' | 'y'}> = ({at, dur = 9, style, children, dir = 'x'}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const p = prog(frame, at, at + dur, EASE_OUT);
	return <div style={{position: 'absolute', clipPath: dir === 'x' ? `inset(0 ${(1 - p) * 100}% 0 0)` : `inset(${(1 - p) * 100}% 0 0 0)`, ...style}}>{children}</div>;
};

const Txt: React.FC<{size: number; color: string; weight?: 300 | 500 | 600 | 800; lh?: number; ls?: number; mono?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({size, color, weight = 800, lh = 0.84, ls = -0.04, mono, style, children}) => (
	<div style={{fontFamily: mono ? FONT.mono : FONT.tight, fontWeight: mono ? 500 : weight, fontSize: size, lineHeight: lh, letterSpacing: mono ? 3 : `${ls}em`, color, whiteSpace: 'pre', ...style}}>{children}</div>
);

const Rule: React.FC<{at: number; x: number; y: number; w: number; color?: string; th?: number; dur?: number}> = ({at, x, y, w, color = BLACK, th = 4, dur = 12}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	return <div style={{position: 'absolute', left: x, top: y, width: w * prog(frame, at, at + dur, EASE_IN_OUT), height: th, backgroundColor: color}} />;
};

const Halftone: React.FC<{src: string; x: number; y: number; w: number; h: number; at: number; tint?: string; zoom?: [number, number]; focus?: string; border?: boolean}> = ({src, x, y, w, h, at, tint = RED, zoom = [1.15, 1.3], focus = '50% 50%', border}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const p = prog(frame, at, at + 12, EASE_IN_OUT);
	const z = interpolate(frame, [at, at + 120], zoom, clamp);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', backgroundColor: tint, boxSizing: 'border-box', border: border ? `4px solid ${BLACK}` : undefined, clipPath: `inset(${(1 - p) * 100}% 0 0 0)`}}>
			<Img src={src} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, scale: z, filter: 'grayscale(1) contrast(1.55) brightness(1.08)', mixBlendMode: 'multiply'}} />
			<div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.6) 1.7px, transparent 2.3px)', backgroundSize: '9px 9px', mixBlendMode: 'multiply', opacity: 0.55}} />
		</div>
	);
};

const Word: React.FC<{at: number; children: string}> = ({at, children}) => {
	const frame = useCurrentFrame();
	const p = prog(frame, at, at + 5);
	return <span style={{opacity: p, translate: `0 ${(1 - p) * 14}px`, display: 'inline-block', marginRight: '0.28em'}}>{children}</span>;
};

// ---------- footer / header ----------
const BOUNDS = [0, 96, 168, 296, 340, 450];
const Chrome: React.FC<{fg: string; muted: string}> = ({fg, muted}) => {
	const frame = useCurrentFrame();
	const cur = BOUNDS.findIndex((b, i) => frame >= b && frame < (BOUNDS[i + 1] ?? 451));
	return (
		<>
			<div style={{position: 'absolute', left: M, right: M, top: 64, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 24, letterSpacing: 4, color: muted}}>
				<span>LIMIT / CLAUDE</span>
				<span>N°{String(cur + 1).padStart(2, '0')}/05</span>
			</div>
			<div style={{position: 'absolute', left: M, right: M, bottom: 70, display: 'flex', gap: 10}}>
				{BOUNDS.slice(0, 5).map((b, i) => {
					const span = BOUNDS[i + 1] - b;
					const fill = i < cur ? 1 : i === cur ? (frame - b) / span : 0;
					return (
						<div key={b} style={{flex: span, height: 8, backgroundColor: muted, opacity: 0.35, position: 'relative'}}>
							<div style={{position: 'absolute', inset: 0, width: `${fill * 100}%`, backgroundColor: i === cur ? RED : fg}} />
						</div>
					);
				})}
			</div>
		</>
	);
};

// ---------- B1 ----------
const Poster1: React.FC = () => {
	const frame = useCurrentFrame();
	const v = interpolate(frame, [T(WORD.habis), T(WORD.habis) + 14], [100, 0], {...clamp, easing: EASE_IN_OUT});
	const habis = prog(frame, T(WORD.habis), T(WORD.habis) + 7, EASE_OUT);
	return (
		<AbsoluteFill style={{backgroundColor: PAPER}}>
			<Clip at={0} dur={8} style={{left: M, top: 130}}>
				<Txt size={84} color={BLACK} weight={600} ls={-0.02}>Pernah nggak,</Txt>
			</Clip>
			<Clip at={T(WORD.limit)} dur={9} style={{left: M - 10, top: 250}}>
				<Txt size={330} color={BLACK} ls={-0.06}>LIMIT</Txt>
			</Clip>
			<Clip at={T(WORD.claude)} dur={8} style={{left: M, top: 548}}>
				<Txt size={170} color={RED} ls={-0.05}>CLAUDE</Txt>
			</Clip>
			<Halftone src={IMG.laptop} x={M} y={730} w={960} h={290} at={T(WORD.limit) + 4} focus="50% 45%" />
			{habis > 0 ? (
				<div style={{position: 'absolute', left: M, top: 1020, width: 960 * habis, height: 190, overflow: 'hidden', backgroundColor: RED}}>
					<Txt size={230} color={PAPER} ls={-0.06} style={{position: 'absolute', left: 16, top: 6}}>HABIS</Txt>
				</div>
			) : null}
			<div style={{position: 'absolute', left: M, top: 1250, width: 960}}>
				<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 26, color: BLACK, letterSpacing: 3}}>
					<span>SISA PEMAKAIAN</span>
					<span style={{color: v < 1 ? RED : BLACK}}>{Math.round(v)}%</span>
				</div>
				<div style={{height: 34, marginTop: 12, border: `4px solid ${BLACK}`, position: 'relative'}}>
					<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v}%`, backgroundColor: BLACK}} />
				</div>
			</div>
			<div style={{position: 'absolute', left: M, top: 1420, fontFamily: FONT.tight, fontWeight: 600, fontSize: 74, lineHeight: 1.08, letterSpacing: '-0.02em', color: BLACK}}>
				<div>
					<Word at={T(WORD.padahal)}>padahal</Word>
					<Word at={T(1.72)}>kamu</Word>
					<Word at={T(1.86)}>merasa</Word>
				</div>
				<div>
					<Word at={T(WORD.belumBanyak)}>belum</Word>
					<Word at={T(2.28)}>banyak</Word>
				</div>
				<div style={{color: RED}}>
					<Word at={T(WORD.menggunakannya)}>menggunakannya?</Word>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- B2 ----------
const Poster2: React.FC = () => {
	const frame = useCurrentFrame();
	const at = T(WORD.dua);
	const slam = interpolate(frame, [at, at + 6], [1.15, 1], {...clamp, easing: EASE_OUT});
	const x = interpolate(frame, [at, at + 8], [-300, -70], {...clamp, easing: EASE_OUT});
	return (
		<AbsoluteFill style={{backgroundColor: PAPER}}>
			<Clip at={T(WORD.sebenarnya)} dur={8} style={{left: M, top: 130}}>
				<Txt size={72} color={BLACK} weight={600} ls={-0.02}>sebenarnya ada</Txt>
			</Clip>
			{frame >= at ? (
				<div style={{position: 'absolute', left: x, top: 270, scale: slam, transformOrigin: '0 50%'}}>
					<Txt size={1100} color={RED} ls={-0.08} lh={0.8}>2</Txt>
				</div>
			) : null}
			<div style={{position: 'absolute', left: 610, top: 300, width: 410}}>
				<Clip at={T(WORD.batas)} dur={8} style={{left: 0, top: 0}}>
					<Txt size={140} color={BLACK} ls={-0.05}>BATAS</Txt>
				</Clip>
				<Clip at={T(WORD.penggunaan)} dur={10} style={{left: 0, top: 150}}>
					<Txt size={64} color={BLACK} ls={-0.03}>PENGGUNAAN</Txt>
				</Clip>
			</div>
			<Rule at={T(WORD.penggunaan) + 6} x={610} y={560} w={410} />
			<Clip at={T(4.72)} dur={8} style={{left: 610, top: 590}}>
				<Txt size={32} color={RED} mono>01</Txt>
				<Txt size={58} color={BLACK} ls={-0.03} style={{marginTop: 6}}>SESI 5 JAM</Txt>
			</Clip>
			<Rule at={T(4.72) + 10} x={610} y={740} w={410} th={2} />
			<Clip at={T(WORD.pahami) - 6} dur={8} style={{left: 610, top: 780}}>
				<Txt size={32} color={RED} mono>02</Txt>
				<Txt size={58} color={BLACK} ls={-0.03} style={{marginTop: 6}}>MINGGUAN</Txt>
			</Clip>
			<Rule at={T(WORD.pahami) + 4} x={610} y={930} w={410} th={2} />
			<Halftone src={IMG.clock} x={610} y={990} w={410} h={520} at={T(WORD.penggunaan) + 8} focus="30% 50%" tint={PAPER} border />
			<div style={{position: 'absolute', left: M, top: 1580, fontFamily: FONT.tight, fontWeight: 600, fontSize: 70, lineHeight: 1.08, letterSpacing: '-0.02em', color: BLACK}}>
				<div>
					<Word at={T(4.72)}>yang</Word>
					<Word at={T(4.82)}>perlu</Word>
					<Word at={T(5.04)}>kamu</Word>
				</div>
				<div style={{color: RED}}>
					<Word at={T(WORD.pahami)}>pahami.</Word>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- B3 ----------
const HOURS = 5;
const Poster3: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(WORD.setiap);
	const b = T(WORD.selesai) + 4;
	const sweep = interpolate(frame, [a, b], [0, HOURS], {...clamp, easing: EASE_IN_OUT});
	const left = interpolate(frame, [a, b], [5 * 3600, 0], clamp);
	const p2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
	const five = interpolate(frame, [T(WORD.lima), T(WORD.lima) + 4, T(WORD.lima) + 9], [1.5, 0.95, 1], {...clamp, easing: EASE_OUT});
	return (
		<AbsoluteFill style={{backgroundColor: BLACK}}>
			<Clip at={T(WORD.pertama) - 2} dur={8} style={{left: M - 8, top: 130}}>
				<Txt size={310} color={RED} ls={-0.07}>01</Txt>
			</Clip>
			<Clip at={T(WORD.current)} dur={8} style={{left: 480, top: 168}}>
				<Txt size={118} color={PAPER} ls={-0.04}>CURRENT</Txt>
			</Clip>
			<Clip at={T(WORD.session)} dur={8} style={{left: 480, top: 282}}>
				<Txt size={118} color={PAPER} ls={-0.04}>SESSION</Txt>
			</Clip>
			<Halftone src={IMG.hourglass} x={M} y={470} w={960} h={560} at={T(WORD.pertama) + 12} focus="50% 55%" zoom={[1.3, 1.1]} />
			{frame >= T(WORD.setiap) ? (
				<div style={{position: 'absolute', left: M + 24, bottom: 1920 - 1030 + 20, fontFamily: FONT.mono, fontWeight: 700, fontSize: 96, color: PAPER, letterSpacing: 2, fontVariantNumeric: 'tabular-nums', textShadow: '0 0 0 #000'}}>
					<span style={{backgroundColor: BLACK, padding: '4px 18px'}}>
						{p2(left / 3600)}:{p2((left % 3600) / 60)}:{p2(left % 60)}
					</span>
				</div>
			) : null}
			<Clip at={T(WORD.yaitu1)} dur={8} style={{left: M, top: 1070}}>
				<Txt size={36} color={PAPER} mono>BATAS PENGGUNAAN / SETIAP PERIODE</Txt>
			</Clip>
			<div style={{position: 'absolute', left: M, top: 1140, width: 960, display: 'flex', gap: 8}}>
				{Array.from({length: HOURS}).map((_, i) => {
					const fill = Math.min(1, Math.max(0, sweep - i));
					return (
						<div key={i} style={{flex: 1, height: 96, border: `4px solid ${PAPER}`, position: 'relative'}}>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, backgroundColor: RED}} />
							<span style={{position: 'absolute', left: 10, bottom: -44, fontFamily: FONT.mono, fontSize: 24, color: 'rgba(241,238,230,0.6)'}}>{i}J</span>
						</div>
					);
				})}
			</div>
			{frame >= T(WORD.lima) ? (
				<div style={{position: 'absolute', left: M - 6, top: 1330, display: 'flex', alignItems: 'flex-end', gap: 30, scale: five, transformOrigin: '10% 90%'}}>
					<Txt size={440} color={PAPER} ls={-0.07} lh={0.78}>5</Txt>
					<Txt size={170} color={RED} ls={-0.05} style={{marginBottom: 30}}>JAM</Txt>
				</div>
			) : null}
			<Clip at={T(WORD.setelah)} dur={8} style={{left: M, top: 1722}}>
				<Txt size={46} color={PAPER} weight={600} ls={-0.02}>setelah periode itu selesai,</Txt>
			</Clip>
		</AbsoluteFill>
	);
};

// ---------- B4 ----------
const Poster4: React.FC = () => {
	const frame = useCurrentFrame();
	const refill = prog(frame, 298, 316, EASE_IN_OUT);
	const n = interpolate(frame, [298, 316], [0, 5 * 3600], clamp);
	const p2 = (x: number) => String(Math.floor(x)).padStart(2, '0');
	const spin = interpolate(frame, [296, 340], [0, 360], clamp);
	return (
		<AbsoluteFill style={{backgroundColor: RED}}>
			<Clip at={T(WORD.limit2)} dur={7} style={{left: M, top: 170}}>
				<Txt size={90} color={PAPER} weight={600} ls={-0.02}>limit akan</Txt>
			</Clip>
			<Clip at={T(WORD.direset) - 2} dur={9} style={{left: M - 14, top: 300}}>
				<Txt size={320} color={PAPER} ls={-0.07}>RESET</Txt>
			</Clip>
			<div style={{position: 'absolute', left: M, top: 920, width: 960, display: 'flex', gap: 8}}>
				{Array.from({length: HOURS}).map((_, i) => {
					const fill = Math.min(1, Math.max(0, refill * HOURS - i));
					return (
						<div key={i} style={{flex: 1, height: 120, border: `4px solid ${PAPER}`, position: 'relative'}}>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, backgroundColor: PAPER}} />
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: M, top: 1080, fontFamily: FONT.mono, fontWeight: 700, fontSize: 110, color: PAPER, fontVariantNumeric: 'tabular-nums', letterSpacing: 2}}>
				{p2(n / 3600)}:{p2((n % 3600) / 60)}:{p2(n % 60)}
			</div>
			<Clip at={T(WORD.otomatis)} dur={9} style={{left: M, top: 1300}}>
				<Txt size={150} color={BLACK} ls={-0.05}>OTOMATIS</Txt>
			</Clip>
			<svg width={260} height={260} viewBox="0 0 100 100" style={{position: 'absolute', right: M, top: 1500, rotate: `${spin}deg`}}>
				<path d="M82 50 A32 32 0 1 1 66 22" fill="none" stroke={PAPER} strokeWidth={9} strokeLinecap="butt" />
				<path d="M72 6 L72 30 L50 22 Z" fill={PAPER} />
			</svg>
		</AbsoluteFill>
	);
};

// ---------- B5 ----------
const DAYS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];
const HEIGHTS = [0.45, 0.72, 0.38, 0.9, 0.58, 0.26, 0.64];
const Poster5: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(WORD.mingguan) - 4;
	const b = T(WORD.jadwal) + 2;
	const under = prog(frame, T(WORD.tersendiri), T(WORD.tersendiri) + 14, EASE_IN_OUT);
	return (
		<AbsoluteFill style={{backgroundColor: PAPER}}>
			<Clip at={T(WORD.kedua) - 2} dur={8} style={{left: M - 8, top: 130}}>
				<Txt size={310} color={RED} ls={-0.07}>02</Txt>
			</Clip>
			<Clip at={T(WORD.weekly)} dur={8} style={{left: 480, top: 168}}>
				<Txt size={118} color={BLACK} ls={-0.04}>WEEKLY</Txt>
			</Clip>
			<Clip at={T(WORD.limit3)} dur={8} style={{left: 480, top: 282}}>
				<Txt size={118} color={BLACK} ls={-0.04}>LIMIT</Txt>
			</Clip>
			<Clip at={T(WORD.yaitu2)} dur={8} style={{left: M, top: 500}}>
				<Txt size={36} color={BLACK} mono>BATAS MINGGUAN / 7 HARI</Txt>
			</Clip>
			<div style={{position: 'absolute', left: M, top: 690, width: 960, height: 470, display: 'flex', gap: 12, alignItems: 'flex-end'}}>
				{DAYS.map((d, i) => {
					const t0 = a + ((b - a) / 7) * i;
					const p = prog(frame, t0, t0 + 8, EASE_OUT);
					const kam = i === 3;
					const flag = kam ? prog(frame, T(WORD.jadwal), T(WORD.jadwal) + 8) : 0;
					return (
						<div key={i} style={{flex: 1, height: '100%', position: 'relative', border: `4px solid ${BLACK}`}}>
							<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: `${HEIGHTS[i] * p * 100}%`, backgroundColor: kam && flag > 0.5 ? RED : BLACK}} />
							<span style={{position: 'absolute', left: 0, right: 0, bottom: -64, textAlign: 'center', fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: kam && flag > 0.5 ? RED : BLACK}}>{d}</span>
							{kam && flag > 0 ? (
								<div style={{position: 'absolute', left: -4, top: -100 + (1 - flag) * 30, width: 140, opacity: flag, fontFamily: FONT.mono, fontWeight: 700, fontSize: 28, color: RED, whiteSpace: 'nowrap'}}>
									▼ RESET
								</div>
							) : null}
						</div>
					);
				})}
			</div>
			<Clip at={T(WORD.jadwal)} dur={9} style={{left: M, top: 1330}}>
				<Txt size={104} color={BLACK} ls={-0.04}>JADWAL RESET</Txt>
			</Clip>
			<Clip at={T(WORD.tersendiri)} dur={10} style={{left: M - 8, top: 1450}}>
				<Txt size={210} color={RED} ls={-0.06}>SENDIRI</Txt>
			</Clip>
			<div style={{position: 'absolute', left: M, top: 1670, width: 960 * under, height: 12, backgroundColor: BLACK}} />
			<Clip at={T(WORD.tersendiri) + 10} dur={8} style={{left: M, top: 1710}}>
				<Txt size={30} color={BLACK} mono>TERPISAH DARI SESI 5 JAM</Txt>
			</Clip>
		</AbsoluteFill>
	);
};

// ---------- hard-cut panels ----------
const Panel: React.FC<{at: number; color: string; from: 'left' | 'right'}> = ({at, color, from}) => {
	const frame = useCurrentFrame();
	if (frame < at - 6 || frame > at + 6) return null;
	const inP = prog(frame, at - 6, at, EASE_IN);
	const outP = prog(frame, at, at + 6, EASE_OUT);
	const sgn = from === 'left' ? 1 : -1;
	const x = frame < at ? (1 - inP) * -1080 * sgn : outP * 1080 * sgn;
	return <AbsoluteFill style={{backgroundColor: color, translate: `${x}px 0`}} />;
};

export const SwissPoster: React.FC = () => {
	const frame = useCurrentFrame();
	const dark = (frame >= 168 && frame < 296) || false;
	const onRed = frame >= 296 && frame < 340;
	const fg = dark ? PAPER : onRed ? PAPER : BLACK;
	return (
		<AbsoluteFill style={{backgroundColor: PAPER}}>
			{frame < 96 ? <Poster1 /> : frame < 168 ? <Poster2 /> : frame < 296 ? <Poster3 /> : frame < 340 ? <Poster4 /> : <Poster5 />}
			<Chrome fg={fg} muted={dark ? 'rgba(241,238,230,0.6)' : onRed ? 'rgba(241,238,230,0.75)' : 'rgba(15,15,14,0.6)'} />
			<Panel at={96} color={BLACK} from="left" />
			<Panel at={168} color={RED} from="right" />
			<Panel at={296} color={RED} from="left" />
			<Panel at={340} color={BLACK} from="right" />
			<AbsoluteFill style={{backgroundColor: PAPER, opacity: interpolate(frame, [440, 449], [0, 1], clamp)}} />
			<VO />
			<SfxTrack
				cues={[
					{at: 0, name: 'mouse-click', vol: 0.25},
					{at: T(WORD.limit), name: 'thump', vol: 0.4},
					{at: T(WORD.habis), name: 'subhit', vol: 0.45},
					{at: 90, name: 'whoosh', vol: 0.22},
					{at: T(WORD.dua), name: 'thump', vol: 0.55},
					{at: T(WORD.batas), name: 'switch', vol: 0.3},
					{at: 162, name: 'whoosh', vol: 0.22},
					{at: T(WORD.pertama) - 2, name: 'thump', vol: 0.4},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(T(WORD.setiap) + ((T(WORD.selesai) + 4 - T(WORD.setiap)) / 5) * i), name: 'tick' as const, vol: 0.26})),
					{at: T(WORD.lima), name: 'thump', vol: 0.55},
					{at: 286, name: 'riser', vol: 0.2},
					{at: 296, name: 'whoosh', vol: 0.25},
					{at: T(WORD.direset) - 2, name: 'subhit', vol: 0.5},
					{at: 316, name: 'ding', vol: 0.4},
					{at: 334, name: 'whoosh', vol: 0.22},
					{at: T(WORD.weekly), name: 'switch', vol: 0.3},
					...[0, 1, 2, 3, 4, 5, 6].map((i) => ({at: Math.round(T(WORD.mingguan) - 4 + ((T(WORD.jadwal) + 2 - T(WORD.mingguan) + 4) / 7) * i), name: 'pop' as const, vol: 0.2})),
					{at: T(WORD.jadwal), name: 'mouse-click', vol: 0.35},
					{at: T(WORD.tersendiri), name: 'thump', vol: 0.5},
				]}
			/>
		</AbsoluteFill>
	);
};

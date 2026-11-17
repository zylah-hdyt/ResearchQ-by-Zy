import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../shared/fonts';
import {SfxTrack, type Cue} from '../shared/Sound';
import {clamp, EASE_IN, EASE_IN_OUT, EASE_OUT, prog} from '../shared/timing';
import {Mascot} from './Mascot';
import {PHRASES} from './words';

// "Kenapa mental lu makin lembek?" Swiss poster explainer with the user's mascot as talking head.
export const MENTAL_FRAMES = 1770;

const PAPER = '#F1EEE6';
const BLACK = '#0F0F0E';
const RED = '#E5352B';
const M = 60;
const T = (s: number) => Math.round(s * 30);

const px = (id: number, w = 1200) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const IMG = {
	phone: px(63572),
	giveUp: px(6214833),
	lazy: px(5409046),
	teacher: px(6325934),
	confused: px(6958584),
	magnifier: px(4494642),
	hourglass: px(3570733),
	climber: px(5907806),
	together: px(8199759),
	notes: px(6549598),
	night: px(33940743),
};

// ---------- scenes ----------
type Bg = 'paper' | 'black' | 'red';
const SCENES: {at: number; bg: Bg; talk?: boolean}[] = [
	{at: 0, bg: 'paper', talk: true}, // 01 hook
	{at: 5.2, bg: 'black'}, // 02 menyerah / malas
	{at: 8.92, bg: 'paper'}, // 03 sudah dijelaskan
	{at: 14.45, bg: 'red', talk: true}, // 04 bukan berarti nggak mampu
	{at: 18.1, bg: 'paper'}, // 05 bukan kecerdasan
	{at: 25.05, bg: 'black'}, // 06 orang lain bisa
	{at: 29.15, bg: 'paper'}, // 07 1x vs 2-3x
	{at: 36.85, bg: 'red', talk: true}, // 08 nggak masalah
	{at: 38.5, bg: 'black'}, // 09 kecepatan beda
	{at: 41.8, bg: 'paper'}, // 10 mau terus belajar
	{at: 49.4, bg: 'black', talk: true}, // 11 jangan buru-buru
	{at: 54.05, bg: 'paper', talk: true}, // 12 save
];
const sceneIndex = (frame: number) => {
	let k = 0;
	SCENES.forEach((s, i) => {
		if (frame >= T(s.at)) k = i;
	});
	return k;
};
const BGC: Record<Bg, string> = {paper: PAPER, black: BLACK, red: RED};
const FG: Record<Bg, string> = {paper: BLACK, black: PAPER, red: PAPER};

// ---------- primitives ----------
const Clip: React.FC<{at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({at, dur = 8, style, children}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const p = prog(frame, at, at + dur, EASE_OUT);
	return <div style={{position: 'absolute', clipPath: `inset(0 ${(1 - p) * 100}% -20% 0)`, ...style}}>{children}</div>;
};

const Txt: React.FC<{size: number; color: string; weight?: 300 | 500 | 600 | 800; lh?: number; ls?: number; mono?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({size, color, weight = 800, lh = 0.86, ls = -0.045, mono, style, children}) => (
	<div style={{fontFamily: mono ? FONT.mono : FONT.tight, fontWeight: mono ? 500 : weight, fontSize: size, lineHeight: lh, letterSpacing: mono ? 4 : `${ls}em`, color, whiteSpace: 'pre', ...style}}>{children}</div>
);

/** Words that appear on their VO hit. */
const Line: React.FC<{words: [string, number][]; size: number; color: string; weight?: 600 | 800; top: number; left?: number; accent?: string[]}> = ({words, size, color, weight = 600, top, left = M, accent = []}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{position: 'absolute', left, top, fontFamily: FONT.tight, fontWeight: weight, fontSize: size, lineHeight: 1, letterSpacing: '-0.03em', color, whiteSpace: 'nowrap'}}>
			{words.map(([w, s], i) => {
				const p = prog(frame, T(s) - 1, T(s) + 4);
				return (
					<span key={i} style={{display: 'inline-block', marginRight: '0.26em', opacity: p, translate: `0 ${(1 - p) * 16}px`, color: accent.includes(w) ? RED : undefined}}>
						{w}
					</span>
				);
			})}
		</div>
	);
};

const Strike: React.FC<{at: number; left: number; top: number; w: number; th?: number; color?: string}> = ({at, left, top, w, th = 14, color = RED}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	return <div style={{position: 'absolute', left, top, height: th, width: w * prog(frame, at, at + 7, EASE_IN_OUT), backgroundColor: color}} />;
};

const Photo: React.FC<{src: string; x: number; y: number; w: number; h: number; at: number; tint?: string; focus?: string; zoom?: [number, number]; border?: string; bright?: number}> = ({src, x, y, w, h, at, tint = PAPER, focus = '50% 50%', zoom = [1.12, 1.24], border, bright = 1.06}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const p = prog(frame, at, at + 10, EASE_IN_OUT);
	const z = interpolate(frame, [at, at + 150], zoom, clamp);
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', backgroundColor: tint, boxSizing: 'border-box', border: border ? `4px solid ${border}` : undefined, clipPath: `inset(${(1 - p) * 100}% 0 0 0)`}}>
			<Img src={src} style={{position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', objectPosition: focus, scale: z, filter: `grayscale(1) contrast(1.45) brightness(${bright})`, mixBlendMode: 'multiply'}} />
			<div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.55) 1.6px, transparent 2.2px)', backgroundSize: '9px 9px', mixBlendMode: 'multiply', opacity: 0.45}} />
		</div>
	);
};

const Disc: React.FC<{cx: number; cy: number; r: number; color: string; at: number}> = ({cx, cy, r, color, at}) => {
	const frame = useCurrentFrame();
	const k = prog(frame, at, at + 12, EASE_OUT);
	return <div style={{position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: '50%', backgroundColor: color, scale: k}} />;
};

// ---------- 01 hook ----------
const S01: React.FC = () => (
	<>
		<Line top={150} size={86} color={BLACK} words={[['Kenapa', 0.82], ['makin', 1.54]]} />
		<Clip at={T(2.24)} style={{left: M - 6, top: 250}}>
			<Txt size={128} color={BLACK}>BERKEMBANG</Txt>
		</Clip>
		<Clip at={T(2.58)} style={{left: M - 6, top: 370}}>
			<Txt size={128} color={BLACK}>TEKNOLOGI,</Txt>
		</Clip>
		<Line top={510} size={86} color={BLACK} words={[['mental', 3.4], ['lu', 3.6], ['justru', 3.86]]} />
		<Clip at={T(4.22)} style={{left: M - 6, top: 615}}>
			<Txt size={150} color={RED}>MAKIN</Txt>
		</Clip>
		<Clip at={T(4.48)} style={{left: M - 6, top: 750}}>
			<Txt size={150} color={RED}>LEMBEK?</Txt>
		</Clip>
		<Disc cx={430} cy={1500} r={400} color={RED} at={0} />
		<Photo src={IMG.phone} x={780} y={930} w={240} h={340} at={T(2.4)} tint={PAPER} border={BLACK} focus="55% 50%" />
		<Mascot pose="m_think" mx={430} my={1420} k={1.42} from={0} to={T(5.2)} />
	</>
);

// ---------- 02 menyerah / malas ----------
const Row: React.FC<{top: number; photo: string; tag: string; at: number; lines: [string, number][]; focus?: string}> = ({top, photo, tag, at, lines, focus}) => (
	<>
		<Photo src={photo} x={M} y={top} w={440} h={640} at={at} tint={RED} focus={focus} />
		<Clip at={at} style={{left: 540, top}}>
			<Txt size={30} color={RED} mono>
				{tag}
			</Txt>
		</Clip>
		{lines.map(([w, s], i) => (
			<Clip key={i} at={T(s)} dur={6} style={{left: 534, top: top + 70 + i * 104}}>
				<Txt size={96} color={i === lines.length - 1 ? RED : PAPER}>
					{w}
				</Txt>
			</Clip>
		))}
	</>
);
const S02: React.FC = () => (
	<>
		<Row top={170} photo={IMG.giveUp} tag="01 / MENYERAH" at={T(5.3)} lines={[['BELUM', 5.34], ['MENCOBA,', 5.6], ['SUDAH', 6.04], ['MENYERAH.', 6.38]]} focus="50% 40%" />
		<Row top={880} photo={IMG.lazy} tag="02 / MALAS" at={T(7.12)} lines={[['BELUM', 7.16], ['MEMBACA,', 7.58], ['SUDAH', 7.98], ['MALAS.', 8.32]]} focus="40% 50%" />
	</>
);

// ---------- 03 sudah dijelaskan ----------
const Check: React.FC<{top: number; label: string; at: number; ok: boolean}> = ({top, label, at, ok}) => {
	const frame = useCurrentFrame();
	const on = frame >= at;
	const k = interpolate(frame, [at, at + 3, at + 8], [0, 1.25, 1], clamp);
	return (
		<div style={{position: 'absolute', left: M, top, display: 'flex', alignItems: 'center', gap: 28, opacity: frame >= at - 18 ? 1 : 0}}>
			<div style={{width: 76, height: 76, border: `6px solid ${BLACK}`, position: 'relative', backgroundColor: on && !ok ? RED : 'transparent', borderColor: on && !ok ? RED : BLACK}}>
				{on ? (
					<svg viewBox="0 0 76 76" width={64} height={64} style={{position: 'absolute', left: 0, top: 0, scale: k}}>
						{ok ? <path d="M14 38 L30 54 L60 18" fill="none" stroke={BLACK} strokeWidth={9} /> : <path d="M16 16 L48 48 M48 16 L16 48" fill="none" stroke={PAPER} strokeWidth={9} />}
					</svg>
				) : null}
			</div>
			<Txt size={70} color={on && !ok ? RED : BLACK}>
				{label}
			</Txt>
		</div>
	);
};
const S03: React.FC = () => (
	<>
		<Clip at={T(9.0)} style={{left: M, top: 150}}>
			<Txt size={30} color={RED} mono>
				BAHKAN KETIKA SUDAH...
			</Txt>
		</Clip>
		<Photo src={IMG.teacher} x={M} y={205} w={960} h={520} at={T(9.02)} border={BLACK} focus="40% 40%" />
		<Check top={780} label="DIBERI INFORMASI" at={T(10.36)} ok />
		<Check top={900} label="DIJELASKAN" at={T(11.16)} ok />
		<Check top={1020} label="MEMAHAMI" at={T(13.56)} ok={false} />
		<Photo src={IMG.confused} x={700} y={770} w={320} h={420} at={T(12.18)} tint={RED} focus="50% 35%" />
		<Clip at={T(12.52)} style={{left: M - 8, top: 1230}}>
			<Txt size={220} color={RED}>
				MASIH SULIT.
			</Txt>
		</Clip>
	</>
);

// ---------- 04 talking: bukan berarti nggak mampu ----------
const S04: React.FC = () => (
	<>
		<Line top={160} size={70} color={PAPER} words={[['Padahal', 14.62], ['percaya', 15.26], ['deh,', 15.98]]} />
		<Clip at={T(16.72)} style={{left: M - 4, top: 270}}>
			<Txt size={120} color={PAPER}>BUKAN BERARTI</Txt>
		</Clip>
		<Clip at={T(17.26)} style={{left: M - 4, top: 385}}>
			<Txt size={120} color={PAPER}>LU NGGAK</Txt>
		</Clip>
		<Clip at={T(17.54)} style={{left: M - 8, top: 500}}>
			<Txt size={230} color={BLACK}>MAMPU.</Txt>
		</Clip>
		<Disc cx={700} cy={1500} r={390} color={PAPER} at={T(14.45)} />
		<Mascot pose="m_point" mx={700} my={1420} k={1.36} from={T(14.45)} to={T(18.1)} />
	</>
);

// ---------- 05 bukan kecerdasan ----------
const Tile: React.FC<{x: number; src: string; at: number; label: string; tint: string; focus?: string}> = ({x, src, at, label, tint, focus}) => (
	<>
		<Photo src={src} x={x} y={720} w={300} h={540} at={at} tint={tint} border={BLACK} focus={focus} />
		<Clip at={at + 2} style={{left: x, top: 1285}}>
			<Txt size={50} color={BLACK} ls={-0.03}>
				{label}
			</Txt>
		</Clip>
	</>
);
const S05: React.FC = () => (
	<>
		<Line top={160} size={64} color={BLACK} words={[['Seringkali', 18.26], ['yang', 18.78], ['kurang', 18.98], ['itu', 19.24], ['bukan', 19.46]]} />
		<Clip at={T(19.72)} style={{left: M - 6, top: 260}}>
			<Txt size={152} color={BLACK}>KECERDASAN</Txt>
		</Clip>
		<Strike at={T(20.2)} left={M - 10} top={316} w={980} th={18} />
		<Clip at={T(20.7)} style={{left: M, top: 470}}>
			<Txt size={34} color={RED} mono>
				MELAINKAN:
			</Txt>
		</Clip>
		<Clip at={T(20.8)} style={{left: M, top: 540}}>
			<Txt size={30} color={BLACK} mono>
				01 · 02 · 03
			</Txt>
		</Clip>
		<Tile x={M} src={IMG.magnifier} at={T(21.08)} label="KETELITIAN" tint={PAPER} />
		<Tile x={M + 330} src={IMG.hourglass} at={T(22.26)} label="KESABARAN" tint={PAPER} />
		<Tile x={M + 660} src={IMG.climber} at={T(23.14)} label="KEMAUAN" tint={RED} focus="40% 50%" />
		<Line top={1390} size={80} color={RED} weight={800} words={[['untuk', 23.72], ['terus', 24.02], ['mencoba.', 24.3]]} />
	</>
);

// ---------- 06 orang lain bisa ----------
const S06: React.FC = () => (
	<>
		<Clip at={T(25.3)} style={{left: M, top: 150}}>
			<Txt size={34} color={RED} mono>
				FAKTANYA
			</Txt>
		</Clip>
		<Photo src={IMG.together} x={M} y={210} w={960} h={600} at={T(25.3)} tint={RED} focus="50% 40%" />
		<Clip at={T(26.46)} style={{left: M - 6, top: 860}}>
			<Txt size={112} color={PAPER}>ORANG LAIN BISA</Txt>
		</Clip>
		<Clip at={T(28.1)} dur={5} style={{left: M - 6, top: 960}}>
			<Txt size={290} color={RED} lh={0.9}>
				≠
			</Txt>
		</Clip>
		<Clip at={T(28.58)} style={{left: M - 6, top: 1230}}>
			<Txt size={112} color={PAPER}>LU NGGAK BISA</Txt>
		</Clip>
	</>
);

// ---------- 07 sekali vs dua-tiga kali ----------
const Boxes: React.FC<{top: number; fills: number[]; color: string; show: number}> = ({top, fills, color, show}) => {
	const frame = useCurrentFrame();
	if (frame < show) return null;
	return (
		<div style={{position: 'absolute', left: M, top, display: 'flex', gap: 18, opacity: prog(frame, show, show + 6)}}>
			{[0, 1, 2].map((i) => {
				const at = fills[i];
				const on = at !== undefined && frame >= at;
				const k = at === undefined ? 0 : prog(frame, at, at + 6, EASE_OUT);
				return (
					<div key={i} style={{width: 150, height: 150, border: `6px solid ${at === undefined ? 'rgba(15,15,14,0.18)' : BLACK}`, position: 'relative', boxSizing: 'border-box'}}>
						{on ? <div style={{position: 'absolute', inset: 10, backgroundColor: color, scale: k}} /> : null}
						{on ? (
							<svg viewBox="0 0 100 60" width={90} height={54} style={{position: 'absolute', left: 24, top: 42, opacity: k}}>
								<path d="M4 30 C 26 4, 74 4, 96 30 C 74 56, 26 56, 4 30 Z" fill="none" stroke={PAPER} strokeWidth={7} />
								<circle cx={50} cy={30} r={11} fill={PAPER} />
							</svg>
						) : null}
					</div>
				);
			})}
		</div>
	);
};
const S07: React.FC = () => (
	<>
		<Photo src={IMG.notes} x={M} y={160} w={960} h={330} at={T(29.26)} border={BLACK} focus="50% 50%" />
		<Clip at={T(30.14)} style={{left: M, top: 550}}>
			<Txt size={60} color={BLACK}>ORANG LAIN</Txt>
		</Clip>
		<Boxes top={630} fills={[T(31.38)]} color={BLACK} show={T(30.14)} />
		<Clip at={T(31.38)} dur={5} style={{left: 640, top: 600}}>
			<Txt size={220} color={BLACK}>1×</Txt>
		</Clip>
		<Clip at={T(32.24)} style={{left: M, top: 810}}>
			<Txt size={34} color={BLACK} mono>
				→ MENGERTI
			</Txt>
		</Clip>
		<Strike at={T(32.9)} left={M} top={905} w={960} th={4} color={BLACK} />
		<Clip at={T(33.48)} style={{left: M, top: 960}}>
			<Txt size={60} color={RED}>LU</Txt>
		</Clip>
		<Boxes top={1040} fills={[T(34.22), T(34.22) + 4, T(34.92)]} color={RED} show={T(33.48)} />
		<Clip at={T(34.22)} dur={5} style={{left: 610, top: 1030}}>
			<Txt size={168} color={RED}>{'2–3×'}</Txt>
		</Clip>
		<Clip at={T(35.74)} style={{left: M, top: 1220}}>
			<Txt size={34} color={RED} mono>
				→ BENAR-BENAR PAHAM
			</Txt>
		</Clip>
	</>
);

// ---------- 08 talking: nggak masalah ----------
const S08: React.FC = () => (
	<>
		<Line top={170} size={100} color={PAPER} weight={800} words={[['DAN', 36.98], ['ITU', 37.34]]} />
		<Clip at={T(37.56)} style={{left: M - 8, top: 290}}>
			<Txt size={210} color={BLACK}>NGGAK</Txt>
		</Clip>
		<Clip at={T(37.7)} style={{left: M - 8, top: 470}}>
			<Txt size={210} color={BLACK}>MASALAH.</Txt>
		</Clip>
		<Disc cx={540} cy={1500} r={410} color={PAPER} at={T(36.85)} />
		<Mascot pose="m_thumb" mx={540} my={1430} k={1.42} from={T(36.85)} to={T(38.5)} />
	</>
);

// ---------- 09 kecepatan beda ----------
const SPEED = [1, 0.62, 0.84, 0.45, 0.72];
const S09: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(39.0);
	const b = T(41.6);
	return (
		<>
			<Line top={160} size={64} color={PAPER} words={[['Setiap', 38.92], ['orang', 39.22], ['punya', 39.42]]} />
			<Clip at={T(39.88)} style={{left: M - 6, top: 250}}>
				<Txt size={130} color={PAPER}>KECEPATAN</Txt>
			</Clip>
			<Clip at={T(40.42)} style={{left: M - 6, top: 370}}>
				<Txt size={130} color={PAPER}>BELAJAR</Txt>
			</Clip>
			{SPEED.map((sp, i) => {
				const p = interpolate(frame, [a + i * 2, b], [0, sp], {...clamp, easing: EASE_OUT});
				return (
					<div key={i} style={{position: 'absolute', left: M, top: 580 + i * 150, width: 960, height: 110, borderBottom: `2px solid rgba(241,238,230,0.35)`}}>
						<span style={{position: 'absolute', left: 0, top: 30, fontFamily: FONT.mono, fontSize: 30, color: 'rgba(241,238,230,0.6)'}}>{String.fromCharCode(65 + i)}</span>
						<div style={{position: 'absolute', left: 60, top: 18, height: 74, width: 900 * p, backgroundColor: i === 3 ? RED : PAPER}} />
					</div>
				);
			})}
			<Clip at={T(41.0)} style={{left: M - 8, top: 1350}}>
				<Txt size={190} color={RED}>BERBEDA.</Txt>
			</Clip>
		</>
	);
};

// ---------- 10 mau terus belajar ----------
const Counter: React.FC = () => {
	const frame = useCurrentFrame();
	const a = T(47.66);
	if (frame < a) return null;
	const n = Math.min(9, 1 + Math.floor((frame - a) / 4));
	return (
		<div style={{position: 'absolute', left: 700, top: 760, width: 320}}>
			<Txt size={30} color={RED} mono>
				MENGULANG
			</Txt>
			<Txt size={230} color={BLACK} style={{marginTop: 20}}>
				{`×${n}`}
			</Txt>
			<svg viewBox="0 0 100 100" width={150} height={150} style={{marginTop: 30, rotate: `${(frame - a) * 9}deg`}}>
				<path d="M80 50 A30 30 0 1 1 65 24" fill="none" stroke={RED} strokeWidth={10} />
				<path d="M58 6 L78 24 L54 34 Z" fill={RED} />
			</svg>
		</div>
	);
};
const S10: React.FC = () => (
	<>
		<Clip at={T(41.98)} dur={24} style={{left: M, top: 160}}>
			<Txt size={30} color={BLACK} mono>
				YANG MEMBEDAKAN BUKAN SIAPA YANG
			</Txt>
		</Clip>
		<Clip at={T(43.72)} style={{left: M - 6, top: 205}}>
			<Txt size={130} color={BLACK}>PALING CEPAT</Txt>
		</Clip>
		<Strike at={T(44.6)} left={M - 10} top={258} w={980} th={16} />
		<Clip at={T(45.34)} style={{left: M, top: 380}}>
			<Txt size={30} color={RED} mono>
				TETAPI SIAPA YANG
			</Txt>
		</Clip>
		<Clip at={T(46.18)} style={{left: M - 6, top: 425}}>
			<Txt size={130} color={RED}>MAU TERUS</Txt>
		</Clip>
		<Clip at={T(46.6)} style={{left: M - 6, top: 545}}>
			<Txt size={130} color={RED}>BELAJAR.</Txt>
		</Clip>
		<Photo src={IMG.night} x={M} y={740} w={600} h={680} at={T(46.4)} tint={PAPER} border={BLACK} focus="40% 50%" bright={2.1} />
		<Counter />
	</>
);

// ---------- 11 talking: jangan buru-buru ----------
const S11: React.FC = () => (
	<>
		<Line top={160} size={96} color={PAPER} weight={800} words={[['JANGAN', 49.62], ['BURU-BURU', 49.96]]} />
		<Clip at={T(50.36)} style={{left: M - 6, top: 265}}>
			<Txt size={132} color={RED}>MENYIMPULKAN</Txt>
		</Clip>
		<Clip at={T(51.14)} style={{left: M - 4, top: 400}}>
			<Txt size={96} color={PAPER}>“LU NGGAK MAMPU”</Txt>
		</Clip>
		<Strike at={T(51.6)} left={M - 8} top={440} w={900} th={12} />
		<Line top={540} size={52} color={PAPER} words={[['kalau', 51.88], ['lu', 52.06], ['sendiri', 52.2], ['belum', 52.4]]} />
		<Line top={605} size={52} color={PAPER} words={[['benar-benar', 52.72], ['berusaha.', 53.32]]} accent={['berusaha.']} />
		<Disc cx={720} cy={1520} r={370} color={RED} at={T(49.4)} />
		<Mascot pose="m_warn" mx={720} my={1450} k={1.3} from={T(49.4)} to={T(54.05)} />
	</>
);

// ---------- 12 save ----------
const Bookmark: React.FC<{at: number}> = ({at}) => {
	const frame = useCurrentFrame();
	const k = interpolate(frame, [at, at + 4, at + 10], [0, 1.2, 1], clamp);
	const fill = prog(frame, at + 8, at + 16);
	return (
		<svg viewBox="0 0 60 80" width={150} height={200} style={{position: 'absolute', left: 860, top: 168, scale: k}}>
			<path d="M6 4 H54 V76 L30 58 L6 76 Z" fill={fill > 0.5 ? RED : 'none'} stroke={RED} strokeWidth={7} strokeLinejoin="round" />
		</svg>
	);
};
const S12: React.FC = () => (
	<>
		<Clip at={T(54.28)} dur={6} style={{left: M - 10, top: 150}}>
			<Txt size={300} color={BLACK}>SAVE</Txt>
		</Clip>
		<Bookmark at={T(54.4)} />
		<Clip at={T(54.78)} style={{left: M - 4, top: 420}}>
			<Txt size={110} color={BLACK}>VIDEO INI</Txt>
		</Clip>
		<Line top={545} size={56} color={BLACK} words={[['kalau', 55.28], ['ini', 55.54], ['bermanfaat.', 55.76]]} />
		<Clip at={T(56.52)} style={{left: M - 4, top: 640}}>
			<Txt size={120} color={RED}>Thank you.</Txt>
		</Clip>
		<Disc cx={720} cy={1520} r={380} color={RED} at={T(54.05)} />
		<Mascot pose="n_wink" mx={720} my={1400} k={1.3} from={T(54.05)} to={MENTAL_FRAMES + 20} />
	</>
);

const SCENE_COMPONENTS = [S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12];

// ---------- chrome ----------
const Chrome: React.FC<{bg: Bg; idx: number}> = ({bg, idx}) => {
	const frame = useCurrentFrame();
	const fg = FG[bg];
	const muted = bg === 'paper' ? 'rgba(15,15,14,0.55)' : 'rgba(241,238,230,0.65)';
	return (
		<>
			<div style={{position: 'absolute', left: M, right: M, top: 64, display: 'flex', justifyContent: 'space-between', fontFamily: FONT.mono, fontSize: 24, letterSpacing: 4, color: muted}}>
				<span>MENTAL / BELAJAR</span>
				<span>N°{String(idx + 1).padStart(2, '0')}/12</span>
			</div>
			<div style={{position: 'absolute', left: M, right: M, bottom: 70, display: 'flex', gap: 8}}>
				{SCENES.map((s, i) => {
					const a = T(s.at);
					const b = i + 1 < SCENES.length ? T(SCENES[i + 1].at) : MENTAL_FRAMES;
					const fill = i < idx ? 1 : i === idx ? (frame - a) / (b - a) : 0;
					return (
						<div key={i} style={{flex: b - a, height: 8, position: 'relative', backgroundColor: muted, opacity: 0.4}}>
							<div style={{position: 'absolute', inset: 0, width: `${Math.min(1, fill) * 100}%`, backgroundColor: i === idx ? (bg === 'red' ? fg : RED) : fg}} />
						</div>
					);
				})}
			</div>
		</>
	);
};

const Subtitle: React.FC<{bg: Bg}> = ({bg}) => {
	const frame = useCurrentFrame();
	const t = frame / 30;
	const p = PHRASES.find((x) => t >= x.a && t < x.b);
	if (!p) return null;
	const o = prog(frame, T(p.a), T(p.a) + 3);
	return (
		<div style={{position: 'absolute', left: M, right: M, bottom: 118, fontFamily: FONT.tight, fontWeight: 600, fontSize: 42, lineHeight: 1.15, letterSpacing: '-0.01em', color: FG[bg], opacity: o}}>
			<span style={{backgroundColor: bg === 'paper' ? PAPER : bg === 'black' ? BLACK : RED, padding: '4px 0'}}>{p.t}</span>
		</div>
	);
};

const Panel: React.FC<{at: number; color: string; dir: 1 | -1}> = ({at, color, dir}) => {
	const frame = useCurrentFrame();
	if (frame < at - 6 || frame > at + 6) return null;
	const x = frame < at ? (1 - prog(frame, at - 6, at, EASE_IN)) * -1080 * dir : prog(frame, at, at + 6, EASE_OUT) * 1080 * dir;
	return <AbsoluteFill style={{backgroundColor: color, translate: `${x}px 0`}} />;
};

// ---------- sound ----------
const CUES: Cue[] = [
	{at: T(2.24), name: 'thump', vol: 0.4},
	{at: T(4.48), name: 'subhit', vol: 0.45},
	{at: T(6.38), name: 'thump', vol: 0.4},
	{at: T(8.32), name: 'thump', vol: 0.4},
	{at: T(10.36), name: 'pop', vol: 0.35},
	{at: T(11.16), name: 'pop', vol: 0.35},
	{at: T(12.52), name: 'thump', vol: 0.4},
	{at: T(13.56), name: 'switch', vol: 0.35},
	{at: T(17.54), name: 'subhit', vol: 0.45},
	{at: T(19.72), name: 'thump', vol: 0.35},
	{at: T(20.2), name: 'switch', vol: 0.35},
	{at: T(21.08), name: 'pop', vol: 0.3},
	{at: T(22.26), name: 'pop', vol: 0.3},
	{at: T(23.14), name: 'pop', vol: 0.3},
	{at: T(28.1), name: 'thump', vol: 0.45},
	{at: T(31.38), name: 'pop', vol: 0.35},
	{at: T(34.22), name: 'pop', vol: 0.3},
	{at: T(34.22) + 4, name: 'pop', vol: 0.3},
	{at: T(34.92), name: 'pop', vol: 0.3},
	{at: T(37.7), name: 'ding', vol: 0.35},
	{at: T(39.0), name: 'whoosh', vol: 0.2},
	{at: T(41.0), name: 'thump', vol: 0.4},
	{at: T(44.6), name: 'switch', vol: 0.35},
	...Array.from({length: 9}).map((_, i) => ({at: T(47.66) + i * 4, name: 'tick' as const, vol: 0.22})),
	{at: T(50.36), name: 'thump', vol: 0.4},
	{at: T(51.6), name: 'switch', vol: 0.35},
	{at: T(54.28), name: 'thump', vol: 0.45},
	{at: T(54.4) + 8, name: 'mouse-click', vol: 0.4},
	{at: T(56.52), name: 'shimmer', vol: 0.3},
	...SCENES.slice(1).map((s) => ({at: T(s.at) - 5, name: 'whoosh' as const, vol: 0.16})),
];

export const MentalSwiss: React.FC = () => {
	const frame = useCurrentFrame();
	const idx = sceneIndex(frame);
	const sc = SCENES[idx];
	const Scene = SCENE_COMPONENTS[idx];
	return (
		<AbsoluteFill style={{backgroundColor: BGC[sc.bg]}}>
			<Scene />
			{!sc.talk ? <Subtitle bg={sc.bg} /> : null}
			<Chrome bg={sc.bg} idx={idx} />
			{SCENES.slice(1).map((s, i) => (
				<Panel key={i} at={T(s.at)} color={s.bg === 'red' ? BLACK : RED} dir={i % 2 ? -1 : 1} />
			))}
			<AbsoluteFill style={{backgroundColor: PAPER, opacity: interpolate(frame, [MENTAL_FRAMES - 12, MENTAL_FRAMES - 1], [0, 1], clamp)}} />
			<Audio src={staticFile('vo_mental.wav')} />
			<SfxTrack cues={CUES} />
		</AbsoluteFill>
	);
};

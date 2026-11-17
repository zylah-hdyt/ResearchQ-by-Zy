import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {capAt} from '../shared/captions';
import {FONT} from '../shared/fonts';
import {SfxTrack, VO} from '../shared/Sound';
import {clamp, EASE_IN_OUT, EASE_OUT, f, prog, WORD} from '../shared/timing';

// A phone-screen walkthrough of a usage page. Everything is plain UI: no glow, no gradients.
const BG = '#F5F4EE';
const CARD = '#FFFFFF';
const LINE = '#E4E0D5';
const INK = '#1F1E1D';
const MUTED = '#6F6B62';
const ACCENT = '#D97757';
const OK = '#3F8F5B';

const SEND = {x: 962, y: 1585};
const AVATAR = {x: 985, y: 190};

// ---------- camera ----------
const CAM: {at: number; s: number; cx: number; cy: number}[] = [
	{at: 0, s: 1, cx: 540, cy: 960},
	{at: 158, s: 1, cx: 540, cy: 960},
	{at: 186, s: 1.04, cx: 540, cy: 900},
	{at: 322, s: 1.04, cx: 540, cy: 900},
	{at: 352, s: 1.04, cx: 540, cy: 1110},
	{at: 450, s: 1.04, cx: 540, cy: 1110},
];
const camAt = (frame: number) => {
	const xs = CAM.map((c) => c.at);
	const e = {...clamp, easing: EASE_IN_OUT};
	return {
		s: interpolate(frame, xs, CAM.map((c) => c.s), e),
		cx: interpolate(frame, xs, CAM.map((c) => c.cx), e),
		cy: interpolate(frame, xs, CAM.map((c) => c.cy), e),
	};
};

// ---------- touch indicator ----------
const TOUCH: {at: number; x: number; y: number}[] = [
	{at: 8, x: 760, y: 1790},
	{at: 22, x: SEND.x, y: SEND.y},
	{at: 52, x: 760, y: 1000},
	{at: 80, x: AVATAR.x - 40, y: AVATAR.y + 40},
	{at: 88, x: AVATAR.x, y: AVATAR.y},
	{at: 120, x: 700, y: 1200},
	{at: 154, x: 900, y: 420},
	{at: 160, x: 890, y: 430},
	{at: 330, x: 880, y: 1700},
	{at: 356, x: 900, y: 1030},
	{at: 360, x: 900, y: 1030},
	{at: 380, x: 960, y: 1700},
	{at: 436, x: 960, y: 1700},
];
const TAPS = [24, 89, 160, 360];

const Touch: React.FC = () => {
	const frame = useCurrentFrame();
	const xs = TOUCH.map((t) => t.at);
	const x = interpolate(frame, xs, TOUCH.map((t) => t.x), {...clamp, easing: EASE_IN_OUT});
	const y = interpolate(frame, xs, TOUCH.map((t) => t.y), {...clamp, easing: EASE_IN_OUT});
	const vis = interpolate(frame, [6, 12, 436, 446], [0, 1, 1, 0], clamp);
	const near = TAPS.reduce((best, t) => (Math.abs(frame - t) < Math.abs(frame - best) ? t : best), TAPS[0]);
	const d = frame - near;
	const press = d >= -2 && d <= 6 ? 0.82 : 1;
	return (
		<>
			{TAPS.map((t) => {
				const k = prog(frame, t, t + 14);
				if (frame < t || frame > t + 14) return null;
				const tp = TOUCH.reduce((b, c) => (Math.abs(c.at - t) < Math.abs(b.at - t) ? c : b), TOUCH[0]);
				return <div key={t} style={{position: 'absolute', left: tp.x - 70, top: tp.y - 70, width: 140, height: 140, borderRadius: '50%', border: `3px solid ${INK}`, opacity: 0.35 * (1 - k), scale: 0.4 + k * 0.9}} />;
			})}
			<div style={{position: 'absolute', left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: '50%', backgroundColor: 'rgba(31,30,29,0.22)', border: '2px solid rgba(31,30,29,0.5)', opacity: vis, scale: press}} />
		</>
	);
};

// ---------- shared UI ----------
const Icon: React.FC<{d: string; size?: number; color?: string}> = ({d, size = 44, color = INK}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
		<path d={d} />
	</svg>
);

const StatusBar: React.FC = () => (
	<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 110, backgroundColor: BG, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 64px 0', fontFamily: FONT.inter, fontWeight: 600, fontSize: 36, color: INK}}>
		<span>09:41</span>
		<span style={{display: 'flex', gap: 14, alignItems: 'center'}}>
			<svg width="44" height="30" viewBox="0 0 44 30">
				{[0, 1, 2, 3].map((i) => (
					<rect key={i} x={i * 11} y={22 - i * 7} width={8} height={8 + i * 7} rx={2} fill={INK} />
				))}
			</svg>
			<svg width="64" height="30" viewBox="0 0 64 30">
				<rect x="1" y="3" width="54" height="24" rx="7" fill="none" stroke={INK} strokeWidth="2.5" />
				<rect x="5" y="7" width="40" height="16" rx="4" fill={INK} />
				<rect x="57" y="11" width="5" height="8" rx="2" fill={INK} />
			</svg>
		</span>
	</div>
);

// ---------- screen 1: chat ----------
const TYPED = 'lanjutkan ke bagian kedua';

const Chat: React.FC<{shake: number}> = ({shake}) => {
	const frame = useCurrentFrame();
	const typed = TYPED.slice(0, Math.min(TYPED.length, Math.floor(interpolate(frame, [2, 20], [0, TYPED.length], clamp))));
	const sent = frame >= 25;
	const banner = prog(frame, f(WORD.habis), f(WORD.habis) + 7, EASE_OUT);
	const caret = !sent && Math.floor(frame / 8) % 2 === 0;
	return (
		<AbsoluteFill style={{backgroundColor: BG}}>
			<div style={{position: 'absolute', top: 120, left: 0, right: 0, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px'}}>
				<Icon d="M4 7h16M4 12h16M4 17h10" size={50} />
				<span style={{fontFamily: FONT.serif, fontSize: 58, color: INK}}>Claude</span>
				<div style={{width: 62, height: 62, borderRadius: '50%', backgroundColor: ACCENT, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.inter, fontWeight: 600, fontSize: 30}}>Z</div>
			</div>
			<div style={{position: 'absolute', top: 290, left: 60, right: 60, translate: `${shake}px 0`}}>
				<div style={{marginLeft: 200, backgroundColor: '#EBE7DB', borderRadius: 34, padding: '28px 34px', fontFamily: FONT.inter, fontSize: 42, lineHeight: 1.35, color: INK}}>Ringkas bab 2 skripsiku, tolong.</div>
				<div style={{marginTop: 44, fontFamily: FONT.inter, fontSize: 42, lineHeight: 1.5, color: INK}}>
					Bab 2 membahas tiga hal: landasan teori, penelitian terdahulu, dan kerangka konseptual. Mau aku ringkas satu per satu?
				</div>
				{sent ? (
					<div style={{marginTop: 44, marginLeft: 200, backgroundColor: '#EBE7DB', borderRadius: 34, padding: '28px 34px', fontFamily: FONT.inter, fontSize: 42, lineHeight: 1.35, color: INK, opacity: prog(frame, 25, 31)}}>{TYPED}</div>
				) : null}
			</div>
			{banner > 0 ? (
				<div style={{position: 'absolute', left: 50, right: 50, top: 1290, translate: `${shake}px ${(1 - banner) * 40}px`, opacity: banner, backgroundColor: '#FBEBE3', border: `2px solid ${ACCENT}`, borderRadius: 30, padding: '30px 34px', display: 'flex', gap: 24, alignItems: 'flex-start'}}>
					<div style={{width: 54, height: 54, borderRadius: '50%', backgroundColor: ACCENT, color: '#fff', fontFamily: FONT.inter, fontWeight: 700, fontSize: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>!</div>
					<div style={{fontFamily: FONT.inter}}>
						<div style={{fontWeight: 600, fontSize: 40, color: INK}}>Batas penggunaan tercapai</div>
						<div style={{fontSize: 34, color: MUTED, marginTop: 6}}>Direset pukul 14.00. Kamu bisa lanjut setelah itu.</div>
					</div>
				</div>
			) : null}
			<div style={{position: 'absolute', left: 50, right: 50, top: 1520, height: 140, borderRadius: 44, backgroundColor: CARD, border: `2px solid ${LINE}`, display: 'flex', alignItems: 'center', padding: '0 34px', justifyContent: 'space-between', opacity: banner > 0.5 ? 0.55 : 1}}>
				<span style={{fontFamily: FONT.inter, fontSize: 40, color: typed && !sent ? INK : '#A8A398'}}>
					{sent ? 'Balas ke Claude' : typed || 'Balas ke Claude'}
					{caret ? <span style={{color: ACCENT}}>|</span> : null}
				</span>
				<div style={{width: 84, height: 84, borderRadius: 26, backgroundColor: banner > 0.5 ? '#D9D4C7' : ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: frame >= 22 && frame <= 28 ? 0.9 : 1}}>
					<Icon d="M12 19V5M5 12l7-7 7 7" color="#fff" />
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------- screen 2: usage ----------
const Bar: React.FC<{value: number; color?: string; segments?: number}> = ({value, color = ACCENT, segments = 0}) => (
	<div style={{position: 'relative', height: 34, borderRadius: 17, backgroundColor: '#ECE8DC', overflow: 'hidden'}}>
		<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${value}%`, backgroundColor: color, borderRadius: 17}} />
		{Array.from({length: Math.max(0, segments - 1)}).map((_, i) => (
			<div key={i} style={{position: 'absolute', top: 0, bottom: 0, left: `${((i + 1) / segments) * 100}%`, width: 3, backgroundColor: BG}} />
		))}
	</div>
);

const Badge: React.FC<{n: string; at: number}> = ({n, at}) => {
	const frame = useCurrentFrame();
	const k = interpolate(frame, [at, at + 4, at + 9], [0, 1.18, 1], {...clamp, easing: EASE_OUT});
	return (
		<div style={{position: 'absolute', left: -22, top: -22, width: 70, height: 70, borderRadius: '50%', backgroundColor: INK, color: '#fff', fontFamily: FONT.inter, fontWeight: 700, fontSize: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', scale: k, opacity: frame >= at ? 1 : 0}}>
			{n}
		</div>
	);
};

const SessionCard: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.setiap);
	const b = f(WORD.selesai) + 4;
	const resetAt = f(WORD.limit2) + 2;
	const sweep = interpolate(frame, [a, b], [0, 1], {...clamp, easing: EASE_IN_OUT});
	const isReset = frame >= resetAt;
	const reFill = prog(frame, resetAt, resetAt + 14, EASE_OUT);
	const fill = isReset ? 100 * (1 - reFill) + 4 * reFill : interpolate(frame, [f(WORD.yaitu1), b], [14, 100], {...clamp, easing: EASE_IN_OUT});
	const leftMin = isReset ? 300 : Math.round(300 * (1 - sweep));
	const h = Math.floor(leftMin / 60);
	const m = leftMin % 60;
	const on = frame >= f(WORD.current) - 6 && frame < 296;
	const ring = frame >= f(WORD.dua) && frame < 168;
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 330, backgroundColor: CARD, border: `${ring || on ? 3 : 2}px solid ${ring || on ? ACCENT : LINE}`, borderRadius: 38, padding: '48px 48px 44px'}}>
			<Badge n="1" at={f(WORD.dua) + 3} />
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
				<span style={{fontFamily: FONT.inter, fontWeight: 600, fontSize: 52, color: INK}}>Sesi saat ini</span>
				<span style={{fontFamily: FONT.inter, fontSize: 38, color: MUTED}}>jendela 5 jam</span>
			</div>
			<div style={{fontFamily: FONT.inter, fontSize: 40, color: MUTED, marginTop: 14, fontVariantNumeric: 'tabular-nums'}}>
				{isReset ? 'Baru direset' : `Direset dalam ${h} j ${String(m).padStart(2, '0')} m`}
			</div>
			<div style={{marginTop: 36}}>
				<Bar value={fill} segments={5} />
			</div>
			<div style={{position: 'relative', height: 70, marginTop: 14}}>
				{[0, 1, 2, 3, 4, 5].map((i) => (
					<span key={i} style={{whiteSpace: 'nowrap', position: 'absolute', left: `${(i / 5) * 100}%`, translate: i === 5 ? '-100% 0' : i === 0 ? '0 0' : '-50% 0', fontFamily: FONT.inter, fontSize: 30, color: MUTED}}>
						{i} j
					</span>
				))}
				{frame >= a && !isReset ? <div style={{position: 'absolute', top: -58, left: `${sweep * 100}%`, width: 4, height: 62, backgroundColor: INK, translate: '-2px 0'}} /> : null}
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, height: 64}}>
				<span style={{fontFamily: FONT.inter, fontWeight: 600, fontSize: 42, color: INK, fontVariantNumeric: 'tabular-nums'}}>{Math.round(fill)}% terpakai</span>
				{isReset ? (
					<span style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT.inter, fontWeight: 600, fontSize: 36, color: OK, backgroundColor: '#E3F1E8', padding: '10px 22px', borderRadius: 40, scale: interpolate(frame, [resetAt, resetAt + 5, resetAt + 10], [0.7, 1.08, 1], clamp)}}>
						<Icon d="M5 12.5l4.5 4.5L19 7" color={OK} size={34} /> Direset otomatis
					</span>
				) : null}
			</div>
		</div>
	);
};

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const WeeklyCard: React.FC = () => {
	const frame = useCurrentFrame();
	const a = f(WORD.mingguan) - 4;
	const b = f(WORD.jadwal) + 2;
	const ring = (frame >= f(WORD.penggunaan) + 4 && frame < 168) || (frame >= f(WORD.weekly) && frame < 450);
	const hi = prog(frame, f(WORD.jadwal), f(WORD.jadwal) + 8);
	const under = prog(frame, f(WORD.tersendiri) - 2, f(WORD.tersendiri) + 10, EASE_IN_OUT);
	return (
		<div style={{position: 'absolute', left: 60, right: 60, top: 940, backgroundColor: CARD, border: `${ring ? 3 : 2}px solid ${ring ? ACCENT : LINE}`, borderRadius: 38, padding: '48px 48px 44px'}}>
			<Badge n="2" at={f(WORD.penggunaan) + 5} />
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
				<span style={{fontFamily: FONT.inter, fontWeight: 600, fontSize: 52, color: INK}}>Batas mingguan</span>
				<span style={{fontFamily: FONT.inter, fontSize: 38, color: MUTED}}>semua model</span>
			</div>
			<div style={{position: 'relative', display: 'inline-block', marginTop: 14}}>
				<span style={{fontFamily: FONT.inter, fontSize: 40, color: hi > 0.5 ? INK : MUTED, fontWeight: hi > 0.5 ? 600 : 400}}>Direset Kamis 09.00</span>
				<div style={{position: 'absolute', left: 0, bottom: -6, height: 10, width: `${under * 100}%`, backgroundColor: ACCENT, borderRadius: 5, opacity: 0.85}} />
			</div>
			<div style={{marginTop: 36}}>
				<Bar value={41} />
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 40}}>
				{DAYS.map((d, i) => {
					const p = prog(frame, a + ((b - a) / 7) * i, a + ((b - a) / 7) * i + 6);
					const reset = i === 3;
					return (
						<div key={d} style={{width: 112, textAlign: 'center'}}>
							<div style={{height: 112, borderRadius: 28, backgroundColor: reset && hi > 0.5 ? ACCENT : p > 0.5 ? '#ECE8DC' : '#F5F3EC', border: `2px solid ${reset && hi > 0.5 ? ACCENT : LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT.inter, fontWeight: 600, fontSize: 34, color: reset && hi > 0.5 ? '#fff' : INK, scale: reset ? 1 + 0.08 * hi : 1}}>
								{d}
							</div>
						</div>
					);
				})}
			</div>
			<div style={{fontFamily: FONT.inter, fontSize: 36, color: MUTED, marginTop: 30, opacity: under}}>Terpisah dari batas sesi 5 jam.</div>
		</div>
	);
};

const Usage: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: BG}}>
		<div style={{position: 'absolute', top: 120, left: 0, right: 0, height: 110, display: 'flex', alignItems: 'center', padding: '0 56px', gap: 24}}>
			<Icon d="M15 5l-7 7 7 7" size={50} />
			<span style={{fontFamily: FONT.serif, fontSize: 58, color: INK}}>Penggunaan</span>
		</div>
		<div style={{position: 'absolute', top: 232, left: 60, fontFamily: FONT.inter, fontSize: 36, color: MUTED}}>Batas penggunaan paketmu</div>
		<SessionCard />
		<WeeklyCard />
	</AbsoluteFill>
);

// ---------- captions (screen space) ----------
const Caption: React.FC = () => {
	const frame = useCurrentFrame();
	const c = capAt(frame);
	if (!c) return null;
	const a = Math.round(c.a * 30);
	const i = prog(frame, a, a + 3);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 74, display: 'flex', justifyContent: 'center', opacity: i}}>
			<div style={{backgroundColor: 'rgba(31,30,29,0.9)', color: '#fff', fontFamily: FONT.inter, fontWeight: 600, fontSize: 46, padding: '18px 40px', borderRadius: 22, translate: `0 ${(1 - i) * 10}px`}}>{c.t}</div>
		</div>
	);
};

export const UiDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const cam = camAt(frame);
	const nav = prog(frame, 96, 112, EASE_IN_OUT);
	const sh = frame >= f(WORD.habis) && frame < f(WORD.habis) + 10 ? Math.sin(frame * 2.6) * 10 * (1 - (frame - f(WORD.habis)) / 10) : 0;
	return (
		<AbsoluteFill style={{backgroundColor: BG}}>
			<AbsoluteFill style={{scale: cam.s, translate: `${540 - cam.cx * cam.s}px ${960 - cam.cy * cam.s}px`, transformOrigin: '0 0'}}>
				{frame < 114 ? (
					<AbsoluteFill style={{translate: `${-nav * 320}px 0`, opacity: 1 - nav * 0.4}}>
						<Chat shake={sh} />
					</AbsoluteFill>
				) : null}
				{frame >= 94 ? (
					<AbsoluteFill style={{translate: `${(1 - nav) * 1080}px 0`, boxShadow: nav < 1 ? '-30px 0 60px rgba(0,0,0,0.12)' : undefined}}>
						<Usage />
					</AbsoluteFill>
				) : null}
				<Touch />
			</AbsoluteFill>
			<StatusBar />
			<Caption />
			<VO />
			<SfxTrack
				cues={[
					{at: 24, name: 'mouse-click', vol: 0.45},
					{at: f(WORD.habis), name: 'pop', vol: 0.55},
					{at: 89, name: 'mouse-click', vol: 0.45},
					{at: 96, name: 'whoosh', vol: 0.18},
					{at: f(WORD.dua) + 3, name: 'pop', vol: 0.3},
					{at: f(WORD.penggunaan) + 5, name: 'pop', vol: 0.3},
					{at: 160, name: 'mouse-click', vol: 0.4},
					...[0, 1, 2, 3, 4].map((i) => ({at: Math.round(f(WORD.setiap) + ((f(WORD.selesai) + 4 - f(WORD.setiap)) / 5) * i), name: 'tick' as const, vol: 0.22})),
					{at: f(WORD.limit2) + 2, name: 'ding', vol: 0.4},
					{at: 330, name: 'whoosh', vol: 0.16},
					{at: 360, name: 'mouse-click', vol: 0.4},
					{at: f(WORD.jadwal), name: 'pop', vol: 0.3},
					{at: f(WORD.tersendiri), name: 'switch', vol: 0.3},
				]}
			/>
		</AbsoluteFill>
	);
};

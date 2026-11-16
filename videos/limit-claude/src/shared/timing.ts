import {Easing, interpolate} from 'remotion';

export const FPS = 30;
export const DURATION = 450; // 15.000 s
export const W = 1080;
export const H = 1920;

// Beat boundaries in frames, derived from the recut VO transcript (scripts/words_raw.json).
export const BEATS = {
	hook: {from: 0, to: 96},
	setup: {from: 96, to: 168},
	first: {from: 168, to: 296},
	reset: {from: 296, to: 340},
	second: {from: 340, to: 450},
} as const;

// Word hits in seconds (recut VO).
export const WORD = {
	pernah: 0.0,
	nggak: 0.4,
	limit: 0.68,
	claude: 0.88,
	habis: 1.04,
	padahal: 1.38,
	belumBanyak: 2.14,
	menggunakannya: 2.54,
	sebenarnya: 3.24,
	dua: 3.9,
	batas: 4.04,
	penggunaan: 4.28,
	pahami: 5.2,
	pertama: 5.66,
	current: 6.18,
	session: 6.34,
	yaitu1: 6.96,
	setiap: 7.84,
	periode: 8.12,
	lima: 8.28,
	jam: 8.48,
	setelah: 8.7,
	selesai: 9.44,
	limit2: 9.94,
	direset: 10.34,
	otomatis: 10.72,
	kedua: 11.42,
	weekly: 11.82,
	limit3: 12.02,
	yaitu2: 12.46,
	mingguan: 13.14,
	dengan: 13.44,
	jadwal: 13.62,
	reset2: 13.92,
	tersendiri: 14.14,
} as const;

export const f = (sec: number) => Math.round(sec * FPS);

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 progress between two frames, eased. */
export const prog = (frame: number, a: number, b: number, easing = EASE_OUT) =>
	interpolate(frame, [a, b], [0, 1], {...clamp, easing});

/** Deterministic pseudo-random in [0,1). */
export const rand = (seed: number) => {
	const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
	return x - Math.floor(x);
};

/** Quantise a frame to emulate stop-motion (on twos / threes). */
export const stepped = (frame: number, every: number) => Math.floor(frame / every) * every;

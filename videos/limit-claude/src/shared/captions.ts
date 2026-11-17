// Caption chunks timed to the recut VO (seconds). Wording follows the spoken text.
export type Cap = {t: string; a: number; b: number};

export const CAPS: Cap[] = [
	{t: 'Pernah nggak,', a: 0.0, b: 0.66},
	{t: 'limit Claude', a: 0.68, b: 1.02},
	{t: 'habis', a: 1.04, b: 1.36},
	{t: 'padahal kamu merasa', a: 1.38, b: 2.12},
	{t: 'belum banyak', a: 2.14, b: 2.52},
	{t: 'menggunakannya?', a: 2.54, b: 3.2},
	{t: 'Sebenarnya ada', a: 3.24, b: 3.88},
	{t: '2 batas penggunaan', a: 3.9, b: 4.7},
	{t: 'yang perlu kamu pahami', a: 4.72, b: 5.62},
	{t: 'Pertama,', a: 5.66, b: 6.16},
	{t: 'current session,', a: 6.18, b: 6.94},
	{t: 'yaitu batas penggunaan', a: 6.96, b: 7.82},
	{t: 'setiap periode', a: 7.84, b: 8.26},
	{t: '5 jam.', a: 8.28, b: 8.68},
	{t: 'Setelah periode itu selesai,', a: 8.7, b: 9.9},
	{t: 'limit akan', a: 9.94, b: 10.32},
	{t: 'di-reset otomatis.', a: 10.34, b: 11.38},
	{t: 'Kedua,', a: 11.42, b: 11.8},
	{t: 'weekly limit,', a: 11.82, b: 12.44},
	{t: 'yaitu batas', a: 12.46, b: 13.12},
	{t: 'mingguan', a: 13.14, b: 13.6},
	{t: 'dengan jadwal reset', a: 13.62, b: 14.12},
	{t: 'tersendiri.', a: 14.14, b: 15.0},
];

export const capAt = (frame: number, fps = 30) => CAPS.find((c) => frame >= Math.round(c.a * fps) && frame < Math.round(c.b * fps) + 1);

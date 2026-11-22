import { useId, type CSSProperties, type ReactNode } from 'react';

/**
 * Cinematic backdrop pieces for the welcome, sign-in and hero surfaces: ambient emerald light, a faint grain, and
 * three illustrated "objects" (coin, card, rising bars). All are inline SVG/CSS: no image downloads, they follow the theme,
 * and they are decorative (aria-hidden) so they never carry information.
 */

/** Soft green/turquoise light pools. Place inside a positioned parent. */
export function Aurora({ className = '', strength = 1 }: { className?: string; strength?: number }) {
  return (
    <div className={`aurora ${className}`} aria-hidden style={{ '--aurora': strength } as CSSProperties}>
      <i className="aurora-a" /><i className="aurora-b" /><i className="aurora-grain" />
    </div>
  );
}

/** A thick emerald coin, lit from the upper left, resting on a glow. */
export function CoinObject({ symbol = 'Rp', className = '' }: { symbol?: string; className?: string }) {
  const id = useId().replace(/:/g, '');
  const g = (n: string) => `${n}${id}`;
  return (
    <svg className={`obj obj-coin ${className}`} viewBox="0 0 260 260" aria-hidden focusable="false">
      <defs>
        <radialGradient id={g('glow')} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#20c975" stopOpacity=".55" /><stop offset="1" stopColor="#20c975" stopOpacity="0" /></radialGradient>
        <linearGradient id={g('face')} x1="0.1" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#8bffc4" /><stop offset=".38" stopColor="#20c975" /><stop offset="1" stopColor="#07703f" /></linearGradient>
        <linearGradient id={g('rim')} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0d8f52" /><stop offset="1" stopColor="#03351d" /></linearGradient>
        <linearGradient id={g('ink')} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a7a47" /><stop offset="1" stopColor="#04361f" /></linearGradient>
        <radialGradient id={g('spec')} cx="30%" cy="22%" r="60%"><stop offset="0" stopColor="#fff" stopOpacity=".85" /><stop offset=".5" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <filter id={g('blur')}><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <ellipse cx="130" cy="236" rx="96" ry="16" fill={`url(#${g('glow')})`} />
      <ellipse cx="130" cy="232" rx="62" ry="9" fill="#000" opacity=".55" filter={`url(#${g('blur')})`} />
      <circle cx="146" cy="128" r="92" fill={`url(#${g('rim')})`} />
      <circle cx="146" cy="128" r="92" fill="none" stroke="#20c975" strokeOpacity=".35" strokeWidth="1.5" />
      <circle cx="128" cy="132" r="92" fill={`url(#${g('face')})`} />
      <circle cx="128" cy="132" r="92" fill="none" stroke="#c9ffe3" strokeOpacity=".55" strokeWidth="1.5" />
      <circle cx="128" cy="132" r="76" fill="none" stroke="#04361f" strokeOpacity=".55" strokeWidth="2" strokeDasharray="1.5 6" />
      <circle cx="128" cy="132" r="66" fill="none" stroke="#e6fff2" strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="128" cy="132" r="66" fill={`url(#${g('ink')})`} opacity=".16" />
      <text x="129" y="153" textAnchor="middle" fontSize="62" fontWeight="800" fill="#e8fff3" opacity=".55" style={{ fontFamily: 'inherit' }}>{symbol}</text>
      <text x="128" y="151" textAnchor="middle" fontSize="62" fontWeight="800" fill={`url(#${g('ink')})`} style={{ fontFamily: 'inherit' }}>{symbol}</text>
      <circle cx="128" cy="132" r="92" fill={`url(#${g('spec')})`} />
    </svg>
  );
}

/** A dark metal card tilted in perspective, emerald line work, floating over a glow. */
export function CardObject({ className = '', label = 'MyFi' }: { className?: string; label?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={`obj obj-card ${className}`} aria-hidden>
      <div className="obj-card-glow" />
      <div className="obj-card-body">
        <svg viewBox="0 0 320 200" className="obj-card-art" focusable="false">
          <defs>
            <linearGradient id={`c${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#20c975" stopOpacity=".9" /><stop offset="1" stopColor="#20c9b4" stopOpacity=".15" /></linearGradient>
          </defs>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={i} cx="250" cy="150" r={34 + i * 22} fill="none" stroke={`url(#c${id})`} strokeWidth="1" opacity={0.75 - i * 0.09} />)}
          <path d="M-10 170 C 70 120, 120 190, 200 140 S 300 90, 340 120" fill="none" stroke="#20c975" strokeOpacity=".5" strokeWidth="1.2" />
        </svg>
        <span className="obj-card-chip" />
        <span className="obj-card-brand">{label}</span>
        <span className="obj-card-num">•••• •••• •••• 4311</span>
      </div>
    </div>
  );
}

/** Rising isometric bars (analytics). */
export function BarsObject({ className = '' }: { className?: string }) {
  const id = useId().replace(/:/g, '');
  const bars = [38, 62, 50, 88, 118, 150];
  const w = 30, dx = 17, dy = 9.5, gap = 14, x0 = 34, base = 214;
  return (
    <svg className={`obj obj-bars ${className}`} viewBox="0 0 320 260" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`t${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c9ffe3" /><stop offset="1" stopColor="#4be39a" /></linearGradient>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#20c975" /><stop offset="1" stopColor="#0a6a3c" /></linearGradient>
        <linearGradient id={`r${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f8f52" /><stop offset="1" stopColor="#032d19" /></linearGradient>
        <radialGradient id={`g${id}`} cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#20c9b4" stopOpacity=".45" /><stop offset="1" stopColor="#20c9b4" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="170" cy="226" rx="140" ry="26" fill={`url(#g${id})`} />
      {bars.map((h, i) => {
        const x = x0 + i * (w + gap), y = base - i * 4;
        return (
          <g key={i}>
            <polygon points={`${x},${y} ${x + w},${y} ${x + w},${y - h} ${x},${y - h}`} fill={`url(#l${id})`} />
            <polygon points={`${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y - h - dy} ${x + w},${y - h}`} fill={`url(#r${id})`} />
            <polygon points={`${x},${y - h} ${x + w},${y - h} ${x + w + dx},${y - h - dy} ${x + dx},${y - h - dy}`} fill={`url(#t${id})`} />
          </g>
        );
      })}
    </svg>
  );
}

/** Frame that floats an object gently (disabled under reduced motion). */
export function Float({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`float ${className}`}>{children}</div>;
}

import { useId } from 'react';

/** MyFi mark: open ring (money in motion) around an "M", with an amber coin at the ring's head. */
export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} role="img" aria-label="MyFi" style={{ flex: 'none' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#14a89a" />
          <stop offset="1" stopColor="#0b5c56" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="28" fill={`url(#${id})`} />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeDasharray="199 52" transform="rotate(-35 60 60)" />
      <circle cx="92.8" cy="37.1" r="9" fill="#fbbf24" />
      <polyline points="43,78 43,45 60,63 77,45 77,78" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "My" in a lighter weight, "Fi" in bold. */
export function Wordmark({ tagline }: { tagline?: string }) {
  return (
    <span className="wordmark">
      <span className="wm-my">My</span><b className="wm-fi">Fi</b>
      {tagline && <span className="wm-tag">{tagline}</span>}
    </span>
  );
}

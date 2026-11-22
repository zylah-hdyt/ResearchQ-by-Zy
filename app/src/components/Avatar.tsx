import type { Profile } from '../data/types';
import { avatarColor, initialsOf } from '../lib/avatar';

export function Avatar({ profile, size = 36 }: { profile: Pick<Profile, 'fullName' | 'displayName' | 'email' | 'avatarDataUrl' | 'userId'>; size?: number }) {
  const name = profile.fullName || profile.displayName;
  const label = name || profile.email;
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.38, background: profile.avatarDataUrl ? 'var(--surface-2)' : avatarColor(profile.userId) }}
      aria-label={label}
      role="img"
    >
      {profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt="" /> : initialsOf(name, profile.email)}
    </span>
  );
}

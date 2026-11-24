import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Proportionate empty state (PRD UI/UX §4): a small icon container, one sentence on what is missing,
 * the primary next action and an optional secondary one. No oversized blank card.
 */
export function EmptyState({ icon: Icon, title, text, children, inline }: { icon: LucideIcon; title?: string; text: string; children?: ReactNode; inline?: boolean }) {
  return (
    <div className={inline ? 'empty-state inline' : 'card empty-state'}>
      <span className="empty-icon" aria-hidden><Icon size={20} /></span>
      <div className="empty-copy">
        {title && <strong>{title}</strong>}
        <p>{text}</p>
      </div>
      {children && <div className="empty-actions">{children}</div>}
    </div>
  );
}

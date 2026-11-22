export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Day part from the user's local clock.
 * 05:00–11:59 morning · 12:00–16:59 afternoon · 17:00–20:59 evening · 21:00–04:59 night
 */
export function dayPart(date: Date = new Date()): DayPart {
  const h = date.getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

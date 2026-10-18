export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return toISODate(new Date(y, m - 1, d + n));
}

export function dateRange(start: string, days: number): string[] {
  return Array.from({ length: days }, (_, i) => addDays(start, i));
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDay(iso: string): { weekday: string; weekdayLong: string; day: number; month: string; label: string } {
  const date = parse(iso);
  return {
    weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
    weekdayLong: date.toLocaleDateString(undefined, { weekday: 'long' }),
    day: date.getDate(),
    month: date.toLocaleDateString(undefined, { month: 'short' }),
    label: date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
  };
}

/** "16–20 Oct", or "29 Oct – 2 Nov" across months. */
export function formatRange(from: string, to: string): string {
  const a = parse(from), b = parse(to);
  if (from === to) return formatDay(from).label;
  if (a.getMonth() === b.getMonth()) {
    return `${a.getDate()}–${b.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
  }
  return `${formatDay(from).label} – ${formatDay(to).label}`;
}

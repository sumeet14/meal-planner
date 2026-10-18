import { round } from '../lib/units';
import { Icon } from './Icon';

/** Number input flanked by − and + buttons. */
export function Stepper({ value, onChange, step = 1, min = step, label }: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  label: string;
}) {
  const set = (n: number) => onChange(Math.max(min, round(n, 2)));
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-line-strong bg-surface">
      <button type="button" className="grid h-full w-9 place-items-center text-ink-2 hover:text-ink disabled:opacity-30"
        onClick={() => set(value - step)} disabled={value - step < min} aria-label={`Fewer ${label}`}>
        <Icon name="minus" size={16} />
      </button>
      <input
        type="number" min={min} step={step} aria-label={label}
        className="num h-full w-12 border-x border-line bg-transparent text-center text-sm font-medium focus:outline-none"
        value={value}
        onChange={(e) => { const n = parseFloat(e.target.value); if (n > 0) onChange(n); }}
      />
      <button type="button" className="grid h-full w-9 place-items-center text-ink-2 hover:text-ink"
        onClick={() => set(value + step)} aria-label={`More ${label}`}>
        <Icon name="plus" size={16} />
      </button>
    </div>
  );
}

/** A row of mutually exclusive options. */
export function Segmented<T extends string | number>({ value, options, onChange, label }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex h-9 rounded-lg bg-ink/[0.06] p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)} type="button" role="radio" aria-checked={o.value === value}
          className={`rounded-md px-3 text-sm font-medium transition-colors ${
            o.value === value ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(29,43,40,0.15)]' : 'text-ink-2 hover:text-ink'
          }`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, autoFocus }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="relative block">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search" autoFocus={autoFocus}
        className="input w-full pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

import { percentOfTarget, targetStatus, type Status } from '../lib/nutrition';
import { round } from '../lib/units';
import { NUTRIENT_KEYS, NUTRIENT_META, type NutrientKey, type Nutrients } from '../types';

/** The bar track spans 0–150% of target, so the target sits two thirds along. */
const TRACK_MAX = 150;

export const STATUS_BAR: Record<Status, string> = { low: 'bg-low', ok: 'bg-ok', high: 'bg-high' };
export const STATUS_TEXT: Record<Status, string> = { low: 'text-low', ok: 'text-ok', high: 'text-high' };
export const STATUS_WORD: Record<Status, string> = { low: '↓ Low', ok: 'On track', high: '↑ Over' };

/** Thin bar of a value against its target, with a tick at the target. */
export function TargetBar({ pct, status }: { pct: number; status: Status }) {
  return (
    <div className="relative h-1.5 w-full rounded-full bg-ink/[0.07]">
      <div
        className={`h-full rounded-full ${STATUS_BAR[status]}`}
        style={{ width: `${(Math.min(pct, TRACK_MAX) / TRACK_MAX) * 100}%` }}
      />
      <div className="absolute -top-1 bottom-[-4px] w-0.5 rounded bg-ink/60" style={{ left: `${(100 / TRACK_MAX) * 100}%` }} />
    </div>
  );
}

/** Each nutrient's daily total against its target. */
export function NutrientBars({ totals, targets, keys = NUTRIENT_KEYS }: {
  totals: Nutrients;
  targets: Nutrients;
  keys?: readonly NutrientKey[];
}) {
  const pct = percentOfTarget(totals, targets);
  return (
    <ul className="space-y-4">
      {keys.map((k) => {
        const meta = NUTRIENT_META[k];
        const status = targetStatus(pct[k], meta.goal);
        return (
          <li key={k}>
            <div className="mb-1.5 flex items-baseline gap-2 text-sm">
              <span className="font-medium">{meta.label}</span>
              {meta.goal === 'max' && <span className="hint">limit</span>}
              {meta.goal === 'min' && <span className="hint">at least</span>}
              <span className="num ml-auto text-ink-2">
                {round(totals[k], 1)} <span className="text-ink-3">/ {targets[k]} {meta.unit}</span>
              </span>
              <span className={`w-[4.5rem] text-right text-[13px] font-medium ${STATUS_TEXT[status]}`}>{STATUS_WORD[status]}</span>
            </div>
            <TargetBar pct={pct[k]} status={status} />
          </li>
        );
      })}
    </ul>
  );
}

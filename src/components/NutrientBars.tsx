import { percentOfTarget, targetStatus, type Status } from '../lib/nutrition';
import { round } from '../lib/units';
import { NUTRIENT_KEYS, NUTRIENT_META, type NutrientKey, type Nutrients } from '../types';

const BAR_COLOR: Record<Status, string> = {
  low: 'bg-amber-400',
  ok: 'bg-emerald-500',
  high: 'bg-red-500',
};

export const STATUS_TEXT: Record<Status, string> = {
  low: 'text-amber-600',
  ok: 'text-emerald-600',
  high: 'text-red-600',
};

interface Props {
  totals: Nutrients;
  targets: Nutrients;
  keys?: readonly NutrientKey[];
  compact?: boolean;
}

/** Horizontal progress bars of each nutrient against its daily target. */
export function NutrientBars({ totals, targets, keys = NUTRIENT_KEYS, compact = false }: Props) {
  const pct = percentOfTarget(totals, targets);
  return (
    <div className={compact ? 'space-y-1' : 'space-y-2.5'}>
      {keys.map((k) => {
        const meta = NUTRIENT_META[k];
        const status = targetStatus(pct[k], meta.goal);
        return (
          <div key={k}>
            <div className={`flex justify-between ${compact ? 'text-[11px]' : 'text-sm'}`}>
              <span className="text-slate-600">
                {meta.label}
                {meta.goal !== 'range' && !compact && (
                  <span className="ml-1 text-xs text-slate-400">({meta.goal === 'max' ? 'limit' : 'min'})</span>
                )}
              </span>
              <span className={STATUS_TEXT[status]}>
                {!compact && (
                  <span className="mr-2 text-slate-500">
                    {round(totals[k], 1)} / {targets[k]} {meta.unit}
                  </span>
                )}
                {Math.round(pct[k])}%
              </span>
            </div>
            <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${compact ? 'h-1' : 'h-2'}`}>
              <div
                className={`h-full rounded-full ${BAR_COLOR[status]}`}
                style={{ width: `${Math.min(pct[k], 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

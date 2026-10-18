import { macroSplit } from '../lib/nutrition';
import { round } from '../lib/units';
import type { Nutrients } from '../types';

const MACROS = [
  { key: 'protein', name: 'Protein', bar: 'bg-protein' },
  { key: 'carbs', name: 'Carbs', bar: 'bg-carbs' },
  { key: 'fat', name: 'Fat', bar: 'bg-fat' },
] as const;

/** Stacked bar of the share of calories from protein, carbs and fat, with a labelled legend. */
export function MacroSplit({ nutrients, thin = false }: { nutrients: Nutrients; thin?: boolean }) {
  const split = macroSplit(nutrients);
  const empty = split.protein + split.carbs + split.fat === 0;

  return (
    <div>
      <div
        className={`flex w-full gap-[2px] overflow-hidden rounded ${thin ? 'h-2' : 'h-3'} ${empty ? 'bg-line' : ''}`}
        role="img"
        aria-label={MACROS.map((m) => `${m.name} ${Math.round(split[m.key])}% of calories`).join(', ')}
      >
        {!empty && MACROS.map((m) => split[m.key] > 0 && (
          <div
            key={m.key}
            className={`${m.bar} h-full first:rounded-l last:rounded-r`}
            style={{ width: `${split[m.key]}%` }}
            title={`${m.name}: ${round(nutrients[m.key], 1)} g, ${Math.round(split[m.key])}% of calories`}
          />
        ))}
      </div>
      <dl className="mt-2.5 grid grid-cols-3 gap-2 text-sm">
        {MACROS.map((m) => (
          <div key={m.key}>
            <dt className="flex items-center gap-1.5 text-ink-2">
              <span className={`h-2 w-2 rounded-full ${m.bar}`} />{m.name}
            </dt>
            <dd className="num mt-0.5 font-medium">
              {round(nutrients[m.key], 1)} g
              <span className="ml-1 font-normal text-ink-3">{Math.round(split[m.key])}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

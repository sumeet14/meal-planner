import { round } from '../lib/units';
import { NUTRIENT_KEYS, NUTRIENT_META, type Nutrients } from '../types';

export function NutrientTable({ nutrients, targets }: { nutrients: Nutrients; targets?: Nutrients }) {
  return (
    <table className="w-full text-sm">
      <thead className="sr-only">
        <tr><th>Nutrient</th><th>Amount</th>{targets && <th>Share of daily target</th>}</tr>
      </thead>
      <tbody>
        {NUTRIENT_KEYS.map((k) => (
          <tr key={k} className="border-t border-line first:border-0">
            <td className="py-2 text-ink-2">{NUTRIENT_META[k].label}</td>
            <td className="num py-2 text-right font-medium">
              {round(nutrients[k], 1)} <span className="font-normal text-ink-3">{NUTRIENT_META[k].unit}</span>
            </td>
            {targets && (
              <td className="num w-24 py-2 text-right text-ink-3">
                {targets[k] ? `${Math.round((nutrients[k] / targets[k]) * 100)}% of day` : ''}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

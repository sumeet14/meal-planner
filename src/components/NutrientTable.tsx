import { round } from '../lib/units';
import { NUTRIENT_KEYS, NUTRIENT_META, type Nutrients } from '../types';

export function NutrientTable({ nutrients, targets }: { nutrients: Nutrients; targets?: Nutrients }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {NUTRIENT_KEYS.map((k) => (
          <tr key={k} className="border-t border-slate-100">
            <td className="py-1 text-slate-600">{NUTRIENT_META[k].label}</td>
            <td className="py-1 text-right tabular-nums">
              {round(nutrients[k], 1)} {NUTRIENT_META[k].unit}
            </td>
            {targets && (
              <td className="w-20 py-1 text-right text-xs tabular-nums text-slate-400">
                {targets[k] ? `${Math.round((nutrients[k] / targets[k]) * 100)}% DV` : ''}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

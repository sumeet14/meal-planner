import { isEstimatedUnit, formatGrams, toGrams } from '../lib/units';
import { useIngredients } from '../store';
import { UNITS, type DishItem, type Ingredient, type Unit } from '../types';
import { IngredientPicker } from './IngredientPicker';

function defaultUnit(ing: Ingredient): { qty: number; unit: Unit } {
  if (ing.unitWeights?.piece) return { qty: 1, unit: 'piece' };
  if (ing.category === 'spices') return { qty: 1, unit: 'tsp' };
  if (ing.category === 'oils') return { qty: 1, unit: 'tbsp' };
  return { qty: 100, unit: 'g' };
}

/** Editable table of ingredients with quantities and units. */
export function ItemsEditor({ items, onChange }: { items: DishItem[]; onChange: (items: DishItem[]) => void }) {
  const { map } = useIngredients();

  const update = (idx: number, patch: Partial<DishItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div className="space-y-2">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="pb-1 font-medium">Ingredient</th>
            <th className="pb-1 font-medium">Qty</th>
            <th className="pb-1 font-medium">Unit</th>
            <th className="pb-1 text-right font-medium">≈ Weight</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const ing = map[item.ingredientId];
            const estimated = isEstimatedUnit(item.unit, ing);
            return (
              <tr key={idx} className="border-t border-slate-100">
                <td className="py-1 pr-2">{ing?.name ?? <span className="text-red-500">Missing: {item.ingredientId}</span>}</td>
                <td className="py-1 pr-2">
                  <input
                    type="number" min={0} step="any"
                    className="input w-20"
                    value={Number.isFinite(item.qty) ? Math.round(item.qty * 100) / 100 : ''}
                    onChange={(e) => update(idx, { qty: parseFloat(e.target.value) || 0 })}
                  />
                </td>
                <td className="py-1 pr-2">
                  <select
                    className="input"
                    value={item.unit}
                    onChange={(e) => update(idx, { unit: e.target.value as Unit })}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </td>
                <td
                  className={`py-1 text-right tabular-nums ${estimated ? 'text-amber-600' : 'text-slate-500'}`}
                  title={estimated ? 'No weight known for this unit; using a generic estimate' : undefined}
                >
                  {formatGrams(toGrams(item, ing))}{estimated && '*'}
                </td>
                <td className="py-1 pl-1 text-right">
                  <button
                    className="btn-danger px-2"
                    aria-label="Remove ingredient"
                    onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  >✕</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <IngredientPicker
        onPick={(ing) => onChange([...items, { ingredientId: ing.id, ...defaultUnit(ing) }])}
      />
    </div>
  );
}

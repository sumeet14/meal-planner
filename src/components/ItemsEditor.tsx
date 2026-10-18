import { isEstimatedUnit, formatGrams, toGrams } from '../lib/units';
import { useIngredients } from '../store';
import { UNITS, type DishItem, type Ingredient, type Unit } from '../types';
import { Icon } from './Icon';
import { IngredientPicker } from './IngredientPicker';

function defaultUnit(ing: Ingredient): { qty: number; unit: Unit } {
  if (ing.unitWeights?.piece) return { qty: 1, unit: 'piece' };
  if (ing.category === 'spices') return { qty: 1, unit: 'tsp' };
  if (ing.category === 'oils') return { qty: 1, unit: 'tbsp' };
  return { qty: 100, unit: 'g' };
}

/** Editable list of ingredients with quantities and units. */
export function ItemsEditor({ items, onChange }: { items: DishItem[]; onChange: (items: DishItem[]) => void }) {
  const { map } = useIngredients();

  const update = (idx: number, patch: Partial<DishItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <div>
      {items.length > 0 && (
        <ul className="mb-3 divide-y divide-line rounded-xl border border-line">
          {items.map((item, idx) => {
            const ing = map[item.ingredientId];
            const estimated = isEstimatedUnit(item.unit, ing);
            return (
              <li key={idx} className="flex flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2">
                <span className="min-w-[8rem] flex-1 text-sm font-medium">
                  {ing?.name ?? <span className="text-high">Missing ingredient ({item.ingredientId})</span>}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number" min={0} step="any"
                    aria-label={`${ing?.name ?? 'Ingredient'} quantity`}
                    className="input num h-8 w-[4.5rem] px-2 text-right"
                    value={Number.isFinite(item.qty) ? Math.round(item.qty * 100) / 100 : ''}
                    onChange={(e) => update(idx, { qty: parseFloat(e.target.value) || 0 })}
                  />
                  <select
                    aria-label={`${ing?.name ?? 'Ingredient'} unit`}
                    className="input h-8 px-2"
                    value={item.unit}
                    onChange={(e) => update(idx, { unit: e.target.value as Unit })}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <span
                    className={`num w-16 text-right text-[13px] ${estimated ? 'text-low' : 'text-ink-3'}`}
                    title={estimated ? 'No weight known for this unit, so this is a rough estimate' : undefined}
                  >
                    {item.unit === 'g' ? '' : `≈ ${formatGrams(toGrams(item, ing))}`}{estimated && '*'}
                  </span>
                  <button
                    className="btn-icon h-8 w-8 hover:text-high"
                    aria-label={`Remove ${ing?.name ?? 'ingredient'}`}
                    onClick={() => onChange(items.filter((_, i) => i !== idx))}
                  ><Icon name="close" size={16} /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <IngredientPicker onPick={(ing) => onChange([...items, { ingredientId: ing.id, ...defaultUnit(ing) }])} />
      {items.some((it) => isEstimatedUnit(it.unit, map[it.ingredientId])) && (
        <p className="hint mt-2">* Estimated weight. Set grams per unit for that ingredient in Settings for a better figure.</p>
      )}
    </div>
  );
}

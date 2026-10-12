import { formatDay } from '../lib/dates';
import { itemsNutrients, mealItems } from '../lib/nutrition';
import { useDishMap, useIngredients, usePlanner } from '../store';
import { SLOTS, type Slot } from '../types';
import { ItemsEditor } from './ItemsEditor';
import { MacroDonut } from './MacroDonut';
import { Modal } from './Modal';
import { NutrientTable } from './NutrientTable';

/** Side panel for one planned meal: servings, groceries, and nutrient breakdown. */
export function MealDrawer({ mealId, onClose }: { mealId: string; onClose: () => void }) {
  const meal = usePlanner((s) => s.meals.find((m) => m.id === mealId));
  const targets = usePlanner((s) => s.targets);
  const { updateMeal, setMealServings, setMealItems, resetMealItems, saveMealToDish, removeMeal } = usePlanner();
  const dishes = useDishMap();
  const { map } = useIngredients();

  if (!meal) return null;
  const dish = dishes[meal.dishId];
  const items = mealItems(meal, dishes);
  const n = itemsNutrients(items, map);
  const day = formatDay(meal.date);

  return (
    <Modal side onClose={onClose} title={dish?.name ?? 'Meal'}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-500">{day.weekday} {day.label}</span>
          <select
            className="input"
            value={meal.slot}
            onChange={(e) => updateMeal(meal.id, { slot: e.target.value as Slot })}
          >
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <label className="flex items-center gap-1">
            Servings
            <input
              type="number" min={0.25} step={0.25}
              className="input w-20"
              value={meal.servings}
              onChange={(e) => setMealServings(meal.id, parseFloat(e.target.value) || meal.servings)}
            />
          </label>
        </div>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Groceries for this meal</h3>
            {meal.overrides && (
              <div className="flex gap-1">
                <button className="btn-ghost text-xs" onClick={() => resetMealItems(meal.id)}>Reset to dish</button>
                <button
                  className="btn-primary text-xs"
                  title="Make these ingredients the default for this dish in the catalogue"
                  onClick={() => saveMealToDish(meal.id)}
                >Save to catalogue</button>
              </div>
            )}
          </div>
          <ItemsEditor items={items} onChange={(next) => setMealItems(meal.id, next)} />
          <p className="mt-2 text-xs text-slate-400">
            Changes here apply to this meal only, unless you click "Save to catalogue".
          </p>
        </section>

        <section>
          <h3 className="mb-3 font-semibold">Nutrition</h3>
          <MacroDonut nutrients={n} />
          <div className="mt-4">
            <NutrientTable nutrients={n} targets={targets} />
          </div>
        </section>

        <button
          className="btn-danger w-full justify-center border border-red-200"
          onClick={() => { removeMeal(meal.id); onClose(); }}
        >Remove meal from plan</button>
      </div>
    </Modal>
  );
}

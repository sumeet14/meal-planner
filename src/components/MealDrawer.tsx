import { formatDay } from '../lib/dates';
import { itemsNutrients, mealItems } from '../lib/nutrition';
import { useDishMap, useIngredients, usePlanner } from '../store';
import { SLOTS, type Slot } from '../types';
import { Segmented, Stepper } from './Controls';
import { ItemsEditor } from './ItemsEditor';
import { MacroSplit } from './MacroSplit';
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
    <Modal
      side
      onClose={onClose}
      title={dish?.name ?? 'Deleted dish'}
      subtitle={`${day.weekdayLong}, ${day.label}`}
      footer={
        <>
          <button className="btn-danger mr-auto" onClick={() => { removeMeal(meal.id); onClose(); }}>Remove from plan</button>
          <button className="btn-primary" onClick={onClose}>Done</button>
        </>
      }
    >
      <div className="space-y-7">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Meal"
            value={meal.slot}
            onChange={(slot: Slot) => updateMeal(meal.id, { slot })}
            options={SLOTS.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          />
          <Stepper label="servings" value={meal.servings} step={0.5} min={0.25} onChange={(v) => setMealServings(meal.id, v)} />
        </div>

        <section>
          <div className="mb-1 flex items-baseline gap-2">
            <span className="num font-display text-3xl font-semibold tracking-tight">{Math.round(n.kcal)}</span>
            <span className="text-sm text-ink-2">kcal, {Math.round((n.kcal / (targets.kcal || 1)) * 100)}% of your day</span>
          </div>
          <div className="mt-3"><MacroSplit nutrients={n} /></div>
        </section>

        <section>
          <h3 className="section-title">Groceries for this meal</h3>
          <p className="hint mb-3 mt-1">
            {meal.overrides
              ? 'You changed these for this meal only. The dish in your catalogue is unchanged.'
              : 'Changes here apply to this meal only.'}
          </p>
          {meal.overrides && (
            <div className="mb-3 flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => resetMealItems(meal.id)}>Undo changes</button>
              <button className="btn-secondary" onClick={() => saveMealToDish(meal.id)}>Save to dish</button>
            </div>
          )}
          <ItemsEditor items={items} onChange={(next) => setMealItems(meal.id, next)} />
        </section>

        <section>
          <h3 className="section-title mb-2">All nutrients</h3>
          <NutrientTable nutrients={n} targets={targets} />
        </section>
      </div>
    </Modal>
  );
}

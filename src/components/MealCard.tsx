import { mealNutrients } from '../lib/nutrition';
import { useDishMap, useIngredients } from '../store';
import type { PlannedMeal } from '../types';

export function MealCard({ meal, onOpen }: { meal: PlannedMeal; onOpen: () => void }) {
  const dishes = useDishMap();
  const { map } = useIngredients();
  const dish = dishes[meal.dishId];
  const n = mealNutrients(meal, dishes, map);

  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-lg border border-line bg-sunk px-2.5 py-2 text-left transition-colors hover:border-ink/40 hover:bg-surface"
    >
      <span className="block text-sm font-medium leading-snug">{dish?.name ?? 'Deleted dish'}</span>
      <span className="num mt-0.5 flex items-center gap-2 text-[13px] text-ink-3">
        {Math.round(n.kcal)} kcal
        {meal.servings !== 1 && <span>×{meal.servings}</span>}
        {meal.overrides && (
          <span className="ml-auto flex items-center gap-1 text-ink-2" title="Ingredients changed for this meal">
            <span className="h-1.5 w-1.5 rounded-full bg-ink-3" />edited
          </span>
        )}
      </span>
    </button>
  );
}

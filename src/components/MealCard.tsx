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
      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-emerald-400"
    >
      <div className="flex items-start justify-between gap-1">
        <span className="text-sm font-medium leading-tight">{dish?.name ?? 'Deleted dish'}</span>
        {meal.servings !== 1 && <span className="shrink-0 text-xs text-slate-400">×{meal.servings}</span>}
      </div>
      <div className="mt-0.5 flex gap-2 text-[11px] text-slate-500">
        <span className="font-medium text-slate-700">{Math.round(n.kcal)} kcal</span>
        <span>P {Math.round(n.protein)}</span>
        <span>C {Math.round(n.carbs)}</span>
        <span>F {Math.round(n.fat)}</span>
        {meal.overrides && <span className="ml-auto text-amber-600" title="Ingredients edited for this meal">edited</span>}
      </div>
    </button>
  );
}

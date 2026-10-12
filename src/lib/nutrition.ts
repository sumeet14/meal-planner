import { NUTRIENT_KEYS, type Dish, type Goal, type DishItem, type Ingredient, type Nutrients, type PlannedMeal } from '../types';
import { toGrams } from './units';

export type IngredientMap = Record<string, Ingredient>;
export type DishMap = Record<string, Dish>;

export function emptyNutrients(): Nutrients {
  return Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0])) as Nutrients;
}

export function addNutrients(a: Nutrients, b: Nutrients): Nutrients {
  const out = emptyNutrients();
  for (const k of NUTRIENT_KEYS) out[k] = a[k] + b[k];
  return out;
}

export function scaleNutrients(n: Nutrients, factor: number): Nutrients {
  const out = emptyNutrients();
  for (const k of NUTRIENT_KEYS) out[k] = n[k] * factor;
  return out;
}

export function itemsNutrients(items: DishItem[], ingredients: IngredientMap): Nutrients {
  return items.reduce((acc, item) => {
    const ing = ingredients[item.ingredientId];
    if (!ing) return acc;
    return addNutrients(acc, scaleNutrients(ing.per100g, toGrams(item, ing) / 100));
  }, emptyNutrients());
}

/** Nutrients for `servings` servings of a dish. */
export function dishNutrients(dish: Dish, ingredients: IngredientMap, servings = 1): Nutrients {
  return scaleNutrients(itemsNutrients(dish.items, ingredients), servings / (dish.servings || 1));
}

export function scaleItems(items: DishItem[], factor: number): DishItem[] {
  return items.map((i) => ({ ...i, qty: i.qty * factor }));
}

/** The actual ingredient quantities used for a planned meal. */
export function mealItems(meal: PlannedMeal, dishes: DishMap): DishItem[] {
  if (meal.overrides) return meal.overrides;
  const dish = dishes[meal.dishId];
  if (!dish) return [];
  return scaleItems(dish.items, meal.servings / (dish.servings || 1));
}

export function mealNutrients(meal: PlannedMeal, dishes: DishMap, ingredients: IngredientMap): Nutrients {
  return itemsNutrients(mealItems(meal, dishes), ingredients);
}

export function dayTotals(
  meals: PlannedMeal[], date: string, dishes: DishMap, ingredients: IngredientMap,
): Nutrients {
  return meals
    .filter((m) => m.date === date)
    .reduce((acc, m) => addNutrients(acc, mealNutrients(m, dishes, ingredients)), emptyNutrients());
}

export function percentOfTarget(totals: Nutrients, targets: Nutrients): Nutrients {
  const out = emptyNutrients();
  for (const k of NUTRIENT_KEYS) out[k] = targets[k] > 0 ? (totals[k] / targets[k]) * 100 : 0;
  return out;
}

/** Share of calories from each macro, in percent. */
export function macroSplit(n: Nutrients): { protein: number; carbs: number; fat: number } {
  const p = n.protein * 4, c = n.carbs * 4, f = n.fat * 9;
  const total = p + c + f;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: (p / total) * 100, carbs: (c / total) * 100, fat: (f / total) * 100 };
}

export type Status = 'low' | 'ok' | 'high';

/**
 * Status for a nutrient's % of target. Below 70% is low (except for upper limits);
 * above 130% is high for range goals, and above 100% is high for upper limits.
 */
export function targetStatus(pct: number, goal: Goal = 'range'): Status {
  if (goal === 'max') return pct > 100 ? 'high' : 'ok';
  if (pct < 70) return 'low';
  if (goal === 'range' && pct > 130) return 'high';
  return 'ok';
}

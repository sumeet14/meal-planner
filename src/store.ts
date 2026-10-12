import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_DISHES } from './data/dishes';
import { SEED_INGREDIENTS } from './data/ingredients';
import { DEFAULT_TARGETS } from './data/targets';
import { scaleItems, type DishMap, type IngredientMap } from './lib/nutrition';
import type { Dish, DishItem, Ingredient, ManualGroceryItem, Nutrients, PlannedMeal, Slot } from './types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export interface PlannerData {
  dishes: Dish[];
  /** User-added ingredients, plus edited copies of seed ingredients (same id). */
  customIngredients: Ingredient[];
  meals: PlannedMeal[];
  targets: Nutrients;
  /** Checked-off grocery lines, keyed by ingredient id or manual item id. */
  groceryChecked: Record<string, boolean>;
  manualGrocery: ManualGroceryItem[];
  planDays: number;
}

interface PlannerState extends PlannerData {
  addMeal: (date: string, slot: Slot, dishId: string, servings?: number) => void;
  updateMeal: (id: string, patch: Partial<PlannedMeal>) => void;
  setMealServings: (id: string, servings: number) => void;
  setMealItems: (id: string, items: DishItem[]) => void;
  resetMealItems: (id: string) => void;
  saveMealToDish: (id: string) => void;
  removeMeal: (id: string) => void;

  upsertDish: (dish: Dish) => void;
  removeDish: (id: string) => void;
  toggleFavorite: (id: string) => void;

  upsertIngredient: (ing: Ingredient) => void;
  removeCustomIngredient: (id: string) => void;

  setTargets: (t: Nutrients) => void;
  setPlanDays: (n: number) => void;

  toggleGrocery: (key: string) => void;
  clearGroceryChecks: () => void;
  addManualGrocery: (name: string, note: string) => void;
  removeManualGrocery: (id: string) => void;

  importData: (data: PlannerData) => void;
  resetAll: () => void;
}

const initialData = (): PlannerData => ({
  dishes: SEED_DISHES,
  customIngredients: [],
  meals: [],
  targets: DEFAULT_TARGETS,
  groceryChecked: {},
  manualGrocery: [],
  planDays: 5,
});

export const usePlanner = create<PlannerState>()(
  persist(
    (set, get) => ({
      ...initialData(),

      addMeal: (date, slot, dishId, servings = 1) =>
        set((s) => ({ meals: [...s.meals, { id: uid(), date, slot, dishId, servings }] })),

      updateMeal: (id, patch) =>
        set((s) => ({ meals: s.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

      setMealServings: (id, servings) =>
        set((s) => ({
          meals: s.meals.map((m) => {
            if (m.id !== id || servings <= 0) return m;
            // Edited ingredient lists scale along with the servings.
            const overrides = m.overrides && scaleItems(m.overrides, servings / m.servings);
            return { ...m, servings, overrides };
          }),
        })),

      setMealItems: (id, items) =>
        set((s) => ({ meals: s.meals.map((m) => (m.id === id ? { ...m, overrides: items } : m)) })),

      resetMealItems: (id) =>
        set((s) => ({ meals: s.meals.map((m) => (m.id === id ? { ...m, overrides: undefined } : m)) })),

      saveMealToDish: (id) => {
        const meal = get().meals.find((m) => m.id === id);
        if (!meal?.overrides) return;
        const overrides = meal.overrides;
        set((s) => ({
          dishes: s.dishes.map((d) =>
            d.id === meal.dishId ? { ...d, items: scaleItems(overrides, d.servings / meal.servings) } : d,
          ),
          meals: s.meals.map((m) => (m.id === id ? { ...m, overrides: undefined } : m)),
        }));
      },

      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),

      upsertDish: (dish) =>
        set((s) => ({
          dishes: s.dishes.some((d) => d.id === dish.id)
            ? s.dishes.map((d) => (d.id === dish.id ? dish : d))
            : [...s.dishes, dish],
        })),

      removeDish: (id) =>
        set((s) => ({
          dishes: s.dishes.filter((d) => d.id !== id),
          meals: s.meals.filter((m) => m.dishId !== id),
        })),

      toggleFavorite: (id) =>
        set((s) => ({ dishes: s.dishes.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d)) })),

      upsertIngredient: (ing) =>
        set((s) => ({
          customIngredients: [...s.customIngredients.filter((i) => i.id !== ing.id), { ...ing, custom: true }],
        })),

      removeCustomIngredient: (id) =>
        set((s) => ({ customIngredients: s.customIngredients.filter((i) => i.id !== id) })),

      setTargets: (targets) => set({ targets }),
      setPlanDays: (planDays) => set({ planDays }),

      toggleGrocery: (key) =>
        set((s) => ({ groceryChecked: { ...s.groceryChecked, [key]: !s.groceryChecked[key] } })),
      clearGroceryChecks: () => set({ groceryChecked: {} }),
      addManualGrocery: (name, note) =>
        set((s) => ({ manualGrocery: [...s.manualGrocery, { id: uid(), name, note }] })),
      removeManualGrocery: (id) =>
        set((s) => ({ manualGrocery: s.manualGrocery.filter((i) => i.id !== id) })),

      importData: (data) => set({ ...initialData(), ...data }),
      resetAll: () => set(initialData()),
    }),
    { name: 'meal-planner', version: 1 },
  ),
);

/** Seed ingredients merged with the user's custom/edited ones. */
export function useIngredients(): { list: Ingredient[]; map: IngredientMap } {
  const custom = usePlanner((s) => s.customIngredients);
  return useMemo(() => {
    const map: IngredientMap = Object.fromEntries(SEED_INGREDIENTS.map((i) => [i.id, i]));
    for (const c of custom) map[c.id] = c;
    const list = Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
    return { list, map };
  }, [custom]);
}

export function useDishMap(): DishMap {
  const dishes = usePlanner((s) => s.dishes);
  return useMemo(() => Object.fromEntries(dishes.map((d) => [d.id, d])), [dishes]);
}

export function pickData(s: PlannerData): PlannerData {
  const { dishes, customIngredients, meals, targets, groceryChecked, manualGrocery, planDays } = s;
  return { dishes, customIngredients, meals, targets, groceryChecked, manualGrocery, planDays };
}

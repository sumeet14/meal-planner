export const NUTRIENT_KEYS = [
  'kcal', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium', 'calcium', 'iron', 'vitC',
] as const;

export type NutrientKey = (typeof NUTRIENT_KEYS)[number];
export type Nutrients = Record<NutrientKey, number>;

/**
 * range: aim to land near the target (too little or too much is flagged).
 * min: reach at least the target; exceeding it is fine.
 * max: an upper limit to stay under.
 */
export type Goal = 'range' | 'min' | 'max';

export const NUTRIENT_META: Record<NutrientKey, { label: string; unit: string; goal: Goal }> = {
  kcal: { label: 'Calories', unit: 'kcal', goal: 'range' },
  protein: { label: 'Protein', unit: 'g', goal: 'min' },
  carbs: { label: 'Carbs', unit: 'g', goal: 'range' },
  fat: { label: 'Fat', unit: 'g', goal: 'range' },
  fiber: { label: 'Fiber', unit: 'g', goal: 'min' },
  sugar: { label: 'Sugar', unit: 'g', goal: 'max' },
  sodium: { label: 'Sodium', unit: 'mg', goal: 'max' },
  calcium: { label: 'Calcium', unit: 'mg', goal: 'min' },
  iron: { label: 'Iron', unit: 'mg', goal: 'min' },
  vitC: { label: 'Vitamin C', unit: 'mg', goal: 'min' },
};

export const CATEGORIES = [
  'produce', 'dairy', 'grains', 'pulses', 'meat', 'nuts', 'oils', 'spices', 'other',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const UNITS = ['g', 'ml', 'piece', 'cup', 'tbsp', 'tsp'] as const;
export type Unit = (typeof UNITS)[number];

export interface Ingredient {
  id: string;
  name: string;
  category: Category;
  per100g: Nutrients;
  /** Grams per non-weight unit. ml is assumed to be 1 g/ml unless overridden. */
  unitWeights?: Partial<Record<Exclude<Unit, 'g'>, number>>;
  custom?: boolean;
}

export interface DishItem {
  ingredientId: string;
  qty: number;
  unit: Unit;
}

export interface Dish {
  id: string;
  name: string;
  /** Number of servings the item quantities make. */
  servings: number;
  items: DishItem[];
  tags: string[];
  favorite: boolean;
}

export const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'] as const;
export type Slot = (typeof SLOTS)[number];

export interface PlannedMeal {
  id: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
  slot: Slot;
  dishId: string;
  /** Servings eaten for this meal. */
  servings: number;
  /**
   * Per-meal ingredient edits, as absolute quantities for this meal (already
   * scaled to `servings`). Replaces the dish's items for this meal only.
   */
  overrides?: DishItem[];
}

export interface ManualGroceryItem {
  id: string;
  name: string;
  note: string;
}

import type { DishItem, Ingredient, Unit } from '../types';

// Used when an ingredient has no specific weight for a unit.
const FALLBACK_GRAMS: Record<Exclude<Unit, 'g'>, number> = {
  ml: 1,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  piece: 100,
};

export function gramsPerUnit(unit: Unit, ingredient?: Ingredient): number {
  if (unit === 'g') return 1;
  return ingredient?.unitWeights?.[unit] ?? FALLBACK_GRAMS[unit];
}

/** True when the conversion relies on a generic fallback rather than ingredient data. */
export function isEstimatedUnit(unit: Unit, ingredient?: Ingredient): boolean {
  if (unit === 'g' || unit === 'ml') return false;
  return ingredient?.unitWeights?.[unit] === undefined;
}

export function toGrams(item: DishItem, ingredient?: Ingredient): number {
  return item.qty * gramsPerUnit(item.unit, ingredient);
}

export function formatGrams(g: number): string {
  if (g >= 1000) return `${round(g / 1000, 2)} kg`;
  if (g >= 10) return `${Math.round(g)} g`;
  return `${round(g, 1)} g`;
}

export function round(n: number, digits = 0): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function formatQty(qty: number, unit: Unit): string {
  const q = round(qty, 2);
  if (unit === 'piece') return `${q} ${q === 1 ? 'piece' : 'pieces'}`;
  if (unit === 'cup') return `${q} ${q === 1 ? 'cup' : 'cups'}`;
  return `${q} ${unit}`;
}

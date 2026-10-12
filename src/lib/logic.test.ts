import { describe, expect, it } from 'vitest';
import { SEED_DISHES } from '../data/dishes';
import { SEED_INGREDIENTS } from '../data/ingredients';
import type { Dish, PlannedMeal } from '../types';
import { buildGroceryList } from './grocery';
import {
  dayTotals, dishNutrients, macroSplit, mealItems, mealNutrients, percentOfTarget, targetStatus,
  type DishMap, type IngredientMap,
} from './nutrition';
import { isEstimatedUnit, toGrams } from './units';
import { addDays, dateRange } from './dates';

const ingredients: IngredientMap = Object.fromEntries(SEED_INGREDIENTS.map((i) => [i.id, i]));
const dishes: DishMap = Object.fromEntries(SEED_DISHES.map((d) => [d.id, d]));

const testDish: Dish = {
  id: 'rice-egg', name: 'Rice & egg', servings: 2, tags: [], favorite: false,
  items: [
    { ingredientId: 'basmati-rice', qty: 100, unit: 'g' },
    { ingredientId: 'egg', qty: 2, unit: 'piece' },
  ],
};
const testDishes: DishMap = { ...dishes, [testDish.id]: testDish };

function meal(partial: Partial<PlannedMeal>): PlannedMeal {
  return { id: 'm', date: '2026-10-13', slot: 'lunch', dishId: testDish.id, servings: 2, ...partial };
}

describe('seed data', () => {
  it('has unique ingredient ids', () => {
    expect(new Set(SEED_INGREDIENTS.map((i) => i.id)).size).toBe(SEED_INGREDIENTS.length);
  });

  it('only references known ingredients from dishes', () => {
    for (const d of SEED_DISHES) for (const item of d.items) {
      expect(ingredients[item.ingredientId], `${d.id} -> ${item.ingredientId}`).toBeDefined();
    }
  });

  it('has macro calories roughly consistent with stated kcal', () => {
    for (const i of SEED_INGREDIENTS) {
      const { kcal, protein, carbs, fat, fiber } = i.per100g;
      if (kcal < 50) continue;
      const est = protein * 4 + (carbs - fiber * 0.5) * 4 + fat * 9;
      expect(Math.abs(est - kcal) / kcal, i.id).toBeLessThan(0.3);
    }
  });
});

describe('units', () => {
  it('converts grams, ingredient-specific units and fallbacks', () => {
    expect(toGrams({ ingredientId: 'egg', qty: 3, unit: 'piece' }, ingredients.egg)).toBe(150);
    expect(toGrams({ ingredientId: 'rice', qty: 50, unit: 'g' }, ingredients['basmati-rice'])).toBe(50);
    expect(toGrams({ ingredientId: 'mutton', qty: 1, unit: 'cup' }, ingredients.mutton)).toBe(240);
    expect(isEstimatedUnit('cup', ingredients.mutton)).toBe(true);
    expect(isEstimatedUnit('piece', ingredients.egg)).toBe(false);
  });
});

describe('nutrition', () => {
  it('computes nutrients for 100 g of rice', () => {
    const n = dishNutrients({ ...testDish, servings: 1, items: [testDish.items[0]] }, ingredients);
    expect(n.kcal).toBeCloseTo(356);
    expect(n.protein).toBeCloseTo(8);
  });

  it('scales a dish by servings', () => {
    const whole = dishNutrients(testDish, ingredients, 2);
    const half = dishNutrients(testDish, ingredients, 1);
    expect(whole.kcal).toBeCloseTo(356 + 143);
    expect(half.kcal).toBeCloseTo(whole.kcal / 2);
  });

  it('uses per-meal overrides instead of the dish', () => {
    const m = meal({ overrides: [{ ingredientId: 'egg', qty: 1, unit: 'piece' }] });
    expect(mealNutrients(m, testDishes, ingredients).kcal).toBeCloseTo(71.5);
    expect(mealItems(meal({ servings: 1 }), testDishes)[1].qty).toBe(1);
  });

  it('sums a day and compares against targets', () => {
    const meals = [meal({ id: 'a' }), meal({ id: 'b', servings: 1 }), meal({ id: 'c', date: '2026-10-14' })];
    const totals = dayTotals(meals, '2026-10-13', testDishes, ingredients);
    expect(totals.kcal).toBeCloseTo((356 + 143) * 1.5);
    const pct = percentOfTarget(totals, { ...totals, kcal: totals.kcal * 2 });
    expect(pct.kcal).toBeCloseTo(50);
    expect(pct.protein).toBeCloseTo(100);
  });

  it('computes macro split and status', () => {
    const split = macroSplit({ ...dishNutrients(testDish, ingredients), protein: 25, carbs: 25, fat: 0 });
    expect(split.protein).toBeCloseTo(50);
    expect(targetStatus(50)).toBe('low');
    expect(targetStatus(100)).toBe('ok');
    expect(targetStatus(140)).toBe('high');
    expect(targetStatus(200, 'min')).toBe('ok');
    expect(targetStatus(50, 'min')).toBe('low');
    expect(targetStatus(50, 'max')).toBe('ok');
    expect(targetStatus(110, 'max')).toBe('high');
  });
});

describe('grocery list', () => {
  it('merges the same ingredient across meals and groups by category', () => {
    const meals = [
      meal({ id: 'a' }),
      meal({ id: 'b', servings: 4 }),
      meal({ id: 'c', overrides: [{ ingredientId: 'egg', qty: 1, unit: 'piece' }] }),
    ];
    const groups = buildGroceryList(meals, testDishes, ingredients);
    const lines = groups.flatMap((g) => g.lines);
    const egg = lines.find((l) => l.ingredientId === 'egg')!;
    expect(egg.grams).toBe((2 + 4 + 1) * 50);
    expect(egg.unitTotal).toEqual({ qty: 7, unit: 'piece' });
    expect(egg.usedIn).toEqual(['Rice & egg']);
    const rice = lines.find((l) => l.ingredientId === 'basmati-rice')!;
    expect(rice.grams).toBe(300);
    expect(rice.unitTotal).toBeUndefined();
    expect(groups.map((g) => g.category)).toEqual(['dairy', 'grains']);
  });

  it('keeps no unit total when units are mixed', () => {
    const meals = [meal({ overrides: [
      { ingredientId: 'onion', qty: 1, unit: 'piece' },
      { ingredientId: 'onion', qty: 50, unit: 'g' },
    ] })];
    const onion = buildGroceryList(meals, testDishes, ingredients)[0].lines[0];
    expect(onion.grams).toBe(160);
    expect(onion.unitTotal).toBeUndefined();
  });
});

describe('dates', () => {
  it('handles month boundaries', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(dateRange('2026-12-30', 3)).toEqual(['2026-12-30', '2026-12-31', '2027-01-01']);
  });
});

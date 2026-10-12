import { CATEGORIES, type Category, type PlannedMeal, type Unit } from '../types';
import { mealItems, type DishMap, type IngredientMap } from './nutrition';
import { toGrams } from './units';

export interface GroceryLine {
  ingredientId: string;
  name: string;
  category: Category;
  grams: number;
  /** Set when every use of the ingredient was in the same non-gram unit, e.g. 3 pieces. */
  unitTotal?: { qty: number; unit: Unit };
  /** Names of the dishes that use this ingredient. */
  usedIn: string[];
}

export interface GroceryGroup {
  category: Category;
  lines: GroceryLine[];
}

export function buildGroceryList(
  meals: PlannedMeal[], dishes: DishMap, ingredients: IngredientMap,
): GroceryGroup[] {
  const lines = new Map<string, GroceryLine & { units: Set<Unit>; unitQty: number }>();

  for (const meal of meals) {
    const dishName = dishes[meal.dishId]?.name ?? 'Unknown dish';
    for (const item of mealItems(meal, dishes)) {
      const ing = ingredients[item.ingredientId];
      if (!ing || item.qty <= 0) continue;
      let line = lines.get(ing.id);
      if (!line) {
        line = {
          ingredientId: ing.id, name: ing.name, category: ing.category,
          grams: 0, usedIn: [], units: new Set(), unitQty: 0,
        };
        lines.set(ing.id, line);
      }
      line.grams += toGrams(item, ing);
      line.units.add(item.unit);
      line.unitQty += item.qty;
      if (!line.usedIn.includes(dishName)) line.usedIn.push(dishName);
    }
  }

  const groups = new Map<Category, GroceryLine[]>();
  for (const { units, unitQty, ...line } of lines.values()) {
    const [only] = units;
    if (units.size === 1 && only !== 'g') line.unitTotal = { qty: unitQty, unit: only };
    const list = groups.get(line.category) ?? [];
    list.push(line);
    groups.set(line.category, list);
  }

  return CATEGORIES.filter((c) => groups.has(c)).map((category) => ({
    category,
    lines: groups.get(category)!.sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export function groceryListToText(groups: GroceryGroup[], format: (l: GroceryLine) => string): string {
  return groups
    .map((g) => `${g.category.toUpperCase()}\n${g.lines.map((l) => `- ${l.name}: ${format(l)}`).join('\n')}`)
    .join('\n\n');
}

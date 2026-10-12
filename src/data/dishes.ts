import type { Dish, DishItem, Unit } from '../types';

type Item = [ingredientId: string, qty: number, unit: Unit];

function dish(id: string, name: string, servings: number, tags: string[], items: Item[]): Dish {
  return {
    id, name, servings, tags, favorite: false,
    items: items.map(([ingredientId, qty, unit]): DishItem => ({ ingredientId, qty, unit })),
  };
}

export const SEED_DISHES: Dish[] = [
  // Indian
  dish('dal-tadka', 'Dal tadka', 4, ['indian', 'lunch', 'dinner', 'veg'], [
    ['toor-dal', 1, 'cup'], ['onion', 1, 'piece'], ['tomato', 1, 'piece'], ['ghee', 1, 'tbsp'],
    ['cumin-seeds', 1, 'tsp'], ['garlic', 4, 'piece'], ['green-chilli', 2, 'piece'], ['turmeric', 0.5, 'tsp'],
    ['red-chilli-powder', 0.5, 'tsp'], ['salt', 1, 'tsp'], ['coriander-leaves', 1, 'tbsp'], ['hing', 0.25, 'tsp'],
  ]),
  dish('roti', 'Roti / chapati (2 pcs)', 1, ['indian', 'bread', 'veg'], [
    ['whole-wheat-flour', 60, 'g'], ['ghee', 0.5, 'tsp'], ['salt', 0.1, 'tsp'],
  ]),
  dish('jeera-rice', 'Jeera rice', 3, ['indian', 'rice', 'veg'], [
    ['basmati-rice', 1, 'cup'], ['ghee', 1, 'tbsp'], ['cumin-seeds', 1, 'tsp'], ['bay-leaf', 1, 'piece'], ['salt', 0.75, 'tsp'],
  ]),
  dish('steamed-rice', 'Steamed rice', 1, ['indian', 'rice', 'veg'], [
    ['basmati-rice', 75, 'g'],
  ]),
  dish('paneer-bhurji', 'Paneer bhurji', 2, ['indian', 'breakfast', 'dinner', 'veg'], [
    ['paneer', 200, 'g'], ['onion', 1, 'piece'], ['tomato', 1, 'piece'], ['capsicum', 0.5, 'piece'],
    ['green-chilli', 1, 'piece'], ['sunflower-oil', 1, 'tbsp'], ['turmeric', 0.25, 'tsp'],
    ['garam-masala', 0.5, 'tsp'], ['salt', 0.5, 'tsp'], ['coriander-leaves', 1, 'tbsp'],
  ]),
  dish('poha', 'Kanda poha', 2, ['indian', 'breakfast', 'veg'], [
    ['poha', 1.5, 'cup'], ['onion', 1, 'piece'], ['peanuts', 2, 'tbsp'], ['sunflower-oil', 1, 'tbsp'],
    ['mustard-seeds', 0.5, 'tsp'], ['curry-leaves', 10, 'piece'], ['green-chilli', 2, 'piece'],
    ['turmeric', 0.25, 'tsp'], ['lemon', 0.5, 'piece'], ['sugar', 1, 'tsp'], ['salt', 0.75, 'tsp'],
    ['coriander-leaves', 1, 'tbsp'],
  ]),
  dish('rajma', 'Rajma masala', 4, ['indian', 'lunch', 'dinner', 'veg'], [
    ['rajma', 1, 'cup'], ['onion', 2, 'piece'], ['tomato-puree', 1, 'cup'], ['ginger-garlic-paste', 1, 'tbsp'],
    ['sunflower-oil', 2, 'tbsp'], ['cumin-seeds', 1, 'tsp'], ['red-chilli-powder', 1, 'tsp'],
    ['coriander-powder', 1, 'tsp'], ['garam-masala', 1, 'tsp'], ['salt', 1.25, 'tsp'],
  ]),
  dish('chicken-curry', 'Chicken curry', 4, ['indian', 'dinner', 'non-veg'], [
    ['chicken-curry-cut', 750, 'g'], ['onion', 2, 'piece'], ['tomato', 2, 'piece'], ['curd', 0.25, 'cup'],
    ['ginger-garlic-paste', 1, 'tbsp'], ['sunflower-oil', 3, 'tbsp'], ['turmeric', 0.5, 'tsp'],
    ['red-chilli-powder', 1, 'tsp'], ['coriander-powder', 2, 'tsp'], ['garam-masala', 1, 'tsp'],
    ['salt', 1.5, 'tsp'], ['coriander-leaves', 2, 'tbsp'],
  ]),
  dish('palak-paneer', 'Palak paneer', 3, ['indian', 'dinner', 'veg'], [
    ['spinach', 300, 'g'], ['paneer', 200, 'g'], ['onion', 1, 'piece'], ['tomato', 1, 'piece'],
    ['ginger-garlic-paste', 1, 'tsp'], ['cream', 2, 'tbsp'], ['butter', 1, 'tbsp'], ['cumin-seeds', 1, 'tsp'],
    ['garam-masala', 0.5, 'tsp'], ['salt', 1, 'tsp'],
  ]),
  dish('chole', 'Chole', 4, ['indian', 'lunch', 'veg'], [
    ['chickpeas', 1, 'cup'], ['onion', 2, 'piece'], ['tomato', 2, 'piece'], ['ginger-garlic-paste', 1, 'tbsp'],
    ['sunflower-oil', 2, 'tbsp'], ['garam-masala', 1, 'tsp'], ['red-chilli-powder', 1, 'tsp'],
    ['coriander-powder', 1, 'tsp'], ['salt', 1.25, 'tsp'],
  ]),
  dish('aloo-gobi', 'Aloo gobi', 3, ['indian', 'sabzi', 'veg'], [
    ['potato', 2, 'piece'], ['cauliflower', 300, 'g'], ['onion', 1, 'piece'], ['tomato', 1, 'piece'],
    ['sunflower-oil', 2, 'tbsp'], ['cumin-seeds', 1, 'tsp'], ['turmeric', 0.5, 'tsp'],
    ['coriander-powder', 1, 'tsp'], ['salt', 1, 'tsp'],
  ]),
  dish('upma', 'Rava upma', 2, ['indian', 'breakfast', 'veg'], [
    ['semolina', 1, 'cup'], ['onion', 1, 'piece'], ['green-peas', 0.25, 'cup'], ['carrot', 0.5, 'piece'],
    ['sunflower-oil', 1.5, 'tbsp'], ['mustard-seeds', 0.5, 'tsp'], ['urad-dal', 1, 'tsp'],
    ['curry-leaves', 10, 'piece'], ['salt', 0.75, 'tsp'],
  ]),
  dish('moong-chilla', 'Moong dal chilla', 2, ['indian', 'breakfast', 'veg'], [
    ['moong-dal', 0.75, 'cup'], ['onion', 0.5, 'piece'], ['tomato', 0.5, 'piece'], ['green-chilli', 1, 'piece'],
    ['ginger', 1, 'tsp'], ['sunflower-oil', 2, 'tsp'], ['salt', 0.5, 'tsp'], ['coriander-leaves', 1, 'tbsp'],
  ]),
  dish('masala-chai', 'Masala chai', 1, ['indian', 'drink', 'veg'], [
    ['milk-toned', 100, 'ml'], ['tea-leaves', 1, 'tsp'], ['sugar', 1, 'tsp'], ['ginger', 0.5, 'tsp'],
  ]),
  dish('cucumber-raita', 'Cucumber raita', 2, ['indian', 'side', 'veg'], [
    ['curd', 1, 'cup'], ['cucumber', 0.5, 'piece'], ['cumin-seeds', 0.5, 'tsp'], ['salt', 0.25, 'tsp'],
  ]),

  // Western
  dish('overnight-oats', 'Overnight oats with banana', 1, ['western', 'breakfast', 'veg'], [
    ['rolled-oats', 0.5, 'cup'], ['milk-toned', 150, 'ml'], ['banana', 1, 'piece'], ['chia-seeds', 1, 'tbsp'],
    ['honey', 1, 'tsp'],
  ]),
  dish('veg-omelette', 'Vegetable omelette', 1, ['western', 'breakfast'], [
    ['egg', 2, 'piece'], ['onion', 0.25, 'piece'], ['tomato', 0.25, 'piece'], ['capsicum', 0.25, 'piece'],
    ['butter', 1, 'tsp'], ['salt', 0.25, 'tsp'], ['black-pepper', 0.25, 'tsp'],
  ]),
  dish('pb-toast', 'Peanut butter banana toast', 1, ['western', 'breakfast', 'veg'], [
    ['whole-wheat-bread', 2, 'piece'], ['peanut-butter', 1.5, 'tbsp'], ['banana', 1, 'piece'],
  ]),
  dish('pasta-marinara', 'Pasta marinara', 2, ['western', 'dinner', 'veg'], [
    ['pasta', 160, 'g'], ['pasta-sauce', 1, 'cup'], ['olive-oil', 1, 'tbsp'], ['garlic', 3, 'piece'],
    ['parmesan', 2, 'tbsp'], ['italian-herbs', 1, 'tsp'],
  ]),
  dish('chicken-salad', 'Grilled chicken salad', 1, ['western', 'lunch', 'non-veg'], [
    ['chicken-breast', 150, 'g'], ['lettuce', 2, 'cup'], ['cucumber', 0.5, 'piece'], ['tomato', 1, 'piece'],
    ['olive-oil', 1, 'tbsp'], ['lemon', 0.5, 'piece'], ['salt', 0.25, 'tsp'], ['black-pepper', 0.25, 'tsp'],
  ]),
  dish('veg-sandwich', 'Grilled veg cheese sandwich', 1, ['western', 'snack', 'veg'], [
    ['whole-wheat-bread', 2, 'piece'], ['cheese-slice', 1, 'piece'], ['tomato', 0.5, 'piece'],
    ['cucumber', 0.25, 'piece'], ['onion', 0.25, 'piece'], ['butter', 1, 'tsp'],
  ]),
  dish('greek-yogurt-bowl', 'Greek yogurt berry bowl', 1, ['western', 'breakfast', 'snack', 'veg'], [
    ['greek-yogurt', 200, 'g'], ['berries', 0.5, 'cup'], ['almonds', 10, 'piece'], ['honey', 1, 'tsp'],
  ]),
  dish('salmon-veg', 'Salmon with roasted veg', 1, ['western', 'dinner', 'non-veg'], [
    ['salmon', 150, 'g'], ['broccoli', 1, 'cup'], ['sweet-potato', 1, 'piece'], ['olive-oil', 1, 'tbsp'],
    ['garlic', 2, 'piece'], ['lemon', 0.5, 'piece'], ['salt', 0.25, 'tsp'],
  ]),
  dish('fruit-bowl', 'Fruit bowl', 1, ['snack', 'veg'], [
    ['apple', 0.5, 'piece'], ['banana', 0.5, 'piece'], ['papaya', 0.5, 'cup'], ['pomegranate', 2, 'tbsp'],
  ]),
  dish('almonds-snack', 'Handful of almonds', 1, ['snack', 'veg'], [
    ['almonds', 15, 'piece'],
  ]),
];

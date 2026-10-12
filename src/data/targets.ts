import type { Nutrients } from '../types';

// FDA Daily Values for a 2000 kcal adult diet. Sugar and sodium are upper limits.
export const DEFAULT_TARGETS: Nutrients = {
  kcal: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
  calcium: 1000,
  iron: 18,
  vitC: 90,
};

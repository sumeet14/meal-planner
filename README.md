# Meal Planner

A local-first meal planner: plan meals for the next few days, edit the groceries for each meal, get a combined grocery list, keep a catalogue of dishes you cook often, and see a rough nutrient breakdown per meal and per day against recommended intake.

Built with React, TypeScript, Vite, Tailwind CSS, Zustand and Recharts.

## Features

- **Planner**: 3, 5 or 7 days × breakfast / lunch / snack / dinner, with per-day calorie and macro bars.
- **Per-meal groceries**: edit quantities, units and ingredients for one meal, or save the changes back to the dish.
- **Grocery list**: merges ingredients across all meals in a date range, grouped by aisle, with checkboxes, extras and copy-as-text.
- **Dish catalogue**: about 25 starter Indian and Western dishes; create, edit, duplicate and favourite your own.
- **Nutrition**: calories, protein, carbs, fat, fiber, sugar, sodium, calcium, iron and vitamin C, compared with editable daily targets (FDA Daily Values for a 2000 kcal diet by default).
- **Your data stays in your browser** (localStorage), with JSON export/import for backups.

## Live app

https://sumeet14.github.io/meal-planner/

Each browser keeps its own data. To move your plan between devices, use Settings → Your data → Export backup, then Import backup on the other device.

## Getting started

```bash
npm install
npm run dev     # http://localhost:5173/meal-planner/
npm test        # unit tests for the nutrition and grocery logic
npm run build   # type-check and production build
```

## Nutrition data

Ingredient values are approximate per-100 g figures based on USDA FoodData Central and the Indian Food Composition Tables (IFCT 2017). They are rough estimates, not dietary advice. You can add or override ingredients in Settings.

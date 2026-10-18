import { useState } from 'react';
import { dishNutrients } from '../lib/nutrition';
import { uid, useIngredients, usePlanner } from '../store';
import type { Dish } from '../types';
import { Stepper } from './Controls';
import { ItemsEditor } from './ItemsEditor';
import { MacroSplit } from './MacroSplit';
import { Modal } from './Modal';

export function newDish(): Dish {
  return { id: uid(), name: '', servings: 1, items: [], tags: [], favorite: false };
}

/** Create or edit a catalogue dish. Calls onSaved with the saved dish. */
export function DishEditor({ initial, onClose, onSaved }: {
  initial: Dish;
  onClose: () => void;
  onSaved?: (dish: Dish) => void;
}) {
  const upsertDish = usePlanner((s) => s.upsertDish);
  const { map } = useIngredients();
  const [dish, setDish] = useState(initial);
  const [tagText, setTagText] = useState(initial.tags.join(', '));
  const perServing = dishNutrients(dish, map, 1);
  const valid = dish.name.trim() && dish.items.length > 0 && dish.servings > 0;

  const save = () => {
    const saved = {
      ...dish,
      name: dish.name.trim(),
      tags: tagText.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    };
    upsertDish(saved);
    onSaved?.(saved);
    onClose();
  };

  return (
    <Modal
      wide
      title={initial.name ? `Edit ${initial.name}` : 'New dish'}
      onClose={onClose}
      footer={
        <>
          {!valid && <span className="hint mr-auto">Add a name and at least one ingredient.</span>}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={!valid} onClick={save}>Save dish</button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name</span>
            <input
              autoFocus
              className="input w-full"
              placeholder="e.g. Masala oats"
              value={dish.name}
              onChange={(e) => setDish({ ...dish, name: e.target.value })}
            />
          </label>
          <div>
            <span className="mb-1 block text-sm font-medium">Recipe makes</span>
            <div className="flex items-center gap-2">
              <Stepper label="servings" value={dish.servings} min={1} onChange={(servings) => setDish({ ...dish, servings })} />
              <span className="text-sm text-ink-2">servings</span>
            </div>
          </div>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Tags</span>
            <input
              className="input w-full"
              placeholder="indian, breakfast, veg"
              value={tagText}
              onChange={(e) => setTagText(e.target.value)}
            />
            <span className="hint mt-1 block">Separate with commas. Tag a dish "breakfast", "lunch", "snack" or "dinner" to see it first in that slot.</span>
          </label>
        </div>

        <section>
          <h3 className="section-title">Ingredients</h3>
          <p className="hint mb-3 mt-1">Quantities for the whole recipe.</p>
          <ItemsEditor items={dish.items} onChange={(items) => setDish({ ...dish, items })} />
        </section>

        <section className="rounded-xl bg-sunk p-4">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="num font-display text-2xl font-semibold">{Math.round(perServing.kcal)}</span>
            <span className="text-sm text-ink-2">kcal per serving</span>
          </div>
          <MacroSplit nutrients={perServing} />
        </section>
      </div>
    </Modal>
  );
}

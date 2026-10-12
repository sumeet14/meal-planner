import { useState } from 'react';
import { dishNutrients } from '../lib/nutrition';
import { uid, useIngredients, usePlanner } from '../store';
import type { Dish } from '../types';
import { ItemsEditor } from './ItemsEditor';
import { MacroDonut } from './MacroDonut';
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
    <Modal wide title={initial.name ? `Edit ${initial.name}` : 'New dish'} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          autoFocus
          className="input"
          placeholder="Dish name"
          value={dish.name}
          onChange={(e) => setDish({ ...dish, name: e.target.value })}
        />
        <label className="flex items-center gap-1 text-sm text-slate-600">
          Recipe makes
          <input
            type="number" min={1} step={1}
            className="input w-16"
            value={dish.servings}
            onChange={(e) => setDish({ ...dish, servings: parseFloat(e.target.value) || 1 })}
          />
          servings
        </label>
        <input
          className="input sm:col-span-2"
          placeholder="Tags, comma separated (e.g. indian, breakfast, veg)"
          value={tagText}
          onChange={(e) => setTagText(e.target.value)}
        />
      </div>

      <h3 className="mb-2 mt-5 font-semibold">Ingredients (whole recipe)</h3>
      <ItemsEditor items={dish.items} onChange={(items) => setDish({ ...dish, items })} />

      <h3 className="mb-3 mt-5 font-semibold">Per serving</h3>
      <MacroDonut nutrients={perServing} size={130} />

      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary disabled:opacity-50" disabled={!valid} onClick={save}>Save dish</button>
      </div>
    </Modal>
  );
}

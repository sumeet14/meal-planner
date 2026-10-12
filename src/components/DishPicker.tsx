import { useMemo, useState } from 'react';
import { dishNutrients } from '../lib/nutrition';
import { useIngredients, usePlanner } from '../store';
import type { Dish } from '../types';
import { Modal } from './Modal';

/** Searchable list of catalogue dishes; favourites and dishes tagged for the slot come first. */
export function DishPicker({ title, slot, onPick, onCreate, onClose }: {
  title: string;
  slot?: string;
  onPick: (dish: Dish, servings: number) => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  const dishes = usePlanner((s) => s.dishes);
  const { map } = useIngredients();
  const [query, setQuery] = useState('');
  const [servings, setServings] = useState(1);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const score = (d: Dish) => (d.favorite ? 2 : 0) + (slot && d.tags.includes(slot) ? 1 : 0);
    return dishes
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q)))
      .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
  }, [dishes, query, slot]);

  return (
    <Modal title={title} onClose={onClose}>
      <div className="mb-3 flex gap-2">
        <input
          autoFocus
          className="input flex-1"
          placeholder="Search dishes or tags…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <label className="flex items-center gap-1 text-sm text-slate-600">
          Servings
          <input
            type="number" min={0.25} step={0.25}
            className="input w-16"
            value={servings}
            onChange={(e) => setServings(parseFloat(e.target.value) || 1)}
          />
        </label>
      </div>
      <ul className="divide-y divide-slate-100">
        {list.map((d) => {
          const n = dishNutrients(d, map, 1);
          return (
            <li key={d.id}>
              <button
                className="flex w-full items-center justify-between px-1 py-2 text-left hover:bg-emerald-50"
                onClick={() => onPick(d, servings)}
              >
                <span>
                  {d.favorite && <span className="mr-1 text-amber-500">★</span>}
                  {d.name}
                  <span className="ml-2 text-xs text-slate-400">{d.tags.join(', ')}</span>
                </span>
                <span className="text-xs text-slate-500">{Math.round(n.kcal)} kcal / serving</span>
              </button>
            </li>
          );
        })}
      </ul>
      <button className="btn-ghost mt-3 w-full justify-center border border-dashed border-slate-300" onClick={onCreate}>
        + Create a new dish
      </button>
    </Modal>
  );
}

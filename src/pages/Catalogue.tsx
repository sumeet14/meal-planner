import { useMemo, useState } from 'react';
import { DishEditor, newDish } from '../components/DishEditor';
import { dishNutrients } from '../lib/nutrition';
import { useIngredients, usePlanner } from '../store';
import type { Dish } from '../types';

export function Catalogue() {
  const { dishes, toggleFavorite, removeDish, meals } = usePlanner();
  const { map } = useIngredients();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Dish | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q)))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));
  }, [dishes, query]);

  const remove = (d: Dish) => {
    const used = meals.filter((m) => m.dishId === d.id).length;
    const msg = used
      ? `Delete "${d.name}"? It is used in ${used} planned meal(s), which will also be removed.`
      : `Delete "${d.name}"?`;
    if (confirm(msg)) removeDish(d.id);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-semibold">Dish catalogue</h1>
        <input className="input w-64" placeholder="Search dishes or tags…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn-primary" onClick={() => setEditing(newDish())}>+ New dish</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => {
          const n = dishNutrients(d, map, 1);
          return (
            <div key={d.id} className="card flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{d.name}</h2>
                <button
                  className={`text-xl leading-none ${d.favorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
                  onClick={() => toggleFavorite(d.id)}
                  aria-label={d.favorite ? 'Unfavourite' : 'Favourite'}
                >★</button>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {d.tags.map((t) => <span key={t} className="rounded bg-slate-100 px-1.5 text-xs text-slate-500">{t}</span>)}
              </div>
              <div className="mt-3 text-sm">
                <span className="font-medium">{Math.round(n.kcal)} kcal</span>
                <span className="text-slate-500"> per serving · P {Math.round(n.protein)}g · C {Math.round(n.carbs)}g · F {Math.round(n.fat)}g</span>
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {d.items.length} ingredients · makes {d.servings} serving{d.servings === 1 ? '' : 's'}
              </div>
              <div className="mt-auto flex justify-end gap-1 pt-3">
                <button className="btn-ghost" onClick={() => setEditing(d)}>Edit</button>
                <button className="btn-ghost" onClick={() => setEditing({ ...d, id: newDish().id, name: `${d.name} (copy)`, favorite: false })}>Duplicate</button>
                <button className="btn-danger" onClick={() => remove(d)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <DishEditor initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

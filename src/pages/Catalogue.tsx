import { useMemo, useState } from 'react';
import { SearchInput } from '../components/Controls';
import { DishEditor, newDish } from '../components/DishEditor';
import { Icon } from '../components/Icon';
import { dishNutrients } from '../lib/nutrition';
import { useIngredients, usePlanner } from '../store';
import type { Dish } from '../types';

const FAVOURITES = '★';

export function Catalogue() {
  const { dishes, toggleFavorite, removeDish, meals } = usePlanner();
  const { map } = useIngredients();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<Dish | null>(null);

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of dishes) for (const t of d.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t).slice(0, 10);
  }, [dishes]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes
      .filter((d) => !q || d.name.toLowerCase().includes(q) || d.tags.some((t) => t.includes(q)))
      .filter((d) => !tag || (tag === FAVOURITES ? d.favorite : d.tags.includes(tag)))
      .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));
  }, [dishes, query, tag]);

  const remove = (d: Dish) => {
    const used = meals.filter((m) => m.dishId === d.id).length;
    const msg = used
      ? `Delete "${d.name}"? It is in ${used} planned ${used === 1 ? 'meal' : 'meals'}, which will be removed too.`
      : `Delete "${d.name}"?`;
    if (confirm(msg)) removeDish(d.id);
  };

  const chip = (value: string | null, label: string) => (
    <button
      key={label}
      onClick={() => setTag(tag === value ? null : value)}
      aria-pressed={tag === value}
      className={`h-8 shrink-0 rounded-full border px-3 text-sm transition-colors ${
        tag === value ? 'border-ink bg-ink text-white' : 'border-line-strong bg-surface text-ink-2 hover:border-ink hover:text-ink'
      }`}
    >{label}</button>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <h1 className="page-title">Dishes</h1>
          <p className="mt-2 text-sm text-ink-2">{dishes.length} dishes you can plan. Nutrition is per serving.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing(newDish())}><Icon name="plus" size={16} />New dish</button>
      </div>

      <div className="mb-3"><SearchInput value={query} onChange={setQuery} placeholder="Search dishes or tags" /></div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {chip(null, 'All')}
        {chip(FAVOURITES, 'Favourites')}
        {tags.map((t) => chip(t, t))}
      </div>

      {list.length === 0 ? (
        <div className="panel px-6 py-10 text-center text-sm text-ink-2">
          No dishes match. <button className="font-medium text-ink underline" onClick={() => { setQuery(''); setTag(null); }}>Clear the search</button>
        </div>
      ) : (
        <ul className="panel divide-y divide-line">
          {list.map((d) => {
            const n = dishNutrients(d, map, 1);
            return (
              <li key={d.id} className="flex items-center gap-2 py-1 pl-2 pr-2 sm:pr-3">
                <button
                  className={`btn-icon ${d.favorite ? 'text-ink' : 'text-line-strong hover:text-ink-2'}`}
                  onClick={() => toggleFavorite(d.id)}
                  aria-pressed={d.favorite}
                  aria-label={`Favourite ${d.name}`}
                ><Icon name="star" filled={d.favorite} /></button>

                <button className="min-w-0 flex-1 py-2.5 text-left" onClick={() => setEditing(d)}>
                  <span className="block font-medium">{d.name}</span>
                  <span className="block truncate text-[13px] text-ink-3">
                    {d.tags.length ? d.tags.join(', ') : 'no tags'}
                    <span className="sm:hidden">, {d.items.length} {d.items.length === 1 ? 'ingredient' : 'ingredients'}</span>
                  </span>
                </button>

                <span className="num hidden w-24 shrink-0 text-right text-[13px] text-ink-3 sm:block">
                  {d.items.length} {d.items.length === 1 ? 'ingredient' : 'ingredients'}
                </span>
                <span className="num w-[7.5rem] shrink-0 text-right">
                  <span className="text-sm font-medium">{Math.round(n.kcal)} kcal</span>
                  <span className="block text-[13px] text-ink-3">
                    P {Math.round(n.protein)} C {Math.round(n.carbs)} F {Math.round(n.fat)}
                  </span>
                </span>

                <div className="flex shrink-0">
                  <button
                    className="btn-icon"
                    title="Duplicate"
                    aria-label={`Duplicate ${d.name}`}
                    onClick={() => setEditing({ ...d, id: newDish().id, name: `${d.name} (copy)`, favorite: false })}
                  ><Icon name="copy" size={17} /></button>
                  <button className="btn-icon hover:text-high" title="Delete" aria-label={`Delete ${d.name}`} onClick={() => remove(d)}>
                    <Icon name="trash" size={17} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && <DishEditor initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

import { useMemo, useState } from 'react';
import { dishNutrients } from '../lib/nutrition';
import { useIngredients, usePlanner } from '../store';
import type { Dish } from '../types';
import { SearchInput, Stepper } from './Controls';
import { Icon } from './Icon';
import { Modal } from './Modal';

/** Searchable list of catalogue dishes; favourites and dishes tagged for the slot come first. */
export function DishPicker({ title, subtitle, slot, onPick, onCreate, onClose }: {
  title: string;
  subtitle?: string;
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
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      footer={
        <button className="btn-secondary mr-auto" onClick={onCreate}>
          <Icon name="plus" size={16} />New dish
        </button>
      }
    >
      <div className="sticky top-0 z-10 -mx-5 mb-2 flex gap-2 bg-surface px-5 pb-3">
        <div className="flex-1">
          <SearchInput autoFocus value={query} onChange={setQuery} placeholder="Search dishes or tags" />
        </div>
        <Stepper label="servings" value={servings} onChange={setServings} step={0.5} min={0.25} />
      </div>
      {list.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-2">No dish matches "{query}". Create it as a new dish.</p>
      )}
      <ul className="-mx-2">
        {list.map((d) => {
          const n = dishNutrients(d, map, servings);
          return (
            <li key={d.id}>
              <button
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-sunk"
                onClick={() => onPick(d, servings)}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    {d.name}
                    {d.favorite && <Icon name="star" size={14} filled className="text-ink" aria-label="Favourite" />}
                  </span>
                  {d.tags.length > 0 && <span className="block truncate text-[13px] text-ink-3">{d.tags.join(', ')}</span>}
                </span>
                <span className="num shrink-0 text-sm text-ink-2">{Math.round(n.kcal)} kcal</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

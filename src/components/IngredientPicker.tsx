import { useMemo, useState } from 'react';
import { useIngredients } from '../store';
import type { Ingredient } from '../types';

/** Search box that lists matching ingredients and calls onPick for the chosen one. */
export function IngredientPicker({ onPick, placeholder = 'Add ingredient…' }: {
  onPick: (ing: Ingredient) => void;
  placeholder?: string;
}) {
  const { list } = useIngredients();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 50);
    return list.filter((i) => i.name.toLowerCase().includes(q) || i.id.includes(q)).slice(0, 50);
  }, [list, query]);

  const pick = (ing: Ingredient) => {
    onPick(ing);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        className="input w-full"
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && matches[0]) { e.preventDefault(); pick(matches[0]); }
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {open && (
        <ul className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white text-sm shadow-lg">
          {matches.length === 0 && (
            <li className="px-3 py-2 text-slate-400">No match. Add it under Settings → Ingredients.</li>
          )}
          {matches.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                className="flex w-full justify-between px-3 py-1.5 text-left hover:bg-emerald-50"
                onMouseDown={(e) => { e.preventDefault(); pick(i); }}
              >
                <span>{i.name}</span>
                <span className="text-xs text-slate-400">{i.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

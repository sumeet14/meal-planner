import { useMemo, useState } from 'react';
import { useIngredients } from '../store';
import type { Ingredient } from '../types';
import { Icon } from './Icon';

/** Search box that lists matching ingredients and calls onPick for the chosen one. */
export function IngredientPicker({ onPick, placeholder = 'Add an ingredient' }: {
  onPick: (ing: Ingredient) => void;
  placeholder?: string;
}) {
  const { list } = useIngredients();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

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
      <Icon name="plus" size={16} className="pointer-events-none absolute left-3 top-[10px] text-ink-3" />
      <input
        role="combobox" aria-expanded={open} aria-autocomplete="list"
        className="input w-full pl-9"
        placeholder={placeholder}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter' && matches[active]) { e.preventDefault(); pick(matches[active]); }
          if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); }
        }}
      />
      {open && (
        <ul role="listbox" className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-surface p-1 text-sm shadow-[0_8px_24px_rgba(29,43,40,0.14)]">
          {matches.length === 0 && (
            <li className="px-3 py-2 text-ink-2">No ingredient called "{query}". Add it in Settings under Ingredients.</li>
          )}
          {matches.map((i, idx) => (
            <li key={i.id} role="option" aria-selected={idx === active}>
              <button
                type="button" tabIndex={-1}
                className={`flex w-full justify-between rounded-lg px-3 py-2 text-left ${idx === active ? 'bg-sunk' : ''}`}
                onMouseEnter={() => setActive(idx)}
                onMouseDown={(e) => { e.preventDefault(); pick(i); }}
              >
                <span>{i.name}</span>
                <span className="text-ink-3">{i.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

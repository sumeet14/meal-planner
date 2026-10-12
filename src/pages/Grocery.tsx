import { useState } from 'react';
import { addDays, today } from '../lib/dates';
import { buildGroceryList, groceryListToText, type GroceryLine } from '../lib/grocery';
import { formatGrams, formatQty } from '../lib/units';
import { useDishMap, useIngredients, usePlanner } from '../store';

function lineAmount(l: GroceryLine): string {
  return l.unitTotal ? `${formatQty(l.unitTotal.qty, l.unitTotal.unit)} (≈ ${formatGrams(l.grams)})` : formatGrams(l.grams);
}

export function Grocery() {
  const {
    meals, planDays, groceryChecked, toggleGrocery, clearGroceryChecks,
    manualGrocery, addManualGrocery, removeManualGrocery,
  } = usePlanner();
  const dishes = useDishMap();
  const { map } = useIngredients();
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(addDays(today(), planDays - 1));
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const inRange = meals.filter((m) => m.date >= from && m.date <= to);
  const groups = buildGroceryList(inRange, dishes, map);
  const total = groups.reduce((n, g) => n + g.lines.length, 0) + manualGrocery.length;
  const done = groups.flatMap((g) => g.lines).filter((l) => groceryChecked[l.ingredientId]).length
    + manualGrocery.filter((i) => groceryChecked[i.id]).length;

  const copy = async () => {
    let text = groceryListToText(
      groups.map((g) => ({ ...g, lines: g.lines.filter((l) => !groceryChecked[l.ingredientId]) }))
        .filter((g) => g.lines.length),
      lineAmount,
    );
    const extra = manualGrocery.filter((i) => !groceryChecked[i.id]);
    if (extra.length) text += `\n\nEXTRAS\n${extra.map((i) => `- ${i.name}${i.note ? `: ${i.note}` : ''}`).join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-semibold">Grocery list</h1>
        <label className="text-sm text-slate-600">From <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="text-sm text-slate-600">To <input type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></label>
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
        <span className="mr-auto">
          {inRange.length} meals planned · {done}/{total} items checked
        </span>
        <button className="btn-ghost" onClick={clearGroceryChecks}>Uncheck all</button>
        <button className="btn-primary" onClick={copy}>{copied ? 'Copied!' : 'Copy as text'}</button>
      </div>

      {groups.length === 0 && manualGrocery.length === 0 && (
        <div className="card p-8 text-center text-slate-500">No meals planned in this date range yet.</div>
      )}

      <div className="space-y-4">
        {groups.map((g) => (
          <section key={g.category} className="card p-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">{g.category}</h2>
            <ul className="divide-y divide-slate-100">
              {g.lines.map((l) => {
                const checked = !!groceryChecked[l.ingredientId];
                return (
                  <li key={l.ingredientId} className="flex items-start gap-3 py-1.5">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 accent-emerald-600"
                      checked={checked}
                      onChange={() => toggleGrocery(l.ingredientId)}
                      aria-label={l.name}
                    />
                    <div className={`flex-1 ${checked ? 'text-slate-400 line-through' : ''}`}>
                      <div className="flex justify-between gap-2">
                        <span>{l.name}</span>
                        <span className="tabular-nums text-slate-600">{lineAmount(l)}</span>
                      </div>
                      <div className="text-xs text-slate-400">{l.usedIn.join(', ')}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <section className="card p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">Extras</h2>
          <ul className="divide-y divide-slate-100">
            {manualGrocery.map((i) => {
              const checked = !!groceryChecked[i.id];
              return (
                <li key={i.id} className="flex items-center gap-3 py-1.5">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-emerald-600"
                    checked={checked}
                    onChange={() => toggleGrocery(i.id)}
                    aria-label={i.name}
                  />
                  <span className={`flex-1 ${checked ? 'text-slate-400 line-through' : ''}`}>
                    {i.name} {i.note && <span className="text-slate-500">· {i.note}</span>}
                  </span>
                  <button className="btn-danger px-2" onClick={() => removeManualGrocery(i.id)} aria-label="Remove">✕</button>
                </li>
              );
            })}
          </ul>
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addManualGrocery(name.trim(), note.trim());
              setName('');
              setNote('');
            }}
          >
            <input className="input flex-1" placeholder="Add item (e.g. dish soap)" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input w-32" placeholder="Qty / note" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-primary" type="submit">Add</button>
          </form>
        </section>
      </div>
    </div>
  );
}

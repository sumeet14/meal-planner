import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Segmented } from '../components/Controls';
import { Icon } from '../components/Icon';
import { addDays, formatRange, today } from '../lib/dates';
import { buildGroceryList, groceryListToText, type GroceryLine } from '../lib/grocery';
import { formatGrams, formatQty } from '../lib/units';
import { useDishMap, useIngredients, usePlanner } from '../store';

function lineAmount(l: GroceryLine): string {
  return l.unitTotal ? `${formatQty(l.unitTotal.qty, l.unitTotal.unit)} (≈ ${formatGrams(l.grams)})` : formatGrams(l.grams);
}

type Span = 3 | 5 | 7 | 'custom';

function CheckRow({ checked, onToggle, children, aside }: {
  checked: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <label className="flex flex-1 cursor-pointer items-start gap-3">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onToggle} />
        <span
          className={`mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md border-[1.5px] transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink ${
            checked ? 'border-ok bg-ok text-white' : 'border-line-strong bg-surface'
          }`}
        >
          {checked && <Icon name="check" size={15} strokeWidth={2.5} />}
        </span>
        <span className={`min-w-0 flex-1 ${checked ? 'text-ink-3 line-through decoration-ink-3/60' : ''}`}>{children}</span>
      </label>
      {aside}
    </li>
  );
}

export function Grocery() {
  const {
    meals, planDays, groceryChecked, toggleGrocery, clearGroceryChecks,
    manualGrocery, addManualGrocery, removeManualGrocery,
  } = usePlanner();
  const dishes = useDishMap();
  const { map } = useIngredients();
  const [span, setSpan] = useState<Span>(planDays as Span);
  const [from, setFrom] = useState(today());
  const [customTo, setCustomTo] = useState(addDays(today(), planDays - 1));
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [copied, setCopied] = useState(false);

  const to = span === 'custom' ? customTo : addDays(from, span - 1);
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
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="mr-auto">
          <h1 className="page-title">Groceries</h1>
          <p className="mt-2 text-sm text-ink-2">
            For {inRange.length} {inRange.length === 1 ? 'meal' : 'meals'}, {formatRange(from, to < from ? from : to)}
          </p>
        </div>
        <button className="btn-primary" onClick={copy} disabled={total === done}>
          <Icon name={copied ? 'check' : 'copy'} size={16} />{copied ? 'Copied' : 'Copy list'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Segmented<Span>
          label="Shop for"
          value={span}
          onChange={setSpan}
          options={[
            { value: 3, label: '3 days' },
            { value: 5, label: '5 days' },
            { value: 7, label: '7 days' },
            { value: 'custom', label: 'Dates' },
          ]}
        />
        <label className="flex items-center gap-2 text-sm text-ink-2">
          from
          <input type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        {span === 'custom' && (
          <label className="flex items-center gap-2 text-sm text-ink-2">
            to
            <input type="date" className="input" value={customTo} min={from} onChange={(e) => setCustomTo(e.target.value)} />
          </label>
        )}
      </div>

      {total > 0 && (
        <div className="mb-6">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-medium">
              {total === done ? 'Everything is in the basket' : `${total - done} of ${total} left to buy`}
            </span>
            {done > 0 && <button className="text-ink-2 underline-offset-2 hover:text-ink hover:underline" onClick={clearGroceryChecks}>Uncheck all</button>}
          </div>
          <div className="h-1.5 rounded-full bg-ink/[0.07]">
            <div className="h-full rounded-full bg-ok transition-[width]" style={{ width: `${(done / total) * 100}%` }} />
          </div>
        </div>
      )}

      {groups.length === 0 && (
        <div className="panel mb-5 px-6 py-10 text-center">
          <p className="section-title">No meals planned for these dates</p>
          <p className="mt-1 text-sm text-ink-2">Plan some meals and their ingredients will be listed here, grouped by aisle.</p>
          <Link className="btn-secondary mt-5" to="/">Open the plan</Link>
        </div>
      )}

      <div className="space-y-5">
        {groups.map((g) => {
          const left = g.lines.filter((l) => !groceryChecked[l.ingredientId]).length;
          return (
            <section key={g.category} className="panel px-5 py-3">
              <h2 className="flex items-baseline justify-between pb-1 pt-1">
                <span className="section-title capitalize">{g.category}</span>
                <span className="text-[13px] text-ink-3">{left === 0 ? 'done' : `${left} left`}</span>
              </h2>
              <ul className="divide-y divide-line">
                {g.lines.map((l) => (
                  <CheckRow key={l.ingredientId} checked={!!groceryChecked[l.ingredientId]} onToggle={() => toggleGrocery(l.ingredientId)}>
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-medium">{l.name}</span>
                      <span className="num text-sm text-ink-2">{lineAmount(l)}</span>
                    </span>
                    <span className="mt-0.5 block text-[13px] text-ink-3">{l.usedIn.join(', ')}</span>
                  </CheckRow>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="panel px-5 py-3">
          <h2 className="section-title pb-1 pt-1">Extras</h2>
          <p className="hint">Anything else to pick up. Extras stay on the list whatever dates you choose.</p>
          {manualGrocery.length > 0 && (
            <ul className="mt-1 divide-y divide-line">
              {manualGrocery.map((i) => (
                <CheckRow
                  key={i.id}
                  checked={!!groceryChecked[i.id]}
                  onToggle={() => toggleGrocery(i.id)}
                  aside={
                    <button className="btn-icon -my-1.5 h-8 w-8 hover:text-high" onClick={() => removeManualGrocery(i.id)} aria-label={`Remove ${i.name}`}>
                      <Icon name="close" size={16} />
                    </button>
                  }
                >
                  <span className="font-medium">{i.name}</span>
                  {i.note && <span className="ml-2 text-sm text-ink-2">{i.note}</span>}
                </CheckRow>
              ))}
            </ul>
          )}
          <form
            className="my-3 flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              addManualGrocery(name.trim(), note.trim());
              setName('');
              setNote('');
            }}
          >
            <input className="input min-w-0 flex-[2]" aria-label="Item" placeholder="Dish soap" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input min-w-0 flex-1" aria-label="Quantity or note" placeholder="Qty or note" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-secondary" type="submit" disabled={!name.trim()}>Add</button>
          </form>
        </section>
      </div>
    </div>
  );
}

import { useRef, useState } from 'react';
import { IngredientPicker } from '../components/IngredientPicker';
import { DEFAULT_TARGETS } from '../data/targets';
import { emptyNutrients } from '../lib/nutrition';
import { pickData, uid, useIngredients, usePlanner, type PlannerData } from '../store';
import { CATEGORIES, NUTRIENT_KEYS, NUTRIENT_META, type Category, type Ingredient, type Unit } from '../types';

const WEIGHT_UNITS = ['piece', 'cup', 'tbsp', 'tsp'] as const satisfies readonly Exclude<Unit, 'g'>[];

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-line py-8 first:border-0 first:pt-0 md:grid-cols-[220px_1fr] md:gap-10">
      <div>
        <h2 className="section-title">{title}</h2>
        <p className="hint mt-1">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function Targets() {
  const { targets, setTargets } = usePlanner();
  return (
    <Section
      title="Daily targets"
      description="What a day of meals is measured against. Defaults are FDA Daily Values for a 2000 kcal adult diet."
    >
      <div className="panel grid gap-x-6 p-2 sm:grid-cols-2">
        {NUTRIENT_KEYS.map((k) => (
          <label key={k} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2">
            <span className="text-sm">
              {NUTRIENT_META[k].label}
              {NUTRIENT_META[k].goal === 'max' && <span className="hint ml-1.5">limit</span>}
              {NUTRIENT_META[k].goal === 'min' && <span className="hint ml-1.5">at least</span>}
            </span>
            <span className="relative">
              <input
                type="number" min={0}
                className="input num w-28 pr-12 text-right"
                value={targets[k]}
                onChange={(e) => setTargets({ ...targets, [k]: parseFloat(e.target.value) || 0 })}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-ink-3">{NUTRIENT_META[k].unit}</span>
            </span>
          </label>
        ))}
      </div>
      <button className="btn-ghost mt-3 -ml-3" onClick={() => setTargets(DEFAULT_TARGETS)}>Reset to 2000 kcal defaults</button>
    </Section>
  );
}

function blankIngredient(): Ingredient {
  return { id: `custom-${uid()}`, name: '', category: 'other', per100g: emptyNutrients(), unitWeights: {} };
}

function IngredientForm({ initial, onDone }: { initial: Ingredient; onDone: () => void }) {
  const upsertIngredient = usePlanner((s) => s.upsertIngredient);
  const [ing, setIng] = useState(initial);
  const num = (v: string) => parseFloat(v) || 0;
  const isNew = !initial.name;

  return (
    <div className="panel space-y-5 p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium">{isNew ? 'New ingredient' : `Edit ${initial.name}`}</h3>
        {!isNew && !initial.custom && <span className="hint">Saving keeps a copy you can revert later.</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <input autoFocus={isNew} className="input min-w-0 flex-1" aria-label="Name" placeholder="Name" value={ing.name} onChange={(e) => setIng({ ...ing, name: e.target.value })} />
        <select className="input capitalize" aria-label="Aisle" value={ing.category} onChange={(e) => setIng({ ...ing, category: e.target.value as Category })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-2">Nutrients per 100 g</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {NUTRIENT_KEYS.map((k) => (
            <label key={k} className="text-[13px] text-ink-2">
              {NUTRIENT_META[k].label} <span className="text-ink-3">{NUTRIENT_META[k].unit}</span>
              <input
                type="number" min={0} step="any"
                className="input num mt-1 w-full"
                value={ing.per100g[k]}
                onChange={(e) => setIng({ ...ing, per100g: { ...ing.per100g, [k]: num(e.target.value) } })}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-2">Grams in one… <span className="font-normal text-ink-3">(optional)</span></legend>
        <div className="grid grid-cols-4 gap-3">
          {WEIGHT_UNITS.map((u) => (
            <label key={u} className="text-[13px] text-ink-2">
              {u}
              <input
                type="number" min={0} step="any"
                className="input num mt-1 w-full"
                value={ing.unitWeights?.[u] ?? ''}
                onChange={(e) => {
                  const unitWeights = { ...ing.unitWeights };
                  if (e.target.value === '') delete unitWeights[u];
                  else unitWeights[u] = num(e.target.value);
                  setIng({ ...ing, unitWeights });
                }}
              />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onDone}>Cancel</button>
        <button
          className="btn-primary"
          disabled={!ing.name.trim()}
          onClick={() => { upsertIngredient({ ...ing, name: ing.name.trim() }); onDone(); }}
        >Save ingredient</button>
      </div>
    </div>
  );
}

function Ingredients() {
  const { customIngredients, removeCustomIngredient } = usePlanner();
  const { list } = useIngredients();
  const [editing, setEditing] = useState<Ingredient | null>(null);

  return (
    <Section
      title="Ingredients"
      description={`${list.length} ingredients with nutrition per 100\u00a0g. Add your own, or correct a built-in one.`}
    >
      <div className="flex gap-2">
        <div className="flex-1"><IngredientPicker placeholder="Find an ingredient to edit" onPick={(i) => setEditing(i)} /></div>
        <button className="btn-secondary" onClick={() => setEditing(blankIngredient())}>New</button>
      </div>
      {editing && <div className="mt-4"><IngredientForm key={editing.id} initial={editing} onDone={() => setEditing(null)} /></div>}

      {customIngredients.length > 0 && (
        <>
          <h3 className="mb-2 mt-6 text-sm font-medium text-ink-2">Added or changed by you</h3>
          <ul className="panel divide-y divide-line text-sm">
            {customIngredients.map((i) => {
              const own = i.id.startsWith('custom-');
              return (
                <li key={i.id} className="flex items-center gap-2 py-1 pl-4 pr-2">
                  <span className="flex-1 py-1.5">
                    <span className="font-medium">{i.name}</span>
                    <span className="num ml-2 text-ink-3">{i.per100g.kcal} kcal per 100 g</span>
                  </span>
                  <button className="btn-ghost h-8" onClick={() => setEditing(i)}>Edit</button>
                  <button
                    className="btn-danger h-8"
                    title={own ? undefined : 'Go back to the built-in values'}
                    onClick={() => removeCustomIngredient(i.id)}
                  >{own ? 'Delete' : 'Revert'}</button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Section>
  );
}

function Backup() {
  const { importData, resetAll } = usePlanner();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const data = JSON.stringify(pickData(usePlanner.getState()), null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    a.download = `meal-planner-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as PlannerData;
      if (!Array.isArray(data.dishes) || !Array.isArray(data.meals)) throw new Error('this file is not a meal planner backup');
      if (confirm('Replace all current data with this backup?')) importData(data);
    } catch (e) {
      alert(`Could not import: ${(e as Error).message}`);
    }
  };

  return (
    <Section
      title="Your data"
      description="Everything is saved in this browser only. Export a backup to keep it safe or move it to another device."
    >
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={exportJson}>Export backup</button>
        <button className="btn-secondary" onClick={() => fileRef.current?.click()}>Import backup</button>
        <input
          ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }}
        />
      </div>
      <div className="mt-6 rounded-xl border border-high/30 p-4">
        <h3 className="font-medium">Start over</h3>
        <p className="hint mb-3 mt-1">Erases all meals, dishes, ingredients and targets. This cannot be undone.</p>
        <button
          className="btn border border-high/40 text-high hover:bg-high/10"
          onClick={() => confirm('Erase all meals, dishes and settings and start fresh?') && resetAll()}
        >Erase everything</button>
      </div>
    </Section>
  );
}

export function Settings() {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="page-title mb-8">Settings</h1>
      <div>
        <Targets />
        <Ingredients />
        <Backup />
      </div>
    </div>
  );
}

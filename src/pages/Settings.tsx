import { useRef, useState } from 'react';
import { IngredientPicker } from '../components/IngredientPicker';
import { DEFAULT_TARGETS } from '../data/targets';
import { emptyNutrients } from '../lib/nutrition';
import { pickData, uid, useIngredients, usePlanner, type PlannerData } from '../store';
import { CATEGORIES, NUTRIENT_KEYS, NUTRIENT_META, type Category, type Ingredient, type Unit } from '../types';

const WEIGHT_UNITS = ['piece', 'cup', 'tbsp', 'tsp'] as const satisfies readonly Exclude<Unit, 'g'>[];

function Targets() {
  const { targets, setTargets } = usePlanner();
  return (
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Daily targets</h2>
        <button className="btn-ghost text-xs" onClick={() => setTargets(DEFAULT_TARGETS)}>Reset to 2000 kcal defaults</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {NUTRIENT_KEYS.map((k) => (
          <label key={k} className="flex items-center justify-between gap-2 text-sm">
            <span className="text-slate-600">
              {NUTRIENT_META[k].label}
              {NUTRIENT_META[k].goal !== 'range' && (
                <span className="ml-1 text-xs text-slate-400">({NUTRIENT_META[k].goal})</span>
              )}
            </span>
            <span className="flex items-center gap-1">
              <input
                type="number" min={0}
                className="input w-24 text-right"
                value={targets[k]}
                onChange={(e) => setTargets({ ...targets, [k]: parseFloat(e.target.value) || 0 })}
              />
              <span className="w-8 text-xs text-slate-400">{NUTRIENT_META[k].unit}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Defaults are FDA Daily Values for a 2000 kcal adult diet. Adjust them to suit your needs.
      </p>
    </section>
  );
}

function blankIngredient(): Ingredient {
  return { id: `custom-${uid()}`, name: '', category: 'other', per100g: emptyNutrients(), unitWeights: {} };
}

function IngredientForm({ initial, onDone }: { initial: Ingredient; onDone: () => void }) {
  const upsertIngredient = usePlanner((s) => s.upsertIngredient);
  const [ing, setIng] = useState(initial);
  const num = (v: string) => parseFloat(v) || 0;

  return (
    <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50/40 p-3">
      <div className="flex gap-2">
        <input className="input flex-1" placeholder="Name" value={ing.name} onChange={(e) => setIng({ ...ing, name: e.target.value })} />
        <select className="input" value={ing.category} onChange={(e) => setIng({ ...ing, category: e.target.value as Category })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <div className="mb-1 text-xs font-medium uppercase text-slate-500">Per 100 g</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {NUTRIENT_KEYS.map((k) => (
            <label key={k} className="text-xs text-slate-600">
              {NUTRIENT_META[k].label} ({NUTRIENT_META[k].unit})
              <input
                type="number" min={0} step="any"
                className="input mt-0.5 w-full"
                value={ing.per100g[k]}
                onChange={(e) => setIng({ ...ing, per100g: { ...ing.per100g, [k]: num(e.target.value) } })}
              />
            </label>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 text-xs font-medium uppercase text-slate-500">Grams per unit (optional)</div>
        <div className="grid grid-cols-4 gap-2">
          {WEIGHT_UNITS.map((u) => (
            <label key={u} className="text-xs text-slate-600">
              1 {u}
              <input
                type="number" min={0} step="any"
                className="input mt-0.5 w-full"
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
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onDone}>Cancel</button>
        <button
          className="btn-primary disabled:opacity-50"
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
    <section className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Ingredients <span className="text-sm font-normal text-slate-400">({list.length})</span></h2>
        <button className="btn-primary" onClick={() => setEditing(blankIngredient())}>+ New ingredient</button>
      </div>
      <div className="mb-3">
        <IngredientPicker placeholder="Find an ingredient to view or edit…" onPick={(i) => setEditing(i)} />
      </div>
      {editing && <IngredientForm key={editing.id} initial={editing} onDone={() => setEditing(null)} />}

      {customIngredients.length > 0 && (
        <>
          <h3 className="mb-1 mt-4 text-sm font-medium text-slate-500">Your custom and edited ingredients</h3>
          <ul className="divide-y divide-slate-100 text-sm">
            {customIngredients.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-1.5">
                <span>{i.name} <span className="text-xs text-slate-400">· {i.per100g.kcal} kcal/100g</span></span>
                <span>
                  <button className="btn-ghost text-xs" onClick={() => setEditing(i)}>Edit</button>
                  <button
                    className="btn-danger text-xs"
                    title={i.id.startsWith('custom-') ? 'Delete' : 'Revert to built-in values'}
                    onClick={() => removeCustomIngredient(i.id)}
                  >{i.id.startsWith('custom-') ? 'Delete' : 'Revert'}</button>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
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
      if (!Array.isArray(data.dishes) || !Array.isArray(data.meals)) throw new Error('Not a meal planner backup');
      if (confirm('Replace all current data with this backup?')) importData(data);
    } catch (e) {
      alert(`Could not import: ${(e as Error).message}`);
    }
  };

  return (
    <section className="card p-4">
      <h2 className="mb-3 font-semibold">Backup</h2>
      <p className="mb-3 text-sm text-slate-500">
        Your data is stored in this browser only. Export a backup to keep it safe or move it to another device.
      </p>
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={exportJson}>Export JSON</button>
        <button className="btn-ghost border border-slate-300" onClick={() => fileRef.current?.click()}>Import JSON</button>
        <input
          ref={fileRef} type="file" accept="application/json" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) importJson(f); e.target.value = ''; }}
        />
        <button
          className="btn-danger ml-auto border border-red-200"
          onClick={() => confirm('Erase all meals, dishes and settings and start fresh?') && resetAll()}
        >Reset everything</button>
      </div>
    </section>
  );
}

export function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <Targets />
      <Ingredients />
      <Backup />
    </div>
  );
}

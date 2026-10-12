import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DishEditor, newDish } from '../components/DishEditor';
import { DishPicker } from '../components/DishPicker';
import { MealCard } from '../components/MealCard';
import { MealDrawer } from '../components/MealDrawer';
import { NutrientBars } from '../components/NutrientBars';
import { addDays, dateRange, formatDay, today } from '../lib/dates';
import { dayTotals } from '../lib/nutrition';
import { useDishMap, useIngredients, usePlanner } from '../store';
import { SLOTS, type Slot } from '../types';

const SUMMARY_KEYS = ['kcal', 'protein', 'carbs', 'fat', 'fiber'] as const;

export function Planner() {
  const { meals, targets, planDays, setPlanDays, addMeal } = usePlanner();
  const dishes = useDishMap();
  const { map } = useIngredients();
  const [start, setStart] = useState(today());
  const [adding, setAdding] = useState<{ date: string; slot: Slot } | null>(null);
  const [creating, setCreating] = useState<{ date: string; slot: Slot } | null>(null);
  const [openMeal, setOpenMeal] = useState<string | null>(null);

  const days = dateRange(start, planDays);
  const todayIso = today();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-semibold">Meal plan</h1>
        <button className="btn-ghost" onClick={() => setStart(addDays(start, -planDays))}>← Prev</button>
        <button className="btn-ghost" onClick={() => setStart(todayIso)}>Today</button>
        <button className="btn-ghost" onClick={() => setStart(addDays(start, planDays))}>Next →</button>
        <select
          className="input"
          value={planDays}
          onChange={(e) => setPlanDays(Number(e.target.value))}
          aria-label="Days to show"
        >
          {[3, 5, 7].map((n) => <option key={n} value={n}>{n} days</option>)}
        </select>
      </div>

      <div className="overflow-x-auto pb-2">
        <div
          className="grid min-w-[720px] gap-3"
          style={{ gridTemplateColumns: `repeat(${planDays}, minmax(150px, 1fr))` }}
        >
          {days.map((date) => {
            const { weekday, label } = formatDay(date);
            const totals = dayTotals(meals, date, dishes, map);
            return (
              <div key={date} className={`card flex flex-col p-2 ${date === todayIso ? 'ring-2 ring-emerald-400' : ''}`}>
                <div className="mb-2 flex items-baseline justify-between px-1">
                  <div>
                    <div className="font-semibold">{weekday}</div>
                    <div className="text-xs text-slate-500">{label}</div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">{Math.round(totals.kcal)} kcal</span>
                </div>

                <div className="flex-1 space-y-2">
                  {SLOTS.map((slot) => {
                    const slotMeals = meals.filter((m) => m.date === date && m.slot === slot);
                    return (
                      <div key={slot}>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{slot}</span>
                          <button
                            className="rounded px-1.5 text-sm text-emerald-600 hover:bg-emerald-50"
                            aria-label={`Add ${slot} on ${label}`}
                            onClick={() => setAdding({ date, slot })}
                          >+</button>
                        </div>
                        <div className="space-y-1">
                          {slotMeals.map((m) => <MealCard key={m.id} meal={m} onOpen={() => setOpenMeal(m.id)} />)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to={`/day/${date}`}
                  className="mt-3 block rounded-md border-t border-slate-100 px-1 pt-2 hover:bg-slate-50"
                  title="See the full nutrient breakdown for this day"
                >
                  <NutrientBars compact totals={totals} targets={targets} keys={SUMMARY_KEYS} />
                  <div className="mt-1 text-right text-[11px] text-emerald-600">Details →</div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {adding && (
        <DishPicker
          title={`Add ${adding.slot}`}
          slot={adding.slot}
          onClose={() => setAdding(null)}
          onPick={(dish, servings) => { addMeal(adding.date, adding.slot, dish.id, servings); setAdding(null); }}
          onCreate={() => { setCreating(adding); setAdding(null); }}
        />
      )}
      {creating && (
        <DishEditor
          initial={{ ...newDish(), tags: [creating.slot] }}
          onClose={() => setCreating(null)}
          onSaved={(dish) => addMeal(creating.date, creating.slot, dish.id, 1)}
        />
      )}
      {openMeal && <MealDrawer mealId={openMeal} onClose={() => setOpenMeal(null)} />}
    </div>
  );
}

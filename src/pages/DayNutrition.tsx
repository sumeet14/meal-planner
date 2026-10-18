import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { MacroSplit } from '../components/MacroSplit';
import { MealDrawer } from '../components/MealDrawer';
import { NutrientBars, STATUS_TEXT, TargetBar } from '../components/NutrientBars';
import { addDays, formatDay, today } from '../lib/dates';
import { dayTotals, mealNutrients, percentOfTarget, targetStatus } from '../lib/nutrition';
import { round } from '../lib/units';
import { useDishMap, useIngredients, usePlanner } from '../store';
import { NUTRIENT_KEYS, NUTRIENT_META, SLOTS, type NutrientKey } from '../types';

const GROUPS: { title: string; keys: NutrientKey[] }[] = [
  { title: 'Macros', keys: ['protein', 'carbs', 'fat', 'fiber'] },
  { title: 'Limits', keys: ['sugar', 'sodium'] },
  { title: 'Minerals and vitamins', keys: ['calcium', 'iron', 'vitC'] },
];

function listJoin(words: string[]): string {
  return words.length < 2 ? words.join('') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

export function DayNutrition() {
  const { date = today() } = useParams();
  const { meals, targets } = usePlanner();
  const dishes = useDishMap();
  const { map } = useIngredients();
  const [openMeal, setOpenMeal] = useState<string | null>(null);

  const totals = dayTotals(meals, date, dishes, map);
  const pct = percentOfTarget(totals, targets);
  const dayMeals = meals
    .filter((m) => m.date === date)
    .sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot));
  const { weekdayLong, label } = formatDay(date);
  const isToday = date === today();

  const status = (k: NutrientKey) => targetStatus(pct[k], NUTRIENT_META[k].goal);
  const low = NUTRIENT_KEYS.filter((k) => k !== 'kcal' && status(k) === 'low').map((k) => NUTRIENT_META[k].label.toLowerCase());
  const high = NUTRIENT_KEYS.filter((k) => k !== 'kcal' && status(k) === 'high').map((k) => NUTRIENT_META[k].label.toLowerCase());
  const kcalStatus = status('kcal');

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-end gap-4">
        <div className="mr-auto">
          <p className="text-sm font-medium text-ink-2">{isToday ? `Today, ${label}` : label}</p>
          <h1 className="page-title mt-1">{weekdayLong}</h1>
        </div>
        <div className="flex">
          <Link className="btn-icon" to={`/day/${addDays(date, -1)}`} aria-label="Previous day"><Icon name="left" /></Link>
          <Link className="btn-icon" to={`/day/${addDays(date, 1)}`} aria-label="Next day"><Icon name="right" /></Link>
        </div>
      </div>

      {dayMeals.length === 0 ? (
        <div className="panel px-6 py-14 text-center">
          <p className="section-title">Nothing planned for {isToday ? 'today' : weekdayLong}</p>
          <p className="mt-1 text-sm text-ink-2">Add meals in the plan to see the day's nutrition here.</p>
          <Link className="btn-primary mt-5" to="/">Open the plan</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="space-y-5">
            <section className="panel p-5">
              <div className="flex items-baseline gap-2">
                <span className="num font-display text-5xl font-semibold tracking-tight">{Math.round(totals.kcal).toLocaleString()}</span>
                <span className="text-ink-2">of {targets.kcal.toLocaleString()} kcal</span>
              </div>
              <div className="mt-3"><TargetBar pct={pct.kcal} status={kcalStatus} /></div>
              <p className={`mt-2 text-sm font-medium ${STATUS_TEXT[kcalStatus]}`}>
                {kcalStatus === 'ok' ? 'Calories on track' : kcalStatus === 'low' ? 'Well under your calorie target' : 'Well over your calorie target'}
              </p>
              <h2 className="mb-3 mt-6 text-sm font-medium text-ink-2">Where the calories come from</h2>
              <MacroSplit nutrients={totals} />
            </section>

            {(low.length > 0 || high.length > 0) && (
              <section className="rounded-xl bg-sunk px-5 py-4 text-sm leading-relaxed">
                {low.length > 0 && <p><span className="font-medium text-low">Low on {listJoin(low)}.</span></p>}
                {high.length > 0 && <p><span className="font-medium text-high">Over on {listJoin(high)}.</span></p>}
              </section>
            )}

            <section className="panel p-5">
              <h2 className="section-title mb-2">Meals</h2>
              <ul className="-mx-2">
                {dayMeals.map((m) => {
                  const n = mealNutrients(m, dishes, map);
                  return (
                    <li key={m.id}>
                      <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-sunk" onClick={() => setOpenMeal(m.id)}>
                        <span className="w-20 shrink-0 text-[13px] capitalize text-ink-3">{m.slot}</span>
                        <span className="min-w-0 flex-1 truncate font-medium">{dishes[m.dishId]?.name ?? 'Deleted dish'}</span>
                        <span className="num shrink-0 text-right text-sm">
                          {Math.round(n.kcal)} kcal
                          <span className="block text-[13px] text-ink-3">{round(n.protein, 1)} g protein</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <section className="panel p-5">
            <h2 className="section-title">Against your daily targets</h2>
            <p className="hint mt-1">The tick marks each target. Bars run to 150% of it.</p>
            <div className="mt-5 space-y-7">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <h3 className="mb-3 text-sm font-medium text-ink-2">{g.title}</h3>
                  <NutrientBars totals={totals} targets={targets} keys={g.keys} />
                </div>
              ))}
            </div>
            <p className="hint mt-7 border-t border-line pt-4">
              On track means 70–130% for calories, carbs and fat, at least 70% for minimums, and under 100% for limits.
              Figures are rough estimates from raw ingredients. <Link className="underline hover:text-ink" to="/settings">Change targets</Link>
            </p>
          </section>
        </div>
      )}

      {openMeal && <MealDrawer mealId={openMeal} onClose={() => setOpenMeal(null)} />}
    </div>
  );
}

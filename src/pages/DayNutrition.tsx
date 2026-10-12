import { Link, useParams } from 'react-router-dom';
import { MacroDonut } from '../components/MacroDonut';
import { NutrientBars, STATUS_TEXT } from '../components/NutrientBars';
import { addDays, formatDay, today } from '../lib/dates';
import { dayTotals, mealNutrients, percentOfTarget, targetStatus } from '../lib/nutrition';
import { round } from '../lib/units';
import { useDishMap, useIngredients, usePlanner } from '../store';
import { NUTRIENT_KEYS, NUTRIENT_META, SLOTS } from '../types';

export function DayNutrition() {
  const { date = today() } = useParams();
  const { meals, targets } = usePlanner();
  const dishes = useDishMap();
  const { map } = useIngredients();

  const totals = dayTotals(meals, date, dishes, map);
  const pct = percentOfTarget(totals, targets);
  const dayMeals = meals
    .filter((m) => m.date === date)
    .sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot));
  const { weekday, label } = formatDay(date);

  const flags = NUTRIENT_KEYS
    .map((k) => ({ k, status: targetStatus(pct[k], NUTRIENT_META[k].goal) }))
    .filter((f) => f.status !== 'ok');

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="mr-auto text-2xl font-semibold">{weekday}, {label}</h1>
        <Link className="btn-ghost" to={`/day/${addDays(date, -1)}`}>← Prev day</Link>
        <Link className="btn-ghost" to={`/day/${addDays(date, 1)}`}>Next day →</Link>
      </div>

      {dayMeals.length === 0 ? (
        <div className="card p-8 text-center text-slate-500">
          Nothing planned for this day. <Link className="text-emerald-600 underline" to="/">Go to the planner</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-[1fr_1.3fr]">
          <div className="space-y-4">
            <section className="card p-4">
              <h2 className="mb-3 font-semibold">Macro split</h2>
              <MacroDonut nutrients={totals} />
            </section>

            <section className="card p-4">
              <h2 className="mb-2 font-semibold">Meals</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-slate-400">
                    <th className="font-medium">Meal</th>
                    <th className="text-right font-medium">kcal</th>
                    <th className="text-right font-medium">Protein</th>
                  </tr>
                </thead>
                <tbody>
                  {dayMeals.map((m) => {
                    const n = mealNutrients(m, dishes, map);
                    return (
                      <tr key={m.id} className="border-t border-slate-100">
                        <td className="py-1.5">
                          <div>{dishes[m.dishId]?.name ?? 'Deleted dish'}</div>
                          <div className="text-xs text-slate-400">{m.slot}</div>
                        </td>
                        <td className="text-right tabular-nums">{Math.round(n.kcal)}</td>
                        <td className="text-right tabular-nums">{round(n.protein, 1)} g</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>

            {flags.length > 0 && (
              <section className="card p-4">
                <h2 className="mb-2 font-semibold">Worth a look</h2>
                <ul className="space-y-1 text-sm">
                  {flags.map(({ k, status }) => (
                    <li key={k} className={STATUS_TEXT[status]}>
                      {NUTRIENT_META[k].label}: {status === 'low' ? 'below' : 'above'} target ({Math.round(pct[k])}%)
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <section className="card p-4">
            <h2 className="mb-3 font-semibold">Against daily targets</h2>
            <NutrientBars totals={totals} targets={targets} />
            <p className="mt-4 text-xs text-slate-400">
              Green means on track: within 70–130% for calories, carbs and fat; at least 70% for minimums; under 100% for limits.
              Values are rough estimates from raw ingredient data. Change targets in Settings.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

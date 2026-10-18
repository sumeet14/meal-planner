import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Segmented } from '../components/Controls';
import { DishEditor, newDish } from '../components/DishEditor';
import { DishPicker } from '../components/DishPicker';
import { Icon } from '../components/Icon';
import { MealCard } from '../components/MealCard';
import { MealDrawer } from '../components/MealDrawer';
import { TargetBar } from '../components/NutrientBars';
import { addDays, dateRange, formatDay, formatRange, today } from '../lib/dates';
import { dayTotals, targetStatus } from '../lib/nutrition';
import { useDishMap, useIngredients, usePlanner } from '../store';
import { SLOTS, type Nutrients, type Slot } from '../types';

const SLOT_LABEL: Record<Slot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', snack: 'Snack', dinner: 'Dinner' };
const GRID = 'md:grid-cols-[76px_repeat(4,minmax(0,1fr))_168px]';

function DateMark({ date, isToday }: { date: string; isToday: boolean }) {
  const { weekday, day } = formatDay(date);
  return (
    <div className="flex items-baseline gap-2 md:flex-col md:items-start md:gap-0">
      <span
        className={`font-display text-[2rem] font-semibold leading-none tracking-tight md:text-[2.5rem] ${
          isToday ? 'rounded-lg bg-turmeric px-1.5 md:-ml-1.5' : ''
        }`}
      >{day}</span>
      <span className="text-sm font-medium text-ink-2 md:mt-1.5">
        {isToday ? <span className="text-ink">Today</span> : weekday}
      </span>
    </div>
  );
}

function DayTotal({ date, totals, target }: { date: string; totals: Nutrients; target: number }) {
  const pct = target ? (totals.kcal / target) * 100 : 0;
  const status = targetStatus(pct, 'range');
  return (
    <Link
      to={`/day/${date}`}
      className="group block rounded-lg p-2 transition-colors hover:bg-sunk md:-m-2"
      aria-label={`Nutrition for ${formatDay(date).weekdayLong}`}
    >
      <div className="num flex items-baseline gap-1">
        <span className="font-display text-xl font-semibold">{Math.round(totals.kcal).toLocaleString()}</span>
        <span className="text-[13px] text-ink-3">/ {target.toLocaleString()} kcal</span>
      </div>
      <div className="mt-2"><TargetBar pct={pct} status={status} /></div>
      <div className="num mt-2 flex flex-wrap gap-x-2 text-[12px] text-ink-2 [&>span]:whitespace-nowrap">
        <span title="Protein"><span className="text-protein">●</span> P {Math.round(totals.protein)}g</span>
        <span title="Carbs"><span className="text-carbs">●</span> C {Math.round(totals.carbs)}g</span>
        <span title="Fat"><span className="text-fat">●</span> F {Math.round(totals.fat)}g</span>
      </div>
      <span className="mt-1.5 flex items-center gap-0.5 text-[13px] font-medium text-ink-2 group-hover:text-ink">
        Nutrition <Icon name="right" size={14} />
      </span>
    </Link>
  );
}

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
  const planned = meals.filter((m) => m.date >= days[0] && m.date <= days[days.length - 1]).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end gap-x-4 gap-y-4">
        <div className="mr-auto">
          <h1 className="page-title">{formatRange(days[0], days[days.length - 1])}</h1>
          <p className="mt-2 text-sm text-ink-2">
            {planned === 0 ? 'Nothing planned yet. Pick a slot to add a meal.' : `${planned} of ${planDays * SLOTS.length} slots planned`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center">
            <button className="btn-icon" onClick={() => setStart(addDays(start, -planDays))} aria-label="Earlier days">
              <Icon name="left" />
            </button>
            <button className="btn-ghost" onClick={() => setStart(todayIso)} disabled={start === todayIso}>Today</button>
            <button className="btn-icon" onClick={() => setStart(addDays(start, planDays))} aria-label="Later days">
              <Icon name="right" />
            </button>
          </div>
          <Segmented
            label="Days to show"
            value={planDays}
            onChange={setPlanDays}
            options={[3, 5, 7].map((n) => ({ value: n, label: `${n} days` }))}
          />
        </div>
      </div>

      <div className="panel overflow-hidden">
        <div className={`hidden border-b border-line bg-sunk px-5 py-2.5 text-[13px] font-medium text-ink-2 md:grid md:gap-4 ${GRID}`}>
          <span />
          {SLOTS.map((s) => <span key={s}>{SLOT_LABEL[s]}</span>)}
          <span>Day total</span>
        </div>

        {days.map((date) => {
          const totals = dayTotals(meals, date, dishes, map);
          const isToday = date === todayIso;
          return (
            <section
              key={date}
              aria-label={formatDay(date).weekdayLong}
              className={`grid gap-3 border-b border-line px-4 py-4 last:border-0 md:gap-4 md:px-5 md:py-5 ${GRID} ${
                isToday ? 'bg-turmeric-soft/40' : ''
              }`}
            >
              <div className="flex items-center justify-between md:block">
                <DateMark date={date} isToday={isToday} />
                <Link to={`/day/${date}`} className="num flex items-center gap-1 text-sm text-ink-2 md:hidden">
                  {Math.round(totals.kcal).toLocaleString()} kcal <Icon name="right" size={14} />
                </Link>
              </div>

              {SLOTS.map((slot) => {
                const slotMeals = meals.filter((m) => m.date === date && m.slot === slot);
                return (
                  <div key={slot} className="grid grid-cols-[76px_1fr] items-start gap-2 md:block md:space-y-1.5">
                    <span className="pt-2 text-[13px] font-medium text-ink-3 md:hidden">{SLOT_LABEL[slot]}</span>
                    <div className="space-y-1.5">
                      {slotMeals.map((m) => <MealCard key={m.id} meal={m} onOpen={() => setOpenMeal(m.id)} />)}
                      <button
                        onClick={() => setAdding({ date, slot })}
                        aria-label={`Add ${slot} on ${formatDay(date).weekdayLong}`}
                        className={`flex w-full items-center gap-1.5 rounded-lg border border-dashed border-line-strong text-ink-3 transition-colors hover:border-ink hover:bg-surface hover:text-ink ${
                          slotMeals.length ? 'h-8 justify-center border-transparent text-[13px]' : 'h-12 px-3 text-sm md:h-[3.75rem] md:justify-center'
                        }`}
                      >
                        <Icon name="plus" size={15} />
                        {slotMeals.length ? 'Add' : <span className="md:sr-only">Add {slot}</span>}
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="hidden md:block">
                <DayTotal date={date} totals={totals} target={targets.kcal} />
              </div>
            </section>
          );
        })}
      </div>

      {adding && (
        <DishPicker
          title={`Add ${adding.slot}`}
          subtitle={formatDay(adding.date).weekdayLong + ', ' + formatDay(adding.date).label}
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

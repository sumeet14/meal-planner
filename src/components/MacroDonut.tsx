import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { macroSplit } from '../lib/nutrition';
import { round } from '../lib/units';
import type { Nutrients } from '../types';

export const MACRO_COLORS = { protein: '#0ea5e9', carbs: '#f59e0b', fat: '#a855f7' };

/** Donut of the share of calories coming from protein, carbs and fat. */
export function MacroDonut({ nutrients, size = 160 }: { nutrients: Nutrients; size?: number }) {
  const split = macroSplit(nutrients);
  const data = [
    { key: 'protein', name: 'Protein', grams: nutrients.protein, value: split.protein },
    { key: 'carbs', name: 'Carbs', grams: nutrients.carbs, value: split.carbs },
    { key: 'fat', name: 'Fat', grams: nutrients.fat, value: split.fat },
  ] as const;

  return (
    <div className="flex items-center gap-4">
      <div style={{ width: size, height: size }} className="relative shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data.map((d) => ({ ...d }))}
              dataKey="value"
              innerRadius="62%"
              outerRadius="100%"
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => <Cell key={d.key} fill={MACRO_COLORS[d.key]} />)}
            </Pie>
            <Tooltip formatter={(v: number) => `${Math.round(v)}% of kcal`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold">{Math.round(nutrients.kcal)}</span>
          <span className="text-xs text-slate-500">kcal</span>
        </div>
      </div>
      <ul className="min-w-0 space-y-1 text-sm">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-2 whitespace-nowrap">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: MACRO_COLORS[d.key] }} />
            <span className="w-14 text-slate-600">{d.name}</span>
            <span className="font-medium">{round(d.grams, 1)} g</span>
            <span className="text-slate-400">· {Math.round(d.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

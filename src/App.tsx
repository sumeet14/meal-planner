import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { today } from './lib/dates';
import { Catalogue } from './pages/Catalogue';
import { DayNutrition } from './pages/DayNutrition';
import { Grocery } from './pages/Grocery';
import { Planner } from './pages/Planner';
import { Settings } from './pages/Settings';

const NAV = [
  { to: '/', label: 'Plan', end: true },
  { to: `/day/${today()}`, label: 'Nutrition', match: '/day' },
  { to: '/grocery', label: 'Groceries' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/settings', label: 'Settings' },
];

export default function App() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2">
          <span className="mr-4 shrink-0 font-semibold text-emerald-700">🥗 Meal Planner</span>
          {NAV.map((n) => (
            <NavLink
              key={n.label}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `shrink-0 rounded-md px-3 py-1.5 text-sm ${
                  isActive || (n.match && pathname.startsWith(n.match))
                    ? 'bg-emerald-50 font-medium text-emerald-700'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Planner />} />
          <Route path="/day/:date" element={<DayNutrition />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

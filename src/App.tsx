import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Icon, type IconName } from './components/Icon';
import { today } from './lib/dates';
import { Catalogue } from './pages/Catalogue';
import { DayNutrition } from './pages/DayNutrition';
import { Grocery } from './pages/Grocery';
import { Planner } from './pages/Planner';
import { Settings } from './pages/Settings';

const NAV: { to: string; label: string; icon: IconName; end?: boolean; match?: string }[] = [
  { to: '/', label: 'Plan', icon: 'plan', end: true },
  { to: `/day/${today()}`, label: 'Nutrition', icon: 'nutrition', match: '/day' },
  { to: '/grocery', label: 'Groceries', icon: 'grocery' },
  { to: '/dishes', label: 'Dishes', icon: 'dishes' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

export default function App() {
  const { pathname } = useLocation();
  const active = (n: (typeof NAV)[number], isActive: boolean) => isActive || (!!n.match && pathname.startsWith(n.match));

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink">
              <span className="h-3.5 w-3.5 rounded-full bg-turmeric" />
            </span>
            Meal planner
          </NavLink>
          <nav className="hidden h-full items-stretch gap-1 md:flex" aria-label="Main">
            {NAV.map((n) => (
              <NavLink
                key={n.label} to={n.to} end={n.end}
                className={({ isActive }) =>
                  `relative flex items-center px-3 text-sm font-medium transition-colors ${
                    active(n, isActive)
                      ? 'text-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-ink'
                      : 'text-ink-2 hover:text-ink'
                  }`
                }
              >{n.label}</NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-16 md:pt-8">
        <Routes>
          <Route path="/" element={<Planner />} />
          <Route path="/day/:date" element={<DayNutrition />} />
          <Route path="/grocery" element={<Grocery />} />
          <Route path="/dishes" element={<Catalogue />} />
          <Route path="/catalogue" element={<Navigate to="/dishes" replace />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Main"
      >
        <div className="grid grid-cols-5">
          {NAV.map((n) => (
            <NavLink
              key={n.label} to={n.to} end={n.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-medium ${
                  active(n, isActive) ? 'text-ink' : 'text-ink-3'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`grid h-7 w-12 place-items-center rounded-full ${active(n, isActive) ? 'bg-ink/[0.07]' : ''}`}>
                    <Icon name={n.icon} size={20} />
                  </span>
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

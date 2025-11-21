import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Simulador simples' },
  { to: '/fixos', label: 'Simulador com números fixos' },
  { to: '/estrategias', label: 'Laboratório de estratégias' },
  { to: '/resultados', label: 'Resultados / Conferência' },
  { to: '/config', label: 'Configurações' },
];

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-950/70 px-4 py-6 shadow">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-white">Simulador Lotofácil</h1>
          <nav className="flex flex-wrap gap-2 text-sm">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 font-semibold transition ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;

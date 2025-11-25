import { NavLink, Outlet } from "react-router-dom";

type IconProps = {
  className?: string;
};

const GridIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className ?? ""}`}
  >
    <rect x="3" y="3" width="7.5" height="7.5" rx="1.4" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.4" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.4" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.4" />
  </svg>
);



const FlaskIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className ?? ""}`}
  >
    <path d="M9 3v4.5L4.4 14a4 4 0 003.4 6h8.4a4 4 0 003.4-6L15 7.5V3" />
    <path d="M9 13h6" />
  </svg>
);

const ChartIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className ?? ""}`}
  >
    <path d="M4 19h16" />
    <path d="M7 15l4-5 4 4 4-6" />
    <circle cx="7" cy="15" r="0.8" />
    <circle cx="11" cy="10" r="0.8" />
    <circle cx="15" cy="14" r="0.8" />
    <circle cx="19" cy="8" r="0.8" />
  </svg>
);

const CogIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className ?? ""}`}
  >
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20M6.2 6.2l1.7 1.7M16.1 16.1l1.7 1.7M17.8 6.2l-1.7 1.7M8.9 16.1l-1.7 1.7" />
  </svg>
);

const HelpIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className ?? ""}`}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-1.75 2.1-2 3.4v1" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const DashboardIcon = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className ?? ""}`}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
);


const links = [
    {
    to: "/dashboard",
    label: "Dashboard",
    description: "Visualize graficos e estatisticas dos resultados.",
    Icon: DashboardIcon,
  },
  {
    to: "/",
    label: "Simulador simples",
    description: "Monte jogos de 15 a 18 dezenas rapidamente.",
    Icon: GridIcon,
  },

  {
    to: "/estrategias",
    label: "Laboratorio de estrategias",
    description: "Aplique filtros avancados e crie estrategias.",
    Icon: FlaskIcon,
  },

  {
    to: "/resultados",
    label: "Resultados / Conferencia",
    description: "Conferir apostas salvas e estatisticas.",
    Icon: ChartIcon,
  },
  {
    to: "/config",
    label: "Configuracoes",
    description: "Importe planilhas e gerencie os dados locais.",
    Icon: CogIcon,
  },
  {
    to: "/impressao-volante",
    label: "Imprimir Volante",
    description: "Imprima o volante oficial com a combinação salva.",
    Icon: GridIcon,
  },
  {
    to: "/ajuda",
    label: "Ajuda / Tutorial",
    description: "Veja o passo a passo completo e dicas em PDF.",
    Icon: HelpIcon,
  },
];

export function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <aside className="hidden flex-shrink-0 flex-col border-r border-slate-800 bg-slate-950 p-6 md:fixed md:inset-y-0 md:flex md:h-screen md:w-72">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Lotofacil
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white">Simulador</h1>
          <p className="text-sm text-slate-400">
            Planeje apostas, teste estrategias e acompanhe resultados.
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `group rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500/15 text-white shadow-inner shadow-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-800/70"
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-start gap-3">
                  <item.Icon
                    className={`h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-emerald-300"
                    }`}
                  />
                  <div className="space-y-0.5">
                    <p className="text-base font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
          <p className="font-semibold text-white">Precisa de ajuda?</p>
          <p className="mt-1 text-xs text-slate-400">
            Consulte o tutorial completo com fluxos e dicas de PDF.
          </p>
          <NavLink
            to="/ajuda"
            className="mt-3 inline-flex items-center text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            Abrir ajuda →
          </NavLink>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-72">
        <header className="border-b border-slate-800 bg-slate-950/80 px-4 py-4 shadow md:hidden">
          <h1 className="text-xl font-semibold text-white">
            Simulador Lotofacil
          </h1>
          <nav className="mt-3 flex flex-wrap gap-2">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

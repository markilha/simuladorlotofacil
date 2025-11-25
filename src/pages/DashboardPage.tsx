import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  carregarResultadosDaConfiguracao,
  type ConcursoExcel,
} from "../utils/resultadosExcel";
import {
  calcularProbabilidadeCondicional,
  analisarCicloDasDezenas,
} from "../services/strategyEngine";
import type { Dezena } from "../types";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

export function DashboardPage() {
  const navigate = useNavigate();

  const historico = useMemo<ConcursoExcel[]>(() => {
    try {
      return carregarResultadosDaConfiguracao();
    } catch {
      return [];
    }
  }, []);

  // Cálculo de frequências
  const frequenciasData = useMemo(() => {
    if (!historico.length) return [];

    const frequencias: Record<Dezena, number> = {} as Record<Dezena, number>;

    for (let i = 1; i <= 25; i++) {
      frequencias[i as Dezena] = 0;
    }

    historico.forEach((concurso) => {
      concurso.dezenas.forEach((dezena) => {
        frequencias[dezena] = (frequencias[dezena] || 0) + 1;
      });
    });

    return Array.from({ length: 25 }, (_, i) => {
      const dezena = (i + 1) as Dezena;
      return {
        numero: dezena.toString().padStart(2, "0"),
        frequencia: frequencias[dezena],
      };
    }).sort((a, b) => b.frequencia - a.frequencia);
  }, [historico]);

  // Top 10 mais frequentes
  const top10Frequentes = useMemo(
    () => frequenciasData.slice(0, 10),
    [frequenciasData]
  );

  // Top 10 menos frequentes
  const top10MenosFrequentes = useMemo(
    () => frequenciasData.slice(-10).reverse(),
    [frequenciasData]
  );

  // Probabilidades condicionais
  const probabilidadesData = useMemo(() => {
    if (!historico.length) return [];

    const probs = calcularProbabilidadeCondicional(historico);
    return probs
      .map((p) => ({
        numero: p.dezena.toString().padStart(2, "0"),
        depoisDeSair: (p.probDepoisDeSair * 100).toFixed(2),
        depoisDeNaoSair: (p.probDepoisDeNaoSair * 100).toFixed(2),
      }))
      .slice(0, 15);
  }, [historico]);

  // Análise de Pares e Ímpares
  const paresImparesData = useMemo(() => {
    if (!historico.length) return [];

    const distribuicao: Record<number, number> = {};

    historico.forEach((concurso) => {
      const pares = concurso.dezenas.filter((d) => d % 2 === 0).length;
      distribuicao[pares] = (distribuicao[pares] || 0) + 1;
    });

    return Object.entries(distribuicao)
      .map(([pares, quantidade]) => ({
        pares: `${pares} pares`,
        quantidade,
        percentual: ((quantidade / historico.length) * 100).toFixed(1),
      }))
      .sort((a, b) => parseInt(a.pares) - parseInt(b.pares));
  }, [historico]);

  // Análise do Ciclo das Dezenas
  const cicloData = useMemo(() => {
    if (!historico.length) return null;

    try {
      const ciclo = analisarCicloDasDezenas(historico);
      return {
        faltantes: ciclo.dezenasFaltantes.length,
        concursosNoCiclo: ciclo.concursosNoCiclo,
        mediaHistorica: ciclo.mediaHistorica?.toFixed(1) || "N/A",
        estimativaRestante: ciclo.estimativaConcursosRestantes || 0,
      };
    } catch {
      return null;
    }
  }, [historico]);

  // Dados para gráfico de radar (últimos 5 concursos)
  const ultimosConcursosRadar = useMemo(() => {
    if (!historico.length) return [];

    const ultimos = historico.slice(-5);
    return ultimos.map((concurso) => {
      const pares = concurso.dezenas.filter((d) => d % 2 === 0).length;
      const soma = concurso.dezenas.reduce((acc, d) => acc + d, 0);
      const baixos = concurso.dezenas.filter((d) => d <= 13).length;

      return {
        concurso: `#${concurso.concurso}`,
        pares,
        impares: 15 - pares,
        baixos,
        altos: 15 - baixos,
        soma: Math.round(soma / 10),
      };
    });
  }, [historico]);

  // Gráfico de pizza para ciclo
  const cicloPieData = useMemo(() => {
    if (!cicloData) return [];

    return [
      {
        name: "Dezenas Sorteadas",
        value: 25 - cicloData.faltantes,
        color: COLORS[0],
      },
      {
        name: "Dezenas Faltantes",
        value: cicloData.faltantes,
        color: COLORS[3],
      },
    ];
  }, [cicloData]);

  // Análise de Linhas e Colunas
  const linhasColunasData = useMemo(() => {
    if (!historico.length) return null;

    const linhasStats = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      total: 0,
      distribuicao: [0, 0, 0, 0, 0, 0], // 0 a 5 dezenas
    }));

    const colunasStats = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      total: 0,
      distribuicao: [0, 0, 0, 0, 0, 0], // 0 a 5 dezenas
    }));

    historico.forEach((concurso) => {
      const countsLinha = [0, 0, 0, 0, 0];
      const countsColuna = [0, 0, 0, 0, 0];

      concurso.dezenas.forEach((d) => {
        const linhaIdx = Math.ceil(d / 5) - 1;
        const colunaIdx = (d - 1) % 5;
        countsLinha[linhaIdx]++;
        countsColuna[colunaIdx]++;
      });

      countsLinha.forEach((count, idx) => {
        linhasStats[idx].total += count;
        linhasStats[idx].distribuicao[count]++;
      });

      countsColuna.forEach((count, idx) => {
        colunasStats[idx].total += count;
        colunasStats[idx].distribuicao[count]++;
      });
    });

    return {
      linhas: linhasStats.map((l) => ({
        ...l,
        media: (l.total / historico.length).toFixed(2),
      })),
      colunas: colunasStats.map((c) => ({
        ...c,
        media: (c.total / historico.length).toFixed(2),
      })),
    };
  }, [historico]);

  if (!historico.length) {
    return (
      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-slate-400">
            Visualize estatísticas e análises dos resultados da Lotofácil
          </p>
        </header>

        <div className="rounded-2xl border border-amber-800/60 bg-amber-950/30 p-6 text-center">
          <p className="mb-4 text-lg font-semibold text-amber-300">
            Nenhuma planilha carregada
          </p>
          <p className="mb-6 text-sm text-slate-400">
            Carregue a planilha oficial para visualizar os gráficos e
            estatísticas
          </p>
          <button
            onClick={() => navigate("/config")}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-slate-900 hover:bg-emerald-600"
          >
            Ir para Configurações
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-slate-400">
          Análise visual de {historico.length} concursos da Lotofácil
        </p>
      </header>

      {/* Cards de Resumo */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-emerald-950/50 to-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Total de Concursos
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-400">
            {historico.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-blue-950/50 to-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Mais Frequente
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-400">
            {top10Frequentes[0]?.numero || "—"}
          </p>
          <p className="text-xs text-slate-500">
            {top10Frequentes[0]?.frequencia || 0}x
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-orange-950/50 to-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Menos Frequente
          </p>
          <p className="mt-2 text-3xl font-bold text-orange-400">
            {top10MenosFrequentes[0]?.numero || "—"}
          </p>
          <p className="text-xs text-slate-500">
            {top10MenosFrequentes[0]?.frequencia || 0}x
          </p>
        </div>

        {cicloData && (
          <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-purple-950/50 to-slate-900/50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">
              Ciclo Atual
            </p>
            <p className="mt-2 text-3xl font-bold text-purple-400">
              {cicloData.faltantes}
            </p>
            <p className="text-xs text-slate-500">dezenas faltando</p>
          </div>
        )}
      </div>

      {/* Gráfico de Frequência dos Números */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Top 10 Números Mais Frequentes
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10Frequentes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="numero" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="frequencia" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Números Menos Frequentes */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Top 10 Números Menos Frequentes
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top10MenosFrequentes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="numero" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="frequencia" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grid com 2 colunas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Probabilidades Condicionais */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Probabilidades Condicionais (Top 15)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={probabilidadesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="numero" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="depoisDeSair"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Depois de Sair (%)"
              />
              <Line
                type="monotone"
                dataKey="depoisDeNaoSair"
                stroke="#ec4899"
                strokeWidth={2}
                name="Depois de Não Sair (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição Pares/Ímpares */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Distribuição de Pares por Concurso
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={paresImparesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="pares" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="quantidade" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Análise de Linhas e Colunas */}
      {linhasColunasData && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tabela de Linhas */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Distribuição nas Linhas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase text-slate-400 bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Linha</th>
                    <th className="px-4 py-3">Média</th>
                    <th className="px-4 py-3 text-center" colSpan={6}>
                      Distr. (0 a 5 dezenas)
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-1"></th>
                    <th className="px-4 py-1"></th>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <th
                        key={n}
                        className="px-2 py-1 text-center text-[10px] text-slate-500"
                      >
                        {n}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhasColunasData.linhas.map((linha) => (
                    <tr
                      key={linha.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        Linha {linha.id}
                      </td>
                      <td className="px-4 py-3 text-emerald-400">
                        {linha.media}
                      </td>
                      {linha.distribuicao.map((qtd, idx) => (
                        <td key={idx} className="px-2 py-3 text-center">
                          <div
                            className="flex flex-col items-center justify-center"
                            title={`${qtd} concursos`}
                          >
                            <span
                              className={`text-xs ${
                                qtd > 0 ? "text-slate-300" : "text-slate-700"
                              }`}
                            >
                              {((qtd / historico.length) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabela de Colunas */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Distribuição nas Colunas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs uppercase text-slate-400 bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Coluna</th>
                    <th className="px-4 py-3">Média</th>
                    <th className="px-4 py-3 text-center" colSpan={6}>
                      Distr. (0 a 5 dezenas)
                    </th>
                  </tr>
                  <tr>
                    <th className="px-4 py-1"></th>
                    <th className="px-4 py-1"></th>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <th
                        key={n}
                        className="px-2 py-1 text-center text-[10px] text-slate-500"
                      >
                        {n}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhasColunasData.colunas.map((coluna) => (
                    <tr
                      key={coluna.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 font-medium text-white">
                        Coluna {coluna.id}
                      </td>
                      <td className="px-4 py-3 text-blue-400">
                        {coluna.media}
                      </td>
                      {coluna.distribuicao.map((qtd, idx) => (
                        <td key={idx} className="px-2 py-3 text-center">
                          <div
                            className="flex flex-col items-center justify-center"
                            title={`${qtd} concursos`}
                          >
                            <span
                              className={`text-xs ${
                                qtd > 0 ? "text-slate-300" : "text-slate-700"
                              }`}
                            >
                              {((qtd / historico.length) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grid com Radar e Pizza */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico Radar - Últimos 5 Concursos */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            Análise dos Últimos 5 Concursos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={ultimosConcursosRadar}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="concurso" stroke="#94a3b8" />
              <PolarRadiusAxis stroke="#94a3b8" />
              <Radar
                name="Pares"
                dataKey="pares"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Radar
                name="Baixos (1-13)"
                dataKey="baixos"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pizza - Ciclo das Dezenas */}
        {cicloData && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Ciclo das Dezenas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cicloPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cicloPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-slate-300">
                <span className="font-semibold text-white">
                  Concursos no ciclo:
                </span>{" "}
                {cicloData.concursosNoCiclo}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold text-white">
                  Média histórica:
                </span>{" "}
                {cicloData.mediaHistorica} concursos
              </p>
              <p className="text-slate-300">
                <span className="font-semibold text-white">
                  Estimativa restante:
                </span>{" "}
                ~{cicloData.estimativaRestante} concursos
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default DashboardPage;

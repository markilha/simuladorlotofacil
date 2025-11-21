import { useEffect, useMemo, useState } from "react";
import NumberGrid from "../components/NumberGrid";
import BetCardPreview from "../components/BetCardPreview";
import { saveManyBets } from "../storage/betsStorage";
import type { Aposta, Dezena } from "../types";
import { createId } from "../utils/id";
import {
  carregarResultadosDaConfiguracao,
  type ConcursoExcel,
} from "../utils/resultadosExcel";
import {
  analisarCicloDasDezenas,
  calcularMetricasJogo,
  calcularProbabilidadeCondicional,
  criarDesdobramentoInteligente,
  criarEstrategiaComFixas,
  criarFechamentoGarantido,
  criarEstrategiaFechamentoDoCiclo,
  estrategiaNumerosFrequentesEAtrasados,
  gerarJogosBalanceados,
  type CondProbabilities,
  type CycleProgressInfo,
  type GuaranteeLevel,
  type RangeConstraint,
  type StatisticalFilterOptions,
  type StrategyMetadata,
} from "../services/strategyEngine";

type StrategyMode =
  | "fixas"
  | "fechamento"
  | "desdobramento"
  | "balanceado"
  | "frequencia"
  | "ciclo";

const criarIntervalosPadrao = () =>
  Array.from({ length: 5 }, () => ({} as RangeConstraint));

const possuiIntervalo = (range?: RangeConstraint) =>
  Boolean(range && (range.min !== undefined || range.max !== undefined));

const possuiIntervalos = (ranges: RangeConstraint[]) =>
  ranges.some((range) => possuiIntervalo(range));

const parseNumero = (value: string): number | undefined => {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const formatarLista = (numeros: Dezena[]) =>
  numeros.map((n) => n.toString().padStart(2, "0")).join(", ");

const formatarOuHifen = (lista?: Dezena[]) =>
  lista && lista.length ? formatarLista(lista) : "Nenhuma";

export function StrategyLabPage() {
  const [strategyMode, setStrategyMode] = useState<StrategyMode>("fixas");
  const [fixas, setFixas] = useState<Dezena[]>([]);
  const [variaveis, setVariaveis] = useState<Dezena[]>([]);
  const [base, setBase] = useState<Dezena[]>([]);
  const [dezenasPorJogo, setDezenasPorJogo] =
    useState<Aposta["dezenasPorJogo"]>(15);
  const [quantidadeJogos, setQuantidadeJogos] = useState(20);
  const [garantia, setGarantia] = useState<GuaranteeLevel>(12);
  const [maxJogosFechamento, setMaxJogosFechamento] = useState(80);
  const [proporcaoFrequentes, setProporcaoFrequentes] = useState(0.6);
  const [nomeEstrategia, setNomeEstrategia] = useState("Estratégia avançada");
  const [mensagem, setMensagem] = useState<{
    tipo: "sucesso" | "erro";
    texto: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [jogosGerados, setJogosGerados] = useState<Dezena[][]>([]);
  const [metadata, setMetadata] = useState<StrategyMetadata | null>(null);
  const [historico, setHistorico] = useState<ConcursoExcel[]>([]);
  const [statusPlanilha, setStatusPlanilha] = useState(
    "Carregando planilha configurada..."
  );
  const [probabilidades, setProbabilidades] = useState<
    CondProbabilities[] | null
  >(null);
  const [ultimoResultadoInput, setUltimoResultadoInput] = useState("");
  const [ultimoResultadoFiltro, setUltimoResultadoFiltro] = useState<Dezena[]>(
    []
  );

  const [paresRange, setParesRange] = useState<RangeConstraint>({});
  const [imparesRange, setImparesRange] = useState<RangeConstraint>({});
  const [somaRange, setSomaRange] = useState<RangeConstraint>({});
  const [faixaBaixaRange, setFaixaBaixaRange] = useState<RangeConstraint>({});
  const [faixaAltaRange, setFaixaAltaRange] = useState<RangeConstraint>({});
  const [linhasRanges, setLinhasRanges] = useState<RangeConstraint[]>(() =>
    criarIntervalosPadrao()
  );
  const [colunasRanges, setColunasRanges] = useState<RangeConstraint[]>(() =>
    criarIntervalosPadrao()
  );
  const [repeticaoRange, setRepeticaoRange] = useState<RangeConstraint>({});

  const carregarHistorico = () => {
    try {
      const dados = carregarResultadosDaConfiguracao();
      setHistorico(dados);
      setStatusPlanilha(`${dados.length} concursos carregados`);
    } catch (error) {
      setHistorico([]);
      setProbabilidades(null);
      setStatusPlanilha(
        error instanceof Error
          ? error.message
          : "Nenhuma planilha configurada. Use a aba Configurações."
      );
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => {
    if (historico.length) {
      setProbabilidades(calcularProbabilidadeCondicional(historico));
    }
  }, [historico]);

  const cicloResumo = useMemo<CycleProgressInfo | null>(() => {
    if (!historico.length) return null;
    try {
      return analisarCicloDasDezenas(historico);
    } catch {
      return null;
    }
  }, [historico]);

  const filtrosAplicados = useMemo<StatisticalFilterOptions>(() => {
    const filtros: StatisticalFilterOptions = {};
    if (possuiIntervalo(paresRange)) filtros.pares = paresRange;
    if (possuiIntervalo(imparesRange)) filtros.impares = imparesRange;
    if (possuiIntervalo(somaRange)) filtros.soma = somaRange;

    if (possuiIntervalo(faixaBaixaRange) || possuiIntervalo(faixaAltaRange)) {
      filtros.faixa = {
        baixas: possuiIntervalo(faixaBaixaRange) ? faixaBaixaRange : undefined,
        altas: possuiIntervalo(faixaAltaRange) ? faixaAltaRange : undefined,
      };
    }

    if (possuiIntervalos(linhasRanges)) {
      filtros.linhas = linhasRanges;
    }
    if (possuiIntervalos(colunasRanges)) {
      filtros.colunas = colunasRanges;
    }
    if (ultimoResultadoFiltro.length && possuiIntervalo(repeticaoRange)) {
      filtros.repeticaoUltimo = {
        ...repeticaoRange,
        dezenas: ultimoResultadoFiltro,
      };
    }

    return filtros;
  }, [
    colunasRanges,
    faixaAltaRange,
    faixaBaixaRange,
    imparesRange,
    linhasRanges,
    paresRange,
    repeticaoRange,
    somaRange,
    ultimoResultadoFiltro,
  ]);

  const filtrosParaEnvio = Object.keys(filtrosAplicados).length
    ? filtrosAplicados
    : undefined;

  const atualizarRange = (
    setter: (updater: (prev: RangeConstraint) => RangeConstraint) => void
  ) => {
    return (bound: "min" | "max", value: string) => {
      setter((prev) => {
        const parsed = parseNumero(value);
        if (parsed === undefined) {
          const next = { ...prev };
          delete next[bound];
          return next;
        }
        return { ...prev, [bound]: parsed };
      });
    };
  };

  const atualizarRangeLista = (
    setter: (updater: (prev: RangeConstraint[]) => RangeConstraint[]) => void,
    index: number,
    bound: "min" | "max",
    value: string
  ) => {
    setter((prev) => {
      const copia = prev.map((item) => ({ ...item }));
      const parsed = parseNumero(value);
      if (parsed === undefined) {
        delete copia[index][bound];
      } else {
        copia[index][bound] = parsed;
      }
      return copia;
    });
  };

  const handleToggleFixas = (numero: Dezena) => {
    setFixas((prev) => {
      if (prev.includes(numero)) {
        return prev.filter((n) => n !== numero);
      }
      return [...prev, numero];
    });
    setVariaveis((prev) => prev.filter((n) => n !== numero));
  };

  const handleToggleVariaveis = (numero: Dezena) => {
    if (fixas.includes(numero)) {
      return;
    }
    setVariaveis((prev) => {
      if (prev.includes(numero)) {
        return prev.filter((n) => n !== numero);
      }
      return [...prev, numero];
    });
  };

  const handleToggleBase = (numero: Dezena) => {
    setBase((prev) => {
      if (prev.includes(numero)) {
        return prev.filter((n) => n !== numero);
      }
      return [...prev, numero];
    });
  };

  const handleAplicarUltimoResultado = () => {
    const tokens = ultimoResultadoInput.split(/[^0-9]+/).filter(Boolean);
    const numeros: Dezena[] = [];
    tokens.forEach((token) => {
      const valor = Number(token);
      if (
        Number.isInteger(valor) &&
        valor >= 1 &&
        valor <= 25 &&
        !numeros.includes(valor as Dezena)
      ) {
        numeros.push(valor as Dezena);
      }
    });
    setUltimoResultadoFiltro(numeros);
    setMensagem({
      tipo: "sucesso",
      texto:
        numeros.length > 0
          ? `Filtro atualizado com ${numeros.length} dezenas do último resultado.`
          : "Filtro de repetição limpo.",
    });
  };

  const gerarEstrategia = () => {
    setMensagem(null);
    setLoading(true);

    try {
      let resultado: { jogos: Dezena[][]; metadata: StrategyMetadata };
      switch (strategyMode) {
        case "fixas":
          if (!fixas.length) {
            throw new Error("Selecione ao menos uma dezena fixa.");
          }
          resultado = criarEstrategiaComFixas({
            fixas,
            dezenasPorJogo,
            quantidadeJogos,
            variaveis,
            filtros: filtrosParaEnvio,
          });
          break;
        case "fechamento":
          if (!variaveis.length) {
            throw new Error(
              "Escolha dezenas variáveis para montar o fechamento."
            );
          }
          resultado = criarFechamentoGarantido({
            fixas,
            variaveis,
            dezenasPorJogo,
            garantia,
            maxJogos: maxJogosFechamento,
            filtros: filtrosParaEnvio,
          });
          break;
        case "desdobramento":
          if (!base.length) {
            throw new Error("Selecione o universo base para o desdobramento.");
          }
          resultado = criarDesdobramentoInteligente({
            base,
            dezenasPorJogo,
            quantidadeJogos,
            garantia,
            filtros: filtrosParaEnvio,
          });
          break;
        case "balanceado":
          resultado = gerarJogosBalanceados({
            dezenasPorJogo,
            quantidadeJogos,
            filtros: filtrosParaEnvio,
          });
          break;
        case "frequencia":
          if (!historico.length) {
            throw new Error(
              "Carregue a planilha oficial antes de usar esta estratégia."
            );
          }
          resultado = estrategiaNumerosFrequentesEAtrasados({
            historico,
            dezenasPorJogo,
            quantidadeJogos,
            proporcaoFrequentes,
            filtros: filtrosParaEnvio,
          });
          break;
        case "ciclo":
          if (!historico.length) {
            throw new Error(
              "Carregue a planilha oficial antes de usar o fechamento do ciclo."
            );
          }
          resultado = criarEstrategiaFechamentoDoCiclo({
            historico,
            dezenasPorJogo,
            quantidadeJogos,
            filtros: filtrosParaEnvio,
          });
          break;
        default:
          throw new Error("Estratégia não suportada.");
      }

      setJogosGerados(resultado.jogos);
      setMetadata(resultado.metadata);
      setMensagem({
        tipo: "sucesso",
        texto: `Estratégia gerou ${resultado.jogos.length} jogo(s). Confira as métricas abaixo.`,
      });
    } catch (error) {
      setJogosGerados([]);
      setMetadata(null);
      setMensagem({
        tipo: "erro",
        texto:
          error instanceof Error ? error.message : "Falha ao gerar estratégia.",
      });
    } finally {
      setLoading(false);
    }
  };

  const metricasResumo = useMemo(() => {
    if (!jogosGerados.length) return null;

    const total = jogosGerados.length;
    const somaLinhas = Array(5).fill(0);
    const somaColunas = Array(5).fill(0);
    let somaTotal = 0;
    let pares = 0;
    let impares = 0;
    let baixas = 0;
    let altas = 0;
    let repeticaoTotal = 0;

    jogosGerados.forEach((jogo) => {
      const metricas = calcularMetricasJogo(
        jogo,
        ultimoResultadoFiltro.length ? ultimoResultadoFiltro : undefined
      );
      somaTotal += metricas.soma;
      pares += metricas.pares;
      impares += metricas.impares;
      baixas += metricas.baixas;
      altas += metricas.altas;
      metricas.linhas.forEach((valor, index) => {
        somaLinhas[index] += valor;
      });
      metricas.colunas.forEach((valor, index) => {
        somaColunas[index] += valor;
      });
      if (metricas.repeticaoUltimo !== undefined) {
        repeticaoTotal += metricas.repeticaoUltimo;
      }
    });

    return {
      mediaSoma: somaTotal / total,
      mediaPares: pares / total,
      mediaImpares: impares / total,
      mediaBaixas: baixas / total,
      mediaAltas: altas / total,
      mediaRepeticao: ultimoResultadoFiltro.length
        ? repeticaoTotal / total
        : null,
      linhas: somaLinhas.map((valor) => valor / total),
      colunas: somaColunas.map((valor) => valor / total),
    };
  }, [jogosGerados, ultimoResultadoFiltro]);

  const salvarAposta = () => {
    if (!jogosGerados.length) {
      setMensagem({
        tipo: "erro",
        texto: "Gere uma estratégia antes de salvar.",
      });
      return;
    }
    const aposta: Aposta = {
      id: createId(),
      tipo: "estrategia",
      nome: nomeEstrategia || "Estratégia avançada",
      dataCriacao: new Date().toISOString(),
      dezenasPorJogo,
      jogos: jogosGerados,
      dezenasFixas: fixas.length ? [...fixas].sort((a, b) => a - b) : undefined,
    };
    saveManyBets(aposta);
    setMensagem({
      tipo: "sucesso",
      texto: "Estratégia salva no histórico de apostas.",
    });
  };

  const topProbDepoisDeSair = useMemo(() => {
    if (!probabilidades) return [];
    return [...probabilidades]
      .sort((a, b) => b.probDepoisDeSair - a.probDepoisDeSair)
      .slice(0, 5);
  }, [probabilidades]);

  const topProbDepoisDeNaoSair = useMemo(() => {
    if (!probabilidades) return [];
    return [...probabilidades]
      .sort((a, b) => b.probDepoisDeNaoSair - a.probDepoisDeNaoSair)
      .slice(0, 5);
  }, [probabilidades]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Laboratório de Estratégias</h2>
        <p className="text-sm text-slate-400">
          Combine fechamentos, fixas, desdobramentos e filtros estatísticos para
          criar jogos de 15 a 20 dezenas com métricas auditáveis. Aproveite o
          histórico oficial para frequências, atrasos e probabilidades
          condicionais.
        </p>
      </header>

      <div className="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 md:grid-cols-2">
        <label className="flex flex-col text-sm font-semibold text-slate-200">
          Nome da estratégia
          <input
            type="text"
            value={nomeEstrategia}
            onChange={(event) => setNomeEstrategia(event.target.value)}
            className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="flex flex-col text-sm font-semibold text-slate-200">
          Estratégia
          <select
            value={strategyMode}
            onChange={(event) =>
              setStrategyMode(event.target.value as StrategyMode)
            }
            className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="fixas">Fixas + variáveis inteligentes</option>
            <option value="fechamento">Fechamento garantido</option>
            <option value="desdobramento">Desdobramento inteligente</option>
            <option value="balanceado">Jogos balanceados</option>
            <option value="frequencia">Frequentes × atrasados</option>
            <option value="ciclo">Fechamento do ciclo das dezenas</option>
          </select>
        </label>
        <label className="flex flex-col text-sm font-semibold text-slate-200">
          Dezenas por jogo
          <select
            value={dezenasPorJogo}
            onChange={(event) =>
              setDezenasPorJogo(
                Number(event.target.value) as Aposta["dezenasPorJogo"]
              )
            }
            className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          >
            {[15, 16, 17, 18, 19, 20].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm font-semibold text-slate-200">
          Quantidade de jogos
          <input
            type="number"
            min={1}
            max={500}
            value={quantidadeJogos}
            onChange={(event) =>
              setQuantidadeJogos(Math.max(1, Number(event.target.value) || 1))
            }
            className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            disabled={strategyMode === "fechamento"}
          />
        </label>
        {(strategyMode === "fechamento" ||
          strategyMode === "desdobramento") && (
          <label className="flex flex-col text-sm font-semibold text-slate-200">
            Garantia
            <select
              value={garantia}
              onChange={(event) =>
                setGarantia(Number(event.target.value) as GuaranteeLevel)
              }
              className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            >
              {[11, 12, 13, 14].map((valor) => (
                <option key={valor} value={valor}>
                  {valor} pontos
                </option>
              ))}
            </select>
          </label>
        )}
        {strategyMode === "fechamento" && (
          <label className="flex flex-col text-sm font-semibold text-slate-200">
            Limite de jogos
            <input
              type="number"
              min={1}
              max={500}
              value={maxJogosFechamento}
              onChange={(event) =>
                setMaxJogosFechamento(
                  Math.max(1, Number(event.target.value) || 1)
                )
              }
              className="mt-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
          </label>
        )}
        {strategyMode === "frequencia" && (
          <label className="flex flex-col text-sm font-semibold text-slate-200">
            Proporção de números frequentes
            <input
              type="range"
              min={0.3}
              max={0.9}
              step={0.05}
              value={proporcaoFrequentes}
              onChange={(event) =>
                setProporcaoFrequentes(Number(event.target.value))
              }
              className="mt-3"
            />
            <span className="text-xs text-slate-400">
              {Math.round(proporcaoFrequentes * 100)}% das dezenas virão do
              grupo mais frequente.
            </span>
          </label>
        )}
      </div>

      {strategyMode === "ciclo" && (
        <div className="space-y-3 rounded-2xl border border-emerald-800/60 bg-slate-900/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-300">
                Fechamento do ciclo das dezenas
              </p>
              <p className="text-xs text-slate-400">
                Priorize as dezenas faltantes e evite as recem encerradas.
              </p>
            </div>
            {cicloResumo && (
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                {cicloResumo.dezenasFaltantes.length
                  ? `${cicloResumo.dezenasFaltantes.length} faltando`
                  : "Ciclo fechado"}
              </span>
            )}
          </div>
          {cicloResumo ? (
            <>
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <p>
                  <span className="text-slate-400">Concursos no ciclo:</span>{" "}
                  <span className="font-semibold text-white">
                    {cicloResumo.concursosNoCiclo}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Media historica:</span>{" "}
                  <span className="font-semibold text-white">
                    {cicloResumo.mediaHistorica
                      ? `${cicloResumo.mediaHistorica.toFixed(1)} conc.`
                      : "—"}
                  </span>
                </p>
                <p>
                  <span className="text-slate-400">Previsao estimada:</span>{" "}
                  <span className="font-semibold text-white">
                    {cicloResumo.estimativaConcursosRestantes !== undefined
                      ? `~${cicloResumo.estimativaConcursosRestantes} conc.`
                      : "—"}
                  </span>
                </p>
                {cicloResumo.ultimoFechamento && (
                  <p>
                    <span className="text-slate-400">Ultimo fechamento:</span>{" "}
                    <span className="font-semibold text-white">
                      Concurso {cicloResumo.ultimoFechamento.concurso}{" "}
                      {cicloResumo.ultimoFechamento.duracao
                        ? `(${cicloResumo.ultimoFechamento.duracao} conc.)`
                        : ""}
                    </span>
                  </p>
                )}
              </div>
              <div className="grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Dezenas faltantes
                  </p>
                  <p className="mt-1 font-semibold text-white">
                    {formatarOuHifen(cicloResumo.dezenasFaltantes)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Dezenas quentes
                  </p>
                  <p className="mt-1 text-slate-200">
                    {formatarOuHifen(cicloResumo.dezenasQuentes)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Recem encerradas (evite)
                  </p>
                  <p className="mt-1 text-slate-200">
                    {formatarOuHifen(cicloResumo.recemEncerradas)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-300">
              Carregue a planilha oficial para calcular o ciclo atual.
            </p>
          )}
        </div>
      )}

      {(strategyMode === "fixas" || strategyMode === "fechamento") && (
        <div className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 lg:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-300">
              Fixas selecionadas ({fixas.length}) — use este quadro para travar
              dezenas em todos os jogos.
            </p>
            <NumberGrid
              selected={fixas}
              onToggleNumber={handleToggleFixas}
              maxSelectable={12}
            />
            {fixas.length > 0 && (
              <p className="text-xs text-slate-400">
                Fixas: {formatarLista(fixas)}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-indigo-300">
              Variáveis ({variaveis.length}) — serão distribuídas para
              complementar cada volante.
            </p>
            <NumberGrid
              selected={variaveis}
              onToggleNumber={handleToggleVariaveis}
              disabledNumbers={fixas}
            />
            {variaveis.length > 0 && (
              <p className="text-xs text-slate-400">
                Variáveis: {formatarLista(variaveis)}
              </p>
            )}
          </div>
        </div>
      )}

      {strategyMode === "desdobramento" && (
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-sm font-semibold text-slate-200">
            Universo base ({base.length}) — quanto maior a base, mais
            combinações serão avaliadas.
          </p>
          <NumberGrid selected={base} onToggleNumber={handleToggleBase} />
        </div>
      )}

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">
            Planilha oficial
          </p>
          <button
            type="button"
            onClick={carregarHistorico}
            className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold hover:bg-slate-700"
          >
            Atualizar
          </button>
        </div>
        <p className="text-sm text-slate-200">{statusPlanilha}</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <h3 className="text-lg font-semibold text-white">
          Filtros estatísticos
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              label: "Pares",
              range: paresRange,
              setter: atualizarRange(setParesRange),
              minHint: "mín",
              maxHint: "máx",
            },
            {
              label: "Ímpares",
              range: imparesRange,
              setter: atualizarRange(setImparesRange),
            },
            {
              label: "Soma",
              range: somaRange,
              setter: atualizarRange(setSomaRange),
              minHint: "mín",
              maxHint: "máx",
            },
          ].map((item) => (
            <div key={item.label} className="text-sm">
              <p className="font-semibold text-slate-200">{item.label}</p>
              <div className="mt-1 flex gap-2">
                <input
                  type="number"
                  value={item.range.min ?? ""}
                  onChange={(event) => item.setter("min", event.target.value)}
                  placeholder={item.minHint ?? "mín"}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
                <input
                  type="number"
                  value={item.range.max ?? ""}
                  onChange={(event) => item.setter("max", event.target.value)}
                  placeholder={item.maxHint ?? "máx"}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="text-sm">
            <p className="font-semibold text-slate-200">Faixa 1-13 (baixos)</p>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                value={faixaBaixaRange.min ?? ""}
                onChange={(event) =>
                  atualizarRange(setFaixaBaixaRange)("min", event.target.value)
                }
                placeholder="mín"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
              <input
                type="number"
                value={faixaBaixaRange.max ?? ""}
                onChange={(event) =>
                  atualizarRange(setFaixaBaixaRange)("max", event.target.value)
                }
                placeholder="máx"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </div>
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-200">Faixa 14-25 (altos)</p>
            <div className="mt-1 flex gap-2">
              <input
                type="number"
                value={faixaAltaRange.min ?? ""}
                onChange={(event) =>
                  atualizarRange(setFaixaAltaRange)("min", event.target.value)
                }
                placeholder="mín"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
              <input
                type="number"
                value={faixaAltaRange.max ?? ""}
                onChange={(event) =>
                  atualizarRange(setFaixaAltaRange)("max", event.target.value)
                }
                placeholder="máx"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Distribuição por linha (0-5 por linha)
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
              {linhasRanges.map((range, index) => (
                <div key={`linha-${index}`} className="space-y-1">
                  <p className="text-center font-semibold text-slate-400">
                    L{index + 1}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={range.min ?? ""}
                    onChange={(event) =>
                      atualizarRangeLista(
                        setLinhasRanges,
                        index,
                        "min",
                        event.target.value
                      )
                    }
                    placeholder="mín"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center"
                  />
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={range.max ?? ""}
                    onChange={(event) =>
                      atualizarRangeLista(
                        setLinhasRanges,
                        index,
                        "max",
                        event.target.value
                      )
                    }
                    placeholder="máx"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center"
                  />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Distribuição por coluna (0-5 por coluna)
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2 text-xs">
              {colunasRanges.map((range, index) => (
                <div key={`coluna-${index}`} className="space-y-1">
                  <p className="text-center font-semibold text-slate-400">
                    C{index + 1}
                  </p>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={range.min ?? ""}
                    onChange={(event) =>
                      atualizarRangeLista(
                        setColunasRanges,
                        index,
                        "min",
                        event.target.value
                      )
                    }
                    placeholder="mín"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center"
                  />
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={range.max ?? ""}
                    onChange={(event) =>
                      atualizarRangeLista(
                        setColunasRanges,
                        index,
                        "max",
                        event.target.value
                      )
                    }
                    placeholder="máx"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm">
          <p className="font-semibold text-slate-200">
            Repetição do último resultado
          </p>
          <textarea
            value={ultimoResultadoInput}
            onChange={(event) => setUltimoResultadoInput(event.target.value)}
            placeholder="Informe até 15 dezenas para controlar a repetição..."
            className="min-h-[60px] w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="number"
              min={0}
              max={15}
              value={repeticaoRange.min ?? ""}
              onChange={(event) =>
                atualizarRange(setRepeticaoRange)("min", event.target.value)
              }
              placeholder="mín"
              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
            <input
              type="number"
              min={0}
              max={15}
              value={repeticaoRange.max ?? ""}
              onChange={(event) =>
                atualizarRange(setRepeticaoRange)("max", event.target.value)
              }
              placeholder="máx"
              className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAplicarUltimoResultado}
              className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600"
            >
              Aplicar dezenas
            </button>
            {ultimoResultadoFiltro.length > 0 && (
              <span className="text-xs text-slate-400">
                Último filtro: {formatarLista(ultimoResultadoFiltro)}
              </span>
            )}
          </div>
        </div>
      </div>

      {mensagem && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensagem.tipo === "sucesso"
              ? "border-emerald-500 text-emerald-300"
              : "border-rose-500 text-rose-200"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={gerarEstrategia}
          className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-600 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Calculando..." : "Gerar estratégia"}
        </button>
        <button
          type="button"
          onClick={salvarAposta}
          className="rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          disabled={!jogosGerados.length}
        >
          Salvar estratégia
        </button>
        <button
          type="button"
          onClick={() => {
            setJogosGerados([]);
            setMetadata(null);
            setMensagem(null);
          }}
          className="rounded-lg bg-slate-800 px-5 py-3 font-semibold text-white hover:bg-slate-700"
        >
          Limpar resultados
        </button>
      </div>

      {metadata && (
        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
          <p className="text-base font-semibold text-white">
            Resumo da estratégia
          </p>
          <ul className="grid gap-3 md:grid-cols-2">
            <li>
              <span className="text-slate-400">Jogos gerados:</span>{" "}
              <span className="font-semibold text-white">
                {metadata.jogosGerados}
              </span>
            </li>
            {metadata.garantia && (
              <li>
                <span className="text-slate-400">Garantia:</span>{" "}
                <span className="font-semibold text-white">
                  {metadata.garantia} pontos
                </span>
              </li>
            )}
            {metadata.subconjuntosTotais !== undefined && (
              <li>
                <span className="text-slate-400">Cobertura:</span>{" "}
                <span className="font-semibold text-white">
                  {metadata.subconjuntosCobertos}/{metadata.subconjuntosTotais}{" "}
                  ({((metadata.cobertura ?? 0) * 100).toFixed(1)}%)
                </span>
              </li>
            )}
            {metadata.ciclo && (
              <>
                <li>
                  <span className="text-slate-400">Concursos no ciclo:</span>{" "}
                  <span className="font-semibold text-white">
                    {metadata.ciclo.concursosNoCiclo}
                  </span>
                </li>
                <li>
                  <span className="text-slate-400">Dezenas faltantes:</span>{" "}
                  <span className="font-semibold text-white">
                    {formatarOuHifen(metadata.ciclo.dezenasFaltantes)}
                  </span>
                </li>
                {metadata.ciclo.concursosRestantesEstimados !== undefined && (
                  <li>
                    <span className="text-slate-400">Previsao:</span>{" "}
                    <span className="font-semibold text-white">
                      ~{metadata.ciclo.concursosRestantesEstimados} concurso(s)
                    </span>
                  </li>
                )}
                {metadata.ciclo.mediaHistorica !== undefined && (
                  <li>
                    <span className="text-slate-400">Media historica:</span>{" "}
                    <span className="font-semibold text-white">
                      {metadata.ciclo.mediaHistorica.toFixed(1)} concurso(s)
                    </span>
                  </li>
                )}
                {metadata.ciclo.dezenasQuentes?.length ? (
                  <li>
                    <span className="text-slate-400">Quentes:</span>{" "}
                    <span className="font-semibold text-white">
                      {formatarLista(metadata.ciclo.dezenasQuentes)}
                    </span>
                  </li>
                ) : null}
                {metadata.ciclo.recemEncerradas?.length ? (
                  <li>
                    <span className="text-slate-400">Recem encerradas:</span>{" "}
                    <span className="font-semibold text-white">
                      {formatarLista(metadata.ciclo.recemEncerradas)}
                    </span>
                  </li>
                ) : null}
                {(metadata.ciclo.ultimoFechamentoConcurso ||
                  metadata.ciclo.ultimoFechamentoData) && (
                  <li className="md:col-span-2">
                    <span className="text-slate-400">Ultimo fechamento:</span>{" "}
                    <span className="font-semibold text-white">
                      Concurso {metadata.ciclo.ultimoFechamentoConcurso ?? "--"}
                      {metadata.ciclo.ultimoFechamentoData
                        ? ` • ${metadata.ciclo.ultimoFechamentoData}`
                        : ""}
                    </span>
                  </li>
                )}
              </>
            )}
            {metadata.observacoes && (
              <li className="md:col-span-2 text-slate-300">
                {metadata.observacoes}
              </li>
            )}
          </ul>
        </div>
      )}

      {metricasResumo && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-base font-semibold text-white">
            Métricas acumuladas
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-slate-950/50 p-3 text-sm">
              <p className="text-slate-400">Soma média</p>
              <p className="text-2xl font-semibold text-emerald-400">
                {metricasResumo.mediaSoma.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/50 p-3 text-sm">
              <p className="text-slate-400">Pares × Ímpares</p>
              <p className="text-lg font-semibold text-white">
                {metricasResumo.mediaPares.toFixed(1)} /{" "}
                {metricasResumo.mediaImpares.toFixed(1)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/50 p-3 text-sm">
              <p className="text-slate-400">Baixos × Altos</p>
              <p className="text-lg font-semibold text-white">
                {metricasResumo.mediaBaixas.toFixed(1)} /{" "}
                {metricasResumo.mediaAltas.toFixed(1)}
              </p>
            </div>
            {metricasResumo.mediaRepeticao !== null && (
              <div className="rounded-lg bg-slate-950/50 p-3 text-sm">
                <p className="text-slate-400">Repetição média</p>
                <p className="text-lg font-semibold text-white">
                  {metricasResumo.mediaRepeticao.toFixed(2)} dezenas
                </p>
              </div>
            )}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">
                Distribuição por linha
              </p>
              <div className="space-y-2 text-xs">
                {metricasResumo.linhas.map((valor, index) => (
                  <div key={`linha-bar-${index}`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Linha {index + 1}</span>
                      <span className="font-semibold text-white">
                        {valor.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.min(
                            (valor / dezenasPorJogo) * 200,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">
                Distribuição por coluna
              </p>
              <div className="space-y-2 text-xs">
                {metricasResumo.colunas.map((valor, index) => (
                  <div key={`coluna-bar-${index}`}>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Coluna {index + 1}</span>
                      <span className="font-semibold text-white">
                        {valor.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{
                          width: `${Math.min(
                            (valor / dezenasPorJogo) * 200,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {jogosGerados.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white">
            Prévia dos {Math.min(9, jogosGerados.length)} primeiros jogos
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jogosGerados.slice(0, 9).map((jogo, index) => (
              <BetCardPreview
                key={`${jogo.join("-")}-${index}`}
                title={`Jogo ${String(index + 1).padStart(2, "0")}`}
                dezenas={jogo}
              />
            ))}
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs text-slate-400">
            Total gerado: {jogosGerados.length} jogo(s) · Este painel utiliza as
            funções matemáticas de fechamento, filtros e probabilidade
            implementadas no motor da aplicação.
          </div>
        </div>
      )}

      {probabilidades && (
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex flex-wrap items-center justify-between">
            <p className="text-base font-semibold text-white">
              Probabilidade condicional (histórico)
            </p>
            <button
              type="button"
              className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-semibold hover:bg-slate-700"
              onClick={() =>
                setProbabilidades(calcularProbabilidadeCondicional(historico))
              }
            >
              Recalcular
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">
                Top 5 para repetir após sair
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="py-1">Dezena</th>
                    <th className="py-1">Prob.</th>
                  </tr>
                </thead>
                <tbody>
                  {topProbDepoisDeSair.map((item) => (
                    <tr
                      key={`hit-${item.dezena}`}
                      className="border-t border-slate-800"
                    >
                      <td className="py-1 font-semibold text-white">
                        {item.dezena.toString().padStart(2, "0")}
                      </td>
                      <td className="py-1">
                        {(item.probDepoisDeSair * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-200">
                Top 5 após não sair
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="py-1">Dezena</th>
                    <th className="py-1">Prob.</th>
                  </tr>
                </thead>
                <tbody>
                  {topProbDepoisDeNaoSair.map((item) => (
                    <tr
                      key={`miss-${item.dezena}`}
                      className="border-t border-slate-800"
                    >
                      <td className="py-1 font-semibold text-white">
                        {item.dezena.toString().padStart(2, "0")}
                      </td>
                      <td className="py-1">
                        {(item.probDepoisDeNaoSair * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default StrategyLabPage;

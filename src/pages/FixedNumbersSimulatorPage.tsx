import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import NumberGrid from '../components/NumberGrid';
import BetCardPreview from '../components/BetCardPreview';
import { saveManyBets } from '../storage/betsStorage';
import { gerarPdfApostas, gerarPdfHistorico, type HistoricoRegistro } from '../services/pdfService';
import { combinationCount, generateFixedCombinations } from '../utils/combinacoes';
import { createId } from '../utils/id';
import type { Aposta, Dezena } from '../types';
import { carregarResultadosDaConfiguracao, type ConcursoExcel } from '../utils/resultadosExcel';
import { contarAcertos, faixaPremiacao } from '../utils/conferencia';

const MIN_FIXAS = 5;
const MAX_FIXAS = 10;

export function FixedNumbersSimulatorPage() {
  const [fixas, setFixas] = useState<Dezena[]>([]);
  const [dezenasPorJogo, setDezenasPorJogo] = useState<15 | 16 | 17 | 18>(15);
  const [quantidadeJogos, setQuantidadeJogos] = useState(10);
  const [nomeSimulacao, setNomeSimulacao] = useState('Simulação com fixos');
  const [jogosGerados, setJogosGerados] = useState<Dezena[][]>([]);
  const [ultimaApostaPdf, setUltimaApostaPdf] = useState<Aposta | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [autoFillQuantidade, setAutoFillQuantidade] = useState(true);
  const [historicoConcursos, setHistoricoConcursos] = useState<ConcursoExcel[] | null>(null);
  const [historicoRelatorio, setHistoricoRelatorio] = useState<HistoricoRegistro[]>([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoErro, setHistoricoErro] = useState<string | null>(null);
  const [statusPlanilha, setStatusPlanilha] = useState('Carregando planilha...');

  const combinacoesGarantia = useMemo(() => {
    if (fixas.length < MIN_FIXAS || fixas.length > MAX_FIXAS) return null;
    const faltantesParaOnze = 11 - fixas.length;
    if (faltantesParaOnze <= 0) return 1;
    const restantes = 25 - fixas.length;
    return combinationCount(restantes, faltantesParaOnze);
  }, [fixas.length]);

  useEffect(() => {
    if (!autoFillQuantidade) return;
    if (combinacoesGarantia === null) {
      setQuantidadeJogos(1);
      return;
    }
    const valor = Number.isFinite(combinacoesGarantia)
      ? Math.max(1, Math.round(combinacoesGarantia))
      : 1;
    setQuantidadeJogos(valor);
  }, [combinacoesGarantia, autoFillQuantidade]);

  const handleToggleFixas = (numero: Dezena) => {
    setAutoFillQuantidade(true);
    setFixas((prev) => {
      if (prev.includes(numero)) {
        return prev.filter((n) => n !== numero);
      }
      if (prev.length >= MAX_FIXAS) {
        return prev;
      }
      return [...prev, numero];
    });
  };

  const montarApostaAtual = (): Aposta => {
    if (!jogosGerados.length) {
      throw new Error('Gere as combinações antes de continuar.');
    }

    return {
      id: createId(),
      tipo: 'simulacao',
      nome: nomeSimulacao || 'Simulação com fixos',
      dataCriacao: new Date().toISOString(),
      dezenasPorJogo,
      jogos: jogosGerados,
      dezenasFixas: [...fixas].sort((a, b) => a - b),
    };
  };

  const handleGenerate = (event?: FormEvent) => {
    event?.preventDefault();
    setMensagem(null);
    setUltimaApostaPdf(null);

    if (fixas.length < MIN_FIXAS || fixas.length > MAX_FIXAS) {
      setMensagem({ tipo: 'erro', texto: 'Selecione entre 5 e 10 números fixos.' });
      return;
    }

    if (quantidadeJogos < 1) {
      setMensagem({ tipo: 'erro', texto: 'Informe a quantidade de jogos desejada.' });
      return;
    }

    setCarregando(true);
    try {
      const combinacoes = generateFixedCombinations(fixas, dezenasPorJogo, quantidadeJogos);
      setJogosGerados(combinacoes);
      setMensagem({ tipo: 'sucesso', texto: `${combinacoes.length} jogos gerados com sucesso.` });
    } catch (error) {
      setJogosGerados([]);
      setMensagem({
        tipo: 'erro',
        texto: error instanceof Error ? error.message : 'Não foi possível gerar as combinações.',
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleSave = () => {
    try {
      const aposta = montarApostaAtual();
      saveManyBets(aposta);
      setMensagem({ tipo: 'sucesso', texto: 'Simulação salva com sucesso.' });
      setHistoricoRelatorio([]);
      setHistoricoErro(null);
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error instanceof Error ? error.message : 'Não foi possível salvar a simulação.',
      });
    }
  };

  const handleGerarPdf = () => {
    try {
      const aposta = montarApostaAtual();
      gerarPdfApostas(aposta);
      setUltimaApostaPdf(aposta);
      setMensagem({ tipo: 'sucesso', texto: 'PDF gerado com sucesso.' });
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error instanceof Error ? error.message : 'Falha ao gerar PDF.',
      });
    }
  };

  const handleDownloadPdf = () => {
    if (!ultimaApostaPdf) {
      setMensagem({ tipo: 'erro', texto: 'Gere o PDF antes de fazer o download.' });
      return;
    }
    gerarPdfApostas(ultimaApostaPdf);
    setMensagem({ tipo: 'sucesso', texto: 'Download PDF iniciado.' });
  };

  const atualizarPlanilhaConfigurada = () => {
    try {
      const dados = carregarResultadosDaConfiguracao();
      setHistoricoConcursos(dados);
      setStatusPlanilha(`${dados.length} concursos carregados`);
    } catch (error) {
      setHistoricoConcursos(null);
      setStatusPlanilha(
        error instanceof Error ? error.message : 'Nenhuma planilha carregada. Use a aba Configurações.',
      );
    }
  };

  useEffect(() => {
    atualizarPlanilhaConfigurada();
  }, []);

  const handleHistorico = async () => {
    if (!jogosGerados.length) {
      setMensagem({ tipo: 'erro', texto: 'Gere combinações antes de analisar o histórico.' });
      return;
    }
    if (!historicoConcursos) {
      setMensagem({
        tipo: 'erro',
        texto: 'Carregue a planilha oficial antes de comparar com os concursos.',
      });
      return;
    }

    setHistoricoLoading(true);
    setHistoricoErro(null);
    try {
      const concursos = historicoConcursos;

      const relatorio = concursos.map((concurso) => {
        let melhorAcertos = 0;
        let melhorJogo: Dezena[] = [];

        jogosGerados.forEach((jogo) => {
          const acertos = contarAcertos(jogo, concurso.dezenas);
          if (acertos > melhorAcertos) {
            melhorAcertos = acertos;
            melhorJogo = jogo;
          }
        });

        return {
          concurso: concurso.concurso,
          dataSorteio: concurso.dataSorteio,
          melhorAcertos,
          faixa: faixaPremiacao(melhorAcertos),
          jogo: melhorJogo,
        };
      });

      relatorio.sort((a: HistoricoRegistro, b: HistoricoRegistro) => {
        if (b.melhorAcertos !== a.melhorAcertos) return b.melhorAcertos - a.melhorAcertos;
        return b.concurso - a.concurso;
      });

      setHistoricoRelatorio(relatorio);
      gerarPdfHistorico(nomeSimulacao || 'Simulação com fixos', relatorio);
      setMensagem({ tipo: 'sucesso', texto: 'Relatório histórico gerado e aberto em nova aba.' });
    } catch (error) {
      setHistoricoErro(error instanceof Error ? error.message : 'Falha ao comparar com o histórico.');
    } finally {
      setHistoricoLoading(false);
    }
  };

  const handleLoadPlanilha = () => {
    atualizarPlanilhaConfigurada();
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Simulador com números fixos</h2>
        <p className="text-sm text-slate-400">
          Escolha entre 5 e 10 dezenas fixas e deixe o sistema completar os jogos para você, distribuindo as demais
          dezenas para ampliar a cobertura e buscar ao menos 11 pontos.
        </p>
      </header>

      {mensagem && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensagem.tipo === 'sucesso' ? 'border-emerald-500 text-emerald-300' : 'border-rose-500 text-rose-200'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <form
        onSubmit={handleGenerate}
        className="space-y-4 rounded-2xl bg-slate-900/70 p-4 shadow md:p-6"
      >
        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
            Nome da simulação
            <input
              type="text"
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              value={nomeSimulacao}
              onChange={(event) => setNomeSimulacao(event.target.value)}
            />
          </label>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-200">
            Dezenas fixas ({fixas.length} selecionadas – mín {MIN_FIXAS} / máx {MAX_FIXAS})
          </p>
          <NumberGrid selected={fixas} onToggleNumber={handleToggleFixas} maxSelectable={MAX_FIXAS} />
          {combinacoesGarantia !== null && (
            <div className="rounded-lg bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
              Considerando que todas as dezenas fixas estejam corretas, para garantir pelo menos um jogo com 11 acertos
              seria necessário cobrir todas as combinações possíveis das demais dezenas:{' '}
              <span className="font-semibold text-emerald-300">
                {Number.isFinite(combinacoesGarantia)
                  ? combinacoesGarantia.toLocaleString('pt-BR')
                  : 'um número extremamente alto'}
              </span>{' '}
              de combinações únicas.
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
            Dezenas por jogo
            <select
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              value={dezenasPorJogo}
              onChange={(event) => setDezenasPorJogo(Number(event.target.value) as 15 | 16 | 17 | 18)}
            >
              {[15, 16, 17, 18].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-200">
            Quantidade de jogos
            <input
              type="number"
              min={1}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
              value={quantidadeJogos}
              onChange={(event) => {
                const valor = Number(event.target.value);
                setAutoFillQuantidade(false);
                setQuantidadeJogos(Number.isNaN(valor) ? 1 : Math.max(1, valor));
              }}
            />
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-600 disabled:opacity-50"
              disabled={carregando}
            >
              {carregando ? 'Gerando...' : 'Gerar combinações'}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="space-y-1 text-sm">
          <p className="text-xs font-semibold uppercase text-slate-400">Planilha configurada</p>
          <p className="text-slate-300">{statusPlanilha}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleLoadPlanilha}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
            >
              Atualizar status
            </button>
            <Link
              to="/config"
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-600"
            >
              Abrir Configurações
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={handleHistorico}
          className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!historicoConcursos || !jogosGerados.length || historicoLoading}
        >
          {historicoLoading ? 'Analisando histórico...' : 'Comparar com todos os concursos'}
        </button>
        {historicoErro && <p className="text-sm text-rose-300">{historicoErro}</p>}
        {historicoLoading && (
          <div className="w-full rounded-lg border border-emerald-500 bg-slate-950/70 p-3 text-sm text-emerald-300">
            <p className="mb-2 font-semibold text-white">Comparando com todos os concursos...</p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-full animate-pulse bg-gradient-to-r from-emerald-400 via-emerald-200 to-emerald-500" />
            </div>
          </div>
        )}
      </div>

      {!!jogosGerados.length && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-600"
            >
              Salvar combinação
            </button>
            <button
              type="button"
              onClick={handleGerarPdf}
              className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
            >
              Gerar PDF dos cartões
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600 disabled:opacity-50"
              disabled={!ultimaApostaPdf}
            >
              Download PDF
            </button>
          </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jogosGerados.map((jogo, index) => (
            <BetCardPreview
              key={`${jogo.join('-')}-${index}`}
              title={`Jogo ${String(index + 1).padStart(2, '0')}`}
              dezenas={jogo}
            />
          ))}
        </div>

          {historicoRelatorio.length > 0 && (
            <div className="mt-4 space-y-4 text-sm text-slate-200">
              <p className="font-semibold text-white">
                Melhores resultados históricos para esses jogos (top 30 concursos)
              </p>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-xs">
                  <thead className="bg-slate-950/70 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Concurso</th>
                      <th className="px-3 py-2 text-left">Data</th>
                      <th className="px-3 py-2 text-left">Melhor jogo</th>
                      <th className="px-3 py-2 text-left">Acertos</th>
                      <th className="px-3 py-2 text-left">Faixa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    {historicoRelatorio.slice(0, 30).map((item) => (
                      <tr key={item.concurso}>
                        <td className="px-3 py-2 font-semibold text-white">#{item.concurso}</td>
                        <td className="px-3 py-2">{item.dataSorteio || '-'}</td>
                        <td className="px-3 py-2 font-mono">
                          {item.jogo.length
                            ? item.jogo.map((n) => n.toString().padStart(2, '0')).join(' ')
                            : '-'}
                        </td>
                        <td className="px-3 py-2">{item.melhorAcertos}</td>
                        <td className="px-3 py-2 uppercase">
                          {item.faixa === 'nenhuma' ? '-' : `${item.faixa} pontos`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    )}
  </section>
  );
}

export default FixedNumbersSimulatorPage;

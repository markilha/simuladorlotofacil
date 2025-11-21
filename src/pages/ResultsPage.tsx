import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import BetsTable from '../components/BetsTable';
import NumberGrid from '../components/NumberGrid';
import { deleteBet, getAllBets } from '../storage/betsStorage';
import { contarAcertos, faixaPremiacao } from '../utils/conferencia';
import { carregarResultadosDaConfiguracao } from '../utils/resultadosExcel';
import type { Aposta, BetResultRow, Dezena } from '../types';
import type { ConcursoExcel } from '../utils/resultadosExcel';

type FiltroFaixa = 'todas' | '11+' | '11' | '12' | '13' | '14' | '15';

export function ResultsPage() {
  const [resultado, setResultado] = useState<Dezena[]>([]);
  const [apostas, setApostas] = useState<Aposta[]>(() => getAllBets());
  const [linhas, setLinhas] = useState<BetResultRow[]>([]);
  const [filtro, setFiltro] = useState<FiltroFaixa>('todas');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  const [concursosExcel, setConcursosExcel] = useState<ConcursoExcel[]>([]);
  const [concursoSelecionado, setConcursoSelecionado] = useState<number | ''>('');
  const [entradaManual, setEntradaManual] = useState('');
  const [erroPlanilha, setErroPlanilha] = useState<string | null>(null);

  const carregarPlanilhaConfigurada = () => {
    try {
      const dados = carregarResultadosDaConfiguracao();
      setConcursosExcel(dados);
      setErroPlanilha(null);
    } catch (error) {
      setConcursosExcel([]);
      setErroPlanilha(error instanceof Error ? error.message : 'Nenhuma planilha carregada.');
    }
  };

  useEffect(() => {
    setApostas(getAllBets());
    carregarPlanilhaConfigurada();
  }, []);

  const handleSelectConcurso = (value: string) => {
    if (!value) {
      setConcursoSelecionado('');
      return;
    }
    const numero = Number(value);
    setConcursoSelecionado(numero);
    const concurso = concursosExcel.find((item) => item.concurso === numero);
    if (concurso) {
      setResultado([...concurso.dezenas].sort((a, b) => a - b));
    }
  };

  const handleApplyManualInput = () => {
    const tokens = entradaManual.split(/[^0-9]+/).filter(Boolean);
    const numeros: Dezena[] = [];
    tokens.forEach((token) => {
      const valor = Number(token);
      if (Number.isInteger(valor) && valor >= 1 && valor <= 25 && !numeros.includes(valor as Dezena)) {
        numeros.push(valor as Dezena);
      }
    });

    if (numeros.length !== 15) {
      setMensagem({ tipo: 'erro', texto: 'Digite exatamente 15 números válidos entre 1 e 25.' });
      return;
    }

    setResultado([...numeros].sort((a, b) => a - b));
    setMensagem({ tipo: 'sucesso', texto: 'Resultado digitado aplicado.' });
  };

  const handleDeleteBet = (id: string) => {
    const confirmDelete = window.confirm('Deseja realmente apagar esta aposta?');
    if (!confirmDelete) return;
    deleteBet(id);
    const atualizadas = getAllBets();
    setApostas(atualizadas);
    setLinhas((prev) => prev.filter((linha) => !linha.id.startsWith(`${id}-`)));
    setMensagem({ tipo: 'sucesso', texto: 'Aposta removida.' });
  };

  const handleToggleResultado = (numero: Dezena) => {
    setResultado((prev) => {
      if (prev.includes(numero)) return prev.filter((n) => n !== numero);
      if (prev.length >= 15) return prev;
      return [...prev, numero];
    });
  };

  const handleConferir = () => {
    if (resultado.length !== 15) {
      setMensagem({ tipo: 'erro', texto: 'Você precisa informar exatamente 15 números sorteados.' });
      return;
    }

    if (!apostas.length) {
      setMensagem({ tipo: 'erro', texto: 'Nenhuma aposta salva para conferência.' });
      return;
    }

    const novaLinhas: BetResultRow[] = [];

    apostas.forEach((aposta) => {
      aposta.jogos.forEach((jogo, index) => {
        const acertos = contarAcertos(jogo, resultado);
        const faixa = faixaPremiacao(acertos);
        novaLinhas.push({
          id: `${aposta.id}-${index + 1}`,
          nome: `${aposta.nome} #${String(index + 1).padStart(2, '0')}`,
          dezenas: jogo,
          acertos,
          faixa: faixa === 'nenhuma' ? undefined : faixa,
        });
      });
    });

    novaLinhas.sort((a, b) => (b.acertos ?? 0) - (a.acertos ?? 0));
    setLinhas(novaLinhas);
    setMensagem({ tipo: 'sucesso', texto: 'Conferência realizada. Confira os resultados abaixo.' });
  };

  const linhasFiltradas = useMemo(() => {
    if (filtro === 'todas') return linhas;
    if (filtro === '11+') {
      return linhas.filter((linha) => (linha.acertos ?? 0) >= 11);
    }
    return linhas.filter((linha) => linha.faixa === filtro);
  }, [linhas, filtro]);

  const estatisticas = useMemo(() => {
    const resumo = {
      '11': 0,
      '12': 0,
      '13': 0,
      '14': 0,
      '15': 0,
    };
    linhas.forEach((linha) => {
      if (!linha.faixa) return;
      if (resumo[linha.faixa as keyof typeof resumo] !== undefined) {
        resumo[linha.faixa as keyof typeof resumo] += 1;
      }
    });
    return resumo;
  }, [linhas]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Resultados / Conferência</h2>
        <p className="text-sm text-slate-400">
          Informe as 15 dezenas sorteadas e descubra quais apostas armazenadas atingiram as faixas de premiação (11 a 15
          acertos).
        </p>
      </header>

      <div className="space-y-3 rounded-2xl bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Apostas salvas ({apostas.length})</h3>
          <button
            type="button"
            className="text-sm text-emerald-400 hover:underline"
            onClick={() => setApostas(getAllBets())}
          >
            Recarregar
          </button>
        </div>
        {apostas.length === 0 ? (
          <p className="text-sm text-slate-400">Nenhuma aposta salva ainda.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {apostas.map((aposta) => (
              <div key={aposta.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{aposta.nome}</p>
                    <p className="text-xs text-slate-400">{new Date(aposta.dataCriacao).toLocaleString('pt-BR')}</p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-rose-400 hover:underline"
                    onClick={() => handleDeleteBet(aposta.id)}
                  >
                    Apagar
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  Tipo:{' '}
                  {aposta.tipo === 'simples'
                    ? 'Jogo simples'
                    : aposta.tipo === 'estrategia'
                      ? 'Estratégia avançada'
                      : 'Simulação'}{' '}
                  · Jogos: {aposta.jogos.length} · Dezenas por jogo: {aposta.dezenasPorJogo}
                </p>
                {aposta.dezenasFixas?.length ? (
                  <p className="text-xs text-slate-400">
                    Fixas: {aposta.dezenasFixas.map((n) => n.toString().padStart(2, '0')).join(', ')}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {mensagem && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            mensagem.tipo === 'sucesso' ? 'border-emerald-500 text-emerald-300' : 'border-rose-500 text-rose-200'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="space-y-4 rounded-2xl bg-slate-900/70 p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
          <span>Informe exatamente 15 números sorteados.</span>
          <span>Apostas salvas: {apostas.length}</span>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase text-slate-400">Planilha configurada</p>
            {concursosExcel.length > 0 ? (
              <p className="text-sm text-emerald-300">
                {concursosExcel.length} concursos disponíveis. Se precisar trocar o arquivo, acesse{' '}
                <Link to="/config" className="text-emerald-400 underline">
                  Configurações
                </Link>
                .
              </p>
            ) : (
              <p className="text-xs text-amber-300">
                {erroPlanilha ?? 'Nenhuma planilha carregada. Use a aba Configurações para carregar o arquivo antes.'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={carregarPlanilhaConfigurada}
              className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
            >
              Atualizar status
            </button>
            <Link
              to="/config"
              className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-600"
            >
              Abrir Configurações
            </Link>
            {concursosExcel.length > 0 && (
              <select
                value={concursoSelecionado}
                onChange={(event) => handleSelectConcurso(event.target.value)}
                className="min-w-[220px] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2"
              >
                <option value="">Selecione um concurso</option>
                {concursosExcel.map((concurso) => (
                  <option key={concurso.concurso} value={concurso.concurso}>
                    Concurso {concurso.concurso} {concurso.dataSorteio ? `- ${concurso.dataSorteio}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <NumberGrid selected={resultado} onToggleNumber={handleToggleResultado} maxSelectable={15} />
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-200">
          <p className="mb-2 text-xs text-slate-400">
            Preferir digitar? Informe os 15 números separados por espaço, vírgula ou quebra de linha e clique em aplicar.
          </p>
          <div className="flex flex-col gap-2 md:flex-row">
            <textarea
              value={entradaManual}
              onChange={(event) => setEntradaManual(event.target.value)}
              className="min-h-[70px] flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              placeholder="01 02 03 04 ..."
            />
            <button
              type="button"
              onClick={handleApplyManualInput}
              className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
            >
              Aplicar resultado digitado
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleConferir}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950 hover:bg-emerald-600"
          >
            Conferir apostas
          </button>
          <button
            type="button"
            onClick={() => {
              setResultado([]);
              setLinhas([]);
              setMensagem(null);
            }}
            className="rounded-lg bg-slate-700 px-4 py-2 font-semibold text-white hover:bg-slate-600"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          Filtro por faixa:
          <select
            value={filtro}
            onChange={(event) => setFiltro(event.target.value as FiltroFaixa)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="todas">Todas</option>
            <option value="11+">11+</option>
            <option value="15">15 pontos</option>
            <option value="14">14 pontos</option>
            <option value="13">13 pontos</option>
            <option value="12">12 pontos</option>
            <option value="11">11 pontos</option>
          </select>
        </label>
        <span className="text-slate-400">Total exibido: {linhasFiltradas.length}</span>
      </div>

      {linhas.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-200">
          <p className="mb-2 font-semibold text-white">Estatísticas desta conferência</p>
          {Object.entries(estatisticas).some(([, valor]) => valor > 0) ? (
            <ul className="space-y-1">
              {Object.entries(estatisticas)
                .filter(([, valor]) => valor > 0)
                .map(([faixa, valor]) => (
                  <li key={faixa}>
                    <span className="font-semibold text-emerald-300">{valor}</span> jogo(s) com{' '}
                    <span className="font-semibold">{faixa} acertos</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-slate-400">Nenhum cartão atingiu 11 ou mais acertos.</p>
          )}
        </div>
      )}

      <BetsTable rows={linhasFiltradas} />
    </section>
  );
}

export default ResultsPage;

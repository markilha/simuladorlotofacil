import { useMemo, useState } from 'react';
import NumberGrid from '../components/NumberGrid';
import { saveBet } from '../storage/betsStorage';
import type { Aposta, Dezena } from '../types';
import { createId } from '../utils/id';

const MIN_DEZENAS = 15;
const MAX_DEZENAS = 18;

export function SimpleSimulatorPage() {
  const [selecionadas, setSelecionadas] = useState<Dezena[]>([]);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const podeSalvar = selecionadas.length >= MIN_DEZENAS && selecionadas.length <= MAX_DEZENAS;

  const handleToggle = (numero: Dezena) => {
    setSelecionadas((prev) => {
      if (prev.includes(numero)) {
        return prev.filter((n) => n !== numero);
      }
      if (prev.length >= MAX_DEZENAS) {
        return prev;
      }
      return [...prev, numero];
    });
  };

  const handleClear = () => {
    setSelecionadas([]);
    setMensagem(null);
  };

  const dezenasOrdenadas = useMemo(() => [...selecionadas].sort((a, b) => a - b), [selecionadas]);

  const handleSave = () => {
    if (!podeSalvar) {
      setMensagem({ tipo: 'erro', texto: 'Selecione entre 15 e 18 números.' });
      return;
    }

    const novaAposta: Aposta = {
      id: createId(),
      tipo: 'simples',
      nome: `Jogo simples - ${new Date().toLocaleDateString('pt-BR')}`,
      dataCriacao: new Date().toISOString(),
      dezenasPorJogo: dezenasOrdenadas.length as Aposta['dezenasPorJogo'],
      jogos: [dezenasOrdenadas],
    };

    saveBet(novaAposta);
    setMensagem({ tipo: 'sucesso', texto: 'Aposta salva com sucesso.' });
    setSelecionadas([]);
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold">Simulador simples</h2>
        <p className="text-sm text-slate-400">
          Monte sua aposta escolhendo entre 15 e 18 dezenas. Cada número só pode ser utilizado uma vez por jogo.
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

      <div className="space-y-4 rounded-2xl bg-slate-900/70 p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-300">
          <span className="font-semibold">
            Números selecionados: {selecionadas.length} (mín {MIN_DEZENAS} / máx {MAX_DEZENAS})
          </span>
          {selecionadas.length > 0 && (
            <button type="button" className="text-emerald-400 hover:underline" onClick={handleClear}>
              Limpar seleção
            </button>
          )}
        </div>
        <NumberGrid selected={selecionadas} onToggleNumber={handleToggle} maxSelectable={MAX_DEZENAS} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!podeSalvar}
        >
          Salvar jogo simples
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg bg-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-600"
        >
          Limpar seleção
        </button>
      </div>
    </section>
  );
}

export default SimpleSimulatorPage;

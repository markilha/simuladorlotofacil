import type { Dezena } from '../types';

const NUMEROS: Dezena[] = Array.from({ length: 25 }, (_, index) => index + 1);

interface BetCardPreviewProps {
  title: string;
  dezenas: Dezena[];
}

export function BetCardPreview({ title, dezenas }: BetCardPreviewProps) {
  const selecionadas = new Set(dezenas);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 shadow">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-400">{title}</h3>
      <div className="grid grid-cols-5 gap-2">
        {NUMEROS.map((numero) => {
          const estaSelecionado = selecionadas.has(numero);
          return (
            <div
              key={numero}
              className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold ${
                estaSelecionado ? 'border-emerald-400 bg-emerald-500 text-slate-900' : 'border-slate-600 bg-slate-900'
              }`}
            >
              {numero.toString().padStart(2, '0')}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BetCardPreview;

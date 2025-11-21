import type { Dezena } from '../types';

const NUMEROS: Dezena[] = Array.from({ length: 25 }, (_, index) => index + 1);

interface NumberGridProps {
  selected: Dezena[];
  onToggleNumber: (numero: Dezena) => void;
  maxSelectable?: number;
  disabledNumbers?: Dezena[];
}

export function NumberGrid({ selected, onToggleNumber, maxSelectable, disabledNumbers }: NumberGridProps) {
  const selectedSet = new Set(selected);
  const disabledSet = new Set(disabledNumbers ?? []);
  const reachedMax = typeof maxSelectable === 'number' && selected.length >= maxSelectable;

  return (
    <div className="grid grid-cols-5 gap-2">
      {NUMEROS.map((numero) => {
        const isSelected = selectedSet.has(numero);
        const disabled = disabledSet.has(numero) || (reachedMax && !isSelected);
        return (
          <button
            key={numero}
            type="button"
            onClick={() => onToggleNumber(numero)}
            disabled={disabled}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
              isSelected
                ? 'border-emerald-400 bg-emerald-500 text-white'
                : 'border-slate-600 bg-slate-800 text-slate-200 hover:border-emerald-400 hover:text-white'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {numero.toString().padStart(2, '0')}
          </button>
        );
      })}
    </div>
  );
}

export default NumberGrid;

import type { BetResultRow } from '../types';

interface BetsTableProps {
  rows: BetResultRow[];
}

const formatDezenas = (dezenas: number[]) => dezenas.map((numero) => numero.toString().padStart(2, '0')).join(' ');

export function BetsTable({ rows }: BetsTableProps) {
  if (!rows.length) {
    return <p className="text-sm text-slate-400">Nenhuma aposta encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3 text-left">ID / Nome</th>
            <th className="px-4 py-3 text-left">Dezenas</th>
            <th className="px-4 py-3 text-left">Acertos</th>
            <th className="px-4 py-3 text-left">Faixa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900 text-sm">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <div className="font-semibold text-white">{row.nome}</div>
                <div className="text-xs text-slate-400">{row.id}</div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-100">{formatDezenas(row.dezenas)}</td>
              <td className="px-4 py-3">{row.acertos ?? '-'}</td>
              <td className="px-4 py-3 uppercase">{row.faixa ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BetsTable;

import type { Dezena } from '../types';

export function contarAcertos(aposta: Dezena[], resultado: Dezena[]): number {
  const resultadoSet = new Set(resultado);
  return aposta.reduce((total, numero) => (resultadoSet.has(numero) ? total + 1 : total), 0);
}

export function faixaPremiacao(acertos: number): '11' | '12' | '13' | '14' | '15' | 'nenhuma' {
  if (acertos >= 15) return '15';
  if (acertos === 14) return '14';
  if (acertos === 13) return '13';
  if (acertos === 12) return '12';
  if (acertos === 11) return '11';
  return 'nenhuma';
}

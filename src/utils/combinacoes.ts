import type { Dezena } from '../types';

const TODAS_DEZENAS: Dezena[] = Array.from({ length: 25 }, (_, index) => index + 1);

const shuffle = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

export const combinationCount = (n: number, k: number): number => {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  const kEff = Math.min(k, n - k);
  let result = 1;
  for (let i = 1; i <= kEff; i += 1) {
    result = (result * (n - kEff + i)) / i;
    if (!Number.isFinite(result)) {
      return Number.POSITIVE_INFINITY;
    }
  }
  return Math.round(result);
};

/**
 * Heurística:
 * - Todas as dezenas fixas aparecem em todos os jogos.
 * - As demais dezenas são embaralhadas e distribuídas em sistema de fila (round-robin),
 *   evitando repetir sempre as mesmas dezenas e maximizando cobertura.
 * - Quando a fila chega ao fim, embaralhamos novamente para introduzir nova variação.
 * Isso não garante matematicamente 11 pontos, mas reduz repetições e cobre boa parte do universo.
 */
export function generateFixedCombinations(
  fixas: Dezena[],
  dezenasPorJogo: number,
  quantidadeJogos: number,
): Dezena[][] {
  if (fixas.length < 5 || fixas.length > 10) {
    throw new Error('Selecione entre 5 e 10 dezenas fixas.');
  }
  if (dezenasPorJogo < 15 || dezenasPorJogo > 18) {
    throw new Error('Número de dezenas por jogo inválido.');
  }
  if (quantidadeJogos < 1) {
    throw new Error('Informe ao menos 1 jogo.');
  }

  const dezenasRestantes = TODAS_DEZENAS.filter((dezena) => !fixas.includes(dezena));
  if (dezenasRestantes.length + fixas.length < dezenasPorJogo) {
    throw new Error('Não há dezenas suficientes para montar os jogos.');
  }

  const combinacoes: Dezena[][] = [];
  let fila = shuffle(dezenasRestantes);
  const dezenasParaCompletar = dezenasPorJogo - fixas.length;

  for (let jogoIndex = 0; jogoIndex < quantidadeJogos; jogoIndex += 1) {
    if (fila.length < dezenasParaCompletar) {
      fila = shuffle(dezenasRestantes);
    }

    const complementares = fila.slice(0, dezenasParaCompletar);
    const jogo = [...fixas, ...complementares].sort((a, b) => a - b);
    combinacoes.push(jogo);

    // Rotaciona a fila para que os próximos jogos utilizem dezenas diferentes primeiro
    fila = [...fila.slice(dezenasParaCompletar), ...complementares];

    // A cada 5 jogos, introduz um novo embaralhamento para variar mais a cobertura
    if ((jogoIndex + 1) % 5 === 0) {
      fila = shuffle(fila);
    }
  }

  return combinacoes;
}

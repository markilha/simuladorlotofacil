import type { Dezena } from '../types';
import type { ConcursoExcel } from '../utils/resultadosExcel';

export type GuaranteeLevel = 11 | 12 | 13 | 14;

const ALL_NUMBERS: Dezena[] = Array.from({ length: 25 }, (_, index) => (index + 1) as Dezena);
const GRID_SIDE = 5;

export interface RangeConstraint {
  min?: number;
  max?: number;
}

export interface FaixaConstraint {
  baixas?: RangeConstraint;
  altas?: RangeConstraint;
}

export interface RepetitionFilter extends RangeConstraint {
  dezenas: Dezena[];
}

export interface StatisticalFilterOptions {
  pares?: RangeConstraint;
  impares?: RangeConstraint;
  soma?: RangeConstraint;
  linhas?: RangeConstraint[];
  colunas?: RangeConstraint[];
  faixa?: FaixaConstraint;
  repeticaoUltimo?: RepetitionFilter;
}

export interface CombinationRequest {
  universo?: Dezena[];
  dezenasPorJogo: number;
  limite?: number;
  filtros?: StatisticalFilterOptions;
  balanceado?: boolean;
}

export interface EstrategiaFixasOptions {
  fixas: Dezena[];
  dezenasPorJogo: number;
  quantidadeJogos: number;
  variaveis?: Dezena[];
  filtros?: StatisticalFilterOptions;
}

export interface FechamentoOptions {
  fixas: Dezena[];
  variaveis: Dezena[];
  dezenasPorJogo: number;
  garantia: GuaranteeLevel;
  maxJogos?: number;
  filtros?: StatisticalFilterOptions;
}

export interface DesdobramentoInteligenteOptions {
  base: Dezena[];
  dezenasPorJogo: number;
  quantidadeJogos: number;
  garantia?: GuaranteeLevel;
  filtros?: StatisticalFilterOptions;
}

export interface BalanceadoOptions {
  dezenasPorJogo: number;
  quantidadeJogos: number;
  filtros?: StatisticalFilterOptions;
}

export interface FrequenciaEAtrasoOptions {
  historico: Pick<ConcursoExcel, 'concurso' | 'dezenas'>[];
  dezenasPorJogo: number;
  quantidadeJogos: number;
  proporcaoFrequentes?: number;
  filtros?: StatisticalFilterOptions;
}

export interface StrategyMetadata {
  jogosGerados: number;
  universoConsiderado?: Dezena[];
  garantia?: GuaranteeLevel;
  subconjuntosTotais?: number;
  subconjuntosCobertos?: number;
  cobertura?: number;
  observacoes?: string;
}

export interface StrategyResult {
  jogos: Dezena[][];
  metadata: StrategyMetadata;
}

export interface GameMetrics {
  soma: number;
  pares: number;
  impares: number;
  linhas: number[];
  colunas: number[];
  baixas: number;
  altas: number;
  repeticaoUltimo?: number;
}

export interface CondProbabilities {
  dezena: Dezena;
  probDepoisDeSair: number;
  probDepoisDeNaoSair: number;
}

const uniqueSorted = (numeros: Dezena[]): Dezena[] => {
  const set = Array.from(new Set(numeros));
  return set.sort((a, b) => a - b);
};

const validateQuantidade = (dezenasPorJogo: number) => {
  if (dezenasPorJogo < 15 || dezenasPorJogo > 20) {
    throw new Error('Quantidade de dezenas precisa estar entre 15 e 20.');
  }
};

const getRowIndex = (numero: Dezena) => Math.floor((numero - 1) / GRID_SIDE);
const getColumnIndex = (numero: Dezena) => (numero - 1) % GRID_SIDE;

const sum = (lista: Dezena[]) => lista.reduce((total, item) => total + item, 0);

const countEven = (lista: Dezena[]) => lista.filter((numero) => numero % 2 === 0).length;

const countRange = (lista: Dezena[], min: number, max: number) =>
  lista.filter((numero) => numero >= min && numero <= max).length;

const passesRange = (value: number, constraint?: RangeConstraint) => {
  if (!constraint) return true;
  if (constraint.min !== undefined && value < constraint.min) return false;
  if (constraint.max !== undefined && value > constraint.max) return false;
  return true;
};

const intersectionSize = (a: Dezena[], b: Dezena[]) => {
  const setB = new Set(b);
  return a.reduce((total, numero) => (setB.has(numero) ? total + 1 : total), 0);
};

const shuffle = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
};

const combinationIterator = function* <T>(items: T[], comboSize: number, start = 0, prefix: T[] = []): Generator<T[]> {
  if (comboSize === 0) {
    yield [];
    return;
  }
  if (prefix.length === comboSize) {
    yield [...prefix];
    return;
  }

  for (let index = start; index <= items.length - (comboSize - prefix.length); index += 1) {
    prefix.push(items[index]);
    yield* combinationIterator(items, comboSize, index + 1, prefix);
    prefix.pop();
  }
};

const generateCombinationsList = (
  universo: Dezena[],
  comboSize: number,
  limite?: number,
): Dezena[][] => {
  const jogos: Dezena[][] = [];
  let count = 0;
  for (const combo of combinationIterator(universo, comboSize)) {
    jogos.push(combo);
    count += 1;
    if (limite && count >= limite) {
      break;
    }
  }
  return jogos;
};

export const calcularMetricasJogo = (jogo: Dezena[], ultimoResultado?: Dezena[]): GameMetrics => {
  const pares = countEven(jogo);
  const impares = jogo.length - pares;
  const linhas = Array(GRID_SIDE).fill(0);
  const colunas = Array(GRID_SIDE).fill(0);

  jogo.forEach((numero) => {
    linhas[getRowIndex(numero)] += 1;
    colunas[getColumnIndex(numero)] += 1;
  });

  const baixas = countRange(jogo, 1, 13);
  const altas = jogo.length - baixas;

  return {
    soma: sum(jogo),
    pares,
    impares,
    linhas,
    colunas,
    baixas,
    altas,
    repeticaoUltimo: ultimoResultado ? intersectionSize(jogo, ultimoResultado) : undefined,
  };
};

const passesFilters = (jogo: Dezena[], filtros?: StatisticalFilterOptions): boolean => {
  if (!filtros) return true;

  const metrics = calcularMetricasJogo(jogo, filtros.repeticaoUltimo?.dezenas);

  if (!passesRange(metrics.pares, filtros.pares)) return false;
  if (!passesRange(metrics.impares, filtros.impares)) return false;
  if (!passesRange(metrics.soma, filtros.soma)) return false;
  if (
    filtros.repeticaoUltimo &&
    metrics.repeticaoUltimo !== undefined &&
    !passesRange(metrics.repeticaoUltimo, filtros.repeticaoUltimo)
  ) {
    return false;
  }

  if (filtros.linhas) {
    const limiteLinhas = Math.min(filtros.linhas.length, GRID_SIDE);
    for (let i = 0; i < limiteLinhas; i += 1) {
      if (!passesRange(metrics.linhas[i], filtros.linhas[i])) {
        return false;
      }
    }
  }

  if (filtros.colunas) {
    const limiteColunas = Math.min(filtros.colunas.length, GRID_SIDE);
    for (let i = 0; i < limiteColunas; i += 1) {
      if (!passesRange(metrics.colunas[i], filtros.colunas[i])) {
        return false;
      }
    }
  }

  if (filtros.faixa) {
    if (!passesRange(metrics.baixas, filtros.faixa.baixas)) return false;
    if (!passesRange(metrics.altas, filtros.faixa.altas)) return false;
  }

  return true;
};

const isBalancedGame = (jogo: Dezena[]): boolean => {
  const metrics = calcularMetricasJogo(jogo);
  const targetParity = jogo.length / 2;
  const parityDiff = Math.abs(metrics.pares - targetParity);
  const faixaDiff = Math.abs(metrics.baixas - metrics.altas);
  const somaEsperada = jogo.length * 13;
  const somaTolerancia = jogo.length * 2;
  const rowsComNumeros = metrics.linhas.filter((valor) => valor > 0).length;
  const colsComNumeros = metrics.colunas.filter((valor) => valor > 0).length;

  return (
    parityDiff <= 2 &&
    faixaDiff <= 3 &&
    Math.abs(metrics.soma - somaEsperada) <= somaTolerancia &&
    rowsComNumeros >= 4 &&
    colsComNumeros >= 4
  );
};

export const aplicarFiltrosEstatisticos = (jogos: Dezena[][], filtros: StatisticalFilterOptions): Dezena[][] =>
  jogos.filter((jogo) => passesFilters(jogo, filtros));

export const gerarCombinacoes = (options: CombinationRequest): StrategyResult => {
  const { universo = ALL_NUMBERS, dezenasPorJogo, limite = 512, filtros, balanceado } = options;
  validateQuantidade(dezenasPorJogo);
  const universoOrdenado = uniqueSorted(universo);

  if (universoOrdenado.length < dezenasPorJogo) {
    throw new Error('Universo insuficiente para o tamanho solicitado.');
  }

  const jogos: Dezena[][] = [];
  for (const combo of combinationIterator(universoOrdenado, dezenasPorJogo)) {
    if (balanceado && !isBalancedGame(combo)) {
      continue;
    }
    if (filtros && !passesFilters(combo, filtros)) {
      continue;
    }
    jogos.push(combo);
    if (jogos.length >= limite) {
      break;
    }
  }

  return {
    jogos,
    metadata: {
      jogosGerados: jogos.length,
      universoConsiderado: universoOrdenado,
      observacoes: balanceado ? 'Combinacoes priorizaram equilibrio estatistico.' : undefined,
    },
  };
};

export const criarEstrategiaComFixas = (options: EstrategiaFixasOptions): StrategyResult => {
  const { fixas, dezenasPorJogo, quantidadeJogos, variaveis, filtros } = options;
  validateQuantidade(dezenasPorJogo);

  if (!fixas.length) {
    throw new Error('Informe ao menos uma dezena fixa.');
  }
  if (quantidadeJogos < 1) {
    throw new Error('Informe a quantidade desejada de jogos.');
  }

  const fixasOrdenadas = uniqueSorted(fixas);
  const fixasSet = new Set(fixasOrdenadas);
  const complementoNecessario = dezenasPorJogo - fixasOrdenadas.length;
  if (complementoNecessario <= 0) {
    throw new Error('Quantidade de fixas maior que o limite por jogo.');
  }

  let variaveisBase = variaveis ? uniqueSorted(variaveis.filter((numero) => !fixasSet.has(numero))) : [];
  if (variaveisBase.length < complementoNecessario) {
    const restantes = ALL_NUMBERS.filter((numero) => !fixasSet.has(numero) && !variaveisBase.includes(numero));
    variaveisBase = [...variaveisBase, ...restantes].slice(0, complementoNecessario);
  }

  if (variaveisBase.length < complementoNecessario) {
    throw new Error('Universo de variaveis insuficiente para completar os jogos.');
  }

  let fila = [...variaveisBase];
  const jogos: Dezena[][] = [];
  let jogoIndex = 0;

  while (jogos.length < quantidadeJogos) {
    if (fila.length < complementoNecessario) {
      fila = shuffle(variaveisBase);
    }

    const candidato = [...fixasOrdenadas, ...fila.slice(0, complementoNecessario)].sort((a, b) => a - b);
    fila = [...fila.slice(complementoNecessario), ...fila.slice(0, complementoNecessario)];

    if (filtros && !passesFilters(candidato, filtros)) {
      fila = shuffle(fila);
      jogoIndex += 1;
      if (jogoIndex > variaveisBase.length * 3) {
        break;
      }
      continue;
    }

    jogos.push(candidato);
    jogoIndex += 1;
  }

  return {
    jogos,
    metadata: {
      jogosGerados: jogos.length,
      universoConsiderado: uniqueSorted([...fixasOrdenadas, ...variaveisBase]),
      observacoes: 'Combina fixas com rotacao de variaveis para ampliar cobertura.',
    },
  };
};

const subsetKeysFromCombination = (numeros: Dezena[], subsetSize: number): string[] => {
  if (subsetSize <= 0) return [];
  const keys: string[] = [];
  for (const subset of combinationIterator(numeros, subsetSize)) {
    keys.push(subset.join('-'));
  }
  return keys;
};

export const criarFechamentoGarantido = (options: FechamentoOptions): StrategyResult => {
  const { fixas, variaveis, dezenasPorJogo, garantia, maxJogos, filtros } = options;
  validateQuantidade(dezenasPorJogo);

  if (!variaveis.length) {
    throw new Error('Informe as dezenas variaveis para o fechamento.');
  }

  const fixasOrdenadas = uniqueSorted(fixas);
  const variaveisOrdenadas = uniqueSorted(variaveis.filter((numero) => !fixasOrdenadas.includes(numero)));
  const universo = uniqueSorted([...fixasOrdenadas, ...variaveisOrdenadas]);

  if (universo.length < dezenasPorJogo) {
    throw new Error('Universo menor que o tamanho dos jogos.');
  }

  const complemento = dezenasPorJogo - fixasOrdenadas.length;
  if (complemento <= 0) {
    throw new Error('Quantidade de fixas excede o limite de dezenas por jogo.');
  }

  if (garantia > dezenasPorJogo) {
    throw new Error('Garantia maior que o tamanho do jogo.');
  }

  const subsetSize = Math.max(garantia - fixasOrdenadas.length, 0);
  if (subsetSize > variaveisOrdenadas.length) {
    throw new Error('Variaveis insuficientes para construir a garantia solicitada.');
  }

  const alvoSubconjuntos = subsetSize > 0 ? subsetKeysFromCombination(variaveisOrdenadas, subsetSize) : [];
  const subconjuntosPendentes = new Set(alvoSubconjuntos);
  const candidatoComplements: Array<Dezena[] | null> = generateCombinationsList(
    variaveisOrdenadas,
    complemento,
  ).map((combo) => [...combo]);

  const jogos: Dezena[][] = [];
  const jogosChaves = new Set<string>();
  const limite = maxJogos ?? candidatoComplements.length;

  while (jogos.length < limite && (subconjuntosPendentes.size > 0 || subsetSize === 0)) {
    let melhorIndice = -1;
    let melhorCobertura = 0;
    for (let i = 0; i < candidatoComplements.length; i += 1) {
      const complementoAtual = candidatoComplements[i];
      if (!complementoAtual) continue;
      const chaves = subsetSize > 0 ? subsetKeysFromCombination(complementoAtual, subsetSize) : [];
      const cobertura = subsetSize > 0 ? chaves.filter((key) => subconjuntosPendentes.has(key)).length : complementoAtual.length;
      if (cobertura > melhorCobertura) {
        melhorCobertura = cobertura;
        melhorIndice = i;
      }
    }

    if (melhorIndice === -1) {
      break;
    }

    const melhorComplemento = candidatoComplements[melhorIndice];
    if (!melhorComplemento) {
      continue;
    }
    candidatoComplements[melhorIndice] = null;

    const jogo = [...fixasOrdenadas, ...melhorComplemento].sort((a, b) => a - b);
    const chave = jogo.join('-');
    if (jogosChaves.has(chave)) {
      continue;
    }

    if (filtros && !passesFilters(jogo, filtros)) {
      continue;
    }

    jogosChaves.add(chave);
    jogos.push(jogo);

    if (subsetSize > 0) {
      for (const key of subsetKeysFromCombination(melhorComplemento, subsetSize)) {
        subconjuntosPendentes.delete(key);
      }
    }

    if (subsetSize === 0) {
      break;
    }
  }

  const totalSubconjuntos = subsetSize > 0 ? alvoSubconjuntos.length : 0;
  const cobertos = subsetSize > 0 ? totalSubconjuntos - subconjuntosPendentes.size : 0;

  return {
    jogos,
    metadata: {
      jogosGerados: jogos.length,
      universoConsiderado: universo,
      garantia,
      subconjuntosTotais: totalSubconjuntos,
      subconjuntosCobertos: cobertos,
      cobertura: totalSubconjuntos ? cobertos / totalSubconjuntos : 1,
      observacoes:
        subsetSize === 0
          ? 'Todas as fixas ja garantem a pontuacao solicitada.'
          : 'Fechamento criado com heuristica gulosa para cobrir combinacoes alvo.',
    },
  };
};

const scoreCombo = (jogo: Dezena[]): number => {
  const metrics = calcularMetricasJogo(jogo);
  const targetParity = jogo.length / 2;
  const parityScore = 1 - Math.abs(metrics.pares - targetParity) / jogo.length;
  const faixaScore = 1 - Math.abs(metrics.baixas - metrics.altas) / jogo.length;
  const linhasScore = metrics.linhas.filter((valor) => valor > 0).length / GRID_SIDE;
  const colunasScore = metrics.colunas.filter((valor) => valor > 0).length / GRID_SIDE;

  return (parityScore + faixaScore + linhasScore + colunasScore) / 4;
};

const pairKey = (a: Dezena, b: Dezena) => {
  const menor = Math.min(a, b);
  const maior = Math.max(a, b);
  return `${menor}-${maior}`;
};

export const criarDesdobramentoInteligente = (options: DesdobramentoInteligenteOptions): StrategyResult => {
  const { base, dezenasPorJogo, quantidadeJogos, garantia, filtros } = options;
  validateQuantidade(dezenasPorJogo);

  const universo = uniqueSorted(base);
  if (universo.length < dezenasPorJogo) {
    throw new Error('Universo base menor do que o tamanho do jogo.');
  }

  const candidatos = gerarCombinacoes({
    universo,
    dezenasPorJogo,
    limite: quantidadeJogos * 25,
    filtros,
    balanceado: true,
  }).jogos;

  const paresCobertos = new Set<string>();
  const jogosSelecionados: Dezena[][] = [];

  while (candidatos.length && jogosSelecionados.length < quantidadeJogos) {
    let melhorIndice = 0;
    let melhorPontuacao = -Infinity;

    candidatos.forEach((jogo, index) => {
      let bonusPares = 0;
      for (let i = 0; i < jogo.length - 1; i += 1) {
        for (let j = i + 1; j < jogo.length; j += 1) {
          if (!paresCobertos.has(pairKey(jogo[i], jogo[j]))) {
            bonusPares += 1;
          }
        }
      }
      const coberturaRatio = garantia ? jogo.length / garantia : 1;
      const pontuacao = scoreCombo(jogo) + bonusPares * 0.01 + coberturaRatio * 0.1;
      if (pontuacao > melhorPontuacao) {
        melhorPontuacao = pontuacao;
        melhorIndice = index;
      }
    });

    const escolhido = candidatos.splice(melhorIndice, 1)[0];
    jogosSelecionados.push(escolhido);
    for (let i = 0; i < escolhido.length - 1; i += 1) {
      for (let j = i + 1; j < escolhido.length; j += 1) {
        paresCobertos.add(pairKey(escolhido[i], escolhido[j]));
      }
    }
  }

  return {
    jogos: jogosSelecionados,
    metadata: {
      jogosGerados: jogosSelecionados.length,
      universoConsiderado: universo,
      garantia,
      observacoes: 'Desdobramento prioriza distribuicao equilibrada e cobertura de pares unicos.',
    },
  };
};

export const gerarJogosBalanceados = (options: BalanceadoOptions): StrategyResult => {
  const { dezenasPorJogo, quantidadeJogos, filtros } = options;
  const combinacoes = gerarCombinacoes({
    dezenasPorJogo,
    limite: quantidadeJogos,
    filtros,
    balanceado: true,
  });

  return {
    jogos: combinacoes.jogos.slice(0, quantidadeJogos),
    metadata: {
      jogosGerados: Math.min(combinacoes.jogos.length, quantidadeJogos),
      observacoes: 'Jogos selecionados com restricoes de equilibrio de pares, linhas e faixas.',
    },
  };
};

const calcularFrequenciasEAtrasos = (
  historico: Pick<ConcursoExcel, 'concurso' | 'dezenas'>[],
): Record<Dezena, { frequencia: number; atraso: number }> => {
  const frequencia: Record<Dezena, number> = {} as Record<Dezena, number>;
  const ultimoIndice: Record<Dezena, number> = {} as Record<Dezena, number>;
  const ordenado = [...historico].sort((a, b) => a.concurso - b.concurso);

  ordenado.forEach((concurso, indice) => {
    concurso.dezenas.forEach((dezena) => {
      frequencia[dezena] = (frequencia[dezena] || 0) + 1;
      ultimoIndice[dezena] = indice + 1;
    });
  });

  const total = ordenado.length;
  const resultado: Record<Dezena, { frequencia: number; atraso: number }> = {} as Record<Dezena, {
    frequencia: number;
    atraso: number;
  }>;

  ALL_NUMBERS.forEach((dezena) => {
    resultado[dezena] = {
      frequencia: frequencia[dezena] || 0,
      atraso: total - (ultimoIndice[dezena] || 0),
    };
  });

  return resultado;
};

export const estrategiaNumerosFrequentesEAtrasados = (
  options: FrequenciaEAtrasoOptions,
): StrategyResult => {
  const { historico, dezenasPorJogo, quantidadeJogos, proporcaoFrequentes = 0.6, filtros } = options;
  validateQuantidade(dezenasPorJogo);

  if (!historico.length) {
    throw new Error('Historico vazio para calcular frequencias.');
  }

  const estatisticas = calcularFrequenciasEAtrasos(historico);
  const frequentes = [...ALL_NUMBERS].sort((a, b) => estatisticas[b].frequencia - estatisticas[a].frequencia);
  const atrasados = [...ALL_NUMBERS].sort((a, b) => estatisticas[b].atraso - estatisticas[a].atraso);
  const frequentesPorJogo = Math.max(1, Math.round(dezenasPorJogo * proporcaoFrequentes));
  const atrasadosPorJogo = Math.max(1, dezenasPorJogo - frequentesPorJogo);

  const jogos: Dezena[][] = [];
  let indiceFrequente = 0;
  let indiceAtrasado = 0;

  while (jogos.length < quantidadeJogos) {
    const jogoSet = new Set<Dezena>();
    for (let i = 0; i < frequentesPorJogo; i += 1) {
      jogoSet.add(frequentes[indiceFrequente % frequentes.length]);
      indiceFrequente += 1;
    }
    for (let i = 0; i < atrasadosPorJogo; i += 1) {
      jogoSet.add(atrasados[indiceAtrasado % atrasados.length]);
      indiceAtrasado += 1;
    }

    const jogo = Array.from(jogoSet).sort((a, b) => a - b).slice(0, dezenasPorJogo);
    if (jogo.length < dezenasPorJogo) {
      const restantes = ALL_NUMBERS.filter((numero) => !jogoSet.has(numero));
      jogo.push(...restantes.slice(0, dezenasPorJogo - jogo.length));
      jogo.sort((a, b) => a - b);
    }

    if (filtros && !passesFilters(jogo, filtros)) {
      indiceFrequente += 1;
      indiceAtrasado += 1;
      continue;
    }

    jogos.push(jogo);
  }

  return {
    jogos,
    metadata: {
      jogosGerados: jogos.length,
      observacoes: 'Combina numeros mais frequentes com os mais atrasados do historico.',
    },
  };
};

export const calcularProbabilidadeCondicional = (
  historico: Pick<ConcursoExcel, 'concurso' | 'dezenas'>[],
): CondProbabilities[] => {
  if (historico.length < 2) {
    return ALL_NUMBERS.map((dezena) => ({
      dezena,
      probDepoisDeSair: 0,
      probDepoisDeNaoSair: 0,
    }));
  }

  const ordenado = [...historico].sort((a, b) => a.concurso - b.concurso);
  const totalDepoisDeSair: Record<Dezena, number> = {} as Record<Dezena, number>;
  const sucessoDepoisDeSair: Record<Dezena, number> = {} as Record<Dezena, number>;
  const totalDepoisDeNaoSair: Record<Dezena, number> = {} as Record<Dezena, number>;
  const sucessoDepoisDeNaoSair: Record<Dezena, number> = {} as Record<Dezena, number>;

  for (let index = 1; index < ordenado.length; index += 1) {
    const anterior = ordenado[index - 1];
    const atual = ordenado[index];
    const anteriorSet = new Set(anterior.dezenas);
    const atualSet = new Set(atual.dezenas);

    ALL_NUMBERS.forEach((dezena) => {
      if (anteriorSet.has(dezena)) {
        totalDepoisDeSair[dezena] = (totalDepoisDeSair[dezena] || 0) + 1;
        if (atualSet.has(dezena)) {
          sucessoDepoisDeSair[dezena] = (sucessoDepoisDeSair[dezena] || 0) + 1;
        }
      } else {
        totalDepoisDeNaoSair[dezena] = (totalDepoisDeNaoSair[dezena] || 0) + 1;
        if (atualSet.has(dezena)) {
          sucessoDepoisDeNaoSair[dezena] = (sucessoDepoisDeNaoSair[dezena] || 0) + 1;
        }
      }
    });
  }

  return ALL_NUMBERS.map((dezena) => {
    const probHit =
      totalDepoisDeSair[dezena] > 0 ? (sucessoDepoisDeSair[dezena] || 0) / totalDepoisDeSair[dezena] : 0;
    const probMiss =
      totalDepoisDeNaoSair[dezena] > 0
        ? (sucessoDepoisDeNaoSair[dezena] || 0) / totalDepoisDeNaoSair[dezena]
        : 0;

    return {
      dezena,
      probDepoisDeSair: Number(probHit.toFixed(4)),
      probDepoisDeNaoSair: Number(probMiss.toFixed(4)),
    };
  });
};

export const analisarRepeticoes = (jogos: Dezena[][], ultimoResultado: Dezena[]): number[] =>
  jogos.map((jogo) => intersectionSize(jogo, ultimoResultado));

export const avaliarFaixas = (jogos: Dezena[][]): { baixas: number; altas: number }[] =>
  jogos.map((jogo) => {
    const baixas = countRange(jogo, 1, 13);
    return { baixas, altas: jogo.length - baixas };
  });

export const estatisticasLinhasEColunas = (jogos: Dezena[][]): { linhas: number[]; colunas: number[] }[] =>
  jogos.map((jogo) => {
    const metrics = calcularMetricasJogo(jogo);
    return {
      linhas: metrics.linhas,
      colunas: metrics.colunas,
    };
  });

import type { Dezena } from '../types';

const API_URL = 'https://loteriascaixa-api.herokuapp.com/api/lotofacil/latest';

export interface Premiacao {
  descricao: string;
  faixa: number;
  ganhadores: number;
  valorPremio: number;
}

interface LotofacilApiResponse {
  loteria: string;
  concurso: number;
  data: string;
  local: string;
  dezenasOrdemSorteio: string[];
  dezenas: string[];
  trevos: any[];
  timeCoracao: string | null;
  mesSorte: string | null;
  premiacoes: Premiacao[];
  estadosPremiados: any[];
  observacao: string;
  acumulou: boolean;
  proximoConcurso: number;
  dataProximoConcurso: string;
  localGanhadores: any[];
  valorArrecadado: number;
  valorAcumuladoConcurso_0_5: number;
  valorAcumuladoConcursoEspecial: number;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
}

export async function fetchLatestLotofacilResult(): Promise<{ dezenas: Dezena[]; descricao?: string; premiacoes?: Premiacao[] }> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: LotofacilApiResponse = await response.json();

    if (!data.dezenas || !Array.isArray(data.dezenas)) {
      throw new Error('Formato de resposta inválido: dezenas não encontradas.');
    }

    const dezenas = data.dezenas
      .map((d) => Number(d))
      .filter((n) => Number.isInteger(n) && n >= 1 && n <= 25) as Dezena[];

    if (dezenas.length !== 15) {
      throw new Error(`Quantidade incorreta de dezenas retornada: ${dezenas.length}`);
    }

    const descricao = `Concurso ${data.concurso} - ${data.data}`;

    return { dezenas, descricao, premiacoes: data.premiacoes };
  } catch (error) {
    console.error('Erro ao buscar resultado da Lotofácil:', error);
    throw error instanceof Error ? error : new Error('Falha na busca do resultado.');
  }
}

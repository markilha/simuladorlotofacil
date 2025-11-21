export type Dezena = number; // valores entre 1 e 25

export interface Aposta {
  id: string;
  tipo: 'simples' | 'simulacao' | 'estrategia';
  nome: string;
  dataCriacao: string; // ISO string
  dezenasPorJogo: 15 | 16 | 17 | 18 | 19 | 20;
  jogos: Dezena[][];
  dezenasFixas?: Dezena[];
}

export interface BetResultRow {
  id: string;
  nome: string;
  dezenas: Dezena[];
  acertos?: number;
  faixa?: string;
}

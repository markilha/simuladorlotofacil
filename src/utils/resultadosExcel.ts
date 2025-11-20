import * as XLSX from 'xlsx';
import type { Dezena } from '../types';
import { getResultsSheetBuffer } from '../storage/resultsSheetStorage';

export interface ConcursoExcel {
  concurso: number;
  dataSorteio: string;
  dezenas: Dezena[];
}

const normalizeSheetRange = (sheet: XLSX.WorkSheet) => {
  const cellKeys = Object.keys(sheet).filter((key) => /^[A-Za-z]+[0-9]+$/.test(key));
  if (!cellKeys.length) return;

  const range = {
    s: { r: Number.MAX_SAFE_INTEGER, c: Number.MAX_SAFE_INTEGER },
    e: { r: 0, c: 0 },
  };

  cellKeys.forEach((key) => {
    const decoded = XLSX.utils.decode_cell(key);
    if (decoded.r < range.s.r) range.s.r = decoded.r;
    if (decoded.c < range.s.c) range.s.c = decoded.c;
    if (decoded.r > range.e.r) range.e.r = decoded.r;
    if (decoded.c > range.e.c) range.e.c = decoded.c;
  });

  sheet['!ref'] = XLSX.utils.encode_range(range.s, range.e);
};

const parseSheet = (sheet: XLSX.WorkSheet): ConcursoExcel[] => {
  normalizeSheetRange(sheet);
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);

  return rows
    .map((row) => {
      const concurso = Number(row['Concurso']);
      const dataSorteio = typeof row['Data Sorteio'] === 'string' ? row['Data Sorteio'] : '';
      const dezenas: Dezena[] = [];

      for (let i = 1; i <= 15; i += 1) {
        const key = `Bola${i}` as keyof typeof row;
        const valor = Number(row[key]);
        if (!Number.isNaN(valor)) {
          dezenas.push(valor as Dezena);
        }
      }

      return {
        concurso,
        dataSorteio,
        dezenas,
      };
    })
    .filter((item) => Number.isFinite(item.concurso) && item.dezenas.length === 15)
    .sort((a, b) => b.concurso - a.concurso);
};

export function carregarResultadosExcelFromBuffer(buffer: ArrayBuffer): ConcursoExcel[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return parseSheet(sheet);
}

export function carregarResultadosDaConfiguracao(): ConcursoExcel[] {
  const buffer = getResultsSheetBuffer();
  if (!buffer) {
    throw new Error('Nenhuma planilha carregada. Vá até Configurações.');
  }
  return carregarResultadosExcelFromBuffer(buffer);
}

import type { Dezena } from '../types';

const LOTOFACIL_URL = 'https://loterias.caixa.gov.br/paginas/lotofacil.aspx';
const URL_FALLBACKS = [
  LOTOFACIL_URL,
  `https://cors.isomorphic-git.org/${LOTOFACIL_URL}`,
  `https://corsproxy.io/?${encodeURIComponent(LOTOFACIL_URL)}`,
  `https://api.allorigins.win/raw?url=${encodeURIComponent(LOTOFACIL_URL)}`,
];

const parseDezenasFromHtml = (html: string): { dezenas: Dezena[]; descricao?: string } => {
  const normalize = (doc: Document) => {
    const selectors = [
      'ul.simple-container.lista-dezenas.lotofacil li',
      '.resultado-loteria .lista-dezenas li',
      '.lotofacil .lista-dezenas li',
    ];

    for (const selector of selectors) {
      const lista = doc.querySelectorAll(selector);
      if (lista.length) {
        const dezenas = Array.from(lista)
          .map((element) => Number(element.textContent?.trim()))
          .filter((numero) => Number.isInteger(numero)) as Dezena[];

        if (dezenas.length) {
          const descricao =
            doc.querySelector('.titulo-modalidade')?.textContent?.trim() ||
            doc.querySelector('.resultado-loteria .title-bar h2')?.textContent?.trim() ||
            undefined;

          return { dezenas, descricao };
        }
      }
    }
    return null;
  };

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const result = normalize(doc);
    if (result) return result;
  }

  const regex = /<li[^>]*class="[^"]*lista-dezenas[^"]*"[^>]*>(\d{2})<\/li>/g;
  const dezenas: Dezena[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    dezenas.push(Number(match[1]) as Dezena);
  }
  return { dezenas, descricao: undefined };
};

const fetchHtmlWithFallback = async (): Promise<string> => {
  let lastError: Error | null = null;
  for (const target of URL_FALLBACKS) {
    try {
      const response = await fetch(target, {
        mode: 'cors',
      });
      if (response.ok) {
        return await response.text();
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Falha na busca do resultado.');
    }
  }
  throw lastError ?? new Error('Não foi possível acessar o site da Caixa.');
};

export async function fetchLatestLotofacilResult(): Promise<{ dezenas: Dezena[]; descricao?: string }> {
  const html = await fetchHtmlWithFallback();
  const { dezenas, descricao } = parseDezenasFromHtml(html);
  if (!dezenas.length) {
    throw new Error('Não foi possível extrair as dezenas do último resultado.');
  }
  return { dezenas: dezenas.slice(0, 15).map((n) => n as Dezena), descricao };
}

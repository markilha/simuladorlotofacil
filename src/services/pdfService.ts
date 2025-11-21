import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Aposta, Dezena } from '../types';

const formatNumber = (numero: Dezena) => numero.toString().padStart(2, '0');

const CARD_WIDTH = 92;
const CARD_HEIGHT = 190;
const GRID_ROWS = 5;
const GRID_COLS = 5;
const CELL_SIZE = 7;
const CELL_SPACING_X = 3;
const CELL_SPACING_Y = 2.5;
const GRID_OFFSET_X = 10;
const GRID_OFFSET_Y = 24;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE + (GRID_ROWS - 1) * CELL_SPACING_Y;
const GRID_NUMBERS: Dezena[] = Array.from({ length: GRID_ROWS * GRID_COLS }, (_, index) => index + 1);
const BORDER_MARGIN = 0.8;
const READING_AREA_HEIGHT = 16;
const LINE_WIDTH = 0.4;
const BULLET = '\u2022';

const INSTRUCTION_TEXTS = [
  'Marque de 15 a 20 n\u00fameros neste quadro.',
  'Utilize caneta azul ou preta e evite rasuras.',
  'Para concursos consecutivos, solicite a Teimosinha no caixa.',
  'Para deixar o sistema escolher, pe\u00e7a a Surpresinha.',
  'Confira e guarde o comprovante emitido pelo terminal.',
];

const OPTION_SECTIONS = [
  {
    title: 'Teimosinha',
    options: ['3 Concursos', '6 Concursos', '9 Concursos', '12 Concursos'],
  },
  {
    title: 'Surpresinha',
    options: ['1 jogo', '2 jogos', '3 jogos', '4 jogos', '5 jogos'],
  },
];

const CONTEST_FIELDS = [
  { label: 'Concurso', width: 24 },
  { label: 'Data', width: 24 },
  { label: 'Valor', width: 20 },
];

const drawOuterBorder = (doc: jsPDF, offsetX: number, offsetY: number) => {
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(
    offsetX + BORDER_MARGIN,
    offsetY + BORDER_MARGIN,
    CARD_WIDTH - BORDER_MARGIN * 2,
    CARD_HEIGHT - BORDER_MARGIN * 2,
  );
};

const drawHeader = (
  doc: jsPDF,
  aposta: Aposta,
  jogoIndex: number,
  total: number,
  offsetX: number,
  offsetY: number,
) => {
  const centerX = offsetX + CARD_WIDTH / 2;
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LOTOF\u00c1CIL', centerX, offsetY + 9, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('Marque de 15 a 20 dezenas', centerX, offsetY + 13.2, { align: 'center' });

  if (aposta.nome) {
    doc.setFontSize(6.5);
    doc.text(aposta.nome, centerX, offsetY + 16.5, {
      align: 'center',
      maxWidth: CARD_WIDTH - 12,
    });
  }

  doc.setFontSize(6);
  doc.text(
    `Jogo ${jogoIndex + 1} de ${total} ${BULLET} ${aposta.dezenasPorJogo} dezenas`,
    centerX,
    offsetY + 19.5,
    { align: 'center' },
  );
};

const drawContestFields = (doc: jsPDF, offsetX: number, offsetY: number) => {
  const startY = offsetY + 16.8;
  const fieldHeight = 7;
  let startX = offsetX + 6;

  CONTEST_FIELDS.forEach((field) => {
    doc.setLineWidth(0.2);
    doc.rect(startX, startY, field.width, fieldHeight);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(field.label.toUpperCase(), startX + 1.2, startY + 2.4);
    doc.setDrawColor(180, 180, 180);
    doc.line(startX + 1.2, startY + fieldHeight - 1.5, startX + field.width - 1.2, startY + fieldHeight - 1.5);
    doc.setDrawColor(0, 0, 0);
    startX += field.width + 3;
  });
};

const drawNumberGrid = (doc: jsPDF, jogo: Dezena[], offsetX: number, offsetY: number) => {
  const selected = new Set(jogo);
  doc.setLineWidth(LINE_WIDTH);

  GRID_NUMBERS.forEach((numero, index) => {
    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);
    const cellX = offsetX + GRID_OFFSET_X + col * (CELL_SIZE + CELL_SPACING_X);
    const cellY = offsetY + GRID_OFFSET_Y + row * (CELL_SIZE + CELL_SPACING_Y);

    doc.setDrawColor(0, 0, 0);
    doc.setFillColor(255, 255, 255);
    doc.rect(cellX, cellY, CELL_SIZE, CELL_SIZE);

    const isSelected = selected.has(numero);
    if (isSelected) {
      doc.setFillColor(20, 20, 20);
      doc.rect(cellX + 0.8, cellY + 0.8, CELL_SIZE - 1.6, CELL_SIZE - 1.6, 'F');
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(0, 0, 0);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(formatNumber(numero), cellX + CELL_SIZE / 2, cellY + CELL_SIZE / 2 + 2.2, { align: 'center' });
  });
};

const drawInstructions = (doc: jsPDF, offsetX: number, startY: number) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('INSTRU\u00c7\u00d5ES', offsetX + 6, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  let cursorY = startY + 4;
  INSTRUCTION_TEXTS.forEach((instruction) => {
    doc.text(`${BULLET} ${instruction}`, offsetX + 6, cursorY, { maxWidth: CARD_WIDTH - 12 });
    cursorY += 4;
  });

  return cursorY;
};

const drawOptionSections = (doc: jsPDF, offsetX: number, startY: number) => {
  const sectionWidth = (CARD_WIDTH - 12) / OPTION_SECTIONS.length;
  const boxSize = 5;
  let maxY = startY;

  OPTION_SECTIONS.forEach((section, index) => {
    const originX = offsetX + 6 + index * sectionWidth;
    let optionY = startY + 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.text(section.title.toUpperCase(), originX, startY + 2.5);

    section.options.forEach((option) => {
      doc.setLineWidth(0.25);
      doc.rect(originX, optionY, boxSize, boxSize);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.2);
      doc.text(option, originX + boxSize + 2, optionY + boxSize - 1.2);
      optionY += boxSize + 2.5;
    });

    if (optionY > maxY) {
      maxY = optionY;
    }
  });

  return maxY;
};

const drawReadingArea = (doc: jsPDF, offsetX: number, offsetY: number) => {
  const areaWidth = CARD_WIDTH - 12;
  const areaX = offsetX + 6;
  const areaY = offsetY + CARD_HEIGHT - READING_AREA_HEIGHT - 4;

  doc.setFillColor(245, 245, 245);
  doc.rect(areaX, areaY, areaWidth, READING_AREA_HEIGHT, 'F');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.rect(areaX, areaY, areaWidth, READING_AREA_HEIGHT);

  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('\u00c1REA RESERVADA \u00c0 LEITURA \u00d3PTICA', offsetX + CARD_WIDTH / 2, areaY + 6, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.text('N\u00e3o escreva ou dobre esta regi\u00e3o', offsetX + CARD_WIDTH / 2, areaY + 11, {
    align: 'center',
  });
  doc.setTextColor(0, 0, 0);
};

const drawOfficialSlip = (
  doc: jsPDF,
  aposta: Aposta,
  jogo: Dezena[],
  index: number,
  total: number,
  offsetX: number,
  offsetY: number,
) => {
  drawOuterBorder(doc, offsetX, offsetY);
  drawHeader(doc, aposta, index, total, offsetX, offsetY);
  drawContestFields(doc, offsetX, offsetY);
  drawNumberGrid(doc, jogo, offsetX, offsetY);

  const instructionsStartY = offsetY + GRID_OFFSET_Y + GRID_HEIGHT + 8;
  const optionStartY = drawInstructions(doc, offsetX, instructionsStartY) + 2;
  drawOptionSections(doc, offsetX, optionStartY);
  drawReadingArea(doc, offsetX, offsetY);
};

const openOrDownload = (doc: jsPDF, filename: string) => {
  if (typeof window !== 'undefined') {
    const blobUrl = doc.output('bloburl');
    const opened = window.open(blobUrl, '_blank');
    if (!opened) {
      doc.save(filename);
    }
  } else {
    doc.save(filename);
  }
};

export function gerarPdfApostas(aposta: Aposta): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const columns = Math.max(1, Math.floor(pageWidth / CARD_WIDTH));
  const rows = Math.max(1, Math.floor(pageHeight / CARD_HEIGHT));
  const horizontalMargin = Math.max(0, (pageWidth - columns * CARD_WIDTH) / 2);
  const verticalMargin = Math.max(0, (pageHeight - rows * CARD_HEIGHT) / 2);

  let columnIndex = 0;
  let rowIndex = 0;

  aposta.jogos.forEach((jogo, index) => {
    if (columnIndex >= columns) {
      columnIndex = 0;
      rowIndex += 1;
    }

    if (rowIndex >= rows) {
      doc.addPage();
      rowIndex = 0;
      columnIndex = 0;
    }

    const offsetX = horizontalMargin + columnIndex * CARD_WIDTH;
    const offsetY = verticalMargin + rowIndex * CARD_HEIGHT;

    drawOfficialSlip(doc, aposta, jogo, index, aposta.jogos.length, offsetX, offsetY);
    columnIndex += 1;
  });

  const filename = `volantes-oficiais-${aposta.nome.replace(/\s+/g, '-').toLowerCase()}-${aposta.id}.pdf`;
  openOrDownload(doc, filename);
}

export interface HistoricoRegistro {
  concurso: number;
  dataSorteio: string;
  melhorAcertos: number;
  faixa: string;
  jogo: Dezena[];
}

export function gerarPdfHistorico(nomeSimulacao: string, registros: HistoricoRegistro[]): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const resumo = {
    '11': 0,
    '12': 0,
    '13': 0,
    '14': 0,
    '15': 0,
  };

  registros.forEach((item) => {
    if (item.melhorAcertos >= 11) {
      const faixa = String(Math.min(item.melhorAcertos, 15)) as keyof typeof resumo;
      resumo[faixa] += 1;
    }
  });

  const resumoTextoPartes = Object.entries(resumo)
    .filter(([, quantidade]) => quantidade > 0)
    .map(([faixa, quantidade]) => `${quantidade} cart\u00e3o(\u00f5es) com ${faixa} pontos`);
  const resumoTexto =
    resumoTextoPartes.length > 0
      ? resumoTextoPartes.join(' \u2022 ')
      : 'Nenhum cart\u00e3o hist\u00f3rico atingiu 11 ou mais pontos.';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Relat\u00f3rio hist\u00f3rico - Lotof\u00e1cil', 15, 15);
  doc.setFontSize(12);
  doc.text(nomeSimulacao, 15, 22, { maxWidth: 180 });
  doc.setFont('helvetica', 'normal');
  doc.text(`Concursos analisados: ${registros.length}`, 15, 28);
  doc.text(`Resumo: ${resumoTexto}`, 15, 35, { maxWidth: 180 });

  const rows = registros.map((item) => [
    `#${item.concurso}`,
    item.dataSorteio || '-',
    item.jogo.length ? item.jogo.map((n) => n.toString().padStart(2, '0')).join(' ') : '-',
    item.melhorAcertos.toString(),
    item.faixa === 'nenhuma' ? '-' : `${item.faixa} pts`,
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Concurso', 'Data', 'Melhor jogo', 'Acertos', 'Faixa']],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      halign: 'left',
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [15, 23, 42],
    },
    margin: { left: 15, right: 15 },
  });

  openOrDownload(
    doc,
    `relatorio-historico-${nomeSimulacao.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
  );
}

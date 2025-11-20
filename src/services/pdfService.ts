import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Aposta, Dezena } from '../types';

const formatNumber = (numero: Dezena) => numero.toString().padStart(2, '0');

const formatLine = (jogo: Dezena[]) => jogo.map(formatNumber).join(', ');

const chunk = <T,>(items: T[], size: number): T[][] => {
  const groups: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }
  return groups;
};

const CHUNK_SIZE = 3;
const CELL_SIZE = 6;
const GRID_SIZE = CELL_SIZE * 5;
const GRID_SPACING = 10;
const MIN_SLIP_HEIGHT = 200;

const drawGrid = (doc: jsPDF, jogo: Dezena[], x: number, y: number) => {
  const jogoSet = new Set(jogo);
  doc.setLineWidth(0.2);

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const numero = row * 5 + col + 1;
      const cellX = x + col * CELL_SIZE;
      const cellY = y + row * CELL_SIZE;
      doc.setDrawColor(30, 41, 59);
      doc.rect(cellX, cellY, CELL_SIZE, CELL_SIZE);
      if (jogoSet.has(numero)) {
        doc.setFillColor(0, 0, 0);
        doc.rect(cellX + 0.5, cellY + 0.5, CELL_SIZE - 1, CELL_SIZE - 1, 'F');
      }
    }
  }
};

const drawSlip = (
  doc: jsPDF,
  aposta: Aposta,
  jogosGrupo: Dezena[][],
  grupoIndex: number,
  totalGrupos: number,
) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const startX = (pageWidth - 85) / 2;
  const startY = 15;
  const contentHeight = 70 + jogosGrupo.length * (GRID_SIZE + GRID_SPACING);
  const slipHeight = Math.max(contentHeight, MIN_SLIP_HEIGHT);

  doc.setDrawColor(220, 38, 38);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(startX, startY, 85, slipHeight);
  doc.setLineDashPattern([], 0);

  const centerX = startX + 42.5;
  doc.setTextColor(15, 23, 42);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Lotofácil', centerX, startY + 10, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(aposta.nome, centerX, startY + 16, { align: 'center' });
  doc.text(`Volante ${grupoIndex + 1} de ${totalGrupos}`, centerX, startY + 22, { align: 'center' });

  const rangeStart = grupoIndex * CHUNK_SIZE + 1;
  const rangeEnd = rangeStart + jogosGrupo.length - 1;

  doc.setFontSize(9);
  doc.text(`Jogos ${rangeStart} a ${rangeEnd}`, centerX, startY + 30, { align: 'center' });

  let textY = startY + 38;
  doc.setFontSize(8);
  doc.setFont('courier', 'normal');
  jogosGrupo.forEach((jogo, idx) => {
    const label = `Jogo ${rangeStart + idx}: ${formatLine(jogo)}`;
    doc.text(label, startX + 4, textY);
    textY += 4;
  });

  let gridStartY = textY + 4;
  doc.setFont('helvetica', 'normal');
  jogosGrupo.forEach((jogo) => {
    const gridX = startX + (85 - GRID_SIZE) / 2;
    drawGrid(doc, jogo, gridX, gridStartY);
    gridStartY += GRID_SIZE + GRID_SPACING;
  });
};

export function gerarPdfApostas(aposta: Aposta): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const grupos = chunk(aposta.jogos, CHUNK_SIZE);

  grupos.forEach((grupo, index) => {
    if (index > 0) {
      doc.addPage();
    }
    drawSlip(doc, aposta, grupo, index, grupos.length);
  });

  const filename = `apostas-${aposta.nome.replace(/\s+/g, '-').toLowerCase()}-${aposta.id}.pdf`;
  if (typeof window !== 'undefined') {
    const blobUrl = doc.output('bloburl');
    const opened = window.open(blobUrl, '_blank');
    if (!opened) {
      doc.save(filename);
    }
  } else {
    doc.save(filename);
  }
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
    .map(([faixa, quantidade]) => `${quantidade} cartão(ões) com ${faixa} pontos`);
  const resumoTexto =
    resumoTextoPartes.length > 0
      ? resumoTextoPartes.join(' · ')
      : 'Nenhum cartão histórico atingiu 11 ou mais pontos.';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Relatório histórico - Lotofácil', 15, 15);
  doc.setFontSize(12);
  doc.text(nomeSimulacao, 15, 22);
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

  if (typeof window !== 'undefined') {
    const blobUrl = doc.output('bloburl');
    const opened = window.open(blobUrl, '_blank');
    if (!opened) {
      doc.save(
        `relatorio-historico-${nomeSimulacao.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`,
      );
    }
  } else {
    doc.save(`relatorio-historico-${nomeSimulacao.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`);
  }
}

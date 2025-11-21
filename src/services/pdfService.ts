import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Aposta, Dezena } from "../types";

const CARD_WIDTH = 92;
const CARD_HEIGHT = 190;
const GRID_ROWS = 5;
const GRID_COLS = 5;
const CELL_SIZE = 7;
const GRID_OFFSET_X = 13;
const GRID_OFFSET_Y = 26;
const GRID_NUMBERS: Dezena[] = Array.from(
  { length: GRID_ROWS * GRID_COLS },
  (_, index) => index + 1
);
// Quantidade de jogos por cartão
const JOGOS_POR_CARTAO = 3;
// Espaçamento entre blocos de jogos (vertical, mm)
// Largura do retângulo de marcação (mm)
const MARK_SIZE_X = 8;
// Altura do retângulo de marcação (mm)
const MARK_SIZE_Y = 4;
// Tamanho do guia de alinhamento (mm)
const ALIGNMENT_GUIDE_LENGTH = 1;
// Espaçamento horizontal entre células (mm)
const BASE_CELL_SPACING_X = 3;
// Espaçamento vertical entre células (mm)
const BASE_CELL_SPACING_Y = 1;
// espaçamento entre blocos (vertical)
const BASE_BLOCK_SPACING = 1;

const formatJogoLinha = (jogo: Dezena[]) =>
  jogo
    .slice()
    .sort((a, b) => a - b)
    .map((numero) => numero.toString().padStart(2, "0"))
    .join(" ");

export interface PdfApostasOptions {
  ajusteMargemEsquerdaMm?: number;
  ajusteMargemTopoMm?: number;
  ajusteEntreCamposMm?: number;
  ajusteEspacoColunasMm?: number;
  ajusteEspacoLinhasMm?: number;
  larguraRetanguloMm?: number;
  alturaRetanguloMm?: number;
  alinhamentoGuiaMm?: number;
  baseCellSpacingX?: number;
  baseCellSpacingY?: number;
  baseBlockSpacing?: number;
}

const sanitizeNumber = (valor?: number) =>
  typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
const sanitizeMargin = sanitizeNumber;
const sanitizeAdjustment = sanitizeNumber;
const getGridHeight = (espacoLinhas: number) =>
  GRID_ROWS * CELL_SIZE + (GRID_ROWS - 1) * espacoLinhas;

const drawAlignmentGuides = (doc: jsPDF, offsetX: number, offsetY: number) => {
  const corners = [
    { x: offsetX, y: offsetY, horizontal: -1, vertical: -1 },
    { x: offsetX + CARD_WIDTH, y: offsetY, horizontal: 1, vertical: -1 },
    { x: offsetX, y: offsetY + CARD_HEIGHT, horizontal: -1, vertical: 1 },
    {
      x: offsetX + CARD_WIDTH,
      y: offsetY + CARD_HEIGHT,
      horizontal: 1,
      vertical: 1,
    },
  ];

  doc.setDrawColor(140, 140, 140);
  doc.setLineWidth(0.25);

  corners.forEach(({ x, y, horizontal, vertical }) => {
    doc.line(x, y, x + horizontal * ALIGNMENT_GUIDE_LENGTH, y);
    doc.line(x, y, x, y + vertical * ALIGNMENT_GUIDE_LENGTH);
  });

  doc.setDrawColor(0, 0, 0);
};

const drawSelectionMarks = (
  doc: jsPDF,
  jogo: Dezena[],
  offsetX: number,
  slotOffsetY: number,
  cellSpacingX: number,
  cellSpacingY: number,
  larguraRetangulo: number = MARK_SIZE_X,
  alturaRetangulo: number = MARK_SIZE_Y
) => {
  const selecionadas = new Set(jogo);
  doc.setFillColor(20, 20, 20);

  GRID_NUMBERS.forEach((numero, index) => {
    if (!selecionadas.has(numero)) {
      return;
    }

    const col = index % GRID_COLS;
    const row = Math.floor(index / GRID_COLS);
    const centerX =
      offsetX +
      GRID_OFFSET_X +
      col * (CELL_SIZE + cellSpacingX) +
      CELL_SIZE / 2;
    const centerY =
      slotOffsetY +
      GRID_OFFSET_Y +
      row * (CELL_SIZE + cellSpacingY) +
      CELL_SIZE / 2;

    doc.rect(
      centerX - larguraRetangulo / 2,
      centerY - alturaRetangulo / 2,
      larguraRetangulo,
      alturaRetangulo,
      "F"
    );
  });
};

interface CardHeadingInfo {
  numero: number;
  jogo: Dezena[];
}

const drawCardHeading = (
  doc: jsPDF,
  aposta: Aposta,
  offsetX: number,
  offsetY: number,
  jogosNoCartao: CardHeadingInfo[]
) => {
  const centerX = offsetX + CARD_WIDTH / 2;
  const nome = aposta.nome?.trim();

  doc.setTextColor(15, 23, 42);

  if (nome) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(nome, centerX, offsetY + 6, {
      align: "center",
      maxWidth: CARD_WIDTH - 8,
    });
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(
    `Cartão com até ${JOGOS_POR_CARTAO} jogos - ${aposta.dezenasPorJogo} dezenas`,
    centerX,
    offsetY + 11,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  jogosNoCartao.forEach((dados, indice) => {
    const linha = `Jogo ${String(dados.numero + 1).padStart(
      2,
      "0"
    )}: ${formatJogoLinha(dados.jogo)}`;
    doc.text(linha, offsetX + 4, offsetY + 15 + indice * 3.6, {
      maxWidth: CARD_WIDTH - 8,
    });
  });

  doc.setTextColor(0, 0, 0);
};

const drawSlipMarks = (
  doc: jsPDF,
  jogo: Dezena[],
  offsetX: number,
  slotOffsetY: number,
  cellSpacingX: number,
  cellSpacingY: number,
  larguraRetangulo?: number,
  alturaRetangulo?: number
) => {
  drawSelectionMarks(
    doc,
    jogo,
    offsetX,
    slotOffsetY,
    cellSpacingX,
    cellSpacingY,
    larguraRetangulo,
    alturaRetangulo
  );
};

const openOrDownload = (doc: jsPDF, filename: string) => {
  if (typeof window !== "undefined") {
    const blobUrl = doc.output("bloburl");
    const opened = window.open(blobUrl, "_blank");
    if (!opened) {
      doc.save(filename);
    }
  } else {
    doc.save(filename);
  }
};

export function gerarPdfApostas(
  aposta: Aposta,
  options: PdfApostasOptions = {}
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [CARD_WIDTH, CARD_HEIGHT],
    compress: true,
  });

  const ajusteMargemEsquerdaMm = sanitizeMargin(options.ajusteMargemEsquerdaMm);
  const ajusteMargemTopoMm = sanitizeMargin(options.ajusteMargemTopoMm);
  const ajusteEntreCamposMm = sanitizeAdjustment(options.ajusteEntreCamposMm);
  const ajusteEspacoColunasMm = sanitizeAdjustment(
    options.ajusteEspacoColunasMm
  );
  const ajusteEspacoLinhasMm = sanitizeAdjustment(options.ajusteEspacoLinhasMm);
  const espacoEntreColunas =
    typeof options.ajusteEspacoColunasMm === "number" &&
    options.ajusteEspacoColunasMm === 0
      ? 0
      : Math.max(0, BASE_CELL_SPACING_X + ajusteEspacoColunasMm);
  const espacoEntreLinhas =
    typeof options.ajusteEspacoLinhasMm === "number" &&
    options.ajusteEspacoLinhasMm === 0
      ? 0
      : Math.max(0, BASE_CELL_SPACING_Y + ajusteEspacoLinhasMm);

  let larguraRetangulo = sanitizeNumber(options.larguraRetanguloMm);
  let alturaRetangulo = sanitizeNumber(options.alturaRetanguloMm);

  // Se o espaçamento vertical entre células for zero, o retângulo ocupa toda a célula
  if (espacoEntreLinhas === 0) {
    alturaRetangulo = CELL_SIZE;
  } else if (!alturaRetangulo) {
    alturaRetangulo = MARK_SIZE_Y;
  }
  // Se o espaçamento horizontal entre células for zero, o retângulo ocupa toda a célula
  if (espacoEntreColunas === 0) {
    larguraRetangulo = CELL_SIZE;
  } else if (!larguraRetangulo) {
    larguraRetangulo = MARK_SIZE_X;
  }

  const gridHeight = getGridHeight(espacoEntreLinhas);
  const distanciaEntreCampos =
    gridHeight +
    (typeof options.ajusteEntreCamposMm === "number" &&
    options.ajusteEntreCamposMm === 0
      ? 0
      : Math.max(0, BASE_BLOCK_SPACING + ajusteEntreCamposMm));

  aposta.jogos.forEach((jogo, index) => {
    const slotIndex = index % JOGOS_POR_CARTAO;
    if (slotIndex === 0) {
      if (index > 0) {
        doc.addPage([CARD_WIDTH, CARD_HEIGHT], "portrait");
      }
      drawAlignmentGuides(doc, ajusteMargemEsquerdaMm, ajusteMargemTopoMm);
      const jogosNoCartao = aposta.jogos
        .slice(index, index + JOGOS_POR_CARTAO)
        .map((jogoAtual, deslocamento) => ({
          numero: index + deslocamento,
          jogo: jogoAtual,
        }));
      drawCardHeading(
        doc,
        aposta,
        ajusteMargemEsquerdaMm,
        ajusteMargemTopoMm,
        jogosNoCartao
      );
    }

    const slotOffsetY = ajusteMargemTopoMm + slotIndex * distanciaEntreCampos;
    drawSlipMarks(
      doc,
      jogo,
      ajusteMargemEsquerdaMm,
      slotOffsetY,
      espacoEntreColunas,
      espacoEntreLinhas,
      larguraRetangulo,
      alturaRetangulo
    );
  });

  const filename = `volantes-oficiais-${aposta.nome
    .replace(/\s+/g, "-")
    .toLowerCase()}-${aposta.id}.pdf`;
  openOrDownload(doc, filename);
}

export interface HistoricoRegistro {
  concurso: number;
  dataSorteio: string;
  melhorAcertos: number;
  faixa: string;
  jogo: Dezena[];
}

export function gerarPdfHistorico(
  nomeSimulacao: string,
  registros: HistoricoRegistro[]
): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const resumo = {
    "11": 0,
    "12": 0,
    "13": 0,
    "14": 0,
    "15": 0,
  };

  registros.forEach((item) => {
    if (item.melhorAcertos >= 11) {
      const faixa = String(
        Math.min(item.melhorAcertos, 15)
      ) as keyof typeof resumo;
      resumo[faixa] += 1;
    }
  });

  const resumoTextoPartes = Object.entries(resumo)
    .filter(([, quantidade]) => quantidade > 0)
    .map(
      ([faixa, quantidade]) =>
        `${quantidade} cart\u00e3o(\u00f5es) com ${faixa} pontos`
    );
  const resumoTexto =
    resumoTextoPartes.length > 0
      ? resumoTextoPartes.join(" \u2022 ")
      : "Nenhum cart\u00e3o hist\u00f3rico atingiu 11 ou mais pontos.";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Relat\u00f3rio hist\u00f3rico - Lotof\u00e1cil", 15, 15);
  doc.setFontSize(12);
  doc.text(nomeSimulacao, 15, 22, { maxWidth: 180 });
  doc.setFont("helvetica", "normal");
  doc.text(`Concursos analisados: ${registros.length}`, 15, 28);
  doc.text(`Resumo: ${resumoTexto}`, 15, 35, { maxWidth: 180 });

  const rows = registros.map((item) => [
    `#${item.concurso}`,
    item.dataSorteio || "-",
    item.jogo.length
      ? item.jogo.map((n) => n.toString().padStart(2, "0")).join(" ")
      : "-",
    item.melhorAcertos.toString(),
    item.faixa === "nenhuma" ? "-" : `${item.faixa} pts`,
  ]);

  autoTable(doc, {
    startY: 42,
    head: [["Concurso", "Data", "Melhor jogo", "Acertos", "Faixa"]],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 2,
      halign: "left",
    },
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [15, 23, 42],
    },
    margin: { left: 15, right: 15 },
  });

  openOrDownload(
    doc,
    `relatorio-historico-${nomeSimulacao
      .replace(/\s+/g, "-")
      .toLowerCase()}-${Date.now()}.pdf`
  );
}

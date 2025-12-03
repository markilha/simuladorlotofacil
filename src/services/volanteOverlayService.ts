import jsPDF from "jspdf";
import type { Dezena } from "../types";

/**
 * Configuração de medidas do volante oficial da Lotofácil
 * Baseado em medições da imagem do volante real
 *
 * Estrutura do volante (3 quadros verticais):
 *
 * ┌─────────────────────────────────────────┐
 * │  LOTOFÁCIL - Cabeçalho                  │
 * ├─────────────────────────────────────────┤
 * │ QUADRO 1:                               │
 * │  01  06  11  16  21                     │
 * │  02  07  12  17  22                     │
 * │  03  08  13  18  23    (5x5 grid)       │
 * │  04  09  14  19  24                     │
 * │  05  10  15  20  25                     │
 * ├─────────────────────────────────────────┤ ← 3mm gap
 * │ QUADRO 2:                               │
 * │  01  06  11  16  21                     │
 * │  02  07  12  17  22                     │
 * │  03  08  13  18  23    (5x5 grid)       │
 * │  04  09  14  19  24                     │
 * │  05  10  15  20  25                     │
 * ├─────────────────────────────────────────┤ ← 3mm gap
 * │ QUADRO 3:                               │
 * │  01  06  11  16  21                     │
 * │  02  07  12  17  22                     │
 * │  03  08  13  18  23    (5x5 grid)       │
 * │  04  09  14  19  24                     │
 * │  05  10  15  20  25                     │
 * ├─────────────────────────────────────────┤
 * │ SURPRESINHA, TEIMOSINHA, BOLÃO          │
 * └─────────────────────────────────────────┘
 */
export interface VolanteConfig {
  // Dimensões do volante oficial em mm (não A4)
  larguraPapelMm: number;
  alturaPapelMm: number;

  // Margens do volante impresso
  margemEsquerdaMm: number;
  margemTopoMm: number;

  // Dimensões de cada quadro de jogo
  larguraQuadroMm: number;
  alturaQuadroMm: number;

  // Espaçamento entre os 3 quadros verticais
  espacoEntreQuadrosMm: number;

  // Grade de números (5x5)
  numerosLinhas: number;
  numerosColunas: number;

  // Dimensões de cada célula de número
  larguraCelulaMm: number;
  alturaCelulaMm: number;

  // Espaçamento entre células
  espacoHorizontalCelulasMm: number;
  espacoVerticalCelulasMm: number;

  // Posição inicial da grade no quadro
  offsetGridXMm: number;
  offsetGridYMm: number;
}

/**
 * Configuração padrão baseada na imagem do volante
 * Medições calibradas para o volante oficial
 * O volante oficial mede 8cm x 19cm (80mm x 190mm)
 */
export const DEFAULT_VOLANTE_CONFIG: VolanteConfig = {
  larguraPapelMm: 80, // Largura padrão do cartão
  alturaPapelMm: 190, // Altura padrão do cartão

  margemEsquerdaMm: 19,
  margemTopoMm: 37,

  larguraQuadroMm: 63, // 75 - 12 = 63
  alturaQuadroMm: 24,

  espacoEntreQuadrosMm: 20, // Espaço entre quadros (altura do quadro)

  numerosLinhas: 5,
  numerosColunas: 5,

  // Para 5 colunas em 63mm com retângulos de 5mm de largura:
  // Espaço total = 63mm - (5 * 5mm) = 38mm
  // Espaço entre 5 colunas (4 gaps) = 38mm / 4 = 9.5mm por gap
  larguraCelulaMm: 0.05, // Largura do retângulo
  alturaCelulaMm: 0.1, // 24mm / 5 linhas = 4.8mm por linha

  espacoHorizontalCelulasMm: 9.8, // Espaço entre colunas
  espacoVerticalCelulasMm: 3.5, // Calculado automaticamente

  offsetGridXMm: 0,
  offsetGridYMm: 0,
};

/**
 * Opções para geração do overlay
 */
export interface OverlayOptions {
  // Qual quadro preencher (1, 2 ou 3) - array permite múltiplos
  quadrosAtivos: number[];

  // Configuração do volante (usar default ou customizar)
  config?: Partial<VolanteConfig>;

  // Estilo da marcação
  corMarcacao?: string; // Cor RGB em formato "r,g,b"
  tamanhoMarcacao?: number; // Proporção da célula (0-1)
}

/**
 * Calcula a posição central de uma célula específica
 */
function calcularPosicaoCelula(
  numero: Dezena,
  config: VolanteConfig
): { x: number; y: number } {
  const index = numero - 1; // 01-25 -> 0-24
  const linha = Math.floor(index / config.numerosColunas);
  const coluna = index % config.numerosColunas;

  const x =
    config.margemEsquerdaMm +
    config.offsetGridXMm +
    coluna * (config.larguraCelulaMm + config.espacoHorizontalCelulasMm) +
    config.larguraCelulaMm / 2;

  const y =
    config.margemTopoMm +
    config.offsetGridYMm +
    linha * (config.alturaCelulaMm + config.espacoVerticalCelulasMm) +
    config.alturaCelulaMm / 2;

  return { x, y };
}

/**
 * Desenha um retângulo preenchido sobre a posição do número
 */
function desenharMarcacaoRetangulo(
  doc: jsPDF,
  x: number,
  y: number,
  largura: number,
  altura: number,
  cor: { r: number; g: number; b: number }
): void {
  doc.setFillColor(cor.r, cor.g, cor.b);

  // Desenha retângulo preenchido centralizado
  doc.rect(x - largura / 2, y - altura / 2, largura, altura, "F");
}

/**
 * Gera PDF overlay transparente com marcações X sobre os números escolhidos
 * Automaticamente divide os jogos em múltiplos cartões (3 jogos por cartão)
 */
export function gerarOverlayVolante(
  jogos: Dezena[][],
  options: OverlayOptions
): void {
  const config: VolanteConfig = {
    ...DEFAULT_VOLANTE_CONFIG,
    ...options.config,
  };

  if (jogos.length === 0) {
    console.error("Nenhum jogo fornecido");
    return;
  }

  // Dividir jogos em grupos de 3 (quantidade de quadros por cartão)
  const jogosPorCartao = 3;
  const numeroDeCartoes = Math.ceil(jogos.length / jogosPorCartao);

  // Criar PDF com tamanho personalizado do volante
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [config.larguraPapelMm, config.alturaPapelMm],
    compress: true,
  });

  // Configurar estilo da marcação
  const corRgb = options.corMarcacao || "0,0,0"; // Preto padrão
  const [r, g, b] = corRgb.split(",").map(Number);

  // Tamanho fixo do retângulo: 4mm x 3mm (largura x altura)
  const larguraRetangulo = 4;
  const alturaRetangulo = 3;

  // Gerar um cartão (página) para cada grupo de jogos
  for (let cartaoIndex = 0; cartaoIndex < numeroDeCartoes; cartaoIndex++) {
    // Adicionar nova página para cartões subsequentes
    if (cartaoIndex > 0) {
      doc.addPage([config.larguraPapelMm, config.alturaPapelMm], "portrait");
    }

    const inicioJogos = cartaoIndex * jogosPorCartao;
    const fimJogos = Math.min(inicioJogos + jogosPorCartao, jogos.length);
    const jogosDoCartao = jogos.slice(inicioJogos, fimJogos);

    // Processar cada jogo do cartão (máximo 3 quadros)
    jogosDoCartao.forEach((jogo, indexNoCartao) => {
      const numeroQuadro = indexNoCartao + 1; // 1, 2 ou 3

      // Marcar cada número do jogo
      jogo.forEach((numero) => {
        const pos = calcularPosicaoCelula(numero, config);
        desenharMarcacaoRetangulo(
          doc,
          pos.x,
          pos.y + (numeroQuadro - 1) * config.espacoEntreQuadrosMm,
          larguraRetangulo,
          alturaRetangulo,
          { r, g, b }
        );
      });
    });
  }

  // Exportar como PDF único
  const timestamp = Date.now();
  const filename = `overlay-volante-${numeroDeCartoes}cartoes-${timestamp}.pdf`;
  abrirOuBaixar(doc, filename);
}

/**
 * Abre PDF em nova aba ou faz download
 */
function abrirOuBaixar(doc: jsPDF, filename: string): void {
  if (typeof window !== "undefined") {
    const blobUrl = doc.output("bloburl");
    const opened = window.open(blobUrl, "_blank");
    if (!opened) {
      doc.save(filename);
    }
  } else {
    doc.save(filename);
  }
}

/**
 * Gera overlay para múltiplas apostas (múltiplos volantes)
 */
export function gerarOverlayMultiplo(
  apostas: Array<{ nome: string; jogos: Dezena[][] }>,
  options: OverlayOptions
): void {
  apostas.forEach((aposta, index) => {
    setTimeout(() => {
      gerarOverlayVolante(aposta.jogos, {
        ...options,
      });
    }, index * 100); // Pequeno delay entre downloads
  });
}

/**
 * Utilitário: Valida se os jogos cabem nos quadros selecionados
 */
export function validarJogosQuadros(
  jogos: Dezena[][],
  quadrosAtivos: number[]
): { valido: boolean; erro?: string } {
  if (quadrosAtivos.length === 0) {
    return { valido: false, erro: "Nenhum quadro selecionado" };
  }

  const maxQuadro = Math.max(...quadrosAtivos);
  if (maxQuadro > jogos.length) {
    return {
      valido: false,
      erro: `Quadro ${maxQuadro} selecionado mas só há ${jogos.length} jogo(s)`,
    };
  }

  // Validar que todos os números estão entre 1-25
  for (let i = 0; i < jogos.length; i++) {
    const jogo = jogos[i];
    const invalidos = jogo.filter((n) => n < 1 || n > 25);
    if (invalidos.length > 0) {
      return {
        valido: false,
        erro: `Jogo ${i + 1} contém números inválidos: ${invalidos.join(", ")}`,
      };
    }
  }

  return { valido: true };
}

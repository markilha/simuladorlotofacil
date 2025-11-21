import type { PdfApostasOptions } from "../services/pdfService";

const STORAGE_KEY = "lotofacil_pdf_settings_v1";

const sanitizeNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

export const DEFAULT_PDF_SETTINGS: Required<PdfApostasOptions> = {
  ajusteMargemEsquerdaMm: 0,
  ajusteMargemTopoMm: 0,
  ajusteEntreCamposMm: 0,
  ajusteEspacoColunasMm: 3,
  ajusteEspacoLinhasMm: 1,
  larguraRetanguloMm: 8, // MARK_SIZE_X
  alturaRetanguloMm: 4, // MARK_SIZE_Y
  alinhamentoGuiaMm: 1, // ALIGNMENT_GUIDE_LENGTH
  baseCellSpacingX: 3, // BASE_CELL_SPACING_X
  baseCellSpacingY: 1, // BASE_CELL_SPACING_Y
  baseBlockSpacing: 0, // BASE_BLOCK_SPACING
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const loadPdfSettings = (): Required<PdfApostasOptions> => {
  const storage = getStorage();
  if (!storage) return DEFAULT_PDF_SETTINGS;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_PDF_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<PdfApostasOptions>;
    return {
      ajusteMargemEsquerdaMm: sanitizeNumber(
        parsed.ajusteMargemEsquerdaMm,
        DEFAULT_PDF_SETTINGS.ajusteMargemEsquerdaMm
      ),
      ajusteMargemTopoMm: sanitizeNumber(
        parsed.ajusteMargemTopoMm,
        DEFAULT_PDF_SETTINGS.ajusteMargemTopoMm
      ),
      ajusteEntreCamposMm: sanitizeNumber(
        parsed.ajusteEntreCamposMm,
        DEFAULT_PDF_SETTINGS.ajusteEntreCamposMm
      ),
      ajusteEspacoColunasMm: sanitizeNumber(
        parsed.ajusteEspacoColunasMm,
        DEFAULT_PDF_SETTINGS.ajusteEspacoColunasMm
      ),
      ajusteEspacoLinhasMm: sanitizeNumber(
        parsed.ajusteEspacoLinhasMm,
        DEFAULT_PDF_SETTINGS.ajusteEspacoLinhasMm
      ),
      larguraRetanguloMm: sanitizeNumber(
        parsed.larguraRetanguloMm,
        DEFAULT_PDF_SETTINGS.larguraRetanguloMm
      ),
      alturaRetanguloMm: sanitizeNumber(
        parsed.alturaRetanguloMm,
        DEFAULT_PDF_SETTINGS.alturaRetanguloMm
      ),
      alinhamentoGuiaMm: sanitizeNumber(
        parsed.alinhamentoGuiaMm,
        DEFAULT_PDF_SETTINGS.alinhamentoGuiaMm
      ),
      baseCellSpacingX: sanitizeNumber(
        parsed.baseCellSpacingX,
        DEFAULT_PDF_SETTINGS.baseCellSpacingX
      ),
      baseCellSpacingY: sanitizeNumber(
        parsed.baseCellSpacingY,
        DEFAULT_PDF_SETTINGS.baseCellSpacingY
      ),
      baseBlockSpacing: sanitizeNumber(
        parsed.baseBlockSpacing,
        DEFAULT_PDF_SETTINGS.baseBlockSpacing
      ),
    };
  } catch {
    return DEFAULT_PDF_SETTINGS;
  }
};

export const savePdfSettings = (settings: PdfApostasOptions) => {
  const storage = getStorage();
  if (!storage) return;
  const payload: Required<PdfApostasOptions> = {
    ajusteMargemEsquerdaMm: sanitizeNumber(
      settings.ajusteMargemEsquerdaMm,
      DEFAULT_PDF_SETTINGS.ajusteMargemEsquerdaMm
    ),
    ajusteMargemTopoMm: sanitizeNumber(
      settings.ajusteMargemTopoMm,
      DEFAULT_PDF_SETTINGS.ajusteMargemTopoMm
    ),
    ajusteEntreCamposMm: sanitizeNumber(
      settings.ajusteEntreCamposMm,
      DEFAULT_PDF_SETTINGS.ajusteEntreCamposMm
    ),
    ajusteEspacoColunasMm: sanitizeNumber(
      settings.ajusteEspacoColunasMm,
      DEFAULT_PDF_SETTINGS.ajusteEspacoColunasMm
    ),
    ajusteEspacoLinhasMm: sanitizeNumber(
      settings.ajusteEspacoLinhasMm,
      DEFAULT_PDF_SETTINGS.ajusteEspacoLinhasMm
    ),
    larguraRetanguloMm: sanitizeNumber(
      settings.larguraRetanguloMm,
      DEFAULT_PDF_SETTINGS.larguraRetanguloMm
    ),
    alturaRetanguloMm: sanitizeNumber(
      settings.alturaRetanguloMm,
      DEFAULT_PDF_SETTINGS.alturaRetanguloMm
    ),
    alinhamentoGuiaMm: sanitizeNumber(
      settings.alinhamentoGuiaMm,
      DEFAULT_PDF_SETTINGS.alinhamentoGuiaMm
    ),
    baseCellSpacingX: sanitizeNumber(
      settings.baseCellSpacingX,
      DEFAULT_PDF_SETTINGS.baseCellSpacingX
    ),
    baseCellSpacingY: sanitizeNumber(
      settings.baseCellSpacingY,
      DEFAULT_PDF_SETTINGS.baseCellSpacingY
    ),
    baseBlockSpacing: sanitizeNumber(
      settings.baseBlockSpacing,
      DEFAULT_PDF_SETTINGS.baseBlockSpacing
    ),
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

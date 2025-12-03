import type {
  VolanteConfig,
  OverlayOptions,
} from "../services/volanteOverlayService";
import { DEFAULT_VOLANTE_CONFIG } from "../services/volanteOverlayService";

const STORAGE_KEY_CONFIG = "lotofacil_volante_config_v1";
const STORAGE_KEY_OVERLAY = "lotofacil_overlay_options_v1";

const sanitizeNumber = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

/**
 * Carrega configuração do volante do localStorage
 */
export function loadVolanteConfig(): VolanteConfig {
  const storage = getStorage();
  if (!storage) return DEFAULT_VOLANTE_CONFIG;

  const raw = storage.getItem(STORAGE_KEY_CONFIG);
  if (!raw) return DEFAULT_VOLANTE_CONFIG;

  try {
    const parsed = JSON.parse(raw) as Partial<VolanteConfig>;
    return {
      larguraPapelMm: sanitizeNumber(
        parsed.larguraPapelMm,
        DEFAULT_VOLANTE_CONFIG.larguraPapelMm
      ),
      alturaPapelMm: sanitizeNumber(
        parsed.alturaPapelMm,
        DEFAULT_VOLANTE_CONFIG.alturaPapelMm
      ),
      margemEsquerdaMm: sanitizeNumber(
        parsed.margemEsquerdaMm,
        DEFAULT_VOLANTE_CONFIG.margemEsquerdaMm
      ),
      margemTopoMm: sanitizeNumber(
        parsed.margemTopoMm,
        DEFAULT_VOLANTE_CONFIG.margemTopoMm
      ),
      larguraQuadroMm: sanitizeNumber(
        parsed.larguraQuadroMm,
        DEFAULT_VOLANTE_CONFIG.larguraQuadroMm
      ),
      alturaQuadroMm: sanitizeNumber(
        parsed.alturaQuadroMm,
        DEFAULT_VOLANTE_CONFIG.alturaQuadroMm
      ),
      espacoEntreQuadrosMm: sanitizeNumber(
        parsed.espacoEntreQuadrosMm,
        DEFAULT_VOLANTE_CONFIG.espacoEntreQuadrosMm
      ),
      numerosLinhas: sanitizeNumber(
        parsed.numerosLinhas,
        DEFAULT_VOLANTE_CONFIG.numerosLinhas
      ),
      numerosColunas: sanitizeNumber(
        parsed.numerosColunas,
        DEFAULT_VOLANTE_CONFIG.numerosColunas
      ),
      larguraCelulaMm: sanitizeNumber(
        parsed.larguraCelulaMm,
        DEFAULT_VOLANTE_CONFIG.larguraCelulaMm
      ),
      alturaCelulaMm: sanitizeNumber(
        parsed.alturaCelulaMm,
        DEFAULT_VOLANTE_CONFIG.alturaCelulaMm
      ),
      espacoHorizontalCelulasMm: sanitizeNumber(
        parsed.espacoHorizontalCelulasMm,
        DEFAULT_VOLANTE_CONFIG.espacoHorizontalCelulasMm
      ),
      espacoVerticalCelulasMm: sanitizeNumber(
        parsed.espacoVerticalCelulasMm,
        DEFAULT_VOLANTE_CONFIG.espacoVerticalCelulasMm
      ),
      offsetGridXMm: sanitizeNumber(
        parsed.offsetGridXMm,
        DEFAULT_VOLANTE_CONFIG.offsetGridXMm
      ),
      offsetGridYMm: sanitizeNumber(
        parsed.offsetGridYMm,
        DEFAULT_VOLANTE_CONFIG.offsetGridYMm
      ),
    };
  } catch {
    return DEFAULT_VOLANTE_CONFIG;
  }
}

/**
 * Salva configuração do volante no localStorage
 */
export function saveVolanteConfig(config: Partial<VolanteConfig>): void {
  const storage = getStorage();
  if (!storage) return;

  const current = loadVolanteConfig();
  const updated: VolanteConfig = {
    ...current,
    ...config,
  };

  storage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
}

/**
 * Restaura configuração padrão do volante
 */
export function resetVolanteConfig(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY_CONFIG);
}

/**
 * Opções padrão de overlay
 */
export const DEFAULT_OVERLAY_OPTIONS: Omit<OverlayOptions, "quadrosAtivos"> = {
  corMarcacao: "0,0,0", // Preto
  tamanhoMarcacao: 0.65,
};

/**
 * Carrega opções de overlay do localStorage
 */
export function loadOverlayOptions(): Omit<OverlayOptions, "quadrosAtivos"> {
  const storage = getStorage();
  if (!storage) return DEFAULT_OVERLAY_OPTIONS;

  const raw = storage.getItem(STORAGE_KEY_OVERLAY);
  if (!raw) return DEFAULT_OVERLAY_OPTIONS;

  try {
    const parsed = JSON.parse(raw) as Partial<OverlayOptions>;
    return {
      corMarcacao:
        typeof parsed.corMarcacao === "string"
          ? parsed.corMarcacao
          : DEFAULT_OVERLAY_OPTIONS.corMarcacao,
      tamanhoMarcacao: sanitizeNumber(
        parsed.tamanhoMarcacao,
        DEFAULT_OVERLAY_OPTIONS.tamanhoMarcacao!
      ),
      config: parsed.config,
    };
  } catch {
    return DEFAULT_OVERLAY_OPTIONS;
  }
}

/**
 * Salva opções de overlay no localStorage
 */
export function saveOverlayOptions(options: Partial<OverlayOptions>): void {
  const storage = getStorage();
  if (!storage) return;

  const current = loadOverlayOptions();
  const updated = {
    ...current,
    ...options,
  };

  // Remover quadrosAtivos antes de salvar (é específico de cada geração)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { quadrosAtivos: _quadrosAtivos, ...toSave } =
    updated as OverlayOptions;

  storage.setItem(STORAGE_KEY_OVERLAY, JSON.stringify(toSave));
}

/**
 * Restaura opções padrão de overlay
 */
export function resetOverlayOptions(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY_OVERLAY);
}

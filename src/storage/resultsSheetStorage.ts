const STORAGE_KEY = 'lotofacil_planilha_base64';

const toBase64 = (buffer: ArrayBuffer) => {
  let result = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    result += String.fromCharCode(...chunk);
  }
  return btoa(result);
};

const fromBase64 = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

export function saveResultsSheet(buffer: ArrayBuffer, filename: string) {
  const storage = getStorage();
  if (!storage) return;
  const payload = {
    savedAt: new Date().toISOString(),
    filename,
    base64: toBase64(buffer),
  };
  storage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearResultsSheet() {
  const storage = getStorage();
  storage?.removeItem(STORAGE_KEY);
}

export function getResultsSheetBuffer(): ArrayBuffer | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: { base64: string } = JSON.parse(raw);
    if (!parsed.base64) return null;
    return fromBase64(parsed.base64);
  } catch {
    return null;
  }
}

export function getResultsSheetInfo():
  | { savedAt: string; filename?: string }
  | null {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed: { savedAt: string; filename?: string } = JSON.parse(raw);
    if (!parsed.savedAt) return null;
    return { savedAt: parsed.savedAt, filename: parsed.filename };
  } catch {
    return null;
  }
}

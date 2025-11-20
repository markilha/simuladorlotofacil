import type { Aposta } from '../types';

const STORAGE_KEY = 'lotofacil_apostas';

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

const persist = (apostas: Aposta[]) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(apostas));
};

export function getAllBets(): Aposta[] {
  const storage = getStorage();
  if (!storage) return [];
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveBet(aposta: Aposta): void {
  const apostas = getAllBets();
  apostas.push(aposta);
  persist(apostas);
}

export function saveManyBets(aposta: Aposta): void {
  saveBet(aposta);
}

export function deleteBet(id: string): void {
  const apostas = getAllBets().filter((aposta) => aposta.id !== id);
  persist(apostas);
}

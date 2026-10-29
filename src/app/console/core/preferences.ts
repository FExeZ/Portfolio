import type { Lang } from '../../i18n/translations';

/** Lo mínimo de localStorage que se usa; se inyecta para poder probarlo. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Preferencias que se guardan entre visitas. El idioma lo guarda LanguageService. */
export interface StoredPreferences {
  sound: boolean;
  crt: boolean;
  returning: boolean;
  /** El cartucho secreto ya se descubrió (RF-75). */
  secret: boolean;
  /** Récord de Snake (RF-78). */
  record: number;
}

/** Los valores de sí o no; el récord se guarda aparte, con saveRecord. */
export type PreferenceKey = Exclude<keyof StoredPreferences, 'record'>;

export const DEFAULT_PREFERENCES: Readonly<StoredPreferences> = {
  sound: true,
  crt: true,
  returning: false,
  secret: false,
  record: 0
};

const STORAGE_KEYS: Record<PreferenceKey, string> = {
  sound: 'fz16.sound',
  crt: 'fz16.crt',
  returning: 'fz16.returning',
  secret: 'fz16.secret'
};

const RECORD_KEY = 'fz16.record';

/** Lee una clave sin fallar: un almacenamiento bloqueado equivale a una clave vacía. */
function readBoolean(store: KeyValueStore | null, key: PreferenceKey): boolean {
  let raw: string | null = null;
  try {
    raw = store?.getItem(STORAGE_KEYS[key]) ?? null;
  } catch {
    /* almacenamiento bloqueado: se usa el valor por defecto */
  }
  if (raw === '1') return true;
  if (raw === '0') return false;
  return DEFAULT_PREFERENCES[key];
}

export function loadPreferences(store: KeyValueStore | null): StoredPreferences {
  return {
    sound: readBoolean(store, 'sound'),
    crt: readBoolean(store, 'crt'),
    returning: readBoolean(store, 'returning'),
    secret: readBoolean(store, 'secret'),
    record: readRecord(store)
  };
}

/** Un récord inválido o un almacenamiento bloqueado equivalen a no tener récord. */
function readRecord(store: KeyValueStore | null): number {
  let raw: string | null = null;
  try {
    raw = store?.getItem(RECORD_KEY) ?? null;
  } catch {
    /* almacenamiento bloqueado: sin récord */
  }
  return raw !== null && /^\d+$/.test(raw) ? Number(raw) : 0;
}

export function saveRecord(store: KeyValueStore | null, value: number): void {
  try {
    store?.setItem(RECORD_KEY, String(value));
  } catch {
    /* almacenamiento bloqueado o lleno: el récord vale solo en esta visita */
  }
}

export function savePreference(
  store: KeyValueStore | null,
  key: PreferenceKey,
  value: boolean
): void {
  try {
    store?.setItem(STORAGE_KEYS[key], value ? '1' : '0');
  } catch {
    /* almacenamiento bloqueado o lleno: el sitio sigue funcionando sin guardar */
  }
}

/** Idioma guardado si es válido; si no, inglés para navegadores en inglés y español para el resto. */
export function pickInitialLang(saved: string | null, browserLang: string | undefined): Lang {
  if (saved === 'es' || saved === 'en') return saved;
  return browserLang?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

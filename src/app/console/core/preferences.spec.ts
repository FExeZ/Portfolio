import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  KeyValueStore,
  loadPreferences,
  pickInitialLang,
  savePreference,
  saveRecord
} from './preferences';

/** Almacenamiento en memoria para simular localStorage. */
function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    }
  };
}

/** Almacenamiento bloqueado: así se comporta el navegador cuando no deja guardar datos. */
const blockedStore: KeyValueStore = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  }
};

describe('pickInitialLang', () => {
  it('usa el idioma guardado cuando es válido', () => {
    expect(pickInitialLang('en', 'es-AR')).toBe('en');
    expect(pickInitialLang('es', 'en-US')).toBe('es');
  });

  it('ignora un idioma guardado inválido y mira el navegador', () => {
    expect(pickInitialLang('fr', 'en-US')).toBe('en');
    expect(pickInitialLang('fr', 'es-AR')).toBe('es');
  });

  it('elige inglés cuando el navegador está en inglés', () => {
    expect(pickInitialLang(null, 'en-US')).toBe('en');
    expect(pickInitialLang(null, 'EN-gb')).toBe('en');
  });

  it('elige español con cualquier otro idioma del navegador', () => {
    expect(pickInitialLang(null, 'pt-BR')).toBe('es');
    expect(pickInitialLang(null, 'es')).toBe('es');
  });

  it('elige español cuando el navegador no informa idioma', () => {
    expect(pickInitialLang(null, undefined)).toBe('es');
    expect(pickInitialLang(null, '')).toBe('es');
  });
});

describe('loadPreferences', () => {
  it('devuelve los valores por defecto con el almacenamiento vacío', () => {
    expect(loadPreferences(memoryStore())).toEqual({ sound: true, crt: true, returning: false, secret: false, record: 0 });
  });

  it('lee los valores guardados como 1 y 0', () => {
    const store = memoryStore({
      'fz16.sound': '0',
      'fz16.crt': '0',
      'fz16.returning': '1',
      'fz16.secret': '1'
    });
    expect(loadPreferences(store)).toEqual({ sound: false, crt: false, returning: true, secret: true, record: 0 });
  });

  it('usa el valor por defecto para cada valor guardado inválido', () => {
    const store = memoryStore({
      'fz16.sound': 'false',
      'fz16.crt': '',
      'fz16.returning': 'yes',
      'fz16.secret': 'si'
    });
    expect(loadPreferences(store)).toEqual(DEFAULT_PREFERENCES);
  });

  it('devuelve los valores por defecto sin almacenamiento', () => {
    expect(loadPreferences(null)).toEqual(DEFAULT_PREFERENCES);
  });

  it('trata al visitante como nuevo si el almacenamiento está bloqueado', () => {
    expect(loadPreferences(blockedStore)).toEqual({ sound: true, crt: true, returning: false, secret: false, record: 0 });
  });
});

describe('savePreference', () => {
  it('guarda 1 y 0 con las claves fz16.*', () => {
    const store = memoryStore();
    savePreference(store, 'sound', false);
    savePreference(store, 'crt', true);
    savePreference(store, 'returning', true);
    savePreference(store, 'secret', true);
    expect(store.data.get('fz16.sound')).toBe('0');
    expect(store.data.get('fz16.crt')).toBe('1');
    expect(store.data.get('fz16.returning')).toBe('1');
    expect(store.data.get('fz16.secret')).toBe('1');
  });

  it('lo guardado se recupera en la próxima visita', () => {
    const store = memoryStore();
    savePreference(store, 'crt', false);
    savePreference(store, 'returning', true);
    expect(loadPreferences(store)).toEqual({ sound: true, crt: false, returning: true, secret: false, record: 0 });
  });

  it('el cartucho secreto descubierto se recupera en la próxima visita (RF-75)', () => {
    const store = memoryStore();
    savePreference(store, 'secret', true);
    expect(loadPreferences(store).secret).toBe(true);
  });

  it('no falla sin almacenamiento', () => {
    expect(() => savePreference(null, 'sound', false)).not.toThrow();
  });

  it('no falla si el almacenamiento está bloqueado', () => {
    expect(() => savePreference(blockedStore, 'returning', true)).not.toThrow();
  });
});

describe('récord de Snake (RF-78)', () => {
  it('lee el récord guardado', () => {
    expect(loadPreferences(memoryStore({ 'fz16.record': '12' })).record).toBe(12);
  });

  it.each(['-3', 'abc', '1.5', ''])('un récord inválido (%j) da 0', (raw) => {
    expect(loadPreferences(memoryStore({ 'fz16.record': raw })).record).toBe(0);
  });

  it('lo guarda y se recupera en la próxima visita', () => {
    const store = memoryStore();
    saveRecord(store, 15);
    expect(store.data.get('fz16.record')).toBe('15');
    expect(loadPreferences(store).record).toBe(15);
  });

  it('no falla si el almacenamiento está bloqueado', () => {
    expect(() => saveRecord(blockedStore, 3)).not.toThrow();
    expect(loadPreferences(blockedStore).record).toBe(0);
  });
});

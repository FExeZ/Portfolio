import { describe, expect, it } from 'vitest';
import { Lang, TRANSLATIONS } from './translations';

/** Junta los textos de un idioma con su ruta (`console.menu.player`), a cualquier profundidad. */
function textsOf(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, item]) => textsOf(item, path ? `${path}.${key}` : key));
}

describe('TRANSLATIONS (RNF-1)', () => {
  it.each<Lang>(['es', 'en'])('ningún texto de la interfaz queda vacío en %s', (lang) => {
    const texts = textsOf(TRANSLATIONS[lang]);
    expect(texts.length).toBeGreaterThan(50);
    for (const [path, text] of texts) expect(text.trim(), path).not.toBe('');
  });

  it('los dos idiomas tienen los mismos textos', () => {
    const paths = (lang: Lang) => textsOf(TRANSLATIONS[lang]).map(([path]) => path).sort();
    expect(paths('en')).toEqual(paths('es'));
  });
});

import { describe, expect, it } from 'vitest';
import { contrastRatio } from './contrast';

// Los mismos valores que los tokens de src/styles.css y los fondos de la escena.
const BLACK = '#06081a';
const NIGHT = '#0b1a5c';
const WALL = '#1b1733';
const BEZEL = '#24242d';
const WHITE = '#f4f6ff';
const YELLOW = '#ffd23f';
const BLUE_LIGHT = '#8fb6ff';
const GRAY = '#7f8bb8';
const RED_TEXT = '#ff6b6b';

// La paleta azulgrana del Modo Ciclón: los mismos tokens, redefinidos bajo .cyclone (RF-71).
const CYCLONE_ACCENT = '#ff5c7a';
const CYCLONE_BLUE = '#1b3fa0';
const CYCLONE_RED = '#9e1b32';

/** RF-70: mínimo para cualquier texto, sea del tamaño que sea. */
const MINIMUM = 4.5;

describe('contrastRatio', () => {
  it('da 21 entre negro y blanco, y 1 entre un color y sí mismo', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio(YELLOW, YELLOW)).toBeCloseTo(1, 5);
  });

  it('no depende del orden de los colores', () => {
    expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(contrastRatio(BLACK, WHITE), 10);
  });

  it('da el valor de referencia de WCAG para el gris #777 sobre blanco', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('acepta los colores con tres dígitos', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 5);
  });
});

const BACKGROUNDS: [string, string][] = [
  ['negro', BLACK],
  ['azul noche', NIGHT],
  ['pared', WALL],
  ['carcasa de la Pocket', BEZEL]
];

describe('colores de texto de la FZ-16 (RF-70)', () => {
  const texts: [string, string][] = [
    ['blanco', WHITE],
    ['amarillo', YELLOW],
    ['celeste', BLUE_LIGHT],
    ['gris', GRAY],
    ['rojo de texto', RED_TEXT]
  ];

  for (const [textName, text] of texts) {
    it.each(BACKGROUNDS)(`el ${textName} llega a 4,5:1 sobre %s`, (_name, background) => {
      expect(contrastRatio(text, background)).toBeGreaterThanOrEqual(MINIMUM);
    });
  }

  it.each([
    ['Backend', '#c42b2b'],
    ['Frontend', '#1d3fd1'],
    ['Bases de datos', '#0f7a55'],
    ['DevOps & Cloud', '#6a3fb5'],
    ['Herramientas', '#8a5a14'],
    ['Otros lenguajes', '#3a3a46']
  ])('el blanco de las insignias llega a 4,5:1 sobre el color de %s', (_name, badge) => {
    expect(contrastRatio('#ffffff', badge)).toBeGreaterThanOrEqual(MINIMUM);
  });

  it('las letras A y B de la Pocket, en blanco pleno, llegan a 4,5:1 sobre el rojo de los botones', () => {
    expect(contrastRatio('#ffffff', '#c42b2b')).toBeGreaterThanOrEqual(MINIMUM);
  });

  it('el rojo de la marca no sirve para texto sobre negro: por eso existe el rojo de texto', () => {
    expect(contrastRatio('#c42b2b', BLACK)).toBeLessThan(MINIMUM);
  });
});

describe('colores de texto del Modo Ciclón (RF-70, RF-71)', () => {
  it.each(BACKGROUNDS)('el grana claro, que reemplaza al amarillo y al rojo de texto, llega a 4,5:1 sobre %s', (_name, background) => {
    expect(contrastRatio(CYCLONE_ACCENT, background)).toBeGreaterThanOrEqual(MINIMUM);
  });

  it('el blanco llega a 4,5:1 sobre el azul de las etiquetas y el grana de los botones A y B', () => {
    expect(contrastRatio(WHITE, CYCLONE_BLUE)).toBeGreaterThanOrEqual(MINIMUM);
    expect(contrastRatio('#ffffff', CYCLONE_RED)).toBeGreaterThanOrEqual(MINIMUM);
  });
});

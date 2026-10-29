import { describe, expect, it } from 'vitest';
import { initialState } from './console-state';
import { CodeInput, KONAMI_CODE, noticeFor, pushCode } from './easter-eggs';

/** Ingresa varias entradas seguidas y devuelve en cuáles se detectó el código. */
function matchesOf(inputs: readonly CodeInput[]): number[] {
  let recent: readonly CodeInput[] = [];
  const matches: number[] = [];
  inputs.forEach((input, index) => {
    const result = pushCode(recent, input);
    recent = result.recent;
    if (result.matched) matches.push(index);
  });
  return matches;
}

const LAST = KONAMI_CODE.length - 1;

describe('KONAMI_CODE', () => {
  it('es ↑ ↑ ↓ ↓ ← → ← → B A (RF-71)', () => {
    expect(KONAMI_CODE).toEqual(['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a']);
  });
});

describe('pushCode', () => {
  it('detecta el código con su última entrada', () => {
    expect(matchesOf(KONAMI_CODE)).toEqual([LAST]);
  });

  it('lo detecta después de entradas sueltas', () => {
    expect(matchesOf(['a', 'right', ...KONAMI_CODE])).toEqual([LAST + 2]);
  });

  it('acepta un ↑ de más al principio', () => {
    expect(matchesOf(['up', ...KONAMI_CODE])).toEqual([LAST + 1]);
  });

  it('no cuenta un código incompleto ni uno con las letras al revés', () => {
    expect(matchesOf(KONAMI_CODE.slice(0, LAST))).toEqual([]);
    expect(matchesOf([...KONAMI_CODE.slice(0, 8), 'a', 'b'])).toEqual([]);
  });

  it('empieza de cero después de detectarlo: la entrada siguiente no lo repite', () => {
    expect(matchesOf([...KONAMI_CODE, 'a'])).toEqual([LAST]);
    expect(matchesOf([...KONAMI_CODE, ...KONAMI_CODE])).toEqual([LAST, LAST + KONAMI_CODE.length]);
  });

  it('guarda solo las últimas entradas', () => {
    let recent: readonly CodeInput[] = [];
    for (let i = 0; i < 50; i++) recent = pushCode(recent, 'up').recent;
    expect(recent).toHaveLength(KONAMI_CODE.length);
  });
});

describe('noticeFor', () => {
  const off = initialState({ sound: true, crt: true, returning: true, secret: false, record: 0 }, null);
  const on = { ...off, cyclone: true };

  it('muestra "¡Vamos Ciclón!" al prender el Modo Ciclón (RF-71)', () => {
    expect(noticeFor(off, on)).toBe('cyclone');
  });

  it('muestra el cartel del cartucho al descubrirlo, una sola vez (RF-74)', () => {
    const found = { ...off, secretFound: true };
    expect(noticeFor(off, found)).toBe('secret');
    expect(noticeFor(found, found)).toBeNull();
  });

  it('no muestra nada al apagarlo ni si no cambia', () => {
    expect(noticeFor(on, off)).toBeNull();
    expect(noticeFor(off, off)).toBeNull();
    expect(noticeFor(on, on)).toBeNull();
  });
});

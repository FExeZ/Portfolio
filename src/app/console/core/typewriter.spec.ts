import { describe, expect, it } from 'vitest';
import { MAX_PAGE_CHARS } from '../content/room';
import { CHAR_MS, blipAt, typingMs, visibleChars } from './typewriter';

describe('visibleChars', () => {
  it('muestra una letra más cada CHAR_MS', () => {
    expect(visibleChars(10, 0)).toBe(0);
    expect(visibleChars(10, CHAR_MS - 1)).toBe(0);
    expect(visibleChars(10, CHAR_MS)).toBe(1);
    expect(visibleChars(10, CHAR_MS * 4 + 5)).toBe(4);
  });

  it('nunca muestra más letras que las del texto', () => {
    expect(visibleChars(10, CHAR_MS * 10)).toBe(10);
    expect(visibleChars(10, 60_000)).toBe(10);
  });
});

describe('typingMs', () => {
  it('una página de 160 caracteres tarda 4,8 s', () => {
    expect(MAX_PAGE_CHARS).toBe(160);
    expect(typingMs(MAX_PAGE_CHARS)).toBe(4800);
  });
});

describe('blipAt', () => {
  const text = 'Hola mundo';

  it('suena cuando aparece una letra en posición par', () => {
    expect(blipAt(text, 0, 1)).toBe(true);
    expect(blipAt(text, 6, 7)).toBe(true);
  });

  it('no suena en las letras de posición impar', () => {
    expect(blipAt(text, 1, 2)).toBe(false);
    expect(blipAt(text, 5, 6)).toBe(false);
  });

  it('los espacios no suenan', () => {
    expect(text[4]).toBe(' ');
    expect(blipAt(text, 4, 5)).toBe(false);
  });

  it('si aparecen varias letras juntas, suena una sola vez', () => {
    expect(blipAt(text, 0, 4)).toBe(true);
  });

  it('sin letras nuevas no suena', () => {
    expect(blipAt(text, 3, 3)).toBe(false);
  });
});

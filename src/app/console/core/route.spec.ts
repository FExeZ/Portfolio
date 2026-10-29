import { describe, expect, it } from 'vitest';
import { SECTION_IDS, fromHash, popStateAction, toHash, urlUpdate } from './route';

describe('SECTION_IDS', () => {
  it('tiene las 7 secciones de la consola', () => {
    expect(SECTION_IDS).toEqual([
      'player',
      'about',
      'skills',
      'projects',
      'simpsonsdle',
      'contact',
      'credits'
    ]);
  });
});

describe('toHash', () => {
  it.each(SECTION_IDS)('identifica la sección %s en la dirección', (id) => {
    expect(toHash(id)).toBe(`#/${id}`);
  });

  it('deja la dirección sin hash fuera de una sección', () => {
    expect(toHash(null)).toBe('');
  });
});

describe('fromHash', () => {
  it.each(['', '#', '#/'])('trata %j como un arranque normal', (hash) => {
    expect(fromHash(hash)).toBeNull();
  });

  it.each(SECTION_IDS)('abre la sección %s', (id) => {
    expect(fromHash(`#/${id}`)).toEqual({ kind: 'section', id });
  });

  it.each(['#/xyz', '#/skills/extra', '#skills', '#/SKILLS', '#/constructor', '#/toString'])(
    'marca %j como desconocida',
    (hash) => {
      expect(fromHash(hash)).toBe('unknown');
    }
  );

  it('reconoce el modo texto, que no es una sección de la consola (RF-68)', () => {
    expect(fromHash('#/text')).toBe('text');
    expect(fromHash('#/text/extra')).toBe('unknown');
  });
});

describe('urlUpdate', () => {
  it('no hace nada si la dirección no cambia', () => {
    expect(urlUpdate('', '')).toBe('none');
    expect(urlUpdate('#/skills', '#/skills')).toBe('none');
  });

  it('crea una entrada en el historial al entrar a una sección', () => {
    expect(urlUpdate('', '#/skills')).toBe('push');
  });

  it('reemplaza la dirección en cualquier otro cambio', () => {
    expect(urlUpdate('#/skills', '')).toBe('replace');
    expect(urlUpdate('#/skills', '#/projects')).toBe('replace');
  });
});

describe('popStateAction', () => {
  it('vuelve al menú cuando el historial sale de una sección', () => {
    expect(popStateAction('skills', '')).toEqual({ type: 'back' });
    expect(popStateAction('skills', '#/xyz')).toEqual({ type: 'back' });
  });

  it('abre la sección cuando el historial entra a una', () => {
    expect(popStateAction(null, '#/projects')).toEqual({
      type: 'open',
      screen: { kind: 'section', id: 'projects' }
    });
  });

  it('no hace nada si la sección no cambia', () => {
    expect(popStateAction('skills', '#/skills')).toBeNull();
  });

  it('no hace nada fuera de una sección sin destino válido', () => {
    expect(popStateAction(null, '')).toBeNull();
    expect(popStateAction(null, '#/xyz')).toBeNull();
  });

  it('abrir el modo texto no mueve la consola, esté o no en una sección', () => {
    expect(popStateAction(null, '#/text')).toBeNull();
    expect(popStateAction('about', '#/text')).toBeNull();
  });
});

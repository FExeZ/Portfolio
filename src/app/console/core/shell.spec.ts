import { describe, expect, it } from 'vitest';
import { pickShell } from './shell';

describe('pickShell', () => {
  it('muestra la carcasa de escritorio desde 768 px de ancho', () => {
    expect(pickShell({ width: 768, height: 800, touch: false, landscape: false })).toEqual({
      shell: 'desktop',
      rotateHint: false
    });
  });

  it('muestra la Pocket por debajo de 768 px de ancho', () => {
    expect(pickShell({ width: 767, height: 800, touch: false, landscape: false })).toEqual({
      shell: 'pocket',
      rotateHint: false
    });
  });

  it('muestra la Pocket en un celular vertical', () => {
    expect(pickShell({ width: 375, height: 812, touch: true, landscape: false })).toEqual({
      shell: 'pocket',
      rotateHint: false
    });
  });

  it('pide girar un celular horizontal con menos de 500 px de alto, aunque sea ancho', () => {
    expect(pickShell({ width: 844, height: 499, touch: true, landscape: true })).toEqual({
      shell: 'pocket',
      rotateHint: true
    });
  });

  it('no pide girar con 500 px de alto exactos', () => {
    expect(pickShell({ width: 844, height: 500, touch: true, landscape: true })).toEqual({
      shell: 'desktop',
      rotateHint: false
    });
  });

  it('no pide girar en una pantalla sin táctil, aunque sea baja', () => {
    expect(pickShell({ width: 1024, height: 450, touch: false, landscape: true })).toEqual({
      shell: 'desktop',
      rotateHint: false
    });
  });

  it('muestra la carcasa de escritorio en una tablet horizontal', () => {
    expect(pickShell({ width: 1024, height: 768, touch: true, landscape: true })).toEqual({
      shell: 'desktop',
      rotateHint: false
    });
  });
});

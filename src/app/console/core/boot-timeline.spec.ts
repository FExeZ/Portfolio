import { describe, expect, it } from 'vitest';
import { BOOT_STEPS, BOOT_STEPS_REDUCED, bootDuration, bootStepAt, bootSteps } from './boot-timeline';

describe('secuencia de arranque', () => {
  it('va del encendido del tubo al logo y a la title screen', () => {
    expect(BOOT_STEPS.map((s) => s.id)).toEqual(['tube', 'static', 'logo', 'fadeToTitle']);
  });

  it.each([
    ['normal', BOOT_STEPS],
    ['reducida', BOOT_STEPS_REDUCED]
  ])('la variante %s dura 5 segundos o menos', (_name, steps) => {
    expect(bootDuration(steps)).toBeLessThanOrEqual(5000);
  });

  it('la variante reducida no tiene estática ni encendido del tubo', () => {
    const ids = BOOT_STEPS_REDUCED.map((s) => s.id);
    expect(ids).not.toContain('static');
    expect(ids).not.toContain('tube');
  });

  it('elige la variante según "reducir movimiento"', () => {
    expect(bootSteps(false)).toBe(BOOT_STEPS);
    expect(bootSteps(true)).toBe(BOOT_STEPS_REDUCED);
  });
});

describe('bootStepAt', () => {
  it('devuelve cada paso dentro de sus límites', () => {
    expect(bootStepAt(BOOT_STEPS, 0)).toBe('tube');
    expect(bootStepAt(BOOT_STEPS, 599)).toBe('tube');
    expect(bootStepAt(BOOT_STEPS, 600)).toBe('static');
    expect(bootStepAt(BOOT_STEPS, 1499)).toBe('static');
    expect(bootStepAt(BOOT_STEPS, 1500)).toBe('logo');
    expect(bootStepAt(BOOT_STEPS, 3499)).toBe('logo');
    expect(bootStepAt(BOOT_STEPS, 3500)).toBe('fadeToTitle');
    expect(bootStepAt(BOOT_STEPS, 3899)).toBe('fadeToTitle');
  });

  it('termina al cumplirse la duración total', () => {
    expect(bootStepAt(BOOT_STEPS, bootDuration(BOOT_STEPS))).toBe('done');
    expect(bootStepAt(BOOT_STEPS, 60000)).toBe('done');
  });

  it('trata un tiempo negativo como el inicio', () => {
    expect(bootStepAt(BOOT_STEPS, -10)).toBe('tube');
  });

  it('funciona con la variante reducida', () => {
    expect(bootStepAt(BOOT_STEPS_REDUCED, 0)).toBe('logo');
    expect(bootStepAt(BOOT_STEPS_REDUCED, bootDuration(BOOT_STEPS_REDUCED))).toBe('done');
  });
});

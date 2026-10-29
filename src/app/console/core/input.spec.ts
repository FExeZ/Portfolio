import { describe, expect, it } from 'vitest';
import { FocusContext, buttonToCode, keyToAction, keyToCode } from './input';

const NO_FOCUS: FocusContext = { editable: false, nativeActivation: false };
const TEXT_FIELD: FocusContext = { editable: true, nativeActivation: false };
const BUTTON: FocusContext = { editable: false, nativeActivation: true };

describe('keyToAction', () => {
  it.each([
    ['ArrowUp', 'up'],
    ['w', 'up'],
    ['W', 'up'],
    ['ArrowDown', 'down'],
    ['s', 'down'],
    ['S', 'down'],
    ['ArrowLeft', 'left'],
    ['a', 'left'],
    ['A', 'left'],
    ['ArrowRight', 'right'],
    ['d', 'right'],
    ['D', 'right'],
    ['Escape', 'back'],
    ['Backspace', 'back'],
    ['Enter', 'confirm'],
    [' ', 'confirm'],
    ['m', 'toggleSound'],
    ['M', 'toggleSound']
  ])('convierte %j en %s', (key, type) => {
    expect(keyToAction(key, NO_FOCUS)).toEqual({ type });
  });

  it.each(['x', 'Tab', 'Shift', 'F5'])('ignora %j', (key) => {
    expect(keyToAction(key, NO_FOCUS)).toBeNull();
  });

  it.each(['ArrowUp', 'w', 's', 'a', 'd', 'm', 'M', 'Escape', 'Backspace', 'Enter', ' '])(
    'no actúa con %j si el foco está en un campo de texto',
    (key) => {
      expect(keyToAction(key, TEXT_FIELD)).toBeNull();
    }
  );

  it.each(['Enter', ' '])('deja que %j active el botón enfocado sin procesarlo dos veces', (key) => {
    expect(keyToAction(key, BUTTON)).toBeNull();
  });

  it('sigue moviendo el cursor y volviendo con el foco en un botón', () => {
    expect(keyToAction('ArrowDown', BUTTON)).toEqual({ type: 'down' });
    expect(keyToAction('Escape', BUTTON)).toEqual({ type: 'back' });
    expect(keyToAction('m', BUTTON)).toEqual({ type: 'toggleSound' });
  });
});

describe('keyToCode (RF-71)', () => {
  it.each([
    ['ArrowUp', 'up'],
    ['ArrowDown', 'down'],
    ['ArrowLeft', 'left'],
    ['ArrowRight', 'right'],
    ['b', 'b'],
    ['B', 'b'],
    ['Escape', 'b'],
    ['Backspace', 'b'],
    ['a', 'a'],
    ['A', 'a'],
    ['Enter', 'a'],
    [' ', 'a']
  ])('convierte %j en %s', (key, input) => {
    expect(keyToCode(key, NO_FOCUS)).toBe(input);
  });

  it.each(['w', 'W', 's', 'd', 'm', 'x', 'Tab'])('no cuenta %j', (key) => {
    expect(keyToCode(key, NO_FOCUS)).toBeNull();
  });

  it('cuenta Enter aunque el foco esté en un botón', () => {
    expect(keyToCode('Enter', BUTTON)).toBe('a');
  });

  it.each(['ArrowUp', 'b', 'a', 'Enter'])('no cuenta %j con el foco en un campo de texto (RF-26)', (key) => {
    expect(keyToCode(key, TEXT_FIELD)).toBeNull();
  });
});

describe('buttonToCode (RF-71)', () => {
  it.each([
    ['up', 'up'],
    ['down', 'down'],
    ['left', 'left'],
    ['right', 'right'],
    ['back', 'b'],
    ['confirm', 'a']
  ] as const)('el botón %s de la Pocket cuenta como %s', (type, input) => {
    expect(buttonToCode(type)).toBe(input);
  });

  it('el silencio no cuenta', () => {
    expect(buttonToCode('toggleSound')).toBeNull();
  });
});

import type { CodeInput } from './easter-eggs';

/** Acciones que salen del teclado; console-state las suma a su unión de acciones. */
export type InputAction = {
  type: 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back' | 'toggleSound';
};

export interface FocusContext {
  /** El foco está en un campo de texto: las teclas son del campo, no de la consola. */
  editable: boolean;
  /** El foco está en un botón o link: Enter y Espacio ya disparan su clic. */
  nativeActivation: boolean;
}

const KEY_MAP: Readonly<Record<string, InputAction['type']>> = {
  ArrowUp: 'up',
  w: 'up',
  W: 'up',
  ArrowDown: 'down',
  s: 'down',
  S: 'down',
  ArrowLeft: 'left',
  a: 'left',
  A: 'left',
  ArrowRight: 'right',
  d: 'right',
  D: 'right',
  Escape: 'back',
  Backspace: 'back',
  Enter: 'confirm',
  ' ': 'confirm',
  m: 'toggleSound',
  M: 'toggleSound'
};

export function keyToAction(key: string, focus: FocusContext): InputAction | null {
  if (focus.editable) return null;
  const type = Object.hasOwn(KEY_MAP, key) ? KEY_MAP[key] : undefined;
  if (!type) return null;
  if (type === 'confirm' && focus.nativeActivation) return null;
  return { type };
}

/** El código se escribe con las flechas y las letras B y A, o con las teclas de los botones B y A. */
const CODE_KEYS: Readonly<Record<string, CodeInput>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  b: 'b',
  B: 'b',
  Escape: 'b',
  Backspace: 'b',
  a: 'a',
  A: 'a',
  Enter: 'a',
  ' ': 'a'
};

/** La tecla como entrada del código del Modo Ciclón (RF-71); nunca dentro de un campo de texto (RF-26). */
export function keyToCode(key: string, focus: FocusContext): CodeInput | null {
  if (focus.editable || !Object.hasOwn(CODE_KEYS, key)) return null;
  return CODE_KEYS[key];
}

/** La cruz y los botones de la Pocket como entrada del código: Start confirma, así que cuenta como A. */
export function buttonToCode(type: InputAction['type']): CodeInput | null {
  switch (type) {
    case 'back':
      return 'b';
    case 'confirm':
      return 'a';
    case 'toggleSound':
      return null;
    default:
      return type;
  }
}

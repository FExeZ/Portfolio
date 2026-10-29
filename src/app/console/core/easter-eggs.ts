import type { ConsoleState } from './console-state';

/** Lo que cuenta para el código: las cuatro direcciones y los botones B y A. */
export type CodeInput = 'up' | 'down' | 'left' | 'right' | 'b' | 'a';

/** El código del Modo Ciclón (RF-71). */
export const KONAMI_CODE: readonly CodeInput[] = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'b',
  'a'
];

/** Suma una entrada a las últimas y avisa si con ella se completó el código. */
export function pushCode(
  recent: readonly CodeInput[],
  input: CodeInput
): { recent: CodeInput[]; matched: boolean } {
  const next = [...recent, input].slice(-KONAMI_CODE.length);
  // No hace falta vaciar la lista al coincidir: el código no empieza como termina, así que no se repite solo.
  const matched = next.length === KONAMI_CODE.length && next.every((entry, i) => entry === KONAMI_CODE[i]);
  return { recent: next, matched };
}

/** Cartel que anuncia un secreto. */
export type NoticeId = 'cyclone' | 'secret';

/** Lo que dura el cartel en pantalla. */
export const NOTICE_MS = 2500;

/**
 * El cartel que corresponde a un cambio de estado: "¡Vamos Ciclón!" al prender el modo (RF-71)
 * y el aviso del cartucho secreto al descubrirlo (RF-74).
 */
export function noticeFor(prev: ConsoleState, next: ConsoleState): NoticeId | null {
  if (next.cyclone && !prev.cyclone) return 'cyclone';
  return next.secretFound && !prev.secretFound ? 'secret' : null;
}

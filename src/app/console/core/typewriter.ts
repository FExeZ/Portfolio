/** Una letra nueva cada 30 ms: una página de 160 caracteres tarda 4,8 s (RF-32). */
export const CHAR_MS = 30;

export function visibleChars(length: number, elapsedMs: number): number {
  return Math.min(length, Math.floor(elapsedMs / CHAR_MS));
}

export function typingMs(length: number): number {
  return length * CHAR_MS;
}

/**
 * Si entre `before` y `after` letras visibles apareció una en posición par que no es un
 * espacio: así la tecla suena cada dos letras y nunca en un espacio (RF-58).
 */
export function blipAt(text: string, before: number, after: number): boolean {
  for (let i = before; i < after; i++) {
    if (i % 2 === 0 && text[i].trim() !== '') return true;
  }
  return false;
}

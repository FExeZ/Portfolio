export type ShellKind = 'desktop' | 'pocket';

export interface ViewportInfo {
  width: number;
  height: number;
  touch: boolean;
  landscape: boolean;
}

export interface ShellChoice {
  shell: ShellKind;
  /** Mostrar el aviso "Girá el teléfono para jugar mejor". */
  rotateHint: boolean;
}

const DESKTOP_MIN_WIDTH = 768;
const LANDSCAPE_MIN_HEIGHT = 500;

export function pickShell({ width, height, touch, landscape }: ViewportInfo): ShellChoice {
  if (touch && landscape && height < LANDSCAPE_MIN_HEIGHT) {
    return { shell: 'pocket', rotateHint: true };
  }
  return { shell: width >= DESKTOP_MIN_WIDTH ? 'desktop' : 'pocket', rotateHint: false };
}

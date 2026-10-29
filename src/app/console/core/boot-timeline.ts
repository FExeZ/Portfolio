export type BootStepId = 'tube' | 'static' | 'logo' | 'fadeToTitle';

export interface BootStep {
  id: BootStepId;
  ms: number;
}

/** Encendido del tubo, estática, logo FZ-16 y fundido a la title screen. */
export const BOOT_STEPS: readonly BootStep[] = [
  { id: 'tube', ms: 600 },
  { id: 'static', ms: 900 },
  { id: 'logo', ms: 2000 },
  { id: 'fadeToTitle', ms: 400 }
];

/** Con "reducir movimiento": sin tubo ni estática, y fundidos cortos (RF-64). */
export const BOOT_STEPS_REDUCED: readonly BootStep[] = [
  { id: 'logo', ms: 1500 },
  { id: 'fadeToTitle', ms: 200 }
];

export function bootSteps(reducedMotion: boolean): readonly BootStep[] {
  return reducedMotion ? BOOT_STEPS_REDUCED : BOOT_STEPS;
}

export function bootDuration(steps: readonly BootStep[]): number {
  return steps.reduce((total, step) => total + step.ms, 0);
}

export function bootStepAt(steps: readonly BootStep[], elapsedMs: number): BootStepId | 'done' {
  let end = 0;
  for (const step of steps) {
    end += step.ms;
    if (elapsedMs < end) return step.id;
  }
  return 'done';
}

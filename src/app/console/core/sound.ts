import { ROOM_OBJECTS } from '../content/room';
import type { Action, ConsoleState, ReduceResult } from './console-state';
import { SectionView, isInserting, snakeOf } from './section-state';

export type SoundId =
  | 'cursor'
  | 'select'
  | 'back'
  | 'power'
  | 'static'
  | 'logo'
  | 'zoom'
  | 'cartridge'
  | 'type'
  | 'barkSmall'
  | 'barkMedium'
  | 'barkBig'
  | 'meow'
  | 'cyclone'
  | 'secret'
  | 'eat'
  | 'gameOver';
export type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise';

export interface Note {
  /** ms desde el inicio del sonido. */
  at: number;
  dur: number;
  wave: Wave;
  /** Hz; el ruido no tiene frecuencia. */
  freq?: number;
  /** Hz al final de la nota: deslizamiento de tono. */
  freqEnd?: number;
  /** 0 a 1, antes del volumen general. */
  gain: number;
  /** Modulador senoidal a freq × ratio: da el timbre metálico de la síntesis FM de 16 bits. */
  fm?: { ratio: number; depth: number };
}

// Notas en Hz.
const C4 = 261.63;
const A4 = 440;
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const B5 = 987.77;
const C6 = 1046.5;
const D6 = 1174.66;
const G6 = 1567.98;

const BELL = { ratio: 2, depth: 0.5 };
const BRASS = { ratio: 1, depth: 1.5 };

/** Frecuencia de una nota MIDI: La 4 es la 69, a 440 Hz. */
function hz(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Primera frase de "Pasaron 100 años", el canto de la hinchada (RF-71). Cada nota es [MIDI,
 * duración en corcheas], en orden. Sale del tarareo de Franco, corregido por él de oído.
 */
const CHANT: readonly (readonly [number, number])[] = [
  [72, 1], [73, 1], [74, 0.5], [77, 1], [79, 1], [79, 2],
  [75, 0.5], [79, 1], [79, 1], [74, 0.5], [79, 1], [74, 0.5],
  [80, 1], [80, 2], [80, 0.5], [80, 1], [80, 1],
  [77, 0.5], [75, 1], [74, 0.5], [74, 1], [74, 2.5], [74, 0.5],
  [75, 1], [75, 1], [77, 0.5], [76, 1], [73, 0.5], [73, 1], [71, 4]
];
/** 109 bpm, la velocidad que eligió Franco. */
const CHANT_EIGHTH_MS = 275;

/** El canto con el bronce del logo, una segunda voz una octava abajo y la tribuna que ruge al final. */
function chant(): Note[] {
  const notes: Note[] = [];
  let at = 0;
  for (const [midi, length] of CHANT) {
    const dur = Math.round(length * CHANT_EIGHTH_MS * 0.85);
    notes.push(
      { at, dur, wave: 'square', freq: hz(midi), gain: 0.28, fm: BRASS },
      { at, dur, wave: 'triangle', freq: hz(midi - 12), gain: 0.2 }
    );
    at += length * CHANT_EIGHTH_MS;
  }
  // La tribuna ruge con la última nota.
  const last = notes[notes.length - 1].at;
  return [...notes, { at: last, dur: 1000, wave: 'noise', gain: 0.12 }];
}

/**
 * Banco de sonidos: originales y sintetizados (RF-59), salvo la melodía del canto del Modo
 * Ciclón (RF-71). Se ajustan de oído en T19.
 */
export const SOUNDS: Readonly<Record<SoundId, readonly Note[]>> = {
  cursor: [{ at: 0, dur: 40, wave: 'square', freq: C6, gain: 0.25 }],
  select: [
    { at: 0, dur: 60, wave: 'square', freq: E5, gain: 0.3, fm: BELL },
    { at: 60, dur: 70, wave: 'square', freq: B5, gain: 0.3, fm: BELL }
  ],
  back: [
    { at: 0, dur: 60, wave: 'square', freq: E5, gain: 0.3 },
    { at: 60, dur: 70, wave: 'square', freq: A4, gain: 0.3 }
  ],
  // Clic y zumbido grave que sube: el tubo que se calienta.
  power: [
    { at: 0, dur: 20, wave: 'noise', gain: 0.4 },
    { at: 20, dur: 430, wave: 'triangle', freq: 55, freqEnd: 220, gain: 0.35 }
  ],
  static: [{ at: 0, dur: 900, wave: 'noise', gain: 0.18 }],
  // Arpegio mayor con la última nota larga.
  logo: [
    { at: 0, dur: 150, wave: 'square', freq: C5, gain: 0.3, fm: BRASS },
    { at: 150, dur: 150, wave: 'square', freq: E5, gain: 0.3, fm: BRASS },
    { at: 300, dur: 150, wave: 'square', freq: G5, gain: 0.3, fm: BRASS },
    { at: 450, dur: 700, wave: 'square', freq: C6, gain: 0.35, fm: BRASS }
  ],
  // Cambio de canal: ráfaga de ruido y un blip que baja.
  zoom: [
    { at: 0, dur: 120, wave: 'noise', gain: 0.2 },
    { at: 80, dur: 120, wave: 'square', freq: G6, freqEnd: G5, gain: 0.2 }
  ],
  // Un cartucho que entra en la ranura: clic, golpe grave y el traqueteo del final.
  cartridge: [
    { at: 0, dur: 30, wave: 'noise', gain: 0.45 },
    { at: 0, dur: 120, wave: 'square', freq: 110, freqEnd: 70, gain: 0.3 },
    { at: 130, dur: 50, wave: 'noise', gain: 0.3 }
  ],
  // La tecla de la máquina de escribir de los diálogos: corta y suave para no cansar.
  type: [{ at: 0, dur: 20, wave: 'square', freq: B5, gain: 0.12 }],
  // Ladridos: una ráfaga de ruido con una nota que cae, más grave cuanto más grande el perro.
  barkSmall: [
    { at: 0, dur: 25, wave: 'noise', gain: 0.25 },
    { at: 0, dur: 70, wave: 'square', freq: 900, freqEnd: 500, gain: 0.25 },
    { at: 140, dur: 25, wave: 'noise', gain: 0.25 },
    { at: 140, dur: 70, wave: 'square', freq: 950, freqEnd: 520, gain: 0.25 }
  ],
  barkMedium: [
    { at: 0, dur: 35, wave: 'noise', gain: 0.28 },
    { at: 0, dur: 130, wave: 'square', freq: 560, freqEnd: 300, gain: 0.28 }
  ],
  barkBig: [
    { at: 0, dur: 50, wave: 'noise', gain: 0.32 },
    { at: 0, dur: 220, wave: 'square', freq: 260, freqEnd: 140, gain: 0.3 },
    { at: 0, dur: 220, wave: 'triangle', freq: 130, freqEnd: 70, gain: 0.3 }
  ],
  // Maullido: sube y baja.
  meow: [
    { at: 0, dur: 180, wave: 'sawtooth', freq: 520, freqEnd: 880, gain: 0.18 },
    { at: 180, dur: 260, wave: 'sawtooth', freq: 880, freqEnd: 440, gain: 0.18 }
  ],
  // Modo Ciclón: el canto de la hinchada (RF-71).
  cyclone: chant(),
  // Cartucho secreto: un arpegio que sube con campana, como encontrar un tesoro (RF-74).
  secret: [
    { at: 0, dur: 80, wave: 'square', freq: G5, gain: 0.28, fm: BELL },
    { at: 90, dur: 80, wave: 'square', freq: B5, gain: 0.28, fm: BELL },
    { at: 180, dur: 80, wave: 'square', freq: D6, gain: 0.28, fm: BELL },
    { at: 270, dur: 450, wave: 'square', freq: G6, gain: 0.3, fm: BELL }
  ],
  // Snake: un blip que sube al comer (RF-76) y una caída de tres notas en el Game Over (RF-77).
  eat: [{ at: 0, dur: 70, wave: 'square', freq: E5, freqEnd: B5, gain: 0.25 }],
  gameOver: [
    { at: 0, dur: 150, wave: 'square', freq: G5, gain: 0.3 },
    { at: 160, dur: 150, wave: 'square', freq: E5, gain: 0.3 },
    { at: 320, dur: 150, wave: 'square', freq: C5, gain: 0.3 },
    { at: 480, dur: 500, wave: 'triangle', freq: C4, gain: 0.35 }
  ]
};

export function soundDuration(notes: readonly Note[]): number {
  return notes.reduce((end, note) => Math.max(end, note.at + note.dur), 0);
}

/** Acciones que no hace el visitante: la consola cambia sola y no suena. */
const SILENT: ReadonlySet<Action['type']> = new Set([
  'transitionEnd',
  'bootDone',
  'open',
  'toggleSound',
  'insertDone',
  'typeDone',
  'pause'
]);

/**
 * Qué sonido corresponde a una acción, según cómo cambió el estado. La estática y el logo
 * no salen de acá sino de los pasos del arranque.
 */
export function soundFor(prev: ConsoleState, result: ReduceResult, action: Action): SoundId | null {
  const next = result.state;
  // Acción ignorada (por ejemplo, durante una transición). Un efecto, como cambiar el idioma, sí cuenta.
  if (next === prev && result.effects.length === 0) return null;
  if (SILENT.has(action.type)) return null;
  // RF-71: el jingle al prender el Modo Ciclón, en cualquier pantalla.
  if (action.type === 'toggleCyclone') return next.cyclone ? 'cyclone' : 'back';
  // RF-74: descubrir el cartucho secreto, en lugar del sonido de elegir la PC.
  if (next.secretFound && !prev.secretFound) return 'secret';
  // RF-58: empezar a insertar un cartucho, desde el estante o desde el menú.
  if (next.view && isInserting(next.view) && !(prev.view && isInserting(prev.view))) {
    return 'cartridge';
  }
  if (prev.screen.kind === 'off' && next.screen.kind === 'boot') return 'power';
  if (next.screen.kind === 'section' && prev.screen.kind !== 'section') return 'zoom';
  if (prev.screen.kind === 'section' && next.screen.kind !== 'section') return 'back';
  const snake = snakeSound(prev.view, next.view, action);
  if (snake !== undefined) return snake;
  const room = roomSound(prev.view, next.view);
  if (room !== undefined) return room;
  switch (action.type) {
    case 'back':
      return 'back';
    case 'up':
    case 'down':
    case 'left':
    case 'right':
    case 'point':
    case 'selectTab':
      return 'cursor';
    case 'confirm':
    case 'pick':
      return 'select';
    default:
      return null;
  }
}

/**
 * Sonidos de Snake; undefined si no hay partida o si la acción cae en la regla general (A suena a
 * selección y B, a volver). Girar no suena: sería un blip cada pocos pasos.
 */
function snakeSound(prev: SectionView | null, next: SectionView | null, action: Action): SoundId | null | undefined {
  const [before, after] = [snakeOf(prev), snakeOf(next)];
  if (!before || !after) return undefined;
  if (after.status === 'over' && before.status !== 'over') return 'gameOver';
  if (after.score > before.score) return 'eat';
  switch (action.type) {
    case 'tick':
    case 'up':
    case 'down':
    case 'left':
    case 'right':
      return null;
    default:
      return undefined;
  }
}

/**
 * Sonidos propios de la habitación (RF-58); undefined si el cambio no es de la habitación.
 * Abrir un diálogo cae en la regla general y suena a selección.
 */
function roomSound(prev: SectionView | null, next: SectionView | null): SoundId | null | undefined {
  if (prev?.id !== 'about' || next?.id !== 'about') return undefined;
  if (next.pet && next.pet.count !== prev.pet?.count) {
    const pet = ROOM_OBJECTS[next.pet.object];
    return pet.kind === 'pet' ? pet.sound : null;
  }
  const [before, after] = [prev.dialog, next.dialog];
  if (!before) return undefined;
  if (!after) return 'back';
  if (after.page !== before.page) return 'cursor';
  // Completar la página con A: la tecla de la escritura se corta sola.
  return before.typing && !after.typing ? null : undefined;
}

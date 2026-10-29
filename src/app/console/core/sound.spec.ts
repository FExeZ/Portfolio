import { describe, expect, it } from 'vitest';
import { ROOM_OBJECTS } from '../content/room';
import { BOOT_STEPS, BOOT_STEPS_REDUCED } from './boot-timeline';
import { Action, ConsoleState, Screen, reduce } from './console-state';
import type { AboutView } from './section-state';
import { SnakeGame, newSnake } from './snake';
import { SOUNDS, SoundId, soundDuration, soundFor } from './sound';

const SOUND_IDS: SoundId[] = [
  'cursor',
  'select',
  'back',
  'power',
  'static',
  'logo',
  'zoom',
  'cartridge',
  'type',
  'barkSmall',
  'barkMedium',
  'barkBig',
  'meow',
  'cyclone',
  'secret',
  'eat',
  'gameOver'
];

function stateWith(screen: Screen, overrides: Partial<ConsoleState> = {}): ConsoleState {
  return {
    screen,
    transitioning: false,
    returning: true,
    prefs: { sound: true, crt: true },
    view: null,
    cyclone: false,
    secretFound: false,
    snakeRecord: 0,
    ...overrides
  };
}

/** Pasa la acción por el reducer real y pregunta qué sonido corresponde. */
function soundAfter(prev: ConsoleState, action: Action): SoundId | null {
  return soundFor(prev, reduce(prev, action), action);
}

function stepMs(steps: typeof BOOT_STEPS, id: string): number {
  return steps.find((step) => step.id === id)?.ms ?? 0;
}

describe('SOUNDS', () => {
  it('define todos los sonidos del banco', () => {
    expect(Object.keys(SOUNDS).sort()).toEqual([...SOUND_IDS].sort());
    for (const id of SOUND_IDS) expect(SOUNDS[id].length).toBeGreaterThan(0);
  });

  it.each(SOUND_IDS)('%s tiene notas válidas', (id) => {
    for (const note of SOUNDS[id]) {
      expect(note.at).toBeGreaterThanOrEqual(0);
      expect(note.dur).toBeGreaterThan(0);
      expect(note.gain).toBeGreaterThan(0);
      expect(note.gain).toBeLessThanOrEqual(1);
      if (note.wave === 'noise') {
        expect(note.freq).toBeUndefined();
      } else {
        expect(note.freq).toBeGreaterThan(0);
      }
      if (note.freqEnd !== undefined) expect(note.freqEnd).toBeGreaterThan(0);
      if (note.fm) {
        expect(note.fm.ratio).toBeGreaterThan(0);
        expect(note.fm.depth).toBeGreaterThan(0);
      }
    }
  });

  it.each<SoundId>(['cursor', 'select', 'back', 'zoom'])('%s es corto (200 ms o menos)', (id) => {
    expect(soundDuration(SOUNDS[id])).toBeLessThanOrEqual(200);
  });

  it('el cartucho dura 300 ms o menos', () => {
    expect(soundDuration(SOUNDS.cartridge)).toBeLessThanOrEqual(300);
  });

  it('el logo termina antes que su paso del arranque, en las dos variantes', () => {
    const shortest = Math.min(stepMs(BOOT_STEPS, 'logo'), stepMs(BOOT_STEPS_REDUCED, 'logo'));
    expect(soundDuration(SOUNDS.logo)).toBeLessThan(shortest);
  });

  it('la estática no dura más que su paso del arranque', () => {
    expect(soundDuration(SOUNDS.static)).toBeLessThanOrEqual(stepMs(BOOT_STEPS, 'static'));
  });

  it('la tecla de la máquina de escribir dura 20 ms', () => {
    expect(soundDuration(SOUNDS.type)).toBe(20);
  });

  it.each<SoundId>(['barkSmall', 'barkMedium', 'barkBig'])('el ladrido %s dura 300 ms o menos', (id) => {
    expect(soundDuration(SOUNDS[id])).toBeLessThanOrEqual(300);
  });

  it('el maullido dura 500 ms o menos', () => {
    expect(soundDuration(SOUNDS.meow)).toBeLessThanOrEqual(500);
  });

  it('el hallazgo del cartucho secreto dura 1 s o menos', () => {
    expect(soundDuration(SOUNDS.secret)).toBeLessThanOrEqual(1000);
  });

  it('el canto del Modo Ciclón dura 15 s o menos (RF-71)', () => {
    expect(soundDuration(SOUNDS.cyclone)).toBeGreaterThanOrEqual(5000);
    expect(soundDuration(SOUNDS.cyclone)).toBeLessThanOrEqual(15000);
  });


  it('cada mascota de la habitación tiene su sonido en el banco (RF-35)', () => {
    for (const object of ROOM_OBJECTS) {
      if (object.kind === 'pet') expect(SOUNDS[object.sound].length, object.id).toBeGreaterThan(0);
    }
  });
});

describe('soundDuration', () => {
  it('es el final de la nota que termina más tarde', () => {
    expect(
      soundDuration([
        { at: 0, dur: 100, wave: 'square', freq: 440, gain: 0.5 },
        { at: 50, dur: 300, wave: 'noise', gain: 0.5 },
        { at: 200, dur: 50, wave: 'sine', freq: 880, gain: 0.5 }
      ])
    ).toBe(350);
  });
});

describe('soundFor', () => {
  const off = stateWith({ kind: 'off' }, { returning: false });
  const boot = stateWith({ kind: 'boot' });
  const title = stateWith({ kind: 'title', cursor: 0 });
  const menu = stateWith({ kind: 'menu', cursor: 0 });
  const options = stateWith({ kind: 'options', cursor: 0, returnTo: 'menu' });
  const skills = stateWith({ kind: 'section', id: 'skills' });

  it('encender la tele suena a encendido', () => {
    expect(soundAfter(off, { type: 'confirm' })).toBe('power');
  });

  it('entrar a una sección suena a cambio de canal', () => {
    expect(soundAfter(menu, { type: 'pick', index: 2 })).toBe('zoom');
  });

  it('salir de una sección suena a volver', () => {
    expect(soundAfter(skills, { type: 'back' })).toBe('back');
  });

  it('B suena a volver en el menú y en Opciones', () => {
    expect(soundAfter(menu, { type: 'back' })).toBe('back');
    expect(soundAfter(options, { type: 'back' })).toBe('back');
  });

  it('mover el cursor suena a cursor', () => {
    expect(soundAfter(menu, { type: 'down' })).toBe('cursor');
    expect(soundAfter(menu, { type: 'up' })).toBe('cursor');
    expect(soundAfter(menu, { type: 'point', index: 3 })).toBe('cursor');
  });

  it('elegir suena a selección', () => {
    expect(soundAfter(title, { type: 'confirm' })).toBe('select');
    expect(soundAfter(menu, { type: 'pick', index: 6 })).toBe('select');
  });

  it('cambiar una opción suena a selección, incluido el idioma, que no cambia el estado', () => {
    expect(soundAfter(options, { type: 'pick', index: 1 })).toBe('select');
    expect(soundAfter(options, { type: 'confirm' })).toBe('select');
  });

  it('una acción sin efecto no suena', () => {
    expect(soundAfter(title, { type: 'back' })).toBeNull();
    expect(soundAfter(menu, { type: 'point', index: 0 })).toBeNull();
    expect(soundAfter(skills, { type: 'confirm' })).toBeNull();
  });

  it('una acción ignorada durante una transición no suena', () => {
    const moving = stateWith({ kind: 'menu', cursor: 0 }, { transitioning: true });
    expect(soundAfter(moving, { type: 'down' })).toBeNull();
    expect(soundAfter(moving, { type: 'confirm' })).toBeNull();
  });

  it('los cambios que no hace el visitante no suenan', () => {
    expect(soundAfter(stateWith({ kind: 'menu', cursor: 0 }, { transitioning: true }), { type: 'transitionEnd' })).toBeNull();
    expect(soundAfter(boot, { type: 'bootDone' })).toBeNull();
    expect(soundAfter(menu, { type: 'open', screen: { kind: 'section', id: 'contact' } })).toBeNull();
  });

  it('moverse dentro de una sección suena a cursor, también al cambiar de pestaña', () => {
    const skills = stateWith({ kind: 'section', id: 'skills' }, { view: { id: 'skills', tab: 0, cursor: 0 } });
    expect(soundAfter(skills, { type: 'down' })).toBe('cursor');
    expect(soundAfter(skills, { type: 'right' })).toBe('cursor');
    expect(soundAfter(skills, { type: 'selectTab', index: 2 })).toBe('cursor');
  });

  it('un acceso de Jugador suena a selección', () => {
    const player = stateWith({ kind: 'section', id: 'player' }, { view: { id: 'player', cursor: 0 } });
    expect(soundAfter(player, { type: 'confirm' })).toBe('select');
  });

  it('insertar un cartucho suena a cartucho, desde el estante y desde el menú (RF-58)', () => {
    const shelf = stateWith({ kind: 'section', id: 'projects' }, { view: { id: 'projects', cursor: 0, open: null } });
    expect(soundAfter(shelf, { type: 'confirm' })).toBe('cartridge');
    expect(soundAfter(menu, { type: 'pick', index: 4 })).toBe('cartridge');
  });

  it('moverse por el estante suena a cursor y volver del manual suena a volver', () => {
    const shelf = stateWith({ kind: 'section', id: 'projects' }, { view: { id: 'projects', cursor: 0, open: null } });
    expect(soundAfter(shelf, { type: 'right' })).toBe('cursor');
    const manual = stateWith({ kind: 'section', id: 'projects' }, { view: { id: 'projects', cursor: 2, open: { index: 2, stage: 'shown' } } });
    expect(soundAfter(manual, { type: 'back' })).toBe('back');
  });

  it('el fin de la inserción no suena', () => {
    const inserting = stateWith({ kind: 'section', id: 'simpsonsdle' }, { view: { id: 'simpsonsdle', stage: 'inserting' } });
    expect(soundAfter(inserting, { type: 'insertDone' })).toBeNull();
  });

  it('silenciar o activar el sonido no suena', () => {
    expect(soundAfter(menu, { type: 'toggleSound' })).toBeNull();
  });

  it('saltear el arranque no suena', () => {
    expect(soundAfter(boot, { type: 'skip' })).toBeNull();
  });
});

describe('soundFor del Modo Ciclón (RF-71)', () => {
  it('prenderlo suena el jingle y apagarlo suena a volver', () => {
    const menu = stateWith({ kind: 'menu', cursor: 0 });
    expect(soundAfter(menu, { type: 'toggleCyclone' })).toBe('cyclone');
    expect(soundAfter({ ...menu, cyclone: true }, { type: 'toggleCyclone' })).toBe('back');
  });

  it('suena también durante la cámara y con un diálogo de la habitación abierto', () => {
    const moving = stateWith({ kind: 'section', id: 'skills' }, { transitioning: true });
    expect(soundAfter(moving, { type: 'toggleCyclone' })).toBe('cyclone');
    const dialog: AboutView = {
      id: 'about',
      cursor: 0,
      dialog: { object: 0, page: 0, typing: true },
      pet: null,
      pcPicks: 0
    };
    const room = stateWith({ kind: 'section', id: 'about' }, { view: dialog });
    expect(soundAfter(room, { type: 'toggleCyclone' })).toBe('cyclone');
  });
});

describe('soundFor en la habitación (RF-58)', () => {
  const index = (id: string) => ROOM_OBJECTS.findIndex((object) => object.id === id);
  const room = (rest: Partial<AboutView> = {}) =>
    stateWith(
      { kind: 'section', id: 'about' },
      { view: { id: 'about', cursor: 0, dialog: null, pet: null, pcPicks: 0, ...rest } }
    );
  const typing = room({ dialog: { object: 0, page: 0, typing: true } });
  const complete = room({ dialog: { object: 0, page: 0, typing: false } });
  const lastPage = room({ dialog: { object: 0, page: 1, typing: false } });

  it('descubrir el cartucho secreto suena a hallazgo (RF-74)', () => {
    expect(soundAfter(room({ cursor: index('pc'), pcPicks: 2 }), { type: 'confirm' })).toBe('secret');
  });

  it('recorrer los objetos suena a cursor', () => {
    expect(soundAfter(room(), { type: 'right' })).toBe('cursor');
  });

  it('abrir un diálogo suena a selección', () => {
    expect(soundAfter(room(), { type: 'confirm' })).toBe('select');
  });

  it('completar la página con A no suena: la escritura se corta sola', () => {
    expect(soundAfter(typing, { type: 'confirm' })).toBeNull();
  });

  it('pasar de página suena a cursor', () => {
    expect(soundAfter(complete, { type: 'confirm' })).toBe('cursor');
  });

  it('cerrar el diálogo suena a volver, con A en la última página o con B', () => {
    expect(soundAfter(lastPage, { type: 'confirm' })).toBe('back');
    expect(soundAfter(typing, { type: 'back' })).toBe('back');
  });

  it('el fin de la escritura no suena', () => {
    expect(soundAfter(typing, { type: 'typeDone' })).toBeNull();
  });

  it('cada mascota suena a su manera (RF-35)', () => {
    expect(soundAfter(room(), { type: 'pick', index: index('pocho') })).toBe('barkSmall');
    expect(soundAfter(room(), { type: 'pick', index: index('negra') })).toBe('barkBig');
    expect(soundAfter(room(), { type: 'pick', index: index('flaco') })).toBe('barkMedium');
    expect(soundAfter(room(), { type: 'pick', index: index('nymeria') })).toBe('meow');
  });

  it('elegir otra vez la misma mascota vuelve a sonar', () => {
    const pocho = index('pocho');
    expect(soundAfter(room({ cursor: pocho, pet: { object: pocho, count: 1 } }), { type: 'confirm' })).toBe(
      'barkSmall'
    );
  });

  it('elegir la tele suena a volver', () => {
    expect(soundAfter(room({ cursor: index('tv') }), { type: 'confirm' })).toBe('back');
  });
});

describe('soundFor en Snake (RF-76, RF-77)', () => {
  const game = (snake: Partial<SnakeGame>) =>
    stateWith(
      { kind: 'section', id: 'projects' },
      {
        secretFound: true,
        view: { id: 'projects', cursor: 9, open: { index: 9, stage: 'shown', snake: { ...newSnake(), status: 'playing', ...snake } } }
      }
    );
  const [head] = newSnake().body;

  it('girar no suena: sería un blip cada pocos pasos', () => {
    expect(soundAfter(game({}), { type: 'up' })).toBeNull();
  });

  it('un paso sin comer ni chocar no suena', () => {
    expect(soundAfter(game({}), { type: 'tick', random: 0 })).toBeNull();
  });

  it('comer suena', () => {
    expect(soundAfter(game({ food: { x: head.x + 1, y: head.y } }), { type: 'tick', random: 0 })).toBe('eat');
  });

  it('chocar suena a Game Over', () => {
    const edge: Partial<SnakeGame> = { body: [{ x: 19, y: 3 }], direction: 'right', next: 'right' };
    expect(soundAfter(game(edge), { type: 'tick', random: 0 })).toBe('gameOver');
  });

  it('pausar, seguir y reintentar suenan a selección', () => {
    expect(soundAfter(game({}), { type: 'confirm' })).toBe('select');
    expect(soundAfter(game({ status: 'over' }), { type: 'confirm' })).toBe('select');
  });

  it('pausar porque se ocultó la pestaña no suena', () => {
    expect(soundAfter(game({}), { type: 'pause' })).toBeNull();
  });
});

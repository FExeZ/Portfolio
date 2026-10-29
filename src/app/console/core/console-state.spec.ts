import { describe, expect, it } from 'vitest';
import {
  Action,
  ConsoleState,
  MENU_ITEMS,
  OPTIONS_ITEMS,
  Screen,
  TITLE_ITEMS_NEW,
  TITLE_ITEMS_RETURNING,
  initialState,
  planeOf,
  reduce,
  shotOf
} from './console-state';
import { ROOM_OBJECTS } from '../content/room';
import { SECTION_IDS } from './route';
import { SnakeGame, newSnake } from './snake';
import type { AboutView } from './section-state';

const PREFS = { sound: true, crt: true };

function stateWith(screen: Screen, overrides: Partial<ConsoleState> = {}): ConsoleState {
  return {
    screen,
    transitioning: false,
    returning: false,
    prefs: PREFS,
    view: null,
    cyclone: false,
    secretFound: false,
    snakeRecord: 0,
    ...overrides
  };
}

/** Aplica varias acciones seguidas y devuelve el estado final. */
function run(state: ConsoleState, ...actions: Action[]): ConsoleState {
  return actions.reduce((current, action) => reduce(current, action).state, state);
}

describe('initialState', () => {
  const NEW = { sound: true, crt: true, returning: false, secret: false, record: 0 };
  const RETURNING = { sound: true, crt: true, returning: true, secret: false, record: 0 };

  it('un visitante nuevo empieza con la tele apagada', () => {
    expect(initialState(NEW, null)).toEqual(stateWith({ kind: 'off' }));
  });

  it('un visitante recurrente empieza en la title screen', () => {
    expect(initialState(RETURNING, null)).toEqual(
      stateWith({ kind: 'title', cursor: 0 }, { returning: true })
    );
  });

  it('un link a una sección la abre directo, sea el visitante nuevo o recurrente', () => {
    const linked = { kind: 'section', id: 'skills' } as const;
    expect(initialState(NEW, linked).screen).toEqual(linked);
    expect(initialState(RETURNING, linked).screen).toEqual(linked);
    expect(initialState(NEW, linked).view).toEqual({ id: 'skills', tab: 0, cursor: 0 });
  });

  it('un link desconocido lleva a la title screen', () => {
    expect(initialState(NEW, 'unknown').screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('un link al modo texto deja la consola como en un arranque normal (RF-68)', () => {
    expect(initialState(NEW, 'text')).toEqual(initialState(NEW, null));
    expect(initialState(RETURNING, 'text')).toEqual(initialState(RETURNING, null));
  });

  it('toma el sonido y los efectos CRT guardados', () => {
    const state = initialState({ sound: false, crt: false, returning: false, secret: false, record: 0 }, null);
    expect(state.prefs).toEqual({ sound: false, crt: false });
  });
});

describe('planeOf', () => {
  it('ubica cada pantalla en su plano de cámara', () => {
    expect(planeOf({ kind: 'off' })).toBe(1);
    expect(planeOf({ kind: 'boot' })).toBe(2);
    expect(planeOf({ kind: 'title', cursor: 0 })).toBe(2);
    expect(planeOf({ kind: 'menu', cursor: 0 })).toBe(2);
    expect(planeOf({ kind: 'options', cursor: 0, returnTo: 'menu' })).toBe(2);
    expect(planeOf({ kind: 'section', id: 'projects' })).toBe(3);
  });

  it('"Sobre mí" es la habitación: plano 1 (RF-28)', () => {
    expect(planeOf({ kind: 'section', id: 'about' })).toBe(1);
  });
});

describe('Sobre mí: cámara (RF-28, RF-31, RF-33)', () => {
  const ABOUT = { kind: 'section', id: 'about' } as const;
  const roomView = (rest: Partial<AboutView> = {}): AboutView => ({
    id: 'about',
    cursor: 0,
    dialog: null,
    pet: null,
    pcPicks: 0,
    ...rest
  });
  const exploring = stateWith(ABOUT, { view: roomView() });
  const opened = run(exploring, { type: 'confirm' });
  const settled = run(opened, { type: 'transitionEnd' });

  it('shotOf encuadra un plano, o el objeto cuyo diálogo está abierto', () => {
    expect(shotOf(stateWith({ kind: 'menu', cursor: 0 }))).toBe(2);
    expect(shotOf(stateWith({ kind: 'section', id: 'skills' }))).toBe(3);
    expect(shotOf(exploring)).toBe(1);
    expect(shotOf(opened)).toEqual({ object: 0 });
  });

  it('entrar desde el menú aleja la cámara a la habitación', () => {
    const state = run(stateWith({ kind: 'menu', cursor: 1 }), { type: 'confirm' });
    expect(state.screen).toEqual(ABOUT);
    expect(shotOf(state)).toBe(1);
    expect(state.transitioning).toBe(true);
  });

  it('abrir un diálogo acerca la cámara al objeto', () => {
    expect(opened.view).toEqual(roomView({ dialog: { object: 0, page: 0, typing: true } }));
    expect(opened.transitioning).toBe(true);
  });

  it('mientras la cámara se acerca, A se ignora (RF-21)', () => {
    expect(reduce(opened, { type: 'confirm' }).state).toEqual(opened);
  });

  it('con la cámara quieta, A completa la página sin mover la cámara', () => {
    const state = run(settled, { type: 'confirm' });
    expect(state.view).toEqual(roomView({ dialog: { object: 0, page: 0, typing: false } }));
    expect(state.transitioning).toBe(false);
  });

  it('pasar de página no mueve la cámara', () => {
    const state = run(settled, { type: 'confirm' }, { type: 'confirm' });
    expect(state.view).toEqual(roomView({ dialog: { object: 0, page: 1, typing: true } }));
    expect(state.transitioning).toBe(false);
  });

  it('cerrar el diálogo devuelve la cámara a la habitación', () => {
    const state = run(settled, { type: 'back' });
    expect(state.view).toEqual(roomView());
    expect(shotOf(state)).toBe(1);
    expect(state.transitioning).toBe(true);
  });

  it('typeDone se procesa aunque la cámara se esté moviendo', () => {
    const state = run(opened, { type: 'typeDone' });
    expect(state.view).toEqual(roomView({ dialog: { object: 0, page: 0, typing: false } }));
  });

  it('mover el cursor o elegir una mascota no mueve la cámara', () => {
    expect(run(exploring, { type: 'right' }).transitioning).toBe(false);
    const pocho = stateWith(ABOUT, { view: roomView({ cursor: 12 }) });
    const petted = run(pocho, { type: 'confirm' });
    expect(petted.view).toEqual(roomView({ cursor: 12, pet: { object: 12, count: 1 } }));
    expect(petted.transitioning).toBe(false);
  });

  it('elegir la tele vuelve al menú y acerca la cámara al plano 2 (RF-38)', () => {
    const state = run(stateWith(ABOUT, { view: roomView({ cursor: 5 }) }), { type: 'confirm' });
    expect(state.screen).toEqual({ kind: 'menu', cursor: MENU_ITEMS.indexOf('about') });
    expect(state.transitioning).toBe(true);
  });
});

describe('reduce: tele apagada', () => {
  it('confirmar enciende la consola y mueve la cámara', () => {
    const { state, effects } = reduce(stateWith({ kind: 'off' }), { type: 'confirm' });
    expect(state.screen).toEqual({ kind: 'boot' });
    expect(state.transitioning).toBe(true);
    expect(effects).toEqual([]);
  });

  it.each<Action>([{ type: 'up' }, { type: 'back' }, { type: 'skip' }])(
    'ignora %o',
    (action) => {
      const off = stateWith({ kind: 'off' });
      expect(reduce(off, action).state).toEqual(off);
    }
  );
});

describe('reduce: secuencia de arranque', () => {
  it.each<Action>([{ type: 'skip' }, { type: 'back' }, { type: 'bootDone' }])(
    '%o lleva a la title screen',
    (action) => {
      expect(reduce(stateWith({ kind: 'boot' }), action).state.screen).toEqual({
        kind: 'title',
        cursor: 0
      });
    }
  );

  it('confirmar no saltea el arranque', () => {
    const boot = stateWith({ kind: 'boot' });
    expect(reduce(boot, { type: 'confirm' }).state).toEqual(boot);
  });
});

describe('reduce: title screen de un visitante nuevo', () => {
  const title = stateWith({ kind: 'title', cursor: 0 });

  it('ofrece PRESS START y Opciones', () => {
    expect(TITLE_ITEMS_NEW).toEqual(['start', 'options']);
  });

  it('Start lleva al menú y marca al visitante como recurrente, sin mover la cámara', () => {
    const state = run(title, { type: 'confirm' });
    expect(state.screen).toEqual({ kind: 'menu', cursor: 0 });
    expect(state.returning).toBe(true);
    expect(state.transitioning).toBe(false);
  });

  it('Opciones abre las opciones y recuerda que se volvió desde el título', () => {
    expect(run(title, { type: 'down' }, { type: 'confirm' }).screen).toEqual({
      kind: 'options',
      cursor: 0,
      returnTo: 'title'
    });
  });

  it('el cursor da la vuelta en los extremos', () => {
    expect(run(title, { type: 'up' }).screen).toEqual({ kind: 'title', cursor: 1 });
    expect(run(title, { type: 'down' }, { type: 'down' }).screen).toEqual({
      kind: 'title',
      cursor: 0
    });
  });

  it('el puntero mueve el cursor e ignora índices inválidos', () => {
    expect(run(title, { type: 'point', index: 1 }).screen).toEqual({ kind: 'title', cursor: 1 });
    expect(run(title, { type: 'point', index: 5 }).screen).toEqual({ kind: 'title', cursor: 0 });
    expect(run(title, { type: 'point', index: -1 }).screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('un clic selecciona el ítem tocado', () => {
    expect(run(title, { type: 'pick', index: 1 }).screen).toEqual({
      kind: 'options',
      cursor: 0,
      returnTo: 'title'
    });
  });

  it('B no hace nada en la title screen', () => {
    expect(run(title, { type: 'back' })).toEqual(title);
  });
});

describe('reduce: title screen de un visitante recurrente', () => {
  const title = stateWith({ kind: 'title', cursor: 0 }, { returning: true });

  it('ofrece CONTINUE, NEW GAME y Opciones', () => {
    expect(TITLE_ITEMS_RETURNING).toEqual(['continue', 'newGame', 'options']);
  });

  it('CONTINUE lleva al menú', () => {
    expect(run(title, { type: 'confirm' }).screen).toEqual({ kind: 'menu', cursor: 0 });
  });

  it('NEW GAME vuelve a la habitación con la tele apagada, como en la primera visita', () => {
    const state = run(title, { type: 'pick', index: 1 });
    expect(state.screen).toEqual({ kind: 'off' });
    expect(state.returning).toBe(false);
    expect(state.transitioning).toBe(true);
  });

  it('Opciones abre las opciones', () => {
    expect(run(title, { type: 'pick', index: 2 }).screen).toEqual({
      kind: 'options',
      cursor: 0,
      returnTo: 'title'
    });
  });
});

describe('reduce: transiciones', () => {
  const moving = stateWith({ kind: 'title', cursor: 0 }, { transitioning: true });

  it.each<Action>([
    { type: 'up' },
    { type: 'down' },
    { type: 'left' },
    { type: 'right' },
    { type: 'confirm' },
    { type: 'back' },
    { type: 'point', index: 1 },
    { type: 'pick', index: 1 },
    { type: 'skip' }
  ])('ignora %o mientras la cámara se mueve', (action) => {
    expect(reduce(moving, action).state).toEqual(moving);
  });

  it('transitionEnd termina la transición', () => {
    expect(run(moving, { type: 'transitionEnd' }).transitioning).toBe(false);
  });

  it('el fin del arranque no se pierde aunque haya una transición', () => {
    const booting = stateWith({ kind: 'boot' }, { transitioning: true });
    expect(run(booting, { type: 'bootDone' }).screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('abrir una pantalla desde la dirección no mueve la cámara', () => {
    const section = { kind: 'section', id: 'contact' } as const;
    const state = run(stateWith({ kind: 'off' }), { type: 'open', screen: section });
    expect(state.screen).toEqual(section);
    expect(state.transitioning).toBe(false);
  });
});

describe('reduce: menú principal', () => {
  const menu = stateWith({ kind: 'menu', cursor: 0 }, { returning: true });

  it('tiene los ítems en el orden de la spec', () => {
    expect(MENU_ITEMS).toEqual([
      'player',
      'about',
      'skills',
      'projects',
      'simpsonsdle',
      'contact',
      'options',
      'credits'
    ]);
  });

  it('incluye todas las secciones', () => {
    for (const id of SECTION_IDS) expect(MENU_ITEMS).toContain(id);
  });

  it('el cursor da la vuelta en los extremos', () => {
    expect(run(menu, { type: 'up' }).screen).toEqual({ kind: 'menu', cursor: 7 });
    const last = stateWith({ kind: 'menu', cursor: 7 }, { returning: true });
    expect(run(last, { type: 'down' }).screen).toEqual({ kind: 'menu', cursor: 0 });
  });

  it('el puntero mueve el cursor', () => {
    expect(run(menu, { type: 'point', index: 4 }).screen).toEqual({ kind: 'menu', cursor: 4 });
  });

  it.each(SECTION_IDS)('elegir %s abre la sección y acerca la cámara', (id) => {
    const state = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf(id) });
    expect(state.screen).toEqual({ kind: 'section', id });
    expect(state.transitioning).toBe(true);
  });

  it('confirmar abre la sección donde está el cursor', () => {
    expect(run(menu, { type: 'down' }, { type: 'down' }, { type: 'confirm' }).screen).toEqual({
      kind: 'section',
      id: 'skills'
    });
  });

  it('Opciones abre las opciones y recuerda que se volvió desde el menú', () => {
    expect(run(menu, { type: 'pick', index: 6 }).screen).toEqual({
      kind: 'options',
      cursor: 0,
      returnTo: 'menu'
    });
  });

  it('B vuelve a la title screen sin mover la cámara', () => {
    const state = run(menu, { type: 'back' });
    expect(state.screen).toEqual({ kind: 'title', cursor: 0 });
    expect(state.transitioning).toBe(false);
  });
});

describe('reduce: secciones', () => {
  it.each(SECTION_IDS)('B en %s vuelve al menú con el cursor en esa sección', (id) => {
    // Simpsonsdle arranca insertando el cartucho; B se prueba con la presentación ya visible.
    const view = id === 'simpsonsdle' ? ({ id, stage: 'shown' } as const) : null;
    const state = run(stateWith({ kind: 'section', id }, { view }), { type: 'back' });
    expect(state.screen).toEqual({ kind: 'menu', cursor: MENU_ITEMS.indexOf(id) });
    expect(state.transitioning).toBe(true);
  });

  it.each<Action>([{ type: 'up' }, { type: 'confirm' }, { type: 'pick', index: 0 }])(
    'ignora %o en una sección sin navegación propia',
    (action) => {
      const section = stateWith({ kind: 'section', id: 'credits' }, { view: { id: 'credits' } });
      expect(reduce(section, action).state).toEqual(section);
    }
  );
});

describe('reduce: opciones', () => {
  const fromMenu = stateWith(
    { kind: 'options', cursor: 0, returnTo: 'menu' },
    { returning: true }
  );

  it('ofrece idioma, sonido, efectos CRT y volver', () => {
    expect(OPTIONS_ITEMS).toEqual(['language', 'sound', 'crt', 'back']);
  });

  it('el idioma lo cambia el store mediante un efecto', () => {
    const { state, effects } = reduce(fromMenu, { type: 'confirm' });
    expect(effects).toEqual([{ type: 'toggleLang' }]);
    expect(state).toEqual(fromMenu);
  });

  it('el sonido se prende y se apaga', () => {
    const off = run(fromMenu, { type: 'pick', index: 1 });
    expect(off.prefs).toEqual({ sound: false, crt: true });
    expect(run(off, { type: 'confirm' }).prefs).toEqual({ sound: true, crt: true });
  });

  it('los efectos CRT se prenden y se apagan', () => {
    const off = run(fromMenu, { type: 'pick', index: 2 });
    expect(off.prefs).toEqual({ sound: true, crt: false });
    expect(run(off, { type: 'confirm' }).prefs).toEqual({ sound: true, crt: true });
  });

  it.each<Action>([{ type: 'back' }, { type: 'pick', index: 3 }])(
    '%o vuelve al menú con el cursor en Opciones',
    (action) => {
      const { state, effects } = reduce(fromMenu, action);
      expect(state.screen).toEqual({ kind: 'menu', cursor: MENU_ITEMS.indexOf('options') });
      expect(effects).toEqual([]);
    }
  );

  it('vuelve a la title screen con el cursor en Opciones', () => {
    const fromNewTitle = stateWith({ kind: 'options', cursor: 0, returnTo: 'title' });
    expect(run(fromNewTitle, { type: 'back' }).screen).toEqual({ kind: 'title', cursor: 1 });

    const fromReturningTitle = stateWith(
      { kind: 'options', cursor: 0, returnTo: 'title' },
      { returning: true }
    );
    expect(run(fromReturningTitle, { type: 'back' }).screen).toEqual({
      kind: 'title',
      cursor: 2
    });
  });
});

describe('reduce: silenciar (RF-61)', () => {
  it('toggleSound apaga y prende el sonido sin cambiar de pantalla', () => {
    const menu = stateWith({ kind: 'menu', cursor: 3 });
    const muted = run(menu, { type: 'toggleSound' });
    expect(muted.prefs).toEqual({ sound: false, crt: true });
    expect(muted.screen).toEqual(menu.screen);
    expect(muted.transitioning).toBe(false);
    expect(run(muted, { type: 'toggleSound' }).prefs).toEqual({ sound: true, crt: true });
  });

  it('funciona aunque la cámara se esté moviendo', () => {
    const moving = stateWith({ kind: 'section', id: 'skills' }, { transitioning: true });
    const muted = run(moving, { type: 'toggleSound' });
    expect(muted.prefs.sound).toBe(false);
    expect(muted.transitioning).toBe(true);
  });

  it('funciona con la tele apagada y durante el arranque', () => {
    expect(run(stateWith({ kind: 'off' }), { type: 'toggleSound' }).prefs.sound).toBe(false);
    expect(run(stateWith({ kind: 'boot' }), { type: 'toggleSound' }).prefs.sound).toBe(false);
  });
});

describe('reduce: Modo Ciclón (RF-71 a RF-73)', () => {
  it('arranca apagado, también para un visitante recurrente (RF-73)', () => {
    expect(initialState({ sound: true, crt: true, returning: true, secret: false, record: 0 }, null).cyclone).toBe(false);
  });

  it('toggleCyclone lo prende y lo apaga sin cambiar de pantalla (RF-72)', () => {
    const menu = stateWith({ kind: 'menu', cursor: 3 });
    const on = run(menu, { type: 'toggleCyclone' });
    expect(on).toEqual({ ...menu, cyclone: true });
    expect(run(on, { type: 'toggleCyclone' })).toEqual(menu);
  });

  it('funciona aunque la cámara se esté moviendo', () => {
    const moving = stateWith({ kind: 'section', id: 'skills' }, { transitioning: true });
    const on = run(moving, { type: 'toggleCyclone' });
    expect(on.cyclone).toBe(true);
    expect(on.transitioning).toBe(true);
  });

  it('funciona con la tele apagada y durante el arranque', () => {
    expect(run(stateWith({ kind: 'off' }), { type: 'toggleCyclone' }).cyclone).toBe(true);
    expect(run(stateWith({ kind: 'boot' }), { type: 'toggleCyclone' }).cyclone).toBe(true);
  });
});

describe('reduce: vista de las secciones', () => {
  const menu = stateWith({ kind: 'menu', cursor: 0 }, { returning: true });

  it('entrar a una sección crea su vista inicial', () => {
    expect(run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('skills') }).view).toEqual({
      id: 'skills',
      tab: 0,
      cursor: 0
    });
  });

  it('salir de una sección borra su vista', () => {
    const skills = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('skills') }, { type: 'transitionEnd' });
    expect(run(skills, { type: 'back' }).view).toBeNull();
  });

  it('abrir una sección desde la dirección crea su vista', () => {
    const state = run(menu, { type: 'open', screen: { kind: 'section', id: 'contact' } });
    expect(state.view).toEqual({ id: 'contact', joined: false, cursor: 0 });
  });

  it('las flechas se mueven dentro de la sección', () => {
    const skills = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('skills') }, { type: 'transitionEnd' });
    expect(run(skills, { type: 'right' }, { type: 'down' }).view).toEqual({
      id: 'skills',
      tab: 1,
      cursor: 1
    });
  });

  it('un acceso de Jugador cambia de sección sin mover la cámara', () => {
    const player = run(menu, { type: 'pick', index: 0 }, { type: 'transitionEnd' });
    const projects = run(player, { type: 'confirm' });
    expect(projects.screen).toEqual({ kind: 'section', id: 'projects' });
    expect(projects.view?.id).toBe('projects');
    expect(projects.transitioning).toBe(false);
  });

  it('B después de un acceso vuelve al menú con el cursor en la sección de destino', () => {
    const player = run(menu, { type: 'pick', index: 0 }, { type: 'transitionEnd' });
    const contact = run(player, { type: 'down' }, { type: 'confirm' });
    expect(run(contact, { type: 'back' }).screen).toEqual({
      kind: 'menu',
      cursor: MENU_ITEMS.indexOf('contact')
    });
  });

  it('un link de Contacto devuelve el efecto de abrirlo', () => {
    const contact = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('contact') }, { type: 'transitionEnd' });
    const joined = run(contact, { type: 'confirm' });
    expect(reduce(joined, { type: 'confirm' }).effects).toEqual([
      { type: 'openUrl', url: 'https://www.linkedin.com/in/franco-zerda' }
    ]);
  });

  it('las teclas dentro de una sección se ignoran durante el zoom', () => {
    const zooming = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('skills') });
    expect(zooming.transitioning).toBe(true);
    expect(run(zooming, { type: 'right' }).view).toEqual({ id: 'skills', tab: 0, cursor: 0 });
  });
});

describe('reduce: inserción de cartuchos', () => {
  const menu = stateWith({ kind: 'menu', cursor: 0 }, { returning: true });

  it('el fin de la inserción llega aunque la cámara se siga moviendo', () => {
    const zooming = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('simpsonsdle') });
    expect(zooming.transitioning).toBe(true);
    expect(zooming.view).toEqual({ id: 'simpsonsdle', stage: 'inserting' });
    const shown = run(zooming, { type: 'insertDone' });
    expect(shown.view).toEqual({ id: 'simpsonsdle', stage: 'shown' });
    expect(shown.transitioning).toBe(true);
  });

  it('B en un manual vuelve al estante sin salir de Proyectos', () => {
    const shelf = run(menu, { type: 'pick', index: MENU_ITEMS.indexOf('projects') }, { type: 'transitionEnd' });
    const manual = run(shelf, { type: 'right' }, { type: 'confirm' }, { type: 'insertDone' });
    const back = run(manual, { type: 'back' });
    expect(back.screen).toEqual({ kind: 'section', id: 'projects' });
    expect(back.view).toEqual({ id: 'projects', cursor: 1, open: null });
  });
});

describe('reduce: cartucho secreto (RF-74, RF-75)', () => {
  const pc = ROOM_OBJECTS.findIndex((object) => object.id === 'pc');
  const room = stateWith(
    { kind: 'section', id: 'about' },
    { view: { id: 'about', cursor: pc, dialog: null, pet: null, pcPicks: 2 } }
  );

  it('sale de lo guardado', () => {
    const stored = { sound: true, crt: true, returning: true, secret: true, record: 0 };
    expect(initialState(stored, null).secretFound).toBe(true);
  });

  it('la tercera vez seguida que se elige la PC lo descubre, sin abrir el diálogo ni mover la cámara', () => {
    const next = run(room, { type: 'confirm' });
    expect(next.secretFound).toBe(true);
    expect(next.view).toMatchObject({ dialog: null, pcPicks: 0 });
    expect(next.transitioning).toBe(false);
  });

  it('NEW GAME no lo borra: queda guardado, como en la memoria de la consola', () => {
    const title = stateWith({ kind: 'title', cursor: 1 }, { returning: true, secretFound: true });
    const next = run(title, { type: 'confirm' });
    expect(next.screen).toEqual({ kind: 'off' });
    expect(next.secretFound).toBe(true);
  });
});

describe('reduce: Snake (RF-76 a RF-79)', () => {
  const PROJECTS_SCREEN = { kind: 'section', id: 'projects' } as const;
  const playing = (snake: Partial<SnakeGame>) =>
    stateWith(PROJECTS_SCREEN, {
      secretFound: true,
      view: { id: 'projects', cursor: 9, open: { index: 9, stage: 'shown', snake: { ...newSnake(), status: 'playing', ...snake } } }
    });

  it('el récord sale de lo guardado', () => {
    const stored = { sound: true, crt: true, returning: true, secret: true, record: 7 };
    expect(initialState(stored, null).snakeRecord).toBe(7);
  });

  it('el récord sube con el puntaje, en vivo, como en los arcades (RF-78)', () => {
    const next = run({ ...playing({ score: 5 }), snakeRecord: 3 }, { type: 'tick', random: 0 });
    expect(next.snakeRecord).toBe(5);
  });

  it('el récord nunca baja', () => {
    const next = run({ ...playing({ score: 2 }), snakeRecord: 10 }, { type: 'tick', random: 0 });
    expect(next.snakeRecord).toBe(10);
  });

  it('con Snake abierto, el código del Modo Ciclón no hace nada (RF-79)', () => {
    const game = playing({});
    expect(reduce(game, { type: 'toggleCyclone' }).state).toBe(game);
    const closed = run(game, { type: 'back' });
    expect(run(closed, { type: 'toggleCyclone' }).cyclone).toBe(true);
  });
});

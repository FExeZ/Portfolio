import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageService } from '../services/language.service';
import { CAMERA_MS, REDUCED_MS } from './core/camera';
import { BOOT_STEPS, BOOT_STEPS_REDUCED, bootDuration } from './core/boot-timeline';
import { AudioService } from './audio.service';
import { ConsoleStore } from './console.store';
import { NOTICE_MS } from './core/easter-eggs';
import type { InputAction } from './core/input';
import type { SoundId } from './core/sound';
import { INSERT_MS, INSERT_REDUCED_MS } from './core/section-state';
import { CHAR_MS } from './core/typewriter';
import { SNAKE_TICK_MS } from './core/snake';
import { ROOM_OBJECTS } from './content/room';

/** jsdom no implementa matchMedia: se simula "reducir movimiento". */
function stubReducedMotion(matches: boolean): void {
  vi.stubGlobal('matchMedia', (media: string) => ({
    matches,
    media,
    addEventListener: () => undefined,
    removeEventListener: () => undefined
  }));
}

function createStore(): ConsoleStore {
  return TestBed.inject(ConsoleStore);
}

describe('ConsoleStore', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('un visitante nuevo empieza con la tele apagada', () => {
    expect(createStore().state().screen).toEqual({ kind: 'off' });
  });

  it('un visitante recurrente empieza en la title screen', () => {
    localStorage.setItem('fz16.returning', '1');
    expect(createStore().state().screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('termina el movimiento de cámara a los CAMERA_MS', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    expect(store.state().transitioning).toBe(true);
    vi.advanceTimersByTime(CAMERA_MS - 1);
    expect(store.state().transitioning).toBe(true);
    vi.advanceTimersByTime(1);
    expect(store.state().transitioning).toBe(false);
  });

  it('con "reducir movimiento" termina la transición a los REDUCED_MS', () => {
    stubReducedMotion(true);
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(REDUCED_MS);
    expect(store.state().transitioning).toBe(false);
  });

  it('recorre la secuencia de arranque y llega a la title screen', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    expect(store.bootStep()).toBe('tube');
    vi.advanceTimersByTime(BOOT_STEPS[0].ms);
    expect(store.bootStep()).toBe('static');
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS) - BOOT_STEPS[0].ms - 1);
    expect(store.state().screen).toEqual({ kind: 'boot' });
    vi.advanceTimersByTime(1);
    expect(store.state().screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('con "reducir movimiento" usa la secuencia corta', () => {
    stubReducedMotion(true);
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    expect(store.bootStep()).toBe('logo');
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS_REDUCED));
    expect(store.state().screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('saltear el arranque cancela los pasos pendientes', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(CAMERA_MS);
    store.dispatch({ type: 'skip' });
    expect(store.state().screen).toEqual({ kind: 'title', cursor: 0 });
    const dispatch = vi.spyOn(store, 'dispatch');
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS));
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'bootDone' });
  });

  it('guarda al visitante como recurrente al llegar al menú', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS));
    store.dispatch({ type: 'confirm' });
    expect(localStorage.getItem('fz16.returning')).toBe('1');
  });

  it('cambia el idioma desde Opciones', () => {
    localStorage.setItem('lang', 'es');
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    const language = TestBed.inject(LanguageService);
    store.dispatch({ type: 'pick', index: 2 });
    store.dispatch({ type: 'confirm' });
    expect(language.lang()).toBe('en');
  });

  it('dispatch avisa si la consola usó la acción', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    expect(store.dispatch({ type: 'back' })).toBe(false);
    expect(store.dispatch({ type: 'down' })).toBe(true);
    store.dispatch({ type: 'pick', index: 2 });
    // Cambiar el idioma no toca el estado de la consola, pero la acción se usó.
    expect(store.dispatch({ type: 'confirm' })).toBe(true);
  });

  it('funciona como visitante nuevo si el navegador bloquea el almacenamiento', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new DOMException('Bloqueado', 'SecurityError');
      }
    });
    try {
      expect(() => localStorage.getItem('fz16.returning')).toThrow();
      const store = createStore();
      expect(store.state().screen).toEqual({ kind: 'off' });
      expect(() => store.dispatch({ type: 'confirm' })).not.toThrow();
      vi.advanceTimersByTime(bootDuration(BOOT_STEPS));
      expect(() => store.dispatch({ type: 'confirm' })).not.toThrow();
      expect(store.state().screen).toEqual({ kind: 'menu', cursor: 0 });
    } finally {
      if (original) Object.defineProperty(globalThis, 'localStorage', original);
    }
  });

  it('guarda el sonido y los efectos CRT cuando cambian', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    store.dispatch({ type: 'pick', index: 2 });
    store.dispatch({ type: 'pick', index: 1 });
    store.dispatch({ type: 'pick', index: 2 });
    expect(localStorage.getItem('fz16.sound')).toBe('0');
    expect(localStorage.getItem('fz16.crt')).toBe('0');
  });
});

describe('ConsoleStore: código del Modo Ciclón (RF-71 a RF-73)', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const DIRECTIONS = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'] as const;

  /** Ingresa el código; `b` y `a` son las acciones que acompañan a esas entradas. Devuelve qué entradas se usaron. */
  function pressCode(store: ConsoleStore, b: InputAction | null, a: InputAction | null): boolean[] {
    return [
      ...DIRECTIONS.map((type) => store.press({ type }, type)),
      store.press(b, 'b'),
      store.press(a, 'a')
    ];
  }

  it('con el teclado, la A final del código no llega a la consola', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    // Escape y Enter: en la title screen, Enter entraría al menú.
    const used = pressCode(store, { type: 'back' }, { type: 'confirm' });
    expect(used.at(-1)).toBe(true);
    expect(store.state().cyclone).toBe(true);
    expect(store.state().screen).toEqual({ kind: 'title', cursor: 0 });
  });

  it('con las letras B y A tampoco se mueve nada: la A no mueve el cursor a la izquierda', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    const dispatch = vi.spyOn(store, 'dispatch');
    pressCode(store, null, { type: 'left' });
    expect(store.state().cyclone).toBe(true);
    // Las dos ← del código, y no la A.
    expect(dispatch.mock.calls.filter(([action]) => action.type === 'left')).toHaveLength(2);
  });

  it('con la Pocket apagada, la A final no la enciende', () => {
    const store = createStore();
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    expect(store.state().cyclone).toBe(true);
    expect(store.state().screen).toEqual({ kind: 'off' });
  });

  it('las entradas sin el código llegan a la consola como siempre', () => {
    const store = createStore();
    expect(store.press({ type: 'confirm' }, 'a')).toBe(true);
    expect(store.state().screen).toEqual({ kind: 'boot' });
    expect(store.press(null, 'b')).toBe(false);
  });

  it('las entradas cuentan aunque la cámara se esté moviendo', () => {
    const store = createStore();
    store.press({ type: 'confirm' }, 'a');
    expect(store.state().transitioning).toBe(true);
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    expect(store.state().cyclone).toBe(true);
  });

  it('la segunda vez lo apaga (RF-72)', () => {
    const store = createStore();
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    expect(store.state().cyclone).toBe(false);
  });

  it('el cartel aparece al prenderlo y se va a los NOTICE_MS', () => {
    const store = createStore();
    expect(store.notice()).toBeNull();
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    expect(store.notice()).toBe('cyclone');
    vi.advanceTimersByTime(NOTICE_MS - 1);
    expect(store.notice()).toBe('cyclone');
    vi.advanceTimersByTime(1);
    expect(store.notice()).toBeNull();
  });

  it('apagarlo no muestra el cartel', () => {
    const store = createStore();
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    vi.advanceTimersByTime(NOTICE_MS);
    pressCode(store, { type: 'back' }, { type: 'confirm' });
    expect(store.notice()).toBeNull();
  });

  it('no se guarda entre visitas (RF-73)', () => {
    localStorage.setItem('fz16.returning', '1');
    pressCode(createStore(), { type: 'back' }, { type: 'confirm' });
    expect(localStorage.length).toBe(1);
    TestBed.resetTestingModule();
    expect(createStore().state().cyclone).toBe(false);
  });
});

describe('ConsoleStore: cartucho secreto (RF-74, RF-75)', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    history.replaceState(null, '', location.pathname);
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState(null, '', location.pathname);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('elegir la PC tres veces lo descubre, muestra el cartel y lo guarda para la próxima visita', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    store.dispatch({ type: 'open', screen: { kind: 'section', id: 'about' } });
    const pc = ROOM_OBJECTS.findIndex((object) => object.id === 'pc');
    for (let i = 0; i < 2; i++) {
      store.dispatch({ type: 'pick', index: pc });
      vi.advanceTimersByTime(CAMERA_MS);
      store.dispatch({ type: 'back' });
      vi.advanceTimersByTime(CAMERA_MS);
    }
    store.dispatch({ type: 'pick', index: pc });
    expect(store.state().secretFound).toBe(true);
    expect(store.notice()).toBe('secret');
    expect(localStorage.getItem('fz16.secret')).toBe('1');
    TestBed.resetTestingModule();
    expect(createStore().state().secretFound).toBe(true);
  });
});

describe('ConsoleStore: Snake (RF-76 a RF-80)', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    localStorage.setItem('fz16.returning', '1');
    localStorage.setItem('fz16.secret', '1');
    history.replaceState(null, '', location.pathname);
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState(null, '', location.pathname);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Abre Proyectos, inserta el cartucho secreto y espera a que termine la inserción. */
  function openSnake(): ConsoleStore {
    const store = createStore();
    store.dispatch({ type: 'open', screen: { kind: 'section', id: 'projects' } });
    store.dispatch({ type: 'pick', index: 9 });
    vi.advanceTimersByTime(INSERT_MS);
    return store;
  }

  function snake(store: ConsoleStore) {
    const { view } = store.state();
    return view?.id === 'projects' ? view.open?.snake : undefined;
  }

  it('el temporizador mueve la serpiente solo mientras se juega', () => {
    const store = openSnake();
    const [start] = snake(store)?.body ?? [];
    vi.advanceTimersByTime(SNAKE_TICK_MS * 3);
    expect(snake(store)?.body[0]).toEqual(start);
    store.dispatch({ type: 'up' });
    vi.advanceTimersByTime(SNAKE_TICK_MS);
    expect(snake(store)?.body[0]).toEqual({ x: start.x, y: start.y - 1 });
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(SNAKE_TICK_MS * 3);
    expect(snake(store)?.status).toBe('paused');
    expect(snake(store)?.body[0]).toEqual({ x: start.x, y: start.y - 1 });
  });

  it('ocultar la pestaña pausa la partida (RF-80)', () => {
    const store = openSnake();
    store.dispatch({ type: 'up' });
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    hidden.mockRestore();
    expect(snake(store)?.status).toBe('paused');
  });

  it('abrir el modo texto pausa la partida', () => {
    const store = openSnake();
    store.dispatch({ type: 'up' });
    history.pushState(null, '', '#/text');
    dispatchEvent(new PopStateEvent('popstate'));
    expect(snake(store)?.status).toBe('paused');
  });

  it('guarda el récord apenas lo supera (RF-78)', () => {
    const store = openSnake();
    // La comida arranca cuatro celdas adelante de la cabeza.
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(SNAKE_TICK_MS * 4);
    expect(snake(store)?.score).toBe(1);
    expect(localStorage.getItem('fz16.record')).toBe('1');
  });

  it('el código del Modo Ciclón no hace nada durante la partida (RF-79)', () => {
    const store = openSnake();
    const code = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'] as const;
    for (const type of code) store.press(null, type);
    store.press(null, 'b');
    store.press(null, 'a');
    expect(store.state().cyclone).toBe(false);
  });
});

describe('ConsoleStore: dirección e historial', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    localStorage.setItem('fz16.returning', '1');
    history.replaceState(null, '', location.pathname);
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState(null, '', location.pathname);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Del título al menú y de ahí a Skills, con la cámara ya quieta. */
  function openSkills(): ConsoleStore {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 2 });
    vi.advanceTimersByTime(CAMERA_MS);
    return store;
  }

  /** jsdom avisa el cambio de historial en una tarea aparte. */
  async function settleHistory(): Promise<void> {
    await vi.advanceTimersByTimeAsync(10);
  }

  it('al entrar a una sección escribe su hash y crea una entrada en el historial', () => {
    const before = history.length;
    openSkills();
    expect(location.hash).toBe('#/skills');
    expect(history.length).toBe(before + 1);
    expect(history.state).toEqual({ fz16: true });
  });

  it('B en una sección vuelve al menú por el historial', async () => {
    const store = openSkills();
    expect(store.dispatch({ type: 'back' })).toBe(true);
    await settleHistory();
    expect(store.state().screen).toEqual({ kind: 'menu', cursor: 2 });
    expect(location.hash).toBe('');
  });

  it('el botón "atrás" del navegador vuelve al menú igual que B', async () => {
    const store = openSkills();
    history.back();
    await settleHistory();
    expect(store.state().screen).toEqual({ kind: 'menu', cursor: 2 });
  });

  it('el botón "adelante" del navegador vuelve a abrir la sección', async () => {
    const store = openSkills();
    history.back();
    await settleHistory();
    history.forward();
    await settleHistory();
    expect(store.state().screen).toEqual({ kind: 'section', id: 'skills' });
  });

  it('B durante el zoom no toca el historial', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 2 });
    const back = vi.spyOn(history, 'back');
    expect(store.dispatch({ type: 'back' })).toBe(false);
    expect(back).not.toHaveBeenCalled();
    expect(location.hash).toBe('#/skills');
  });

  it('un link directo abre la sección y B lleva al menú sin salir del sitio', () => {
    localStorage.clear();
    history.replaceState(null, '', '#/contact');
    const store = createStore();
    expect(store.state().screen).toEqual({ kind: 'section', id: 'contact' });
    const back = vi.spyOn(history, 'back');
    store.dispatch({ type: 'back' });
    expect(back).not.toHaveBeenCalled();
    expect(store.state().screen).toEqual({ kind: 'menu', cursor: 5 });
    expect(location.hash).toBe('');
  });

  it('un hash desconocido muestra la title screen y limpia la dirección', () => {
    history.replaceState(null, '', '#/xyz');
    const store = createStore();
    expect(store.state().screen).toEqual({ kind: 'title', cursor: 0 });
    expect(location.hash).toBe('');
  });
});

describe('ConsoleStore: modo texto (RF-68)', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    localStorage.setItem('fz16.returning', '1');
    history.replaceState(null, '', location.pathname);
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState(null, '', location.pathname);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /** Como cuando el visitante sigue un link o usa "atrás": cambia la dirección y llega el popstate. */
  function goTo(hash: string): void {
    history.pushState(null, '', hash || location.pathname);
    dispatchEvent(new PopStateEvent('popstate'));
  }

  it('un link directo abre el modo texto y deja la consola en la title screen', () => {
    history.replaceState(null, '', '#/text');
    const store = createStore();
    expect(store.textMode()).toBe(true);
    expect(store.state().screen).toEqual({ kind: 'title', cursor: 0 });
    expect(location.hash).toBe('#/text');
  });

  it('sin el link, la consola arranca sin modo texto', () => {
    expect(createStore().textMode()).toBe(false);
  });

  it('el modo texto se abre y se cierra con la dirección, sin mover la consola', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    const menu = store.state();
    goTo('#/text');
    expect(store.textMode()).toBe(true);
    expect(store.state()).toBe(menu);
    goTo('#/');
    expect(store.textMode()).toBe(false);
    expect(store.state()).toBe(menu);
  });

  it('volver de una sección al modo texto y de nuevo a la sección la deja abierta', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 1 });
    vi.advanceTimersByTime(CAMERA_MS);
    goTo('#/text');
    expect(store.state().screen).toEqual({ kind: 'section', id: 'about' });
    goTo('#/about');
    expect(store.textMode()).toBe(false);
    expect(store.state().screen).toEqual({ kind: 'section', id: 'about' });
  });

  it('"Volver a FZ-16" apunta a la sección abierta, o a la raíz fuera de las secciones', () => {
    const store = createStore();
    expect(store.consoleHash()).toBe('#/');
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 1 });
    expect(store.consoleHash()).toBe('#/about');
  });

  it('mientras el modo texto está abierto, la consola no reescribe la dirección', () => {
    history.replaceState(null, '', '#/text');
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 2 });
    vi.advanceTimersByTime(CAMERA_MS);
    expect(location.hash).toBe('#/text');
  });
});

describe('ConsoleStore: sonido', () => {
  let played: SoundId[];
  let stops: number;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    history.replaceState(null, '', location.pathname);
    stubReducedMotion(false);
    vi.useFakeTimers();
    played = [];
    stops = 0;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AudioService,
          useValue: {
            unlock: () => undefined,
            play: (id: SoundId) => played.push(id),
            stop: () => stops++
          }
        }
      ]
    });
  });

  it('silenciar corta lo que está sonando, como el canto del Modo Ciclón (RF-61)', () => {
    const store = createStore();
    store.dispatch({ type: 'toggleCyclone' });
    expect(played).toEqual(['cyclone']);
    expect(stops).toBe(0);
    store.dispatch({ type: 'toggleSound' });
    expect(stops).toBe(1);
    store.dispatch({ type: 'toggleSound' });
    expect(stops).toBe(1);
  });

  it('apagar el Modo Ciclón corta el canto antes de sonar a volver (RF-72)', () => {
    const store = createStore();
    store.dispatch({ type: 'toggleCyclone' });
    store.dispatch({ type: 'toggleCyclone' });
    expect(stops).toBe(1);
    expect(played).toEqual(['cyclone', 'back']);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('suena el encendido al prender la tele', () => {
    createStore().dispatch({ type: 'confirm' });
    expect(played).toEqual(['power']);
  });

  it('suenan la estática y el logo en sus pasos del arranque', () => {
    createStore().dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(BOOT_STEPS[0].ms);
    expect(played).toEqual(['power', 'static']);
    vi.advanceTimersByTime(BOOT_STEPS[1].ms);
    expect(played).toEqual(['power', 'static', 'logo']);
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS));
    expect(played).toEqual(['power', 'static', 'logo']);
  });

  it('con "reducir movimiento" suena el logo sin estática', () => {
    stubReducedMotion(true);
    createStore().dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS_REDUCED));
    expect(played).toEqual(['power', 'logo']);
  });

  it('suenan la selección y el cursor en el menú', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'down' });
    expect(played).toEqual(['select', 'cursor']);
  });

  it('con el sonido apagado no suena nada', () => {
    localStorage.setItem('fz16.sound', '0');
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(bootDuration(BOOT_STEPS));
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'down' });
    expect(played).toEqual([]);
  });

  it('suena el cartucho al empezar a insertarlo (RF-58)', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 3 });
    vi.advanceTimersByTime(CAMERA_MS);
    store.dispatch({ type: 'confirm' });
    expect(played).toEqual(['select', 'zoom', 'cartridge']);
  });

  it('silenciar guarda la preferencia y apaga lo que sigue', () => {
    localStorage.setItem('fz16.returning', '1');
    const store = createStore();
    store.dispatch({ type: 'toggleSound' });
    expect(localStorage.getItem('fz16.sound')).toBe('0');
    store.dispatch({ type: 'down' });
    expect(played).toEqual([]);
    store.dispatch({ type: 'toggleSound' });
    expect(localStorage.getItem('fz16.sound')).toBe('1');
    store.dispatch({ type: 'down' });
    expect(played).toEqual(['cursor']);
  });
});

describe('ConsoleStore: habitación', () => {
  let played: SoundId[];
  const index = (id: string) => ROOM_OBJECTS.findIndex((object) => object.id === id);
  const windowObject = ROOM_OBJECTS[0];
  if (windowObject.kind !== 'story') throw new Error('la ventana tiene que tener historia');
  /** Primera página de la ventana, en español. */
  const FIRST_PAGE = windowObject.pages[0].es;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    localStorage.setItem('lang', 'es');
    history.replaceState(null, '', '#/about');
    stubReducedMotion(false);
    vi.useFakeTimers();
    played = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AudioService,
          useValue: { unlock: () => undefined, play: (id: SoundId) => played.push(id) }
        }
      ]
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState(null, '', location.pathname);
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** Abre el diálogo de la ventana y espera a que la cámara llegue al objeto. */
  function openWindowDialog(): ConsoleStore {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(CAMERA_MS);
    return store;
  }

  function dialogOf(store: ConsoleStore) {
    const view = store.state().view;
    return view?.id === 'about' ? view.dialog : null;
  }

  it('la página empieza a escribirse cuando la cámara llega al objeto', () => {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(CAMERA_MS - 1);
    vi.advanceTimersByTime(CHAR_MS * 3);
    // La cámara llegó hace menos de tres letras: ya hay alguna, pero no tres.
    expect(store.typed()).toBeGreaterThan(0);
    expect(store.typed()).toBeLessThan(3);
  });

  it('las letras aparecen de a una', () => {
    const store = openWindowDialog();
    expect(store.typed()).toBe(0);
    vi.advanceTimersByTime(CHAR_MS);
    expect(store.typed()).toBe(1);
    vi.advanceTimersByTime(CHAR_MS * 4);
    expect(store.typed()).toBe(5);
  });

  it('al terminar de escribirse, la página queda completa', () => {
    const store = openWindowDialog();
    vi.advanceTimersByTime(CHAR_MS * FIRST_PAGE.length);
    expect(store.typed()).toBe(FIRST_PAGE.length);
    expect(dialogOf(store)).toEqual({ object: 0, page: 0, typing: false });
  });

  it('la tecla suena cada dos letras y no en los espacios (RF-58)', () => {
    const store = openWindowDialog();
    played = [];
    vi.advanceTimersByTime(CHAR_MS * FIRST_PAGE.length);
    const expected = [...FIRST_PAGE].filter((char, i) => i % 2 === 0 && char.trim() !== '').length;
    expect(played.filter((id) => id === 'type')).toHaveLength(expected);
    expect(store.typed()).toBe(FIRST_PAGE.length);
  });

  it('con el sonido apagado la escritura no suena', () => {
    localStorage.setItem('fz16.sound', '0');
    openWindowDialog();
    vi.advanceTimersByTime(CHAR_MS * FIRST_PAGE.length);
    expect(played).toEqual([]);
  });

  it('A corta la escritura y no suenan más letras', () => {
    const store = openWindowDialog();
    vi.advanceTimersByTime(CHAR_MS * 3);
    store.dispatch({ type: 'confirm' });
    expect(dialogOf(store)).toEqual({ object: 0, page: 0, typing: false });
    played = [];
    vi.advanceTimersByTime(CHAR_MS * FIRST_PAGE.length);
    expect(played).toEqual([]);
  });

  it('la página siguiente se escribe desde el principio, sin mover la cámara', () => {
    const store = openWindowDialog();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'confirm' });
    expect(dialogOf(store)).toEqual({ object: 0, page: 1, typing: true });
    expect(store.typed()).toBe(0);
    vi.advanceTimersByTime(CHAR_MS * 2);
    expect(store.typed()).toBe(2);
  });

  it('cambiar el idioma con una página a medio escribir la completa (RF-54)', () => {
    const store = openWindowDialog();
    vi.advanceTimersByTime(CHAR_MS * 3);
    TestBed.inject(LanguageService).setLang('en');
    TestBed.tick();
    expect(dialogOf(store)).toEqual({ object: 0, page: 0, typing: false });
  });

  it('elegir una mascota suena a su manera (RF-35)', () => {
    const store = createStore();
    store.dispatch({ type: 'pick', index: index('nymeria') });
    expect(played).toEqual(['meow']);
  });

  it('elegir la tele vuelve al menú por el historial, igual que B (RF-38)', async () => {
    localStorage.setItem('fz16.returning', '1');
    history.replaceState(null, '', location.pathname);
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 1 });
    vi.advanceTimersByTime(CAMERA_MS);
    expect(location.hash).toBe('#/about');
    const back = vi.spyOn(history, 'back');
    expect(store.dispatch({ type: 'pick', index: index('tv') })).toBe(true);
    expect(back).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(10);
    expect(store.state().screen).toEqual({ kind: 'menu', cursor: 1 });
    expect(location.hash).toBe('');
  });
});

describe('ConsoleStore: cartuchos y links', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    localStorage.setItem('fz16.returning', '1');
    history.replaceState(null, '', location.pathname);
    stubReducedMotion(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    history.replaceState(null, '', location.pathname);
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** Del título al estante de Proyectos, con la cámara ya quieta. */
  function openProjects(): ConsoleStore {
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 3 });
    vi.advanceTimersByTime(CAMERA_MS);
    return store;
  }

  /** Inserta el cartucho marcado y espera a que aparezca el manual. */
  function openManual(store: ConsoleStore): void {
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(INSERT_MS);
  }

  it('la inserción termina a los INSERT_MS', () => {
    const store = openProjects();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(INSERT_MS - 1);
    expect(store.state().view).toEqual({ id: 'projects', cursor: 0, open: { index: 0, stage: 'inserting' } });
    vi.advanceTimersByTime(1);
    expect(store.state().view).toEqual({ id: 'projects', cursor: 0, open: { index: 0, stage: 'shown' } });
  });

  it('con "reducir movimiento" la inserción dura INSERT_REDUCED_MS', () => {
    stubReducedMotion(true);
    const store = openProjects();
    store.dispatch({ type: 'confirm' });
    vi.advanceTimersByTime(INSERT_REDUCED_MS);
    expect(store.state().view).toEqual({ id: 'projects', cursor: 0, open: { index: 0, stage: 'shown' } });
  });

  it('un link directo a Simpsonsdle también termina de insertar el cartucho', () => {
    history.replaceState(null, '', '#/simpsonsdle');
    const store = createStore();
    expect(store.state().view).toEqual({ id: 'simpsonsdle', stage: 'inserting' });
    vi.advanceTimersByTime(INSERT_MS);
    expect(store.state().view).toEqual({ id: 'simpsonsdle', stage: 'shown' });
  });

  it('PLAY abre simpsonsdle.com en una pestaña nueva (RF-48)', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const store = openProjects();
    openManual(store);
    store.dispatch({ type: 'confirm' });
    expect(open).toHaveBeenCalledWith('https://www.simpsonsdle.com', '_blank', 'noopener');
  });

  it('el email abre el cliente de correo sin salir del sitio (RF-51)', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    const store = createStore();
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'pick', index: 5 });
    vi.advanceTimersByTime(CAMERA_MS);
    store.dispatch({ type: 'confirm' });
    store.dispatch({ type: 'up' });
    store.dispatch({ type: 'confirm' });
    expect(open).toHaveBeenCalledWith('mailto:francoexequielzerda@gmail.com', '_self');
  });

  it('B en un manual vuelve al estante sin tocar el historial', () => {
    const store = openProjects();
    openManual(store);
    const back = vi.spyOn(history, 'back');
    expect(store.dispatch({ type: 'back' })).toBe(true);
    expect(back).not.toHaveBeenCalled();
    expect(store.state().view).toEqual({ id: 'projects', cursor: 0, open: null });
    expect(location.hash).toBe('#/projects');
  });

  it('B durante la inserción no toca el historial', () => {
    const store = openProjects();
    store.dispatch({ type: 'confirm' });
    const back = vi.spyOn(history, 'back');
    expect(store.dispatch({ type: 'back' })).toBe(false);
    expect(back).not.toHaveBeenCalled();
  });

  it('el botón "atrás" del navegador en un manual cierra el manual', async () => {
    const store = openProjects();
    openManual(store);
    history.back();
    await vi.advanceTimersByTimeAsync(10);
    expect(store.state().screen).toEqual({ kind: 'section', id: 'projects' });
    expect(store.state().view).toEqual({ id: 'projects', cursor: 0, open: null });
    expect(location.hash).toBe('#/projects');
  });
});

import type { Plane } from './camera';
import type { InputAction } from './input';
import type { StoredPreferences } from './preferences';
import type { HashTarget, SectionId, SectionScreen } from './route';
import { OpenUrlEffect, SectionView, initialView, reduceSection, snakeOf } from './section-state';

export type Screen =
  | { kind: 'off' }
  | { kind: 'boot' }
  | { kind: 'title'; cursor: number }
  | { kind: 'menu'; cursor: number }
  | { kind: 'options'; cursor: number; returnTo: 'title' | 'menu' }
  | SectionScreen;

export interface Prefs {
  sound: boolean;
  crt: boolean;
}

export interface ConsoleState {
  screen: Screen;
  /** La cámara se está moviendo: se ignoran las acciones de navegación (RF-21). */
  transitioning: boolean;
  /** Visitante que ya llegó al menú alguna vez. */
  returning: boolean;
  prefs: Prefs;
  /** Estado interno de la sección abierta; null fuera de las secciones. */
  view: SectionView | null;
  /** Modo Ciclón (RF-71): arranca apagado en cada visita y no se guarda (RF-73). */
  cyclone: boolean;
  /** El cartucho secreto ya se descubrió: se guarda entre visitas (RF-75). */
  secretFound: boolean;
  /** Récord de Snake: se guarda entre visitas (RF-78). */
  snakeRecord: number;
}

export type Action =
  | InputAction
  | { type: 'point'; index: number }
  | { type: 'pick'; index: number }
  | { type: 'selectTab'; index: number }
  | { type: 'skip' }
  | { type: 'bootDone' }
  | { type: 'transitionEnd' }
  /** Terminó la animación de insertar un cartucho (la programa el store). */
  | { type: 'insertDone' }
  /** La página del diálogo terminó de escribirse, o cambió el idioma (la despacha el store). */
  | { type: 'typeDone' }
  /** Se completó el código del Modo Ciclón (lo detecta el store). */
  | { type: 'toggleCyclone' }
  /** Un paso de Snake; `random`, de 0 a 1, elige dónde aparece la comida (lo despacha el store). */
  | { type: 'tick'; random: number }
  /** La pestaña se ocultó o se abrió el modo texto: Snake se pausa (RF-80). */
  | { type: 'pause' }
  | { type: 'open'; screen: Screen };

/** Lo que el reducer no puede hacer solo; lo ejecuta el store. */
export type Effect = { type: 'toggleLang' } | OpenUrlEffect;

export interface ReduceResult {
  state: ConsoleState;
  effects: Effect[];
}

export const TITLE_ITEMS_NEW = ['start', 'options'] as const;
export const TITLE_ITEMS_RETURNING = ['continue', 'newGame', 'options'] as const;

export const MENU_ITEMS = [
  'player',
  'about',
  'skills',
  'projects',
  'simpsonsdle',
  'contact',
  'options',
  'credits'
] as const satisfies readonly (SectionId | 'options')[];

export const OPTIONS_ITEMS = ['language', 'sound', 'crt', 'back'] as const;

export type TitleItem = (typeof TITLE_ITEMS_NEW)[number] | (typeof TITLE_ITEMS_RETURNING)[number];
export type MenuItem = (typeof MENU_ITEMS)[number];
export type OptionsItem = (typeof OPTIONS_ITEMS)[number];

/** Acciones que se procesan aunque la cámara se esté moviendo. */
const ALWAYS_ALLOWED: ReadonlySet<Action['type']> = new Set([
  'bootDone',
  'transitionEnd',
  'open',
  'toggleSound',
  'toggleCyclone',
  'insertDone',
  'typeDone'
]);

export function initialState(stored: StoredPreferences, linked: HashTarget): ConsoleState {
  const screen = initialScreen(stored.returning, linked);
  return {
    screen,
    transitioning: false,
    returning: stored.returning,
    prefs: { sound: stored.sound, crt: stored.crt },
    view: screen.kind === 'section' ? initialView(screen.id) : null,
    cyclone: false,
    secretFound: stored.secret,
    snakeRecord: stored.record
  };
}

function initialScreen(returning: boolean, linked: HashTarget): Screen {
  if (linked === 'unknown') return { kind: 'title', cursor: 0 };
  // Con un link al modo texto, la consola queda lista detrás, como en un arranque normal.
  if (linked && linked !== 'text') return linked;
  return returning ? { kind: 'title', cursor: 0 } : { kind: 'off' };
}

export function planeOf(screen: Screen): Plane {
  switch (screen.kind) {
    case 'off':
      return 1;
    case 'section':
      // RF-28: "Sobre mí" es la habitación.
      return screen.id === 'about' ? 1 : 3;
    default:
      return 2;
  }
}

/** Lo que encuadra la cámara: un plano, o el objeto de la habitación cuyo diálogo está abierto. */
export type Shot = Plane | { object: number };

export function shotOf(state: ConsoleState): Shot {
  const { view } = state;
  return view?.id === 'about' && view.dialog ? { object: view.dialog.object } : planeOf(state.screen);
}

function sameShot(a: Shot, b: Shot): boolean {
  return typeof a === 'number' || typeof b === 'number' ? a === b : a.object === b.object;
}

export function reduce(state: ConsoleState, action: Action): ReduceResult {
  if (action.type === 'transitionEnd') return unchanged({ ...state, transitioning: false });
  // Llegar desde la dirección de la página no anima la cámara.
  if (action.type === 'open') {
    return unchanged({ ...withScreen(state, action.screen), transitioning: false });
  }
  if (state.transitioning && !ALWAYS_ALLOWED.has(action.type)) return unchanged(state);
  // RF-61: el silencio responde en cualquier pantalla, incluso durante un movimiento de cámara.
  if (action.type === 'toggleSound') {
    return unchanged({ ...state, prefs: { ...state.prefs, sound: !state.prefs.sound } });
  }
  // RF-71, RF-72: el código prende y apaga el Modo Ciclón en cualquier pantalla, salvo en Snake (RF-79).
  if (action.type === 'toggleCyclone') {
    return snakeOf(state.view) ? unchanged(state) : unchanged({ ...state, cyclone: !state.cyclone });
  }

  const next = reduceScreen(state, action);
  const cameraMoves = !sameShot(shotOf(next.state), shotOf(state));
  return cameraMoves ? { ...next, state: { ...next.state, transitioning: true } } : next;
}

function reduceScreen(state: ConsoleState, action: Action): ReduceResult {
  const { screen } = state;
  switch (screen.kind) {
    case 'off':
      return action.type === 'confirm' ? goTo(state, { kind: 'boot' }) : unchanged(state);
    case 'boot':
      return action.type === 'skip' || action.type === 'back' || action.type === 'bootDone'
        ? goTo(state, { kind: 'title', cursor: 0 })
        : unchanged(state);
    case 'title':
      return reduceList(
        state,
        action,
        screen.cursor,
        titleItems(state.returning),
        (cursor) => ({ kind: 'title', cursor }),
        confirmTitle
      );
    case 'menu':
      return reduceList(
        state,
        action,
        screen.cursor,
        MENU_ITEMS,
        (cursor) => ({ kind: 'menu', cursor }),
        confirmMenu,
        (current) => goTo(current, { kind: 'title', cursor: 0 })
      );
    case 'options':
      return reduceList(
        state,
        action,
        screen.cursor,
        OPTIONS_ITEMS,
        (cursor) => ({ ...screen, cursor }),
        (current, item) => confirmOptions(current, item, screen.returnTo),
        (current) => closeOptions(current, screen.returnTo)
      );
    case 'section': {
      const result = reduceSection(state.view ?? initialView(screen.id), action, state.secretFound);
      switch (result.kind) {
        case 'leave':
          // RF-19: el cursor queda en la sección de la que se salió.
          return goTo(state, { kind: 'menu', cursor: MENU_ITEMS.indexOf(screen.id) });
        case 'goto':
          return goTo(state, { kind: 'section', id: result.section });
        case 'view': {
          // RF-74: la PC descubre el cartucho secreto. RF-78: el récord sube con el puntaje.
          const secretFound = state.secretFound || result.found === true;
          const snakeRecord = Math.max(state.snakeRecord, snakeOf(result.view)?.score ?? 0);
          return {
            state: { ...state, view: result.view, secretFound, snakeRecord },
            effects: result.effects ?? []
          };
        }
        case 'ignore':
          return unchanged(state);
      }
    }
  }
}

export function titleItems(returning: boolean): readonly TitleItem[] {
  return returning ? TITLE_ITEMS_RETURNING : TITLE_ITEMS_NEW;
}

function confirmTitle(state: ConsoleState, item: TitleItem): ReduceResult {
  switch (item) {
    case 'start':
    case 'continue':
      return goTo({ ...state, returning: true }, { kind: 'menu', cursor: 0 });
    case 'newGame':
      return goTo({ ...state, returning: false }, { kind: 'off' });
    case 'options':
      return goTo(state, { kind: 'options', cursor: 0, returnTo: 'title' });
  }
}

function confirmMenu(state: ConsoleState, item: MenuItem): ReduceResult {
  return item === 'options'
    ? goTo(state, { kind: 'options', cursor: 0, returnTo: 'menu' })
    : goTo(state, { kind: 'section', id: item });
}

function confirmOptions(
  state: ConsoleState,
  item: OptionsItem,
  returnTo: 'title' | 'menu'
): ReduceResult {
  switch (item) {
    case 'language':
      return { state, effects: [{ type: 'toggleLang' }] };
    case 'sound':
    case 'crt':
      return unchanged({ ...state, prefs: { ...state.prefs, [item]: !state.prefs[item] } });
    case 'back':
      return closeOptions(state, returnTo);
  }
}

/** Al salir de Opciones, el cursor queda sobre "Opciones" en la pantalla de origen. */
function closeOptions(state: ConsoleState, returnTo: 'title' | 'menu'): ReduceResult {
  return returnTo === 'menu'
    ? goTo(state, { kind: 'menu', cursor: MENU_ITEMS.indexOf('options') })
    : goTo(state, { kind: 'title', cursor: titleItems(state.returning).indexOf('options') });
}

/** Navegación común a toda lista con cursor: mover, apuntar, tocar, confirmar y volver. */
function reduceList<T extends string>(
  state: ConsoleState,
  action: Action,
  cursor: number,
  items: readonly T[],
  withCursor: (cursor: number) => Screen,
  onConfirm: (state: ConsoleState, item: T) => ReduceResult,
  onBack: (state: ConsoleState) => ReduceResult = unchanged
): ReduceResult {
  const isIndex = (index: number) => Number.isInteger(index) && index >= 0 && index < items.length;
  switch (action.type) {
    case 'up':
      return goTo(state, withCursor((cursor - 1 + items.length) % items.length));
    case 'down':
      return goTo(state, withCursor((cursor + 1) % items.length));
    case 'point':
      return isIndex(action.index) && action.index !== cursor
        ? goTo(state, withCursor(action.index))
        : unchanged(state);
    case 'pick':
      return isIndex(action.index)
        ? onConfirm({ ...state, screen: withCursor(action.index) }, items[action.index])
        : unchanged(state);
    case 'confirm':
      return onConfirm(state, items[cursor]);
    case 'back':
      return onBack(state);
    default:
      return unchanged(state);
  }
}

function goTo(state: ConsoleState, screen: Screen): ReduceResult {
  return { state: withScreen(state, screen), effects: [] };
}

/** Cambia de pantalla: entrar a una sección crea su vista y salir de ella la borra. */
function withScreen(state: ConsoleState, screen: Screen): ConsoleState {
  const view =
    screen.kind !== 'section'
      ? null
      : state.view?.id === screen.id
        ? state.view
        : initialView(screen.id);
  return { ...state, screen, view };
}

function unchanged(state: ConsoleState): ReduceResult {
  return { state, effects: [] };
}

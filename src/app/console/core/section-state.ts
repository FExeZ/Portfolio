import { CONTACT_LINKS } from '../content/contact';
import { PLAYER_SHORTCUTS } from '../content/player';
import { PROJECTS, Project, SIMPSONSDLE } from '../content/projects';
import { ROOM_OBJECTS, pagesOf } from '../content/room';
import { CERTIFICATIONS, SKILL_CATEGORIES } from '../content/skills';
import type { Action } from './console-state';
import type { SectionId } from './route';
import { SnakeGame, newSnake, steerSnake, stepSnake } from './snake';

/** Un cartucho se está insertando (las teclas se ignoran) o ya muestra su manual. */
export type Stage = 'inserting' | 'shown';

export interface OpenCartridge {
  index: number;
  stage: Stage;
  /** El juego del cartucho secreto, desde que termina la inserción (RF-76). */
  snake?: SnakeGame;
}

/** Caja de diálogo de un objeto de la habitación: en qué página va y si se está escribiendo. */
export interface Dialog {
  object: number;
  page: number;
  typing: boolean;
}

/** Última mascota elegida; `count` cambia en cada elección para reiniciar su animación. */
export interface PetReaction {
  object: number;
  count: number;
}

/** Estado interno de la sección abierta: lo que mueven las flechas, A y B dentro de ella. */
export type SectionView =
  | { id: 'player'; cursor: number }
  | { id: 'skills'; tab: number; cursor: number }
  | { id: 'projects'; cursor: number; open: OpenCartridge | null }
  | { id: 'simpsonsdle'; stage: Stage }
  | { id: 'contact'; joined: boolean; cursor: number }
  /** `pcPicks`: veces seguidas que se eligió la PC (RF-74). */
  | { id: 'about'; cursor: number; dialog: Dialog | null; pet: PetReaction | null; pcPicks: number }
  | { id: 'credits' };

export type ProjectsView = Extract<SectionView, { id: 'projects' }>;
export type SimpsonsdleView = Extract<SectionView, { id: 'simpsonsdle' }>;
export type AboutView = Extract<SectionView, { id: 'about' }>;

export interface OpenUrlEffect {
  type: 'openUrl';
  url: string;
}

export type SectionResult =
  /** `found`: la PC descubrió el cartucho secreto (RF-74). */
  | { kind: 'view'; view: SectionView; effects?: OpenUrlEffect[]; found?: true }
  /** Cambia a otra sección sin pasar por el menú (accesos de Jugador). */
  | { kind: 'goto'; section: SectionId }
  /** B: volver al menú. */
  | { kind: 'leave' }
  | { kind: 'ignore' };

/** Las categorías y, al final, la pestaña de Logros con las certificaciones (RF-43). */
export const SKILL_TAB_COUNT = SKILL_CATEGORIES.length + 1;

/**
 * Estante de 3 × 3: Simpsonsdle primero, como proyecto destacado, y después los 8 proyectos.
 * El cartucho secreto, una vez descubierto, va último, solo en un cuarto estante (RF-74).
 */
export const SHELF_COLUMNS = 3;

export function shelfSize(secretFound: boolean): number {
  return PROJECTS.length + (secretFound ? 2 : 1);
}

export type ShelfItem =
  | { kind: 'simpsonsdle' }
  | { kind: 'project'; project: Project }
  | { kind: 'secret' };

export function shelfItem(index: number): ShelfItem {
  if (index === 0) return { kind: 'simpsonsdle' };
  return index <= PROJECTS.length ? { kind: 'project', project: PROJECTS[index - 1] } : { kind: 'secret' };
}

function shelfUrl(index: number): string | null {
  const item = shelfItem(index);
  switch (item.kind) {
    case 'simpsonsdle':
      return SIMPSONSDLE.url;
    case 'project':
      return item.project.repoUrl;
    case 'secret':
      return null;
  }
}

export function skillTabSize(tab: number): number {
  return tab < SKILL_CATEGORIES.length ? SKILL_CATEGORIES[tab].skills.length : CERTIFICATIONS.length;
}

export function initialView(id: SectionId): SectionView {
  switch (id) {
    case 'player':
      return { id, cursor: 0 };
    case 'skills':
      return { id, tab: 0, cursor: 0 };
    case 'contact':
      return { id, joined: false, cursor: 0 };
    case 'projects':
      return { id, cursor: 0, open: null };
    case 'simpsonsdle':
      // RF-47: entrar desde el menú también inserta el cartucho.
      return { id, stage: 'inserting' };
    case 'about':
      return { id, cursor: 0, dialog: null, pet: null, pcPicks: 0 };
    case 'credits':
      return { id };
  }
}

/** Duración de la animación de insertar un cartucho; con "reducir movimiento", un fundido corto. */
export const INSERT_MS = 700;
export const INSERT_REDUCED_MS = 200;

export function insertMs(reducedMotion: boolean): number {
  return reducedMotion ? INSERT_REDUCED_MS : INSERT_MS;
}

/** La partida de Snake abierta, si la hay. */
export function snakeOf(view: SectionView | null): SnakeGame | null {
  return view?.id === 'projects' ? (view.open?.snake ?? null) : null;
}

export function isInserting(view: SectionView): boolean {
  if (view.id === 'projects') return view.open?.stage === 'inserting';
  return view.id === 'simpsonsdle' && view.stage === 'inserting';
}

/**
 * Si B sale de la sección o vuelve a un nivel anterior dentro de ella: el manual de un
 * cartucho o el diálogo de un objeto de la habitación.
 */
export function backLeavesSection(view: SectionView): boolean {
  if (view.id === 'projects') return view.open === null;
  if (view.id === 'about') return view.dialog === null;
  return true;
}

/** Si la acción sale de la sección: B, o elegir la tele de la habitación (RF-38). */
export function exitsSection(view: SectionView, action: Action): boolean {
  return reduceSection(view, action).kind === 'leave';
}

/** `secretFound` cambia el estante y la racha de la PC (RF-74). */
export function reduceSection(view: SectionView, action: Action, secretFound = false): SectionResult {
  // Durante la inserción solo cuenta su final, igual que durante un movimiento de cámara.
  if (isInserting(view)) {
    return action.type === 'insertDone' ? { kind: 'view', view: finishInsert(view) } : { kind: 'ignore' };
  }
  if (action.type === 'insertDone') return { kind: 'ignore' };
  if (action.type === 'back' && backLeavesSection(view)) return { kind: 'leave' };
  switch (view.id) {
    case 'projects':
      return reduceProjects(view, action, secretFound);
    case 'simpsonsdle':
      return reduceSimpsonsdle(view, action);
    case 'player':
      return reducePlayer(view, action);
    case 'skills':
      return reduceSkills(view, action);
    case 'contact':
      return reduceContact(view, action);
    case 'about':
      return reduceAbout(view, action, secretFound);
    case 'credits':
      return { kind: 'ignore' };
  }
}

function reduceAbout(view: AboutView, action: Action, secretFound: boolean): SectionResult {
  if (view.dialog) return reduceDialog(view, view.dialog, action);
  if (action.type === 'typeDone') return { kind: 'ignore' };
  const size = ROOM_OBJECTS.length;
  // RF-34: las cuatro flechas recorren los objetos en orden de lectura.
  const linear =
    action.type === 'left' ? { type: 'up' as const } : action.type === 'right' ? { type: 'down' as const } : action;
  const cursor = moveCursor(view.cursor, size, linear);
  if (cursor !== null) return { kind: 'view', view: { ...view, cursor } };

  const picked = pickedIndex(view.cursor, size, action);
  if (picked === null) return { kind: 'ignore' };
  const object = ROOM_OBJECTS[picked];
  // RF-74: elegir la PC tres veces seguidas descubre el cartucho secreto; otro objeto corta la racha.
  const pcPicks = object.id === 'pc' ? view.pcPicks + 1 : 0;
  if (pcPicks === 3 && !secretFound) {
    return { kind: 'view', view: { ...view, cursor: picked, pcPicks: 0 }, found: true };
  }
  switch (object.kind) {
    case 'tv':
      return { kind: 'leave' };
    case 'pet': {
      const pet = { object: picked, count: (view.pet?.count ?? 0) + 1 };
      return { kind: 'view', view: { ...view, cursor: picked, pcPicks, pet } };
    }
    case 'story':
    case 'consoles':
      return {
        kind: 'view',
        view: { ...view, cursor: picked, pcPicks, dialog: { object: picked, page: 0, typing: true } }
      };
  }
}

/** RF-32: A completa la página que se escribe; con la página completa, pasa a la siguiente o cierra. */
function reduceDialog(view: AboutView, dialog: Dialog, action: Action): SectionResult {
  // RF-33: al cerrar, el cursor sigue en el objeto.
  const closed: SectionResult = { kind: 'view', view: { ...view, dialog: null } };
  if (action.type === 'back') return closed;
  if (dialog.typing) {
    return action.type === 'confirm' || action.type === 'typeDone'
      ? { kind: 'view', view: { ...view, dialog: { ...dialog, typing: false } } }
      : { kind: 'ignore' };
  }
  if (action.type !== 'confirm') return { kind: 'ignore' };
  return dialog.page + 1 < pagesOf(ROOM_OBJECTS[dialog.object]).length
    ? { kind: 'view', view: { ...view, dialog: { ...dialog, page: dialog.page + 1, typing: true } } }
    : closed;
}

function finishInsert(view: SectionView): SectionView {
  if (view.id === 'projects' && view.open) {
    // RF-76: el cartucho secreto no tiene manual: arranca Snake.
    const game = shelfItem(view.open.index).kind === 'secret' ? { snake: newSnake() } : {};
    return { ...view, open: { ...view.open, stage: 'shown', ...game } };
  }
  if (view.id === 'simpsonsdle') return { ...view, stage: 'shown' };
  return view;
}

function reduceProjects(view: ProjectsView, action: Action, secretFound: boolean): SectionResult {
  const { open } = view;
  if (open) {
    // Manual: B vuelve al estante con el cursor en el cartucho y A abre su link.
    if (action.type === 'back') return { kind: 'view', view: { ...view, cursor: open.index, open: null } };
    if (open.snake) return reduceSnake(view, open, open.snake, action);
    const url = shelfUrl(open.index);
    if (url && (action.type === 'confirm' || (action.type === 'pick' && action.index === 0))) {
      return { kind: 'view', view, effects: [{ type: 'openUrl', url }] };
    }
    // Las flechas quedan para hacer scroll en el manual.
    return { kind: 'ignore' };
  }
  const size = shelfSize(secretFound);
  const cursor = moveInShelf(view.cursor, action, size);
  if (cursor !== null) return { kind: 'view', view: { ...view, cursor } };
  const picked = pickedIndex(view.cursor, size, action);
  if (picked === null) return { kind: 'ignore' };
  return { kind: 'view', view: { ...view, cursor: picked, open: { index: picked, stage: 'inserting' } } };
}

/**
 * Snake (RF-76, RF-77, RF-80): las flechas giran; A arranca, pausa, sigue o reintenta; el store
 * manda los pasos y la pausa. B ya volvió al estante antes de llegar acá.
 */
function reduceSnake(
  view: ProjectsView,
  open: OpenCartridge,
  game: SnakeGame,
  action: Action
): SectionResult {
  const next = nextSnake(game, action);
  return next === game ? { kind: 'ignore' } : { kind: 'view', view: { ...view, open: { ...open, snake: next } } };
}

function nextSnake(game: SnakeGame, action: Action): SnakeGame {
  switch (action.type) {
    case 'up':
    case 'down':
    case 'left':
    case 'right':
      return steerSnake(game, action.type);
    case 'confirm':
    case 'pick':
      if (game.status === 'over') return newSnake();
      return { ...game, status: game.status === 'playing' ? 'paused' : 'playing' };
    case 'tick':
      return stepSnake(game, action.random);
    case 'pause':
      return game.status === 'playing' ? { ...game, status: 'paused' } : game;
    default:
      return game;
  }
}

/** Izquierda y derecha siguen el orden; arriba y abajo cambian de estante sin salir de la columna. */
function moveInShelf(cursor: number, action: Action, size: number): number | null {
  switch (action.type) {
    case 'left':
      return wrap(cursor - 1, size);
    case 'right':
      return wrap(cursor + 1, size);
    case 'up':
    case 'down': {
      const column = cursor % SHELF_COLUMNS;
      const rows = Math.ceil((size - column) / SHELF_COLUMNS);
      const row = Math.floor(cursor / SHELF_COLUMNS) + (action.type === 'down' ? 1 : -1);
      return column + wrap(row, rows) * SHELF_COLUMNS;
    }
    default:
      return moveCursor(cursor, size, action);
  }
}

function reduceSimpsonsdle(view: SimpsonsdleView, action: Action): SectionResult {
  // RF-48: PLAY es el único control de la presentación.
  return action.type === 'confirm' || (action.type === 'pick' && action.index === 0)
    ? { kind: 'view', view, effects: [{ type: 'openUrl', url: SIMPSONSDLE.url }] }
    : { kind: 'ignore' };
}

function reducePlayer(view: { id: 'player'; cursor: number }, action: Action): SectionResult {
  const size = PLAYER_SHORTCUTS.length;
  const cursor = moveCursor(view.cursor, size, action);
  if (cursor !== null) return { kind: 'view', view: { ...view, cursor } };
  const picked = pickedIndex(view.cursor, size, action);
  return picked === null ? { kind: 'ignore' } : { kind: 'goto', section: PLAYER_SHORTCUTS[picked] };
}

function reduceSkills(view: { id: 'skills'; tab: number; cursor: number }, action: Action): SectionResult {
  if (action.type === 'left' || action.type === 'right') {
    const step = action.type === 'right' ? 1 : -1;
    return { kind: 'view', view: { ...view, tab: wrap(view.tab + step, SKILL_TAB_COUNT), cursor: 0 } };
  }
  if (action.type === 'selectTab') {
    return isIndex(action.index, SKILL_TAB_COUNT) && action.index !== view.tab
      ? { kind: 'view', view: { ...view, tab: action.index, cursor: 0 } }
      : { kind: 'ignore' };
  }
  // RF-42: la descripción sigue al cursor, así que tocar un ítem solo lo marca.
  const pointed = action.type === 'pick' ? { ...action, type: 'point' as const } : action;
  const cursor = moveCursor(view.cursor, skillTabSize(view.tab), pointed);
  return cursor === null ? { kind: 'ignore' } : { kind: 'view', view: { ...view, cursor } };
}

function reduceContact(
  view: { id: 'contact'; joined: boolean; cursor: number },
  action: Action
): SectionResult {
  // RF-50: hasta que el visitante presiona Start, solo se muestra "PRESS START TO JOIN".
  if (!view.joined) {
    return action.type === 'confirm'
      ? { kind: 'view', view: { ...view, joined: true, cursor: 0 } }
      : { kind: 'ignore' };
  }
  const size = CONTACT_LINKS.length;
  const cursor = moveCursor(view.cursor, size, action);
  if (cursor !== null) return { kind: 'view', view: { ...view, cursor } };
  const picked = pickedIndex(view.cursor, size, action);
  if (picked === null) return { kind: 'ignore' };
  return {
    kind: 'view',
    view: { ...view, cursor: picked },
    effects: [{ type: 'openUrl', url: CONTACT_LINKS[picked].url }]
  };
}

/** Arriba, abajo y el puntero mueven el cursor; devuelve null si la acción no lo mueve. */
function moveCursor(cursor: number, size: number, action: Action): number | null {
  switch (action.type) {
    case 'up':
      return wrap(cursor - 1, size);
    case 'down':
      return wrap(cursor + 1, size);
    case 'point':
      return isIndex(action.index, size) && action.index !== cursor ? action.index : null;
    default:
      return null;
  }
}

/** A confirma el ítem del cursor; un clic confirma el ítem tocado. */
function pickedIndex(cursor: number, size: number, action: Action): number | null {
  if (action.type === 'confirm') return cursor;
  if (action.type === 'pick' && isIndex(action.index, size)) return action.index;
  return null;
}

function wrap(index: number, size: number): number {
  return (index + size) % size;
}

function isIndex(index: number, size: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < size;
}

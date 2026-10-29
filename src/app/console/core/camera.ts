/** 1 = habitación, 2 = sentado frente a la tele, 3 = la pantalla ocupa la vista. */
export type Plane = 1 | 2 | 3;

export interface Viewport {
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

/** Rectángulo de la escena medido en pantallas: la pantalla va de (0, 0) a (1, 1). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** `translate(x, y) scale(scale)` con `transform-origin: 0 0` sobre el escenario. */
export interface CameraTransform {
  x: number;
  y: number;
  scale: number;
}

export const SCREEN_MARGIN = 32;
export const CAMERA_MS = 900;
export const REDUCED_MS = 200;

/** Margen que deja el plano 2 alrededor del televisor con la consola. */
const SET_PADDING = 1.1;

/** Parte de abajo de la vista que ocupa la caja de diálogo en el plano de detalle. */
export const DIALOG_SHARE = 0.35;
/** Margen alrededor del objeto en el plano de detalle. */
const DETAIL_PADDING = 1.6;

/** En la Pocket entra media habitación a lo ancho: los objetos chicos se pueden ver y tocar. */
export const POCKET_ZOOM = 2;
/**
 * Con el diálogo abierto, el objeto sube al 20 % del alto: en una pantalla tan chica la caja
 * ocupa cerca del 70 %, y el objeto tiene que quedar arriba de ella.
 */
const POCKET_DIALOG_FOCUS = 0.2;

/** Unidades del SVG de la habitación: 100 por alto de pantalla, así la pantalla mide 133,3 × 100. */
export const UNITS_PER_SCREEN_WIDTH = 400 / 3;
export const UNITS_PER_SCREEN_HEIGHT = 100;

/**
 * Geometría de la escena. La carcasa de escritorio dibuja la habitación con estas medidas,
 * así que cambiar un valor acá implica ajustar el SVG.
 */
export const SCENE: Readonly<Record<'screen' | 'set' | 'room', Rect>> = {
  screen: { x: 0, y: 0, width: 1, height: 1 },
  set: { x: -0.25, y: -0.2, width: 1.5, height: 2 },
  room: { x: -1.8, y: -1.4, width: 4.6, height: 4 }
};

/** Pasa un rectángulo de unidades del SVG de la habitación a pantallas. */
export function unitsToScreens(rect: Rect): Rect {
  return {
    x: rect.x / UNITS_PER_SCREEN_WIDTH,
    y: rect.y / UNITS_PER_SCREEN_HEIGHT,
    width: rect.width / UNITS_PER_SCREEN_WIDTH,
    height: rect.height / UNITS_PER_SCREEN_HEIGHT
  };
}

/** La habitación en unidades del SVG: es su `viewBox`. */
export const ROOM_UNITS: Rect = {
  x: SCENE.room.x * UNITS_PER_SCREEN_WIDTH,
  y: SCENE.room.y * UNITS_PER_SCREEN_HEIGHT,
  width: SCENE.room.width * UNITS_PER_SCREEN_WIDTH,
  height: SCENE.room.height * UNITS_PER_SCREEN_HEIGHT
};

/** La pantalla 4:3 más grande que entra en la vista, en píxeles enteros para que el texto sea nítido. */
export function screenBox({ width, height }: Viewport): Size {
  const availableWidth = Math.max(0, width - 2 * SCREEN_MARGIN);
  const availableHeight = Math.max(0, height - 2 * SCREEN_MARGIN);
  const boxHeight = Math.floor(Math.min(availableHeight, (availableWidth * 3) / 4));
  return { width: Math.floor((boxHeight * 4) / 3), height: boxHeight };
}

function fitScale(rect: Rect, viewport: Viewport, box: Size, padding: number): number {
  return Math.min(
    viewport.width / (rect.width * box.width * padding),
    viewport.height / (rect.height * box.height * padding)
  );
}

/**
 * Encuadre de la cámara de escritorio: uno de los tres planos, o un objeto de la habitación
 * (rectángulo en pantallas) para el plano de detalle, con lugar abajo para la caja de diálogo.
 */
export function cameraTransform(target: Plane | Rect, viewport: Viewport, box: Size): CameraTransform {
  if (typeof target !== 'number') {
    const zone = { width: viewport.width, height: viewport.height * (1 - DIALOG_SHARE) };
    // Nunca más cerca que el plano 3: un objeto chico no se agranda de más.
    const { x, y, scale } = frame(target, zone, box, Math.min(1, fitScale(target, zone, box, DETAIL_PADDING)));
    // Un objeto del borde no deja ver afuera de la habitación, arriba de la caja de diálogo.
    const room = SCENE.room;
    return {
      x: Math.round(
        clamp(x, zone.width - scale * (room.x + room.width) * box.width, -scale * room.x * box.width)
      ),
      y: Math.round(
        clamp(y, zone.height - scale * (room.y + room.height) * box.height, -scale * room.y * box.height)
      ),
      scale
    };
  }
  const focus = target === 3 ? SCENE.screen : target === 2 ? SCENE.set : SCENE.room;
  // En el plano 3 la pantalla se ve a su tamaño real (RF-18).
  const scale =
    target === 3 ? 1 : fitScale(focus, viewport, box, target === 2 ? SET_PADDING : 1);
  return frame(focus, viewport, box, scale);
}

/** Centra el foco en la zona visible con la escala dada. */
function frame(focus: Rect, zone: Viewport, box: Size, scale: number): CameraTransform {
  const focusX = (focus.x + focus.width / 2) * box.width;
  const focusY = (focus.y + focus.height / 2) * box.height;
  return {
    x: Math.round(zone.width / 2 - scale * focusX),
    y: Math.round(zone.height / 2 - scale * focusY),
    scale
  };
}

/**
 * Cámara de la habitación dentro de la pantalla de la Pocket (RF-39). Un punto (u, v) de la
 * habitación, en unidades del SVG, queda en (x + scale · (u − room.x), y + scale · (v − room.y)).
 * Sigue al objeto con el cursor sin dejar ver nunca afuera de la habitación.
 */
export function pocketCamera(focus: Rect, screen: Size, dialogOpen: boolean): CameraTransform {
  const scale = (POCKET_ZOOM * screen.width) / ROOM_UNITS.width;
  const centerX = focus.x + focus.width / 2 - ROOM_UNITS.x;
  const centerY = focus.y + focus.height / 2 - ROOM_UNITS.y;
  const targetY = screen.height * (dialogOpen ? POCKET_DIALOG_FOCUS : 0.5);
  return {
    x: Math.round(clamp(screen.width / 2 - scale * centerX, screen.width - scale * ROOM_UNITS.width, 0)),
    y: Math.round(clamp(targetY - scale * centerY, screen.height - scale * ROOM_UNITS.height, 0)),
    scale
  };
}

/**
 * Limita el desplazamiento de la cámara para que la habitación cubra la zona visible.
 * Si la habitación es más chica que la zona (min > max), la centra.
 */
function clamp(offset: number, min: number, max: number): number {
  return min > max ? (min + max) / 2 : Math.min(max, Math.max(min, offset));
}

export function transitionMs(reducedMotion: boolean): number {
  return reducedMotion ? REDUCED_MS : CAMERA_MS;
}

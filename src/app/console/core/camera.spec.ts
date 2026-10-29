import { describe, expect, it } from 'vitest';
import { ROOM_OBJECTS } from '../content/room';
import {
  CAMERA_MS,
  DIALOG_SHARE,
  POCKET_ZOOM,
  Plane,
  REDUCED_MS,
  ROOM_UNITS,
  SCENE,
  SCREEN_MARGIN,
  Rect,
  Size,
  Viewport,
  cameraTransform,
  pocketCamera,
  screenBox,
  transitionMs,
  unitsToScreens
} from './camera';

const VIEWPORTS: Viewport[] = [
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
  { width: 800, height: 1200 },
  { width: 768, height: 1024 }
];

/** Proyecta un rectángulo de la escena (en fracciones de la pantalla) a píxeles de la vista. */
function project(rect: Rect, target: Plane | Rect, viewport: Viewport) {
  const box = screenBox(viewport);
  const { x, y, scale } = cameraTransform(target, viewport, box);
  return {
    left: x + scale * rect.x * box.width,
    top: y + scale * rect.y * box.height,
    right: x + scale * (rect.x + rect.width) * box.width,
    bottom: y + scale * (rect.y + rect.height) * box.height
  };
}

describe('screenBox', () => {
  it.each(VIEWPORTS)('mantiene la proporción 4:3 en %o', (viewport) => {
    const box = screenBox(viewport);
    expect(Math.abs(box.width - (box.height * 4) / 3)).toBeLessThanOrEqual(1);
  });

  it.each(VIEWPORTS)('entra con márgenes en %o', (viewport) => {
    const box = screenBox(viewport);
    expect(box.width).toBeLessThanOrEqual(viewport.width - 2 * SCREEN_MARGIN);
    expect(box.height).toBeLessThanOrEqual(viewport.height - 2 * SCREEN_MARGIN);
  });

  it('ocupa todo el alto disponible en una vista horizontal', () => {
    expect(screenBox({ width: 1280, height: 800 }).height).toBe(800 - 2 * SCREEN_MARGIN);
  });

  it('ocupa todo el ancho disponible en una vista vertical', () => {
    expect(screenBox({ width: 800, height: 1200 }).width).toBe(800 - 2 * SCREEN_MARGIN);
  });

  it('usa píxeles enteros para que el texto no se vea borroso', () => {
    const box = screenBox({ width: 1366, height: 768 });
    expect(Number.isInteger(box.width)).toBe(true);
    expect(Number.isInteger(box.height)).toBe(true);
  });

  it('no devuelve medidas negativas en una vista diminuta', () => {
    expect(screenBox({ width: 40, height: 40 })).toEqual({ width: 0, height: 0 });
  });
});

describe('cameraTransform', () => {
  it.each(VIEWPORTS)('en el plano 3 usa escala 1 y centra la pantalla en %o', (viewport) => {
    const box = screenBox(viewport);
    const t = cameraTransform(3, viewport, box);
    expect(t.scale).toBe(1);
    expect(Math.abs(t.x - (viewport.width - box.width) / 2)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(t.y - (viewport.height - box.height) / 2)).toBeLessThanOrEqual(0.5);
  });

  it('en el plano 3 usa desplazamientos enteros', () => {
    const viewport = { width: 1366, height: 768 };
    const t = cameraTransform(3, viewport, screenBox(viewport));
    expect(Number.isInteger(t.x)).toBe(true);
    expect(Number.isInteger(t.y)).toBe(true);
  });

  it.each(VIEWPORTS)('aleja la cámara en los planos 1 y 2 en %o', (viewport) => {
    const box = screenBox(viewport);
    const plane1 = cameraTransform(1, viewport, box).scale;
    const plane2 = cameraTransform(2, viewport, box).scale;
    expect(plane2).toBeLessThan(1);
    expect(plane1).toBeLessThan(plane2);
  });

  it.each(VIEWPORTS)('en el plano 2 entra el televisor con la consola en %o', (viewport) => {
    const r = project(SCENE.set, 2, viewport);
    expect(r.left).toBeGreaterThanOrEqual(0);
    expect(r.top).toBeGreaterThanOrEqual(0);
    expect(r.right).toBeLessThanOrEqual(viewport.width);
    expect(r.bottom).toBeLessThanOrEqual(viewport.height);
  });

  it.each(VIEWPORTS)('en el plano 1 entra la habitación completa en %o', (viewport) => {
    const r = project(SCENE.room, 1, viewport);
    expect(r.left).toBeGreaterThanOrEqual(-0.5);
    expect(r.top).toBeGreaterThanOrEqual(-0.5);
    expect(r.right).toBeLessThanOrEqual(viewport.width + 0.5);
    expect(r.bottom).toBeLessThanOrEqual(viewport.height + 0.5);
  });

  it('la habitación contiene al televisor con la consola, y este a la pantalla', () => {
    const { room, set } = SCENE;
    expect(room.x).toBeLessThan(set.x);
    expect(room.y).toBeLessThan(set.y);
    expect(room.x + room.width).toBeGreaterThan(set.x + set.width);
    expect(room.y + room.height).toBeGreaterThan(set.y + set.height);
    expect(set.x).toBeLessThan(0);
    expect(set.y).toBeLessThan(0);
    expect(set.x + set.width).toBeGreaterThan(1);
    expect(set.y + set.height).toBeGreaterThan(1);
  });
});

describe('unidades del SVG de la habitación', () => {
  it('una pantalla mide 133,3 × 100 unidades', () => {
    expect(unitsToScreens({ x: 400 / 3, y: -100, width: 400 / 3, height: 50 })).toEqual({
      x: 1,
      y: -1,
      width: 1,
      height: 0.5
    });
  });

  it('la habitación en unidades es la misma de la escena', () => {
    const room = unitsToScreens(ROOM_UNITS);
    expect(room.x).toBeCloseTo(SCENE.room.x);
    expect(room.y).toBeCloseTo(SCENE.room.y);
    expect(room.width).toBeCloseTo(SCENE.room.width);
    expect(room.height).toBeCloseTo(SCENE.room.height);
  });
});

describe('plano de detalle de un objeto (RF-31)', () => {
  const objects = ROOM_OBJECTS.map((object) => ({ id: object.id, rect: unitsToScreens(object.rect) }));

  it.each(VIEWPORTS)('cada objeto entra entero arriba de la caja de diálogo en %o', (viewport) => {
    for (const { id, rect } of objects) {
      const r = project(rect, rect, viewport);
      expect(r.left, id).toBeGreaterThanOrEqual(0);
      expect(r.top, id).toBeGreaterThanOrEqual(0);
      expect(r.right, id).toBeLessThanOrEqual(viewport.width);
      expect(r.bottom, id).toBeLessThanOrEqual(viewport.height * (1 - DIALOG_SHARE));
    }
  });

  it.each(VIEWPORTS)('la habitación cubre la vista arriba de la caja, aun con un objeto del borde, en %o', (viewport) => {
    for (const { id, rect } of objects) {
      const room = project(SCENE.room, rect, viewport);
      expect(room.left, id).toBeLessThanOrEqual(0.5);
      expect(room.top, id).toBeLessThanOrEqual(0.5);
      expect(room.right, id).toBeGreaterThanOrEqual(viewport.width - 0.5);
      expect(room.bottom, id).toBeGreaterThanOrEqual(viewport.height * (1 - DIALOG_SHARE) - 0.5);
    }
  });

  it.each(VIEWPORTS)('nunca acerca más que el plano 3 en %o', (viewport) => {
    const box = screenBox(viewport);
    for (const { rect } of objects) {
      expect(cameraTransform(rect, viewport, box).scale).toBeLessThanOrEqual(1);
    }
  });

  it('acerca más que el plano 1', () => {
    const viewport = VIEWPORTS[0];
    const box = screenBox(viewport);
    const mate = ROOM_OBJECTS.find((object) => object.id === 'mate');
    if (!mate) throw new Error('falta el mate');
    expect(cameraTransform(unitsToScreens(mate.rect), viewport, box).scale).toBeGreaterThan(
      cameraTransform(1, viewport, box).scale
    );
  });

  it('centra a lo ancho un objeto lejos de los bordes', () => {
    const viewport = VIEWPORTS[0];
    const favaloro = objects.find((object) => object.id === 'favaloro');
    if (!favaloro) throw new Error('falta Favaloro');
    const { rect } = favaloro;
    const r = project(rect, rect, viewport);
    expect(Math.abs((r.left + r.right) / 2 - viewport.width / 2)).toBeLessThanOrEqual(1);
  });
});

describe('cámara de la Pocket (RF-39)', () => {
  const SCREENS: Size[] = [
    { width: 320, height: 240 },
    { width: 420, height: 315 },
    { width: 300, height: 260 }
  ];

  /** Dónde queda en la pantalla un rectángulo de la habitación (en unidades del SVG). */
  function place(rect: Rect, focus: Rect, screen: Size, dialogOpen: boolean) {
    const { x, y, scale } = pocketCamera(focus, screen, dialogOpen);
    return {
      left: x + scale * (rect.x - ROOM_UNITS.x),
      top: y + scale * (rect.y - ROOM_UNITS.y),
      right: x + scale * (rect.x + rect.width - ROOM_UNITS.x),
      bottom: y + scale * (rect.y + rect.height - ROOM_UNITS.y)
    };
  }

  it('muestra la habitación con zoom: entra media habitación a lo ancho', () => {
    const screen = SCREENS[0];
    const { scale } = pocketCamera(ROOM_OBJECTS[0].rect, screen, false);
    expect(POCKET_ZOOM).toBe(2);
    expect(scale * ROOM_UNITS.width).toBeCloseTo(screen.width * POCKET_ZOOM);
  });

  it.each(SCREENS)('nunca deja ver afuera de la habitación en %o', (screen) => {
    for (const object of ROOM_OBJECTS) {
      for (const dialogOpen of [false, true]) {
        const room = place(ROOM_UNITS, object.rect, screen, dialogOpen);
        expect(room.left, object.id).toBeLessThanOrEqual(0);
        expect(room.top, object.id).toBeLessThanOrEqual(0);
        expect(room.right, object.id).toBeGreaterThanOrEqual(screen.width - 0.5);
        expect(room.bottom, object.id).toBeGreaterThanOrEqual(screen.height - 0.5);
      }
    }
  });

  it.each(SCREENS)('el objeto con el cursor siempre se ve entero en %o', (screen) => {
    for (const object of ROOM_OBJECTS) {
      const r = place(object.rect, object.rect, screen, false);
      expect(r.left, object.id).toBeGreaterThanOrEqual(-0.5);
      expect(r.top, object.id).toBeGreaterThanOrEqual(-0.5);
      expect(r.right, object.id).toBeLessThanOrEqual(screen.width + 0.5);
      expect(r.bottom, object.id).toBeLessThanOrEqual(screen.height + 0.5);
    }
  });

  it('centra un objeto del medio; con el diálogo abierto lo sube al 20 % del alto', () => {
    const screen = SCREENS[0];
    const middle: Rect = { x: 40, y: 50, width: 20, height: 20 };
    const centered = place(middle, middle, screen, false);
    expect((centered.left + centered.right) / 2).toBeCloseTo(screen.width / 2, 0);
    expect((centered.top + centered.bottom) / 2).toBeCloseTo(screen.height / 2, 0);
    const raised = place(middle, middle, screen, true);
    expect((raised.top + raised.bottom) / 2).toBeCloseTo(screen.height * 0.2, 0);
  });
});

describe('duraciones de transición', () => {
  it('mueve la cámara en 1 segundo o menos', () => {
    expect(CAMERA_MS).toBeLessThanOrEqual(1000);
    expect(transitionMs(false)).toBe(CAMERA_MS);
  });

  it('con "reducir movimiento" usa un fundido de 200 ms o menos', () => {
    expect(REDUCED_MS).toBeLessThanOrEqual(200);
    expect(transitionMs(true)).toBe(REDUCED_MS);
  });
});

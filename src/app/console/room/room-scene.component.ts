import { Component, ElementRef, computed, effect, inject, input, output, viewChildren } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ROOM_OBJECTS } from '../content/room';
import { CYCLONE_WINDOW, PIXEL_UNITS, ROOM_SPRITES } from '../content/room-sprites';
import { spritePixels } from '../content/sprites';
import { ROOM_UNITS, Rect } from '../core/camera';
import type { AboutView, PetReaction } from '../core/section-state';

/** Margen del marco de resaltado, en unidades del SVG: menos que la separación de las consolas. */
const FRAME_GAP = 2;

/** Posición de un rectángulo de la habitación en porcentajes de la escena. */
function percent(rect: Rect) {
  return {
    left: ((rect.x - ROOM_UNITS.x) / ROOM_UNITS.width) * 100,
    top: ((rect.y - ROOM_UNITS.y) / ROOM_UNITS.height) * 100,
    width: (rect.width / ROOM_UNITS.width) * 100,
    height: (rect.height / ROOM_UNITS.height) * 100
  };
}

/** Los dibujos se calculan una sola vez: no cambian nunca. */
const DRAWINGS = ROOM_OBJECTS.flatMap((object, index) =>
  // La tele ya está dibujada en la habitación base.
  object.id === 'tv'
    ? []
    : [
        {
          index,
          id: object.id,
          pet: object.kind === 'pet',
          transform: `translate(${object.rect.x} ${object.rect.y}) scale(${PIXEL_UNITS})`,
          pixels: spritePixels(ROOM_SPRITES[object.id])
        }
      ]
);

/** Con el Modo Ciclón, la ventana muestra la cancha llena (RF-71). */
const CYCLONE_WINDOW_PIXELS = spritePixels(CYCLONE_WINDOW);

const HITS = ROOM_OBJECTS.map((object, index) => ({ index, name: object.name, ...percent(object.rect) }));

/** El marco sigue al cursor; en el diálogo del estante, pasa por cada consola (RF-36). */
export function roomHighlight(view: AboutView): Rect | null {
  if (!view.dialog) return ROOM_OBJECTS[view.cursor].rect;
  const object = ROOM_OBJECTS[view.dialog.object];
  return object.kind === 'consoles' ? object.slots[view.dialog.page] : null;
}

/**
 * Objetos de la habitación (RF-29). Siempre se dibujan; en "Sobre mí" además son botones,
 * en orden de lectura (RF-34), con un marco que sigue al cursor y al foco (RF-30, RF-69).
 * Presentacional: el cursor y la reacción de las mascotas vienen del store.
 */
@Component({
  selector: 'app-room-scene',
  standalone: true,
  templateUrl: './room-scene.component.html',
  styleUrls: ['./room-scene.component.css']
})
export class RoomSceneComponent {
  /** Se puede explorar: "Sobre mí" sin un diálogo abierto. */
  readonly interactive = input.required<boolean>();
  readonly cursor = input.required<number>();
  readonly pet = input.required<PetReaction | null>();
  /** Lo que marca el marco amarillo: el objeto del cursor, o una consola del estante (RF-36). */
  readonly highlight = input.required<Rect | null>();
  readonly cyclone = input(false);
  readonly point = output<number>();
  readonly pick = output<number>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly lang = this.language.lang;

  readonly viewBox = [ROOM_UNITS.x, ROOM_UNITS.y, ROOM_UNITS.width, ROOM_UNITS.height].join(' ');
  readonly hits = HITS;

  /**
   * La mascota elegida cambia de clave en cada reacción: Angular vuelve a crear su dibujo y
   * la animación del salto arranca de nuevo, aunque se elija la misma dos veces seguidas.
   */
  readonly drawings = computed(() => {
    const pet = this.pet();
    const cyclone = this.cyclone();
    return DRAWINGS.map((drawing) => {
      const hop = drawing.pet && pet?.object === drawing.index;
      const pixels = cyclone && drawing.id === 'window' ? CYCLONE_WINDOW_PIXELS : drawing.pixels;
      return { ...drawing, pixels, hop, key: hop ? `${drawing.index}:${pet.count}` : `${drawing.index}` };
    });
  });

  readonly frame = computed(() => {
    const rect = this.highlight();
    return rect
      ? {
          x: rect.x - FRAME_GAP,
          y: rect.y - FRAME_GAP,
          width: rect.width + 2 * FRAME_GAP,
          height: rect.height + 2 * FRAME_GAP
        }
      : null;
  });

  private readonly buttons = viewChildren<ElementRef<HTMLButtonElement>>('hit');

  constructor() {
    // El foco sigue al cursor, como en las listas del menú: así Enter elige el objeto marcado.
    effect(() => {
      if (this.interactive()) this.buttons()[this.cursor()]?.nativeElement.focus({ preventScroll: true });
    });
  }

  /** Solo cuando el mouse se mueve: si la cámara pasa un objeto bajo un puntero quieto, no se marca. */
  onPointerMove(index: number): void {
    if (index !== this.cursor()) this.point.emit(index);
  }

  /** Tab mueve el foco; el cursor lo sigue. */
  onFocus(index: number): void {
    if (index !== this.cursor()) this.point.emit(index);
  }
}

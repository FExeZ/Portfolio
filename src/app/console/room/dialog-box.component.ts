import { Component, ElementRef, afterNextRender, computed, inject, input, output, viewChild } from '@angular/core';
import type { Lang } from '../../i18n/translations';
import { LanguageService } from '../../services/language.service';
import { ROOM_OBJECTS, pagesOf } from '../content/room';
import { MEMORY_SPRITES } from '../content/room-sprites';
import type { Sprite } from '../content/sprites';
import type { Dialog } from '../core/section-state';
import { PixelSpriteComponent } from '../screen/pixel-sprite.component';

export interface DialogContent {
  name: string;
  text: string;
  typing: boolean;
  /** Es la última página: A cierra el diálogo. */
  last: boolean;
  memory: Sprite | null;
}

/** Lo que muestra la caja para el diálogo abierto, en el idioma actual (RF-54). */
export function dialogContent(dialog: Dialog, lang: Lang): DialogContent {
  const object = ROOM_OBJECTS[dialog.object];
  const pages = pagesOf(object);
  return {
    name: object.name[lang],
    text: pages[dialog.page]?.[lang] ?? '',
    typing: dialog.typing,
    last: dialog.page === pages.length - 1,
    memory: object.kind === 'story' && object.memory ? MEMORY_SPRITES[object.memory] : null
  };
}

/**
 * Caja de diálogo de estilo RPG (RF-31, RF-32, RF-37). Presentacional: la página, la
 * escritura y las letras visibles vienen del store. Un clic en cualquier parte equivale a A.
 */
@Component({
  selector: 'app-dialog-box',
  standalone: true,
  imports: [PixelSpriteComponent],
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.css']
})
export class DialogBoxComponent {
  readonly content = input.required<DialogContent>();
  /** Letras visibles mientras la página se escribe. */
  readonly typed = input.required<number>();
  /** Pantalla chica (Pocket): el texto rodea al recuerdo y usa todo el ancho por debajo. */
  readonly compact = input(false);
  readonly advance = output<void>();

  readonly t = inject(LanguageService).t;

  /**
   * El resto de la página se dibuja invisible: así la caja tiene su tamaño final desde
   * la primera letra y el texto no salta de renglón mientras se escribe.
   */
  readonly shown = computed(() => {
    const { text, typing } = this.content();
    return typing ? text.slice(0, this.typed()) : text;
  });
  readonly rest = computed(() => this.content().text.slice(this.shown().length));

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  constructor() {
    // El foco pasa a la caja: Enter y Espacio avanzan, y Escape la cierra.
    afterNextRender(() => this.button().nativeElement.focus({ preventScroll: true }));
  }
}

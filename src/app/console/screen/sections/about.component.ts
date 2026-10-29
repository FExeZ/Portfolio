import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { ConsoleStore } from '../../console.store';
import { ROOM_OBJECTS } from '../../content/room';
import { ROOM_UNITS, Size, pocketCamera } from '../../core/camera';
import { DialogBoxComponent, dialogContent } from '../../room/dialog-box.component';
import { RoomBaseComponent } from '../../room/room-base.component';
import { RoomSceneComponent, roomHighlight } from '../../room/room-scene.component';

/** Alto de la línea con el nombre del objeto al pie de la pantalla, con su margen. */
const NAME_LINE_PX = 30;

/**
 * "Sobre mí". En la tele de escritorio muestra el título y la ayuda: los objetos están afuera,
 * en la escena, y la tele es uno más (RF-28, RF-38). En la Pocket, la habitación entra en la
 * pantalla con zoom y sigue al cursor (RF-39).
 */
@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [DialogBoxComponent, RoomBaseComponent, RoomSceneComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutSectionComponent {
  readonly pocket = input(false);

  readonly store = inject(ConsoleStore);
  private readonly language = inject(LanguageService);
  readonly t = this.language.t;

  readonly view = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'about' ? view : null;
  });
  readonly exploring = computed(() => this.view()?.dialog === null);
  readonly objectName = computed(() => {
    const view = this.view();
    return view && this.exploring() ? ROOM_OBJECTS[view.cursor].name[this.language.lang()] : null;
  });
  readonly highlight = computed(() => {
    const view = this.view();
    return view ? roomHighlight(view) : null;
  });
  /** La caja aparece cuando la habitación terminó de moverse hasta el objeto. */
  readonly dialog = computed(() => {
    const dialog = this.view()?.dialog;
    return dialog && !this.store.state().transitioning
      ? dialogContent(dialog, this.language.lang())
      : null;
  });

  /** Tamaño de la pantalla de la Pocket, que cambia al girar el teléfono. */
  private readonly size = signal<Size | null>(null);

  /**
   * La habitación entera, movida para que el objeto del cursor (o el del diálogo) quede a la
   * vista. Se encuadra arriba de la línea del nombre, así los objetos del piso no quedan tapados.
   */
  readonly world = computed(() => {
    const size = this.size();
    const view = this.view();
    if (!size || !view) return null;
    const focus = ROOM_OBJECTS[view.dialog?.object ?? view.cursor].rect;
    const zone = { width: size.width, height: size.height - NAME_LINE_PX };
    const { x, y, scale } = pocketCamera(focus, zone, view.dialog !== null);
    return {
      transform: `translate(${x}px, ${y}px)`,
      width: ROOM_UNITS.width * scale,
      height: ROOM_UNITS.height * scale
    };
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!this.pocket() || typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        this.size.set({ width, height });
      });
      observer.observe(host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ConsoleStore } from '../console.store';
import { ROOM_OBJECTS } from '../content/room';
import {
  CAMERA_MS,
  SCENE,
  UNITS_PER_SCREEN_HEIGHT,
  Viewport,
  cameraTransform,
  screenBox,
  unitsToScreens
} from '../core/camera';
import { DialogBoxComponent, dialogContent } from '../room/dialog-box.component';
import { RoomBaseComponent } from '../room/room-base.component';
import { RoomSceneComponent, roomHighlight } from '../room/room-scene.component';
import { ScreenComponent } from '../screen/screen.component';
import { SoundToggleComponent } from '../sound-toggle/sound-toggle.component';

/** Cuerpo del televisor en unidades del SVG, igual que en room.ts; es también el botón de encendido. */
const TV = { x: -20, y: -18, width: 173.33, height: 136 };

/** Carcasa de escritorio: la habitación con la tele y la consola, y la cámara que se mueve. */
@Component({
  selector: 'app-desktop-shell',
  standalone: true,
  imports: [
    DialogBoxComponent,
    RoomBaseComponent,
    RoomSceneComponent,
    ScreenComponent,
    SoundToggleComponent
  ],
  templateUrl: './desktop-shell.component.html',
  styleUrls: ['./desktop-shell.component.css']
})
export class DesktopShellComponent {
  readonly viewport = input.required<Viewport>();
  readonly store = inject(ConsoleStore);
  private readonly language = inject(LanguageService);
  readonly t = this.language.t;

  /** La vista de "Sobre mí", o null en cualquier otra pantalla. */
  readonly about = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'about' ? view : null;
  });
  /** Se exploran los objetos: "Sobre mí" sin un diálogo abierto. */
  readonly exploring = computed(() => this.about()?.dialog === null);
  readonly objectName = computed(() => {
    const about = this.about();
    return about && this.exploring() ? ROOM_OBJECTS[about.cursor].name[this.language.lang()] : null;
  });
  readonly highlight = computed(() => {
    const about = this.about();
    return about ? roomHighlight(about) : null;
  });
  /** La caja aparece cuando la cámara llegó al objeto (RF-31). */
  readonly dialog = computed(() => {
    const dialog = this.about()?.dialog;
    return dialog && !this.moving() ? dialogContent(dialog, this.language.lang()) : null;
  });

  readonly box = computed(() => screenBox(this.viewport()));
  readonly camera = computed(() => {
    const shot = this.store.shot();
    // Plano de detalle: el objeto de la habitación cuyo diálogo está abierto (RF-31).
    const target = typeof shot === 'number' ? shot : unitsToScreens(ROOM_OBJECTS[shot.object].rect);
    const { x, y, scale } = cameraTransform(target, this.viewport(), this.box());
    return `translate(${x}px, ${y}px) scale(${scale})`;
  });
  readonly off = computed(() => this.store.state().screen.kind === 'off');
  readonly moving = computed(() => this.store.state().transitioning);
  /** Con "reducir movimiento" la cámara salta y un fundido corto tapa el salto (RF-64). */
  readonly cameraMs = computed(() => (this.moving() && !this.store.reducedMotion() ? CAMERA_MS : 0));
  readonly fading = computed(() => this.moving() && this.store.reducedMotion());

  readonly room = computed(() => {
    const { width, height } = this.box();
    return {
      left: SCENE.room.x * width,
      top: SCENE.room.y * height,
      width: SCENE.room.width * width,
      height: SCENE.room.height * height
    };
  });

  readonly tv = computed(() => {
    const pxPerUnit = this.box().height / UNITS_PER_SCREEN_HEIGHT;
    return {
      left: TV.x * pxPerUnit,
      top: TV.y * pxPerUnit,
      width: TV.width * pxPerUnit,
      height: TV.height * pxPerUnit
    };
  });

  powerOn(): void {
    this.store.dispatch({ type: 'confirm' });
  }
}

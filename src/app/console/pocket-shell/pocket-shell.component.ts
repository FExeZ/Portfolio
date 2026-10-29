import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ConsoleStore } from '../console.store';
import { InputAction, buttonToCode } from '../core/input';
import { ScreenComponent } from '../screen/screen.component';
import { SoundToggleComponent } from '../sound-toggle/sound-toggle.component';

/** FZ-16 Pocket: el celular es la consola portátil. Los botones mandan las mismas acciones que el teclado. */
@Component({
  selector: 'app-pocket-shell',
  standalone: true,
  imports: [ScreenComponent, SoundToggleComponent],
  templateUrl: './pocket-shell.component.html',
  styleUrls: ['./pocket-shell.component.css']
})
export class PocketShellComponent {
  readonly store = inject(ConsoleStore);
  readonly t = inject(LanguageService).t;
  readonly off = computed(() => this.store.state().screen.kind === 'off');

  /** Start y A confirman; con la consola apagada, la encienden (RF-8). También cuentan para el código (RF-71). */
  press(type: InputAction['type']): void {
    this.store.press({ type }, buttonToCode(type));
  }
}

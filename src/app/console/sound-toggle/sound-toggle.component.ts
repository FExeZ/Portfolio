import { Component, computed, inject } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ConsoleStore } from '../console.store';

/** Botón de silencio (RF-61). Comparte el estado con la tecla M y con Opciones → Sonido. */
@Component({
  selector: 'app-sound-toggle',
  standalone: true,
  templateUrl: './sound-toggle.component.html',
  styleUrls: ['./sound-toggle.component.css']
})
export class SoundToggleComponent {
  private readonly store = inject(ConsoleStore);
  readonly t = inject(LanguageService).t;
  readonly on = computed(() => this.store.state().prefs.sound);

  toggle(event: MouseEvent): void {
    this.store.dispatch({ type: 'toggleSound' });
    // Con el mouse, el foco no se queda en el botón: si no, el próximo Enter volvería a
    // silenciar en lugar de elegir en el menú. Con teclado (detail = 0) el foco se queda.
    if (event.detail > 0 && event.currentTarget instanceof HTMLElement) event.currentTarget.blur();
  }
}

import { Component, ElementRef, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ConsoleStore } from '../console.store';
import { textModeSections } from '../content/text-mode';

/**
 * Modo texto (RF-67, RF-68): todo el contenido en una sola página, sin carcasa ni animaciones,
 * con encabezados ordenados. Tiene su propio scroll porque la consola bloquea el de la página.
 */
@Component({
  selector: 'app-text-mode',
  standalone: true,
  templateUrl: './text-mode.component.html',
  styleUrls: ['./text-mode.component.css']
})
export class TextModeComponent {
  readonly store = inject(ConsoleStore);
  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly lang = this.language.lang;

  readonly content = computed(() => textModeSections(this.lang()));
  /** El idioma al que cambia el botón, para que el lector de pantalla lo pronuncie bien. */
  readonly otherLang = computed(() => (this.lang() === 'es' ? 'en' : 'es'));

  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');

  constructor() {
    // El lector de pantalla empieza por el principio, y las flechas hacen scroll desde ahí.
    afterNextRender(() => this.heading().nativeElement.focus({ preventScroll: true }));
  }

  toggleLanguage(): void {
    this.language.toggle();
  }
}

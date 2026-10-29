import { Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { COPYRIGHT, CREDITS, CREDITS_END } from '../../content/credits';

/** Créditos (RF-52): suben por la pantalla y terminan en "Thanks for playing". */
@Component({
  selector: 'app-credits-section',
  standalone: true,
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.css']
})
export class CreditsSectionComponent {
  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly lang = this.language.lang;
  readonly credits = CREDITS;
  readonly end = CREDITS_END;
  readonly copyright = COPYRIGHT;

  private readonly section = viewChild.required<ElementRef<HTMLElement>>('section');

  constructor() {
    // Sin controles: el foco va a la sección para que el lector de pantalla la anuncie.
    afterNextRender(() => this.section().nativeElement.focus({ preventScroll: true }));
  }
}

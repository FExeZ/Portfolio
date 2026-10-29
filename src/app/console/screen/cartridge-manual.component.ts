import {
  Component,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { Sprite } from '../content/sprites';
import { isPlainClick } from './menu-list.component';
import { PixelSpriteComponent } from './pixel-sprite.component';

export interface Manual {
  title: string;
  sprite: Sprite;
  gold: boolean;
  paragraphs: readonly string[];
  technologies: readonly string[];
  url: string;
  actionLabel: string;
  /** Indicador "En vivo" (Simpsonsdle, RF-47). */
  live: boolean;
}

/** Manual de un cartucho: descripción, tecnologías y el link a su código o a jugar (RF-46 a RF-48). */
@Component({
  selector: 'app-cartridge-manual',
  standalone: true,
  imports: [PixelSpriteComponent],
  templateUrl: './cartridge-manual.component.html',
  styleUrls: ['./cartridge-manual.component.css']
})
export class CartridgeManualComponent {
  readonly manual = input.required<Manual>();
  /** El link se usó: el reducer devuelve el efecto que lo abre (con teclado o con mouse). */
  readonly activate = output<void>();

  readonly t = inject(LanguageService).t;
  private readonly link = viewChild.required<ElementRef<HTMLAnchorElement>>('link');

  constructor() {
    // El foco va al link: Enter lo abre y el lector de pantalla llega al manual.
    afterNextRender(() => this.link().nativeElement.focus({ preventScroll: true }));
  }

  onClick(event: MouseEvent): void {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    this.activate.emit();
  }
}

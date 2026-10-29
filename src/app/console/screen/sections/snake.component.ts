import { Component, ElementRef, effect, inject, input, output, viewChild } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { SECRET_CARTRIDGE } from '../../content/projects';
import { SNAKE_COLUMNS, SNAKE_ROWS, SnakeGame } from '../../core/snake';

/** Snake, el juego del cartucho secreto (RF-76, RF-77): marcador, tablero y carteles. */
@Component({
  selector: 'app-snake',
  standalone: true,
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css']
})
export class SnakeComponent {
  readonly game = input.required<SnakeGame>();
  readonly record = input.required<number>();
  /** Clic en "REINTENTAR": lo mismo que A. */
  readonly retry = output<void>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly lang = this.language.lang;
  readonly title = SECRET_CARTRIDGE.title;
  readonly columns = SNAKE_COLUMNS;
  readonly rows = SNAKE_ROWS;
  readonly viewBox = `0 0 ${SNAKE_COLUMNS} ${SNAKE_ROWS}`;

  private readonly retryButton = viewChild<ElementRef<HTMLButtonElement>>('retryButton');

  constructor() {
    // RF-77: en Game Over, el foco va a "REINTENTAR".
    effect(() => this.retryButton()?.nativeElement.focus({ preventScroll: true }));
  }
}

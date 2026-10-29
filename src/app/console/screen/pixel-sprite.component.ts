import { Component, computed, input } from '@angular/core';
import { Sprite, spritePixels, spriteSize } from '../content/sprites';

/** Dibuja un ícono de `sprites.ts` como SVG nítido a cualquier tamaño. */
@Component({
  selector: 'app-pixel-sprite',
  standalone: true,
  templateUrl: './pixel-sprite.component.html',
  styleUrls: ['./pixel-sprite.component.css']
})
export class PixelSpriteComponent {
  readonly sprite = input.required<Sprite>();
  /** Nombre accesible; sin él, el ícono es decorativo y el lector de pantalla lo saltea. */
  readonly label = input<string>();

  readonly viewBox = computed(() => {
    const { width, height } = spriteSize(this.sprite());
    return `0 0 ${width} ${height}`;
  });
  readonly pixels = computed(() => spritePixels(this.sprite()));
}

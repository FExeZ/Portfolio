import { Component, input } from '@angular/core';
import { Sprite } from '../content/sprites';
import { PixelSpriteComponent } from './pixel-sprite.component';

/** Cartucho con su etiqueta (RF-45). El de Simpsonsdle es dorado. */
@Component({
  selector: 'app-cartridge',
  standalone: true,
  imports: [PixelSpriteComponent],
  templateUrl: './cartridge.component.html',
  styleUrls: ['./cartridge.component.css']
})
export class CartridgeComponent {
  readonly title = input.required<string>();
  readonly sprite = input.required<Sprite>();
  readonly gold = input(false);
  readonly active = input(false);
}

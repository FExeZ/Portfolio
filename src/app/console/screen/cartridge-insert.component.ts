import { Component, input } from '@angular/core';
import { Sprite } from '../content/sprites';
import { CartridgeComponent } from './cartridge.component';

/**
 * Animación de insertar un cartucho (RF-46, RF-47). Dura lo mismo que INSERT_MS; el store
 * despacha `insertDone` al terminar.
 */
@Component({
  selector: 'app-cartridge-insert',
  standalone: true,
  imports: [CartridgeComponent],
  templateUrl: './cartridge-insert.component.html',
  styleUrls: ['./cartridge-insert.component.css']
})
export class CartridgeInsertComponent {
  readonly title = input.required<string>();
  readonly sprite = input.required<Sprite>();
  readonly gold = input(false);
  /** "Insertando cartucho…", para el lector de pantalla. */
  readonly status = input.required<string>();
}

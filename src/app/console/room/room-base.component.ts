import { Component, computed, input } from '@angular/core';
import { ROOM_UNITS } from '../core/camera';

/**
 * La habitación sin objetos: pared, piso, muebles, la consola FZ-16 y el televisor. La usan
 * la carcasa de escritorio y la Pocket; los objetos los dibuja app-room-scene encima.
 */
@Component({
  selector: 'app-room-base',
  standalone: true,
  templateUrl: './room-base.component.html',
  styleUrls: ['./room-base.component.css']
})
export class RoomBaseComponent {
  /** Con la consola encendida, las luces de la tele y de la FZ-16 están prendidas. */
  readonly on = input.required<boolean>();

  readonly viewBox = [ROOM_UNITS.x, ROOM_UNITS.y, ROOM_UNITS.width, ROOM_UNITS.height].join(' ');
  readonly led = computed(() => (this.on() ? '#ff3b3b' : '#3a1414'));
}

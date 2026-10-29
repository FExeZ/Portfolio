import { Component, input, output } from '@angular/core';
import { BootStepId } from '../core/boot-timeline';

/** Secuencia de arranque: tubo, estática, logo y fundido. Los tiempos los maneja el store. */
@Component({
  selector: 'app-boot',
  standalone: true,
  templateUrl: './boot.component.html',
  styleUrls: ['./boot.component.css']
})
export class BootComponent {
  readonly step = input.required<BootStepId | 'done'>();
  readonly brand = input.required<string>();
  readonly skipLabel = input.required<string>();
  readonly skip = output<void>();
}

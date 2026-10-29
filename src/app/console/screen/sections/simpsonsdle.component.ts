import { Component, computed, inject, input, output } from '@angular/core';
import { Lang } from '../../../i18n/translations';
import { LanguageService } from '../../../services/language.service';
import { SIMPSONSDLE } from '../../content/projects';
import { CARTRIDGE_SPRITES } from '../../content/sprites';
import { SimpsonsdleView } from '../../core/section-state';
import { CartridgeInsertComponent } from '../cartridge-insert.component';
import { CartridgeManualComponent, Manual } from '../cartridge-manual.component';

/** La presentación de Simpsonsdle (RF-47), igual desde el menú y desde el estante de Proyectos. */
export function simpsonsdleManual(lang: Lang, playLabel: string): Manual {
  return {
    title: SIMPSONSDLE.title,
    sprite: CARTRIDGE_SPRITES[SIMPSONSDLE.icon],
    gold: true,
    paragraphs: SIMPSONSDLE.story.map((paragraph) => paragraph[lang]),
    technologies: SIMPSONSDLE.technologies,
    url: SIMPSONSDLE.url,
    actionLabel: playLabel,
    live: true
  };
}

/** Sección Simpsonsdle del menú (RF-47, RF-48): inserta el cartucho dorado y muestra PLAY. */
@Component({
  selector: 'app-simpsonsdle-section',
  standalone: true,
  imports: [CartridgeInsertComponent, CartridgeManualComponent],
  templateUrl: './simpsonsdle.component.html',
  styleUrls: ['./simpsonsdle.component.css']
})
export class SimpsonsdleSectionComponent {
  readonly view = input.required<SimpsonsdleView>();
  readonly pick = output<number>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;

  readonly manual = computed(() =>
    simpsonsdleManual(this.language.lang(), this.t().console.projects.play)
  );
}

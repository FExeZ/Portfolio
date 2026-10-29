import { Component, ElementRef, computed, effect, inject, input, output, viewChildren } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { SECRET_CARTRIDGE, SIMPSONSDLE } from '../../content/projects';
import { CARTRIDGE_SPRITES, Sprite } from '../../content/sprites';
import { ProjectsView, shelfItem, shelfSize } from '../../core/section-state';
import { CartridgeInsertComponent } from '../cartridge-insert.component';
import { CartridgeManualComponent, Manual } from '../cartridge-manual.component';
import { CartridgeComponent } from '../cartridge.component';
import { simpsonsdleManual } from './simpsonsdle.component';
import { SnakeComponent } from './snake.component';

interface ShelfCartridge {
  title: string;
  sprite: Sprite;
  gold: boolean;
}

/** Estante de cartuchos (RF-44 a RF-46): Simpsonsdle dorado primero, los 8 proyectos y el secreto. */
@Component({
  selector: 'app-projects-section',
  standalone: true,
  imports: [CartridgeComponent, CartridgeInsertComponent, CartridgeManualComponent, SnakeComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsSectionComponent {
  readonly view = input.required<ProjectsView>();
  /** Con el cartucho secreto descubierto, el estante tiene un cuarto estante (RF-74). */
  readonly secretFound = input(false);
  /** Récord de Snake, el juego del cartucho secreto (RF-78). */
  readonly snakeRecord = input(0);
  readonly point = output<number>();
  readonly pick = output<number>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  private readonly slots = viewChildren<ElementRef<HTMLButtonElement>>('slot');

  readonly shelf = computed<ShelfCartridge[]>(() => {
    const lang = this.language.lang();
    return Array.from({ length: shelfSize(this.secretFound()) }, (_, index) => {
      const item = shelfItem(index);
      switch (item.kind) {
        case 'simpsonsdle':
          return { title: SIMPSONSDLE.title, sprite: CARTRIDGE_SPRITES[SIMPSONSDLE.icon], gold: true };
        case 'project':
          return { title: item.project.title[lang], sprite: CARTRIDGE_SPRITES[item.project.icon], gold: false };
        case 'secret':
          return { title: SECRET_CARTRIDGE.title[lang], sprite: CARTRIDGE_SPRITES[SECRET_CARTRIDGE.icon], gold: false };
      }
    });
  });

  readonly selected = computed(() => {
    const open = this.view().open;
    return this.shelf()[open ? open.index : this.view().cursor];
  });

  readonly manual = computed<Manual | null>(() => {
    const open = this.view().open;
    if (!open) return null;
    const lang = this.language.lang();
    const text = this.t().console.projects;
    const { title, sprite, gold } = this.shelf()[open.index];
    const item = shelfItem(open.index);
    switch (item.kind) {
      case 'simpsonsdle':
        return simpsonsdleManual(lang, text.play);
      case 'project':
        return {
          title,
          sprite,
          gold,
          paragraphs: [item.project.description[lang]],
          technologies: item.project.technologies,
          url: item.project.repoUrl,
          actionLabel: text.code,
          live: false
        };
      case 'secret':
        // El cartucho secreto no tiene manual: abre Snake (RF-76).
        return null;
    }
  });

  constructor() {
    // Roving tabindex en el estante: el foco sigue al cursor, igual que en las listas.
    effect(() => {
      if (this.view().open) return;
      this.slots()[this.view().cursor]?.nativeElement.focus({ preventScroll: true });
    });
  }

  /** Solo si el mouse se mueve (ver MenuListComponent.onPointerMove). */
  onPointerMove(index: number): void {
    if (index !== this.view().cursor) this.point.emit(index);
  }
}

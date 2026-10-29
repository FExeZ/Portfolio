import { Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { ConsoleStore } from '../console.store';
import {
  Action,
  MENU_ITEMS,
  OPTIONS_ITEMS,
  OptionsItem,
  Prefs,
  titleItems
} from '../core/console-state';
import { BootComponent } from './boot.component';
import { MenuEntry, MenuListComponent } from './menu-list.component';
import { AboutSectionComponent } from './sections/about.component';
import { ContactSectionComponent } from './sections/contact.component';
import { CreditsSectionComponent } from './sections/credits.component';
import { PlayerSectionComponent } from './sections/player.component';
import { ProjectsSectionComponent } from './sections/projects.component';
import { SimpsonsdleSectionComponent } from './sections/simpsonsdle.component';
import { SkillsSectionComponent } from './sections/skills.component';

/** Pantalla de la consola, compartida por las dos carcasas. */
@Component({
  selector: 'app-screen',
  standalone: true,
  imports: [
    AboutSectionComponent,
    BootComponent,
    ContactSectionComponent,
    CreditsSectionComponent,
    MenuListComponent,
    PlayerSectionComponent,
    ProjectsSectionComponent,
    SimpsonsdleSectionComponent,
    SkillsSectionComponent
  ],
  templateUrl: './screen.component.html',
  styleUrls: ['./screen.component.css']
})
export class ScreenComponent {
  /** En la Pocket, "Sobre mí" dibuja la habitación dentro de la pantalla (RF-39). */
  readonly pocket = input(false);

  readonly store = inject(ConsoleStore);
  readonly t = inject(LanguageService).t;

  readonly screen = computed(() => this.store.state().screen);
  readonly crt = computed(() => this.store.state().prefs.crt);
  readonly cursor = computed(() => {
    const screen = this.screen();
    return 'cursor' in screen ? screen.cursor : 0;
  });
  // Una señal por sección, para que el template reciba la vista ya del tipo correcto.
  readonly playerView = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'player' ? view : null;
  });
  readonly skillsView = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'skills' ? view : null;
  });
  readonly projectsView = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'projects' ? view : null;
  });
  readonly simpsonsdleView = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'simpsonsdle' ? view : null;
  });
  readonly contactView = computed(() => {
    const view = this.store.state().view;
    return view?.id === 'contact' ? view : null;
  });
  readonly sectionId = computed(() => this.store.state().view?.id ?? null);

  readonly entries = computed<MenuEntry[]>(() => {
    const { screen, returning, prefs } = this.store.state();
    const text = this.t().console;
    switch (screen.kind) {
      case 'title':
        return titleItems(returning).map((id) => ({ label: text.title[id] }));
      case 'menu':
        return MENU_ITEMS.map((id) => ({ label: text.menu[id] }));
      case 'options':
        return OPTIONS_ITEMS.map((id) => ({
          label: text.options[id],
          value: this.optionValue(id, prefs)
        }));
      default:
        return [];
    }
  });

  dispatch(action: Action): void {
    this.store.dispatch(action);
  }

  private optionValue(item: OptionsItem, prefs: Prefs): string | undefined {
    const text = this.t().console.options;
    switch (item) {
      case 'language':
        return text.languageName;
      case 'sound':
      case 'crt':
        return prefs[item] ? text.on : text.off;
      case 'back':
        return undefined;
    }
  }
}

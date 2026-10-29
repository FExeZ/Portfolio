import { Component, computed, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { PLAYER, PLAYER_SHORTCUTS } from '../../content/player';
import { MenuEntry, MenuListComponent } from '../menu-list.component';

/** Ficha de jugador (RF-27). El cursor de los accesos vive en el estado de la consola. */
@Component({
  selector: 'app-player-section',
  standalone: true,
  imports: [MenuListComponent],
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerSectionComponent {
  readonly cursor = input.required<number>();
  readonly point = output<number>();
  readonly pick = output<number>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly lang = this.language.lang;
  readonly player = PLAYER;

  readonly shortcuts = computed<MenuEntry[]>(() =>
    PLAYER_SHORTCUTS.map((id) => ({ label: this.t().console.menu[id] }))
  );
}

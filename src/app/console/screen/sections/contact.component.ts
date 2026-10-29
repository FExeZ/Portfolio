import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild
} from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { CONTACT_LINKS, CONTACT_MESSAGE } from '../../content/contact';
import { MenuEntry, MenuListComponent } from '../menu-list.component';

/** Contacto (RF-49 a RF-51): "PRESS START TO JOIN" y, al unirse, los 4 links. */
@Component({
  selector: 'app-contact-section',
  standalone: true,
  imports: [MenuListComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactSectionComponent {
  readonly joined = input.required<boolean>();
  readonly cursor = input.required<number>();
  /** Clic o toque en "PRESS START": lo mismo que Start. */
  readonly join = output<void>();
  readonly point = output<number>();
  readonly pick = output<number>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly message = computed(() => CONTACT_MESSAGE[this.language.lang()]);
  readonly links: MenuEntry[] = CONTACT_LINKS.map((link) => ({
    label: link.label,
    href: link.url,
    newTab: !link.url.startsWith('mailto:')
  }));

  private readonly start = viewChild<ElementRef<HTMLButtonElement>>('start');

  constructor() {
    // La sección siempre abre sin unirse (RF-50): el foco va a "PRESS START".
    afterNextRender(() => this.start()?.nativeElement.focus({ preventScroll: true }));
  }
}

import { Component, computed, inject, input, output } from '@angular/core';
import { LanguageService } from '../../../services/language.service';
import { CERTIFICATIONS, SKILL_CATEGORIES } from '../../content/skills';
import { ACHIEVEMENT_SPRITE, badgeSprite } from '../../content/sprites';
import { SKILL_TAB_COUNT } from '../../core/section-state';
import { MenuEntry, MenuListComponent } from '../menu-list.component';
import { PixelSpriteComponent } from '../pixel-sprite.component';

/** Inventario de Skills (RF-41 a RF-43): una página por categoría y la de Logros al final. */
@Component({
  selector: 'app-skills-section',
  standalone: true,
  imports: [MenuListComponent, PixelSpriteComponent],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsSectionComponent {
  readonly tab = input.required<number>();
  readonly cursor = input.required<number>();
  readonly point = output<number>();
  readonly pick = output<number>();
  readonly selectTab = output<number>();

  private readonly language = inject(LanguageService);
  readonly t = this.language.t;
  readonly lang = this.language.lang;
  readonly achievementSprite = ACHIEVEMENT_SPRITE;

  /** Un azulejo por categoría, en su color. */
  private readonly badges = SKILL_CATEGORIES.map((category) => badgeSprite(category.color));

  readonly tabTitles = computed(() => [
    ...SKILL_CATEGORIES.map((category) => category.title[this.lang()]),
    this.t().console.skills.achievements
  ]);
  readonly tabTitle = computed(() => this.tabTitles()[this.tab()]);
  readonly onAchievements = computed(() => this.tab() === SKILL_CATEGORIES.length);
  readonly previousTab = computed(() => (this.tab() - 1 + SKILL_TAB_COUNT) % SKILL_TAB_COUNT);
  readonly nextTab = computed(() => (this.tab() + 1) % SKILL_TAB_COUNT);

  readonly items = computed<MenuEntry[]>(() => {
    if (this.onAchievements()) {
      return CERTIFICATIONS.map((certification) => ({
        label: certification.title[this.lang()],
        icon: ACHIEVEMENT_SPRITE
      }));
    }
    const icon = this.badges[this.tab()];
    return SKILL_CATEGORIES[this.tab()].skills.map((skill) => ({
      label: skill.name,
      icon,
      iconText: skill.short
    }));
  });

  /** Lo que muestra el panel de detalle: la tecnología o el logro donde está el cursor (RF-42). */
  readonly detail = computed(() => {
    const lang = this.lang();
    if (this.onAchievements()) {
      const certification = CERTIFICATIONS[this.cursor()];
      return certification
        ? { kind: 'achievement' as const, title: certification.title[lang], issuer: certification.issuer }
        : null;
    }
    const skill = SKILL_CATEGORIES[this.tab()].skills[this.cursor()];
    return skill
      ? {
          kind: 'skill' as const,
          title: skill.name,
          short: skill.short,
          description: skill.description[lang],
          icon: this.badges[this.tab()]
        }
      : null;
  });
}

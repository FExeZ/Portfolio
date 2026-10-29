import { Injectable, computed, signal } from '@angular/core';
import { Lang, TRANSLATIONS, Translations } from '../i18n/translations';
import { pickInitialLang } from '../console/core/preferences';

const STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  /** Idioma actual. */
  readonly lang = signal<Lang>(this.detectInitial());

  /** Diccionario de textos del idioma actual. */
  readonly t = computed<Translations>(() => TRANSLATIONS[this.lang()]);

  constructor() {
    document.documentElement.lang = this.lang();
  }

  toggle(): void {
    this.setLang(this.lang() === 'es' ? 'en' : 'es');
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* localStorage no disponible: se ignora */
    }
  }

  private detectInitial(): Lang {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* localStorage no disponible */
    }
    return pickInitialLang(saved, navigator.language);
  }
}

import type { Localized } from '../../i18n/translations';
import type { SectionId } from '../core/route';

/** Ficha de jugador (RF-27). */
export const PLAYER: {
  name: string;
  avatar: string;
  className: Localized;
  level: Localized;
  languages: string;
} = {
  name: 'Franco Zerda',
  avatar: 'assets/avatar-48.png',
  className: { es: 'Desarrollador Full Stack', en: 'Full Stack Developer' },
  level: { es: 'Junior L2', en: 'Junior L2' },
  languages: 'ES · EN · PT'
};

/** Accesos directos de la ficha. */
export const PLAYER_SHORTCUTS = ['projects', 'contact'] as const satisfies readonly SectionId[];

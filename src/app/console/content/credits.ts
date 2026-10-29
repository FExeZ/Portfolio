import type { Localized } from '../../i18n/translations';

export interface CreditLine {
  role: Localized;
  name: string;
}

// Escrito por Claude y aprobado por Franco en T30.
export const CREDITS: readonly CreditLine[] = [
  {
    role: { es: 'Idea, diseño y desarrollo', en: 'Idea, design and development' },
    name: 'Franco Zerda'
  },
  { role: { es: 'Hecho con', en: 'Built with' }, name: 'Angular · TypeScript · CSS · SVG' },
  { role: { es: 'Sonido sintetizado con', en: 'Sound synthesized with' }, name: 'Web Audio' },
  {
    role: { es: 'Tipografías (licencia OFL)', en: 'Typefaces (OFL license)' },
    name: 'Press Start 2P (CodeMan38) · VT323 (Peter Hull)'
  },
  {
    role: { es: 'Compañía en cada línea de código', en: 'Company on every line of code' },
    name: 'Pocho, Negra, Flaco y Nymeria'
  }
];

export const CREDITS_END = 'Thanks for playing';

export const COPYRIGHT: Localized = {
  es: '© 2026 Franco Zerda. Todos los derechos reservados.',
  en: '© 2026 Franco Zerda. All rights reserved.'
};

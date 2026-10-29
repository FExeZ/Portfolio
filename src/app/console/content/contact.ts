import type { Localized } from '../../i18n/translations';

export interface ContactLink {
  id: 'linkedin' | 'github' | 'instagram' | 'email';
  label: string;
  url: string;
}

/** Los mismos 4 links del portfolio anterior (RF-50). */
export const CONTACT_LINKS: readonly ContactLink[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/franco-zerda' },
  { id: 'github', label: 'GitHub', url: 'https://github.com/FExeZ' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/fran.zerda/' },
  { id: 'email', label: 'Email', url: 'mailto:francoexequielzerda@gmail.com' }
];

/** RF-49. Escrito por Claude a partir de lo que contó Franco y aprobado por él en T30. */
export const CONTACT_MESSAGE: Localized = {
  es: '¿Buscás a alguien para tu equipo? Me sumo para aportar, para que puedas confiar en mí y para compartir la carga: el estrés se divide y los logros se multiplican. Crezcamos juntos.',
  en: 'Looking for someone to join your team? I’m in to contribute, to be someone you can count on and to share the load: stress gets split and wins get multiplied. Let’s grow together.'
};

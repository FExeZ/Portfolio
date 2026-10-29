/** Secciones de la consola, en el mismo orden que el menú. También son los hashes de la dirección. */
export const SECTION_IDS = [
  'player',
  'about',
  'skills',
  'projects',
  'simpsonsdle',
  'contact',
  'credits'
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export interface SectionScreen {
  kind: 'section';
  id: SectionId;
}

/**
 * Resultado de leer el hash: sin destino (arranque normal), una sección, el modo texto
 * (que no es parte de la consola, RF-68) o un hash desconocido.
 */
export type HashTarget = SectionScreen | 'text' | 'unknown' | null;

export type RouteAction = { type: 'back' } | { type: 'open'; screen: SectionScreen };

const PREFIX = '#/';
export const TEXT_MODE_HASH = '#/text';

function isSectionId(value: string): value is SectionId {
  return SECTION_IDS.some((id) => id === value);
}

export function toHash(section: SectionId | null): string {
  return section ? PREFIX + section : '';
}

export function fromHash(hash: string): HashTarget {
  if (hash === '' || hash === '#' || hash === PREFIX) return null;
  if (hash === TEXT_MODE_HASH) return 'text';
  const id = hash.startsWith(PREFIX) ? hash.slice(PREFIX.length) : '';
  return isSectionId(id) ? { kind: 'section', id } : 'unknown';
}

/** Entrar a una sección crea una entrada en el historial; el resto la reemplaza. */
export function urlUpdate(prevHash: string, nextHash: string): 'push' | 'replace' | 'none' {
  if (prevHash === nextHash) return 'none';
  return prevHash === '' ? 'push' : 'replace';
}

/** Qué hacer cuando el visitante usa "atrás" o "adelante" del navegador. */
export function popStateAction(current: SectionId | null, hash: string): RouteAction | null {
  const target = fromHash(hash);
  // El modo texto se abre encima de la consola, que queda como estaba.
  if (target === 'text') return null;
  const targetSection = target !== null && target !== 'unknown' ? target : null;
  if (current && !targetSection) return { type: 'back' };
  if (targetSection && targetSection.id !== current) return { type: 'open', screen: targetSection };
  return null;
}

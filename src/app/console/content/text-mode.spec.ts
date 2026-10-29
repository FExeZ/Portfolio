import { describe, expect, it } from 'vitest';
import type { Lang } from '../../i18n/translations';
import { CONTACT_LINKS } from './contact';
import { PROJECTS, SIMPSONSDLE } from './projects';
import { ROOM_OBJECTS, pagesOf } from './room';
import { CERTIFICATIONS, SKILL_CATEGORIES } from './skills';
import { TextBlock, TextLink, TextModeContent, TextSection, textModeSections } from './text-mode';

const LANGS: Lang[] = ['es', 'en'];

function section(content: TextModeContent, id: TextSection['id']): TextSection {
  const found = content.sections.find((candidate) => candidate.id === id);
  if (!found) throw new Error(`falta la sección ${id}`);
  return found;
}

const subheadings = (blocks: readonly TextBlock[]) =>
  blocks.flatMap((block) => (block.kind === 'subheading' ? [block.text] : []));
const items = (blocks: readonly TextBlock[]) =>
  blocks.flatMap((block) => (block.kind === 'list' ? block.items : []));
const links = (blocks: readonly TextBlock[]): TextLink[] =>
  blocks.flatMap((block) => (block.kind === 'links' ? block.links : []));

/** Todos los textos de la página, a cualquier profundidad. */
function strings(value: unknown, found: string[] = []): string[] {
  if (typeof value === 'string') found.push(value);
  else if (Array.isArray(value)) value.forEach((item) => strings(item, found));
  else if (typeof value === 'object' && value !== null) Object.values(value).forEach((item) => strings(item, found));
  return found;
}

describe.each(LANGS)('modo texto en %s (RF-67)', (lang) => {
  const content = textModeSections(lang);

  it('empieza con el nombre y la ficha de jugador', () => {
    expect(content.title).toBe('Franco Zerda');
    expect(content.intro.map((item) => item.text)).toEqual([
      lang === 'es' ? 'Desarrollador Full Stack' : 'Full Stack Developer',
      'Junior L2',
      'ES · EN · PT'
    ]);
  });

  it('tiene las secciones en el orden del plan', () => {
    expect(content.sections.map((candidate) => candidate.id)).toEqual([
      'about',
      'skills',
      'projects',
      'simpsonsdle',
      'contact',
      'credits'
    ]);
  });

  it('cuenta las historias de los 13 objetos con historia', () => {
    const about = section(content, 'about');
    const stories = ROOM_OBJECTS.filter((object) => pagesOf(object).length > 0);
    expect(stories).toHaveLength(13);
    expect(subheadings(about.blocks)).toEqual(stories.map((object) => object.name[lang]));
    for (const object of stories) {
      for (const page of pagesOf(object)) expect(strings(about.blocks)).toContain(page[lang]);
    }
  });

  it('muestra las consolas como lista, una por consola', () => {
    const consoles = ROOM_OBJECTS.find((object) => object.kind === 'consoles');
    if (!consoles) throw new Error('falta el estante de consolas');
    const texts = items(section(content, 'about').blocks).map((item) => item.text);
    for (const page of pagesOf(consoles)) expect(texts).toContain(page[lang]);
  });

  it('tiene las 25 tecnologías con su descripción y las 4 certificaciones con su emisor', () => {
    const skills = section(content, 'skills');
    const listed = items(skills.blocks);
    const all = SKILL_CATEGORIES.flatMap((category) => category.skills);
    expect(all).toHaveLength(25);
    for (const skill of all) {
      expect(listed).toContainEqual({ term: skill.name, text: skill.description[lang] });
    }
    expect(CERTIFICATIONS).toHaveLength(4);
    for (const certification of CERTIFICATIONS) {
      expect(listed).toContainEqual({ term: certification.title[lang], text: certification.issuer });
    }
  });

  it('tiene los 8 proyectos, cada uno con el link a su repositorio', () => {
    const projects = section(content, 'projects');
    expect(subheadings(projects.blocks)).toEqual(PROJECTS.map((project) => project.title[lang]));
    const urls = links(projects.blocks).map((link) => link.url);
    expect(urls).toEqual(PROJECTS.map((project) => project.repoUrl));
  });

  it('tiene la historia de Simpsonsdle y el link para jugar', () => {
    const simpsonsdle = section(content, 'simpsonsdle');
    for (const paragraph of SIMPSONSDLE.story) expect(strings(simpsonsdle.blocks)).toContain(paragraph[lang]);
    expect(links(simpsonsdle.blocks).map((link) => link.url)).toEqual([SIMPSONSDLE.url]);
  });

  it('tiene los 4 links de contacto; solo el email abre en la misma pestaña', () => {
    const contact = links(section(content, 'contact').blocks);
    expect(contact.map((link) => link.url)).toEqual(CONTACT_LINKS.map((link) => link.url));
    expect(contact.filter((link) => !link.newTab).map((link) => link.url)).toEqual([
      'mailto:francoexequielzerda@gmail.com'
    ]);
  });

  it('los links externos se abren en una pestaña nueva', () => {
    const all = content.sections.flatMap((candidate) => links(candidate.blocks));
    for (const link of all) expect(link.newTab).toBe(!link.url.startsWith('mailto:'));
  });

  it('no deja ningún texto vacío', () => {
    for (const text of strings(content)) expect(text.trim(), JSON.stringify(text)).not.toBe('');
  });

  it('no salta niveles de encabezado: h1, después h2 por sección y h3 adentro', () => {
    const levels = [
      1,
      ...content.sections.flatMap((candidate) => [
        2,
        ...candidate.blocks.flatMap((block) => (block.kind === 'subheading' ? [3] : []))
      ])
    ];
    levels.forEach((level, i) => {
      if (i > 0) expect(level).toBeLessThanOrEqual(levels[i - 1] + 1);
    });
  });
});

import { Lang, TRANSLATIONS } from '../../i18n/translations';
import { CONTACT_LINKS, CONTACT_MESSAGE } from './contact';
import { COPYRIGHT, CREDITS, CREDITS_END } from './credits';
import { PLAYER } from './player';
import { PROJECTS, SIMPSONSDLE } from './projects';
import { ROOM_OBJECTS, pagesOf } from './room';
import { CERTIFICATIONS, SKILL_CATEGORIES } from './skills';

/** Un renglón de una lista: con término (tecnología, rol, dato de la ficha) o solo texto. */
export interface TextItem {
  term?: string;
  text: string;
}

export interface TextLink {
  label: string;
  url: string;
  /** Los sitios externos abren en una pestaña nueva; el email, en el cliente de correo. */
  newTab: boolean;
  /** A qué se refiere el link, para el lector de pantalla ("Ver código" de qué proyecto). */
  context?: string;
}

export type TextBlock =
  /** h3 */
  | { kind: 'subheading'; text: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: readonly TextItem[] }
  | { kind: 'links'; links: readonly TextLink[] };

/** Una sección del modo texto, con su h2. */
export interface TextSection {
  id: 'about' | 'skills' | 'projects' | 'simpsonsdle' | 'contact' | 'credits';
  title: string;
  blocks: readonly TextBlock[];
}

export interface TextModeContent {
  /** h1 */
  title: string;
  /** La ficha de jugador, debajo del h1. */
  intro: readonly TextItem[];
  sections: readonly TextSection[];
}

function link(label: string, url: string, context?: string): TextLink {
  return { label, url, newTab: !url.startsWith('mailto:'), context };
}

/**
 * El modo texto (RF-67): todo el contenido de la consola en una sola página, en el idioma
 * pedido. Sale de los mismos archivos de content/, así que no hay textos repetidos.
 */
export function textModeSections(lang: Lang): TextModeContent {
  const text = TRANSLATIONS[lang].console;
  return {
    title: PLAYER.name,
    intro: [
      { term: text.player.classLabel, text: PLAYER.className[lang] },
      { term: text.player.levelLabel, text: PLAYER.level[lang] },
      { term: text.player.languagesLabel, text: PLAYER.languages }
    ],
    sections: [
      {
        id: 'about',
        title: text.menu.about,
        // Las historias de los objetos de la habitación; las consolas van como lista.
        blocks: ROOM_OBJECTS.flatMap((object): TextBlock[] => {
          const pages = pagesOf(object).map((page) => page[lang]);
          if (pages.length === 0) return [];
          const body: TextBlock[] =
            object.kind === 'consoles'
              ? [{ kind: 'list', items: pages.map((page) => ({ text: page })) }]
              : pages.map((page) => ({ kind: 'paragraph', text: page }));
          return [{ kind: 'subheading', text: object.name[lang] }, ...body];
        })
      },
      {
        id: 'skills',
        title: text.menu.skills,
        blocks: [
          ...SKILL_CATEGORIES.flatMap((category): TextBlock[] => [
            { kind: 'subheading', text: category.title[lang] },
            {
              kind: 'list',
              items: category.skills.map((skill) => ({ term: skill.name, text: skill.description[lang] }))
            }
          ]),
          { kind: 'subheading', text: text.skills.achievements },
          {
            kind: 'list',
            items: CERTIFICATIONS.map((certification) => ({
              term: certification.title[lang],
              text: certification.issuer
            }))
          }
        ]
      },
      {
        id: 'projects',
        title: text.menu.projects,
        blocks: PROJECTS.flatMap((project): TextBlock[] => [
          { kind: 'subheading', text: project.title[lang] },
          { kind: 'paragraph', text: project.description[lang] },
          { kind: 'list', items: [{ term: text.projects.technologies, text: project.technologies.join(' · ') }] },
          { kind: 'links', links: [link(text.projects.code, project.repoUrl, project.title[lang])] }
        ])
      },
      {
        id: 'simpsonsdle',
        title: text.menu.simpsonsdle,
        blocks: [
          ...SIMPSONSDLE.story.map((paragraph): TextBlock => ({ kind: 'paragraph', text: paragraph[lang] })),
          {
            kind: 'list',
            items: [{ term: text.projects.technologies, text: SIMPSONSDLE.technologies.join(' · ') }]
          },
          { kind: 'links', links: [link(text.textMode.play, SIMPSONSDLE.url)] }
        ]
      },
      {
        id: 'contact',
        title: text.menu.contact,
        blocks: [
          { kind: 'paragraph', text: CONTACT_MESSAGE[lang] },
          { kind: 'links', links: CONTACT_LINKS.map((contact) => link(contact.label, contact.url)) }
        ]
      },
      {
        id: 'credits',
        title: text.menu.credits,
        blocks: [
          { kind: 'list', items: CREDITS.map((line) => ({ term: line.role[lang], text: line.name })) },
          { kind: 'paragraph', text: CREDITS_END },
          { kind: 'paragraph', text: COPYRIGHT[lang] }
        ]
      }
    ]
  };
}

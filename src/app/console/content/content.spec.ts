import { describe, expect, it } from 'vitest';
import type { Localized } from '../../i18n/translations';
import { ROOM_UNITS, Rect } from '../core/camera';
import { CONTACT_LINKS, CONTACT_MESSAGE } from './contact';
import { COPYRIGHT, CREDITS, CREDITS_END } from './credits';
import { PLAYER, PLAYER_SHORTCUTS } from './player';
import { PROJECTS, SECRET_CARTRIDGE, SIMPSONSDLE } from './projects';
import { MAX_PAGE_CHARS, ROOM_OBJECTS, RoomObject, RoomObjectId, pagesOf } from './room';
import { CERTIFICATIONS, SKILL_CATEGORIES } from './skills';

function isLocalized(value: unknown): value is Localized {
  return (
    typeof value === 'object' &&
    value !== null &&
    'es' in value &&
    'en' in value &&
    Object.keys(value).length === 2
  );
}

/** Junta todos los textos bilingües que hay dentro de un valor, a cualquier profundidad. */
function collectLocalized(value: unknown, found: Localized[] = []): Localized[] {
  if (isLocalized(value)) {
    found.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectLocalized(item, found));
  } else if (typeof value === 'object' && value !== null) {
    Object.values(value).forEach((item) => collectLocalized(item, found));
  }
  return found;
}

const ALL_CONTENT = {
  ROOM_OBJECTS,
  CONTACT_MESSAGE,
  COPYRIGHT,
  CREDITS,
  PLAYER,
  PROJECTS,
  SIMPSONSDLE,
  SECRET_CARTRIDGE,
  CERTIFICATIONS,
  SKILL_CATEGORIES
};

describe('textos bilingües', () => {
  const texts = collectLocalized(ALL_CONTENT);

  it('encuentra los textos del contenido', () => {
    expect(texts.length).toBeGreaterThan(50);
  });

  it('ningún texto queda vacío en español ni en inglés', () => {
    for (const text of texts) {
      expect(text.es.trim(), JSON.stringify(text)).not.toBe('');
      expect(text.en.trim(), JSON.stringify(text)).not.toBe('');
    }
  });

  it('ningún texto usa HTML: las pantallas los muestran como texto plano', () => {
    for (const text of texts) {
      expect(text.es).not.toMatch(/<[a-z]/i);
      expect(text.en).not.toMatch(/<[a-z]/i);
    }
  });
});

describe('Jugador (RF-27)', () => {
  it('tiene la clase, el nivel y los idiomas de la spec', () => {
    expect(PLAYER.className.es).toBe('Desarrollador Full Stack');
    expect(PLAYER.level.es).toBe('Junior L2');
    expect(PLAYER.languages).toBe('ES · EN · PT');
  });

  it('ofrece accesos a Proyectos y Contacto', () => {
    expect(PLAYER_SHORTCUTS).toEqual(['projects', 'contact']);
  });
});

describe('Skills (RF-41, RF-43)', () => {
  const skills = SKILL_CATEGORIES.flatMap((category) => category.skills);

  it('tiene las 6 categorías actuales con sus 25 tecnologías', () => {
    expect(SKILL_CATEGORIES.map((category) => category.title.es)).toEqual([
      'Backend',
      'Frontend',
      'Bases de datos',
      'DevOps & Cloud',
      'Herramientas',
      'Otros lenguajes'
    ]);
    expect(skills).toHaveLength(25);
    // Franco sacó Time Tracker al revisar los textos (T30).
    expect(skills.map((skill) => skill.name)).not.toContain('Time Tracker');
  });

  it('cada tecnología tiene una abreviatura única de 2 caracteres para su insignia', () => {
    for (const skill of skills) expect(skill.short).toMatch(/^[A-Z0-9]{2}$/);
    expect(new Set(skills.map((skill) => skill.short)).size).toBe(skills.length);
  });

  it('las descripciones son cortas para entrar en el panel', () => {
    for (const skill of skills) {
      expect(skill.description.es.length, skill.name).toBeLessThanOrEqual(140);
      expect(skill.description.en.length, skill.name).toBeLessThanOrEqual(140);
    }
  });

  it('cada categoría tiene un color para sus insignias', () => {
    for (const category of SKILL_CATEGORIES) expect(category.color).toMatch(/^#[0-9a-f]{6}$/);
  });

  it('tiene las 4 certificaciones con emisor', () => {
    expect(CERTIFICATIONS).toHaveLength(4);
    for (const certification of CERTIFICATIONS) expect(certification.issuer.trim()).not.toBe('');
  });
});

describe('Proyectos (RF-44, RF-45, RF-47)', () => {
  it('tiene los 8 proyectos de la spec, en orden', () => {
    expect(PROJECTS.map((project) => project.title.es)).toEqual([
      'MusicApp',
      'GetTaskedApp',
      'COPLAC',
      'APIRest',
      'CRUD Java MySQL',
      'Maqueta Web Pizzería',
      'FaseLunarApp',
      'Conversor de Monedas'
    ]);
  });

  it('cada proyecto tiene tecnologías y un repositorio de GitHub', () => {
    for (const project of PROJECTS) {
      expect(project.technologies.length).toBeGreaterThan(0);
      expect(project.repoUrl).toMatch(/^https:\/\/github\.com\/FExeZ\/.+/);
    }
  });

  it('cada cartucho, incluido el de Simpsonsdle, tiene un ícono propio', () => {
    const icons = [...PROJECTS.map((project) => project.icon), SIMPSONSDLE.icon];
    expect(new Set(icons).size).toBe(9);
  });

  it('Simpsonsdle abre su sitio y lista sus tecnologías', () => {
    expect(SIMPSONSDLE.url).toBe('https://www.simpsonsdle.com');
    expect(SIMPSONSDLE.technologies).toEqual(['Angular', 'Spring', 'PostgreSQL']);
  });
});

describe('Contacto (RF-49, RF-51)', () => {
  it('tiene LinkedIn, GitHub, Instagram y email', () => {
    expect(CONTACT_LINKS.map((link) => link.id)).toEqual(['linkedin', 'github', 'instagram', 'email']);
  });

  it('las redes abren por https y el email con mailto', () => {
    for (const link of CONTACT_LINKS) {
      expect(link.url).toMatch(link.id === 'email' ? /^mailto:.+@.+/ : /^https:\/\//);
    }
  });

  it('tiene el mensaje para quien busca sumar a alguien al equipo', () => {
    expect(CONTACT_MESSAGE.es.length).toBeGreaterThan(40);
  });
});

describe('Créditos (RF-52)', () => {
  it('terminan con "Thanks for playing"', () => {
    expect(CREDITS_END).toBe('Thanks for playing');
  });

  it('dan crédito a las fuentes y su licencia', () => {
    const names = CREDITS.map((line) => line.name).join(' ');
    expect(names).toContain('Press Start 2P');
    expect(names).toContain('VT323');
    expect(CREDITS.some((line) => line.role.es.includes('OFL'))).toBe(true);
  });
});

describe('Habitación (RF-29 a RF-40)', () => {
  const byId = (id: RoomObjectId): RoomObject => {
    const object = ROOM_OBJECTS.find((candidate) => candidate.id === id);
    if (!object) throw new Error(`falta el objeto ${id}`);
    return object;
  };

  it('tiene los 14 objetos y las 4 mascotas de RF-29, en orden de lectura', () => {
    expect(ROOM_OBJECTS.map((object) => object.id)).toEqual([
      'window',
      'flag',
      'favaloro',
      'poster',
      'trophies',
      'tv',
      'consoles',
      'pc',
      'mate',
      'recordPlayer',
      'globe',
      'bear',
      'pocho',
      'negra',
      'ball',
      'racket',
      'flaco',
      'nymeria'
    ]);
  });

  it('el orden va por fila y, dentro de cada fila, de izquierda a derecha (RF-34)', () => {
    for (let i = 1; i < ROOM_OBJECTS.length; i++) {
      const prev = ROOM_OBJECTS[i - 1];
      const next = ROOM_OBJECTS[i];
      expect(next.row, next.id).toBeGreaterThanOrEqual(prev.row);
      if (next.row === prev.row) expect(next.rect.x, next.id).toBeGreaterThan(prev.rect.x);
    }
  });

  it('la tele y las mascotas no tienen historia; los otros 13 objetos sí', () => {
    const silent = ROOM_OBJECTS.filter((object) => pagesOf(object).length === 0).map((o) => o.id);
    expect(silent).toEqual(['tv', 'pocho', 'negra', 'flaco', 'nymeria']);
  });

  it('cada página entra en la caja de diálogo, en los dos idiomas', () => {
    for (const object of ROOM_OBJECTS) {
      for (const page of pagesOf(object)) {
        expect(page.es.length, `${object.id}: ${page.es}`).toBeLessThanOrEqual(MAX_PAGE_CHARS);
        expect(page.en.length, `${object.id}: ${page.en}`).toBeLessThanOrEqual(MAX_PAGE_CHARS);
      }
    }
  });

  it('el estante de consolas recorre las 5 consolas en orden, cada una con su juego (RF-36)', () => {
    const consoles = byId('consoles');
    if (consoles.kind !== 'consoles') throw new Error('el estante no es de consolas');
    const games = ['Balloon Fight', 'Sunset Riders', 'GTA San Andreas', 'Bioshock', 'Minecraft'];
    expect(consoles.pages).toHaveLength(games.length);
    expect(consoles.slots).toHaveLength(games.length);
    consoles.pages.forEach((page, i) => {
      expect(page.es).toContain(games[i]);
      expect(page.en).toContain(games[i]);
    });
    for (const slot of consoles.slots) expect(contains(consoles.rect, slot)).toBe(true);
  });

  it('los recuerdos están en los trofeos, el póster, el globo y el oso (RF-37)', () => {
    const memories = ROOM_OBJECTS.flatMap((object) =>
      object.kind === 'story' && object.memory ? [[object.id, object.memory]] : []
    );
    expect(Object.fromEntries(memories)).toEqual({
      poster: 'stands',
      trophies: 'team',
      globe: 'languages',
      bear: 'bear'
    });
  });

  it('Favaloro se describe por su legado, sin las circunstancias de su muerte (RF-40)', () => {
    const text = pagesOf(byId('favaloro'))
      .map((page) => `${page.es} ${page.en}`)
      .join(' ')
      .toLowerCase();
    expect(text).toContain('ética');
    expect(text).toContain('humildad');
    expect(text).toContain('conciencia social');
    for (const word of [
      'muerte',
      'murió',
      'muere',
      'suicid',
      'quitó la vida',
      'quitándose',
      'disparo',
      'tragedia',
      'death',
      'died',
      'own life',
      'tragedy',
      'shot'
    ]) {
      expect(text).not.toContain(word);
    }
  });

  it('cada mascota tiene su sonido: ladridos para los perros y maullido para Nymeria (RF-35)', () => {
    const sounds = ROOM_OBJECTS.flatMap((object) =>
      object.kind === 'pet' ? [[object.id, object.sound]] : []
    );
    expect(Object.fromEntries(sounds)).toEqual({
      pocho: 'barkSmall',
      negra: 'barkBig',
      flaco: 'barkMedium',
      nymeria: 'meow'
    });
  });

  it('cada objeto está dentro de la habitación y ninguno pisa a otro', () => {
    for (const object of ROOM_OBJECTS) expect(contains(ROOM_UNITS, object.rect), object.id).toBe(true);
    for (let i = 0; i < ROOM_OBJECTS.length; i++) {
      for (let j = i + 1; j < ROOM_OBJECTS.length; j++) {
        const [a, b] = [ROOM_OBJECTS[i], ROOM_OBJECTS[j]];
        expect(overlaps(a.rect, b.rect), `${a.id} y ${b.id}`).toBe(false);
      }
    }
  });
});

/**
 * Lee src/index.html con Node. El proyecto no instala los tipos de Node solo para esto:
 * el import con el nombre armado en una variable evita que TypeScript los pida.
 */
async function readIndexHtml(): Promise<string> {
  const specifier = 'node:fs';
  const fs = (await import(/* @vite-ignore */ specifier)) as {
    readFileSync(path: string, encoding: 'utf8'): string;
  };
  return fs.readFileSync('src/index.html', 'utf8');
}

/** Los archivos de `public/`, que el build copia tal cual al sitio publicado. */
async function publicFiles(): Promise<string[]> {
  const specifier = 'node:fs';
  const fs = (await import(/* @vite-ignore */ specifier)) as {
    readdirSync(path: string, options: { recursive: true }): string[];
  };
  // Las carpetas no tienen extensión; las barras de Windows se normalizan.
  return fs
    .readdirSync('public', { recursive: true })
    .map((file) => file.replaceAll('\\', '/'))
    .filter((file) => file.includes('.'))
    .sort();
}

describe('public/ (RNF-2)', () => {
  it('solo tiene los archivos que usa el sitio: ninguna foto de terceros se publica', async () => {
    expect(await publicFiles()).toEqual(['assets/avatar-48.png', 'favicon.ico', 'og-image.png']);
  });
});

describe('index.html (RNF-7 y el caso sin JavaScript)', () => {
  it('sin JavaScript muestra los mismos 4 links de contacto que la consola', async () => {
    const html = await readIndexHtml();
    const noscript = /<noscript>([\s\S]*?)<\/noscript>/.exec(html)?.[1] ?? '';
    const hrefs = [...noscript.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
    expect(hrefs).toEqual(CONTACT_LINKS.map((link) => link.url));
  });

  it('tiene la vista previa en redes con direcciones absolutas al sitio publicado', async () => {
    const html = await readIndexHtml();
    const meta = (key: string) =>
      new RegExp(`<meta (?:property|name)="${key}" content="([^"]+)"`).exec(html)?.[1];
    expect(html).toContain('<title>Franco Zerda · Desarrollador Full Stack</title>');
    expect(meta('description')).toBeTruthy();
    expect(meta('og:title')).toBe('Franco Zerda · Desarrollador Full Stack');
    expect(meta('og:description')).toBe(meta('description'));
    expect(meta('og:type')).toBe('website');
    expect(meta('og:url')).toBe('https://fexez.github.io/Portfolio/');
    expect(meta('og:image')).toBe('https://fexez.github.io/Portfolio/og-image.png');
    expect(meta('og:image:width')).toBe('1200');
    expect(meta('og:image:height')).toBe('630');
    expect(meta('og:image:alt')).toBeTruthy();
    expect(meta('twitter:card')).toBe('summary_large_image');
  });
});

function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

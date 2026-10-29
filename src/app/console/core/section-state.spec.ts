import { describe, expect, it } from 'vitest';
import { CONTACT_LINKS } from '../content/contact';
import { PROJECTS, SIMPSONSDLE } from '../content/projects';
import { ROOM_OBJECTS, RoomObjectId } from '../content/room';
import { CERTIFICATIONS, SKILL_CATEGORIES } from '../content/skills';
import type { Action } from './console-state';
import { SnakeGame, newSnake } from './snake';
import {
  AboutView,
  SKILL_TAB_COUNT,
  SectionResult,
  SectionView,
  backLeavesSection,
  exitsSection,
  initialView,
  reduceSection,
  shelfItem,
  shelfSize,
  skillTabSize
} from './section-state';

/** Aplica varias acciones mientras la vista siga dentro de la sección. */
function run(view: SectionView, ...actions: Action[]): SectionView {
  return actions.reduce((current, action) => {
    const result = reduceSection(current, action);
    return result.kind === 'view' ? result.view : current;
  }, view);
}

const LEAVE: SectionResult = { kind: 'leave' };
const IGNORE: SectionResult = { kind: 'ignore' };

describe('initialView', () => {
  it('arranca cada sección en su estado inicial', () => {
    expect(initialView('player')).toEqual({ id: 'player', cursor: 0 });
    expect(initialView('skills')).toEqual({ id: 'skills', tab: 0, cursor: 0 });
    expect(initialView('contact')).toEqual({ id: 'contact', joined: false, cursor: 0 });
    expect(initialView('credits')).toEqual({ id: 'credits' });
    expect(initialView('about')).toEqual({ id: 'about', cursor: 0, dialog: null, pet: null, pcPicks: 0 });
    expect(initialView('projects')).toEqual({ id: 'projects', cursor: 0, open: null });
    expect(initialView('simpsonsdle')).toEqual({ id: 'simpsonsdle', stage: 'inserting' });
  });
});

describe('Jugador (RF-27)', () => {
  const player = initialView('player');

  it('el cursor recorre los dos accesos y da la vuelta', () => {
    expect(run(player, { type: 'down' })).toEqual({ id: 'player', cursor: 1 });
    expect(run(player, { type: 'down' }, { type: 'down' })).toEqual({ id: 'player', cursor: 0 });
    expect(run(player, { type: 'up' })).toEqual({ id: 'player', cursor: 1 });
    expect(run(player, { type: 'point', index: 1 })).toEqual({ id: 'player', cursor: 1 });
  });

  it('A abre Proyectos o Contacto sin pasar por el menú', () => {
    expect(reduceSection(player, { type: 'confirm' })).toEqual({ kind: 'goto', section: 'projects' });
    expect(reduceSection(run(player, { type: 'down' }), { type: 'confirm' })).toEqual({
      kind: 'goto',
      section: 'contact'
    });
    expect(reduceSection(player, { type: 'pick', index: 1 })).toEqual({
      kind: 'goto',
      section: 'contact'
    });
  });

  it('B vuelve al menú y los costados no hacen nada', () => {
    expect(reduceSection(player, { type: 'back' })).toEqual(LEAVE);
    expect(reduceSection(player, { type: 'left' })).toEqual(IGNORE);
  });
});

describe('Skills (RF-41, RF-42, RF-43)', () => {
  const skills = initialView('skills');

  it('tiene una pestaña por categoría más la de Logros', () => {
    expect(SKILL_TAB_COUNT).toBe(SKILL_CATEGORIES.length + 1);
    expect(skillTabSize(0)).toBe(SKILL_CATEGORIES[0].skills.length);
    expect(skillTabSize(SKILL_TAB_COUNT - 1)).toBe(CERTIFICATIONS.length);
  });

  it('izquierda y derecha cambian de pestaña con vuelta circular', () => {
    expect(run(skills, { type: 'right' })).toEqual({ id: 'skills', tab: 1, cursor: 0 });
    expect(run(skills, { type: 'left' })).toEqual({ id: 'skills', tab: SKILL_TAB_COUNT - 1, cursor: 0 });
  });

  it('cambiar de pestaña vuelve el cursor al primer ítem', () => {
    expect(run(skills, { type: 'down' }, { type: 'down' }, { type: 'right' })).toEqual({
      id: 'skills',
      tab: 1,
      cursor: 0
    });
  });

  it('arriba y abajo recorren los ítems de la pestaña con vuelta circular', () => {
    const last = skillTabSize(0) - 1;
    expect(run(skills, { type: 'up' })).toEqual({ id: 'skills', tab: 0, cursor: last });
    const atLast = run(skills, { type: 'point', index: last });
    expect(run(atLast, { type: 'down' })).toEqual({ id: 'skills', tab: 0, cursor: 0 });
  });

  it('la pestaña de Logros recorre las certificaciones', () => {
    const achievements = run(skills, { type: 'left' });
    expect(run(achievements, { type: 'up' })).toEqual({
      id: 'skills',
      tab: SKILL_TAB_COUNT - 1,
      cursor: CERTIFICATIONS.length - 1
    });
  });

  it('el puntero elige pestaña e ítem, e ignora índices inválidos', () => {
    expect(run(skills, { type: 'selectTab', index: 3 })).toEqual({ id: 'skills', tab: 3, cursor: 0 });
    expect(run(skills, { type: 'selectTab', index: 99 })).toEqual(skills);
    expect(run(skills, { type: 'point', index: 2 })).toEqual({ id: 'skills', tab: 0, cursor: 2 });
    expect(run(skills, { type: 'pick', index: 2 })).toEqual({ id: 'skills', tab: 0, cursor: 2 });
    expect(run(skills, { type: 'point', index: 99 })).toEqual(skills);
  });

  it('la descripción sigue al cursor: A no hace nada', () => {
    expect(reduceSection(skills, { type: 'confirm' })).toEqual(IGNORE);
  });

  it('B vuelve al menú', () => {
    expect(reduceSection(skills, { type: 'back' })).toEqual(LEAVE);
  });
});

describe('Contacto (RF-49, RF-50, RF-51)', () => {
  const waiting = initialView('contact');
  const joined = run(waiting, { type: 'confirm' });

  it('antes de unirse, solo Start hace algo', () => {
    expect(reduceSection(waiting, { type: 'down' })).toEqual(IGNORE);
    expect(joined).toEqual({ id: 'contact', joined: true, cursor: 0 });
  });

  it('después de unirse, el cursor recorre los 4 links', () => {
    expect(run(joined, { type: 'down' })).toEqual({ id: 'contact', joined: true, cursor: 1 });
    expect(run(joined, { type: 'up' })).toEqual({
      id: 'contact',
      joined: true,
      cursor: CONTACT_LINKS.length - 1
    });
  });

  it('A sobre un link lo abre', () => {
    const onGitHub = run(joined, { type: 'down' });
    expect(reduceSection(onGitHub, { type: 'confirm' })).toEqual({
      kind: 'view',
      view: onGitHub,
      effects: [{ type: 'openUrl', url: CONTACT_LINKS[1].url }]
    });
  });

  it('un clic sobre un link lo marca y lo abre', () => {
    expect(reduceSection(joined, { type: 'pick', index: 3 })).toEqual({
      kind: 'view',
      view: { id: 'contact', joined: true, cursor: 3 },
      effects: [{ type: 'openUrl', url: 'mailto:francoexequielzerda@gmail.com' }]
    });
  });

  it('B vuelve al menú, antes y después de unirse', () => {
    expect(reduceSection(waiting, { type: 'back' })).toEqual(LEAVE);
    expect(reduceSection(joined, { type: 'back' })).toEqual(LEAVE);
  });
});

describe('Créditos y Sobre mí', () => {
  it.each<Action>([{ type: 'up' }, { type: 'confirm' }, { type: 'left' }, { type: 'pick', index: 0 }])(
    'los créditos ignoran %o',
    (action) => {
      expect(reduceSection(initialView('credits'), action)).toEqual(IGNORE);
    }
  );

  it('B vuelve al menú', () => {
    expect(reduceSection(initialView('credits'), { type: 'back' })).toEqual(LEAVE);
    expect(reduceSection(initialView('about'), { type: 'back' })).toEqual(LEAVE);
  });
});

describe('backLeavesSection', () => {
  it.each(['player', 'skills', 'contact', 'credits', 'about'] as const)(
    'B sale de %s',
    (id) => {
      expect(backLeavesSection(initialView(id))).toBe(true);
    }
  );
});

describe('Proyectos: estante (RF-44)', () => {
  const shelf = initialView('projects');
  const at = (cursor: number): SectionView => ({ id: 'projects', cursor, open: null });

  it('tiene 9 cartuchos: Simpsonsdle primero, como proyecto destacado, y los 8 proyectos', () => {
    expect(shelfSize(false)).toBe(9);
    expect(shelfItem(0)).toEqual({ kind: 'simpsonsdle' });
    expect(shelfItem(1)).toEqual({ kind: 'project', project: PROJECTS[0] });
    expect(shelfItem(8)).toEqual({ kind: 'project', project: PROJECTS[7] });
  });

  it('izquierda y derecha recorren los cartuchos con vuelta circular', () => {
    expect(run(shelf, { type: 'right' })).toEqual(at(1));
    expect(run(shelf, { type: 'left' })).toEqual(at(8));
  });

  it('arriba y abajo cambian de fila dentro de la misma columna', () => {
    expect(run(shelf, { type: 'down' })).toEqual(at(3));
    expect(run(shelf, { type: 'up' })).toEqual(at(6));
    expect(run(at(7), { type: 'down' })).toEqual(at(1));
  });

  it('el puntero marca un cartucho', () => {
    expect(run(shelf, { type: 'point', index: 4 })).toEqual(at(4));
  });

  it('con el cartucho secreto son 10: va último, solo en un cuarto estante (RF-74)', () => {
    expect(shelfSize(true)).toBe(10);
    expect(shelfItem(9)).toEqual({ kind: 'secret' });
  });

  it('con 10, arriba y abajo mantienen la columna y dan la vuelta dentro de ella', () => {
    const move = (cursor: number, action: Action) => {
      const result = reduceSection(at(cursor), action, true);
      return result.kind === 'view' && result.view.id === 'projects' ? result.view.cursor : null;
    };
    expect(move(6, { type: 'down' })).toBe(9);
    expect(move(9, { type: 'down' })).toBe(0);
    expect(move(0, { type: 'up' })).toBe(9);
    expect(move(7, { type: 'down' })).toBe(1);
    expect(move(1, { type: 'up' })).toBe(7);
    expect(move(9, { type: 'right' })).toBe(0);
    expect(move(0, { type: 'left' })).toBe(9);
    expect(move(0, { type: 'point', index: 9 })).toBe(9);
  });

  it('sin descubrirlo, el décimo lugar no existe', () => {
    expect(reduceSection(shelf, { type: 'point', index: 9 })).toEqual(IGNORE);
    expect(reduceSection(shelf, { type: 'pick', index: 9 })).toEqual(IGNORE);
  });

  it('B vuelve al menú', () => {
    expect(reduceSection(shelf, { type: 'back' })).toEqual(LEAVE);
    expect(backLeavesSection(shelf)).toBe(true);
  });
});

describe('Proyectos: inserción y manual (RF-46, RF-47)', () => {
  const shelf = initialView('projects');
  const inserting = run(shelf, { type: 'pick', index: 2 });
  const manual = run(inserting, { type: 'insertDone' });

  it('A o un clic insertan el cartucho', () => {
    expect(run(shelf, { type: 'confirm' })).toEqual({
      id: 'projects',
      cursor: 0,
      open: { index: 0, stage: 'inserting' }
    });
    expect(inserting).toEqual({ id: 'projects', cursor: 2, open: { index: 2, stage: 'inserting' } });
  });

  it.each<Action>([{ type: 'up' }, { type: 'confirm' }, { type: 'back' }, { type: 'pick', index: 0 }])(
    'durante la inserción ignora %o',
    (action) => {
      expect(reduceSection(inserting, action)).toEqual(IGNORE);
    }
  );

  it('al terminar la inserción se muestra el manual', () => {
    expect(manual).toEqual({ id: 'projects', cursor: 2, open: { index: 2, stage: 'shown' } });
  });

  it('en el manual, A abre el repositorio del proyecto', () => {
    expect(reduceSection(manual, { type: 'confirm' })).toEqual({
      kind: 'view',
      view: manual,
      effects: [{ type: 'openUrl', url: PROJECTS[1].repoUrl }]
    });
    expect(reduceSection(manual, { type: 'pick', index: 0 })).toEqual({
      kind: 'view',
      view: manual,
      effects: [{ type: 'openUrl', url: PROJECTS[1].repoUrl }]
    });
  });

  it('en el manual, las flechas quedan para hacer scroll', () => {
    expect(reduceSection(manual, { type: 'down' })).toEqual(IGNORE);
  });

  it('B en el manual vuelve al estante con el cursor en ese cartucho, sin salir de la sección', () => {
    expect(backLeavesSection(manual)).toBe(false);
    expect(reduceSection(manual, { type: 'back' })).toEqual({
      kind: 'view',
      view: { id: 'projects', cursor: 2, open: null }
    });
  });

  it('el cartucho dorado muestra Simpsonsdle y PLAY abre su sitio (RF-48)', () => {
    const simpsonsdle = run(shelf, { type: 'confirm' }, { type: 'insertDone' });
    expect(reduceSection(simpsonsdle, { type: 'confirm' })).toEqual({
      kind: 'view',
      view: simpsonsdle,
      effects: [{ type: 'openUrl', url: SIMPSONSDLE.url }]
    });
  });

  it('insertDone sin inserción en curso no hace nada', () => {
    expect(reduceSection(shelf, { type: 'insertDone' })).toEqual(IGNORE);
    expect(reduceSection(manual, { type: 'insertDone' })).toEqual(IGNORE);
  });
});

/** Índice de un objeto de la habitación en el orden de recorrido. */
function objectIndex(id: RoomObjectId): number {
  return ROOM_OBJECTS.findIndex((object) => object.id === id);
}

function pageCount(id: RoomObjectId): number {
  const object = ROOM_OBJECTS[objectIndex(id)];
  return object.kind === 'story' || object.kind === 'consoles' ? object.pages.length : 0;
}

const room = (cursor: number, rest: Partial<AboutView> = {}): AboutView => ({
  id: 'about',
  cursor,
  dialog: null,
  pet: null,
  pcPicks: 0,
  ...rest
});

describe('Sobre mí: recorrer la habitación (RF-30, RF-34)', () => {
  const last = ROOM_OBJECTS.length - 1;

  it('derecha y abajo van al objeto siguiente; izquierda y arriba, al anterior', () => {
    expect(run(room(0), { type: 'right' })).toEqual(room(1));
    expect(run(room(0), { type: 'down' })).toEqual(room(1));
    expect(run(room(2), { type: 'left' })).toEqual(room(1));
    expect(run(room(2), { type: 'up' })).toEqual(room(1));
  });

  it('el recorrido da la vuelta en los dos sentidos', () => {
    expect(run(room(0), { type: 'left' })).toEqual(room(last));
    expect(run(room(last), { type: 'right' })).toEqual(room(0));
  });

  it('el puntero marca un objeto e ignora índices inválidos', () => {
    expect(run(room(0), { type: 'point', index: 5 })).toEqual(room(5));
    expect(reduceSection(room(5), { type: 'point', index: 5 })).toEqual(IGNORE);
    expect(reduceSection(room(0), { type: 'point', index: 99 })).toEqual(IGNORE);
    expect(reduceSection(room(0), { type: 'pick', index: -1 })).toEqual(IGNORE);
  });

  it('B vuelve al menú', () => {
    expect(reduceSection(room(3), { type: 'back' })).toEqual(LEAVE);
    expect(backLeavesSection(room(3))).toBe(true);
  });
});

describe('Sobre mí: diálogos (RF-31, RF-32, RF-33)', () => {
  const poster = objectIndex('poster');
  const boedo = objectIndex('window');
  const typing = room(boedo, { dialog: { object: boedo, page: 0, typing: true } });
  const complete = room(boedo, { dialog: { object: boedo, page: 0, typing: false } });

  it('A sobre un objeto con historia abre su diálogo en la primera página, escribiéndose', () => {
    expect(run(room(boedo), { type: 'confirm' })).toEqual(typing);
  });

  it('un clic sobre un objeto lo marca y abre su diálogo', () => {
    expect(run(room(0), { type: 'pick', index: poster })).toEqual(
      room(poster, { dialog: { object: poster, page: 0, typing: true } })
    );
  });

  it('mientras la página se escribe, A la completa al instante', () => {
    expect(run(typing, { type: 'confirm' })).toEqual(complete);
  });

  it('typeDone completa la página cuando termina de escribirse', () => {
    expect(run(typing, { type: 'typeDone' })).toEqual(complete);
    expect(reduceSection(complete, { type: 'typeDone' })).toEqual(IGNORE);
    expect(reduceSection(room(boedo), { type: 'typeDone' })).toEqual(IGNORE);
  });

  it('con la página completa, A pasa a la siguiente', () => {
    expect(run(complete, { type: 'confirm' })).toEqual(
      room(boedo, { dialog: { object: boedo, page: 1, typing: true } })
    );
  });

  it('en la última página, A cierra el diálogo y el cursor queda en el objeto', () => {
    const pages = pageCount('window');
    const lastPage = room(boedo, { dialog: { object: boedo, page: pages - 1, typing: false } });
    expect(run(lastPage, { type: 'confirm' })).toEqual(room(boedo));
  });

  it('se puede leer una historia entera solo con A', () => {
    const presses = Array.from({ length: pageCount('window') * 2 }, (): Action => ({ type: 'confirm' }));
    expect(run(typing, ...presses)).toEqual(room(boedo));
  });

  it('B cierra el diálogo, esté escribiéndose o completo, sin salir de la sección', () => {
    expect(reduceSection(typing, { type: 'back' })).toEqual({ kind: 'view', view: room(boedo) });
    expect(reduceSection(complete, { type: 'back' })).toEqual({ kind: 'view', view: room(boedo) });
    expect(backLeavesSection(typing)).toBe(false);
  });

  it.each<Action>([
    { type: 'down' },
    { type: 'left' },
    { type: 'point', index: 3 },
    { type: 'pick', index: 3 }
  ])('con el diálogo abierto ignora %o', (action) => {
    expect(reduceSection(complete, action)).toEqual(IGNORE);
  });

  it('el estante de consolas tiene una página por consola, en orden (RF-36)', () => {
    const consoles = objectIndex('consoles');
    let view = run(room(consoles), { type: 'confirm' });
    const pages: number[] = [];
    while (view.id === 'about' && view.dialog) {
      pages.push(view.dialog.page);
      view = run(view, { type: 'confirm' }, { type: 'confirm' });
    }
    expect(pages).toEqual([0, 1, 2, 3, 4]);
    expect(view).toEqual(room(consoles));
  });
});

describe('Sobre mí: tele y mascotas (RF-35, RF-38)', () => {
  const tv = objectIndex('tv');
  const pocho = objectIndex('pocho');
  const negra = objectIndex('negra');

  it('A o un clic sobre la tele vuelven al menú', () => {
    expect(reduceSection(room(tv), { type: 'confirm' })).toEqual(LEAVE);
    expect(reduceSection(room(0), { type: 'pick', index: tv })).toEqual(LEAVE);
  });

  it('elegir una mascota la hace reaccionar sin abrir un diálogo', () => {
    expect(run(room(pocho), { type: 'confirm' })).toEqual(
      room(pocho, { pet: { object: pocho, count: 1 } })
    );
    expect(run(room(0), { type: 'pick', index: negra })).toEqual(
      room(negra, { pet: { object: negra, count: 1 } })
    );
  });

  it('elegir otra vez una mascota reinicia la reacción', () => {
    expect(run(room(pocho), { type: 'confirm' }, { type: 'confirm' })).toEqual(
      room(pocho, { pet: { object: pocho, count: 2 } })
    );
    expect(run(room(pocho), { type: 'confirm' }, { type: 'pick', index: negra })).toEqual(
      room(negra, { pet: { object: negra, count: 2 } })
    );
  });

  it('la reacción de una mascota no impide abrir un diálogo', () => {
    const reacted = run(room(pocho), { type: 'confirm' });
    expect(run(reacted, { type: 'pick', index: 0 })).toEqual(
      room(0, { pet: { object: pocho, count: 1 }, dialog: { object: 0, page: 0, typing: true } })
    );
  });
});

describe('exitsSection', () => {
  const tv = objectIndex('tv');

  it('es verdadero cuando la acción sale de la sección', () => {
    expect(exitsSection(room(0), { type: 'back' })).toBe(true);
    expect(exitsSection(room(tv), { type: 'confirm' })).toBe(true);
    expect(exitsSection(room(0), { type: 'pick', index: tv })).toBe(true);
    expect(exitsSection(initialView('skills'), { type: 'back' })).toBe(true);
  });

  it('es falso cuando la acción se queda dentro de la sección', () => {
    const dialog = room(0, { dialog: { object: 0, page: 0, typing: false } });
    expect(exitsSection(dialog, { type: 'back' })).toBe(false);
    expect(exitsSection(room(0), { type: 'confirm' })).toBe(false);
    expect(exitsSection(initialView('simpsonsdle'), { type: 'back' })).toBe(false);
    const manual = run(initialView('projects'), { type: 'confirm' }, { type: 'insertDone' });
    expect(exitsSection(manual, { type: 'back' })).toBe(false);
  });
});

describe('Simpsonsdle desde el menú (RF-47, RF-48)', () => {
  const inserting = initialView('simpsonsdle');
  const shown = run(inserting, { type: 'insertDone' });

  it('arranca insertando el cartucho e ignora las teclas hasta terminar', () => {
    expect(reduceSection(inserting, { type: 'confirm' })).toEqual(IGNORE);
    expect(reduceSection(inserting, { type: 'back' })).toEqual(IGNORE);
    expect(shown).toEqual({ id: 'simpsonsdle', stage: 'shown' });
  });

  it('PLAY abre simpsonsdle.com', () => {
    expect(reduceSection(shown, { type: 'confirm' })).toEqual({
      kind: 'view',
      view: shown,
      effects: [{ type: 'openUrl', url: 'https://www.simpsonsdle.com' }]
    });
  });

  it('B vuelve al menú', () => {
    expect(reduceSection(shown, { type: 'back' })).toEqual(LEAVE);
    expect(backLeavesSection(shown)).toBe(true);
  });
});

describe('Sobre mí: cartucho secreto (RF-74)', () => {
  const pc = objectIndex('pc');
  const pick = (index: number): Action => ({ type: 'pick', index });
  const close: Action = { type: 'back' };

  it('elegir la PC tres veces seguidas descubre el cartucho, sin abrir el diálogo', () => {
    const twice = run(room(0), pick(pc), close, pick(pc), close);
    expect(twice).toEqual(room(pc, { pcPicks: 2 }));
    expect(reduceSection(twice, pick(pc))).toEqual({ kind: 'view', view: room(pc), found: true });
  });

  it('mover el cursor en el medio no corta la racha', () => {
    const moved = run(room(0), pick(pc), close, { type: 'right' }, { type: 'left' }, pick(pc), close);
    expect(moved).toMatchObject({ pcPicks: 2 });
  });

  it('elegir otro objeto en el medio, aunque sea una mascota, corta la racha', () => {
    const story = run(room(0), pick(pc), close, pick(objectIndex('window')), close, pick(pc), close, pick(pc));
    expect(story).toMatchObject({ pcPicks: 2, dialog: { object: pc } });
    const pet = run(room(0), pick(pc), close, pick(objectIndex('pocho')), pick(pc), close, pick(pc));
    expect(pet).toMatchObject({ pcPicks: 2, dialog: { object: pc } });
  });

  it('con el cartucho ya descubierto, la PC abre su diálogo como siempre', () => {
    const result = reduceSection(room(pc, { pcPicks: 2 }), pick(pc), true);
    expect(result).toMatchObject({ kind: 'view', view: { dialog: { object: pc, page: 0, typing: true } } });
    expect(result).not.toHaveProperty('found');
  });
});

describe('Proyectos: Snake (RF-76 a RF-80)', () => {
  const SECRET = 9;
  const shelf: SectionView = { id: 'projects', cursor: SECRET, open: null };
  const withSnake = (snake: Partial<SnakeGame>): SectionView => ({
    id: 'projects',
    cursor: SECRET,
    open: { index: SECRET, stage: 'shown', snake: { ...newSnake(), ...snake } }
  });
  const after = (view: SectionView, action: Action): SnakeGame | null | undefined => {
    const result = reduceSection(view, action, true);
    return result.kind === 'view' && result.view.id === 'projects' ? result.view.open?.snake : undefined;
  };
  const ready = withSnake({});
  const playing = withSnake({ status: 'playing' });
  const paused = withSnake({ status: 'paused' });
  const over = withSnake({ status: 'over', score: 4 });

  it('insertar el cartucho secreto abre Snake esperando el primer movimiento', () => {
    const inserting = reduceSection(shelf, { type: 'confirm' }, true);
    expect(inserting).toEqual({ kind: 'view', view: { ...shelf, open: { index: SECRET, stage: 'inserting' } } });
    if (inserting.kind !== 'view') throw new Error('no se insertó');
    expect(reduceSection(inserting.view, { type: 'insertDone' }, true)).toEqual({ kind: 'view', view: ready });
  });

  it('en ready, una flecha arranca y gira, y A arranca', () => {
    expect(after(ready, { type: 'up' })).toMatchObject({ status: 'playing', next: 'up' });
    expect(after(ready, { type: 'confirm' })).toMatchObject({ status: 'playing', next: 'right' });
  });

  it('jugando, las flechas giran y A pausa', () => {
    expect(after(playing, { type: 'down' })).toMatchObject({ status: 'playing', next: 'down' });
    expect(after(playing, { type: 'confirm' })).toMatchObject({ status: 'paused' });
  });

  it('en pausa, A sigue y una flecha sigue y gira', () => {
    expect(after(paused, { type: 'confirm' })).toMatchObject({ status: 'playing' });
    expect(after(paused, { type: 'up' })).toMatchObject({ status: 'playing', next: 'up' });
  });

  it('en Game Over, A o el botón reintentan con un juego nuevo; las flechas no hacen nada (RF-77)', () => {
    expect(after(over, { type: 'confirm' })).toEqual(newSnake());
    expect(after(over, { type: 'pick', index: 0 })).toEqual(newSnake());
    expect(reduceSection(over, { type: 'up' }, true)).toEqual(IGNORE);
  });

  it('el paso del temporizador solo mueve la serpiente mientras se juega', () => {
    const [head] = newSnake().body;
    expect(after(playing, { type: 'tick', random: 0 })?.body[0]).toEqual({ x: head.x + 1, y: head.y });
    for (const view of [ready, paused, over]) {
      expect(reduceSection(view, { type: 'tick', random: 0 }, true)).toEqual(IGNORE);
    }
  });

  it('pause pausa una partida en curso y no toca las demás (RF-80)', () => {
    expect(after(playing, { type: 'pause' })).toMatchObject({ status: 'paused' });
    for (const view of [ready, paused, over]) {
      expect(reduceSection(view, { type: 'pause' }, true)).toEqual(IGNORE);
    }
  });

  it('B vuelve al estante con el cursor en el cartucho secreto, en cualquier momento', () => {
    for (const view of [ready, playing, paused, over]) {
      expect(backLeavesSection(view)).toBe(false);
      expect(reduceSection(view, { type: 'back' }, true)).toEqual({ kind: 'view', view: shelf });
    }
  });

  it('tick y pause no hacen nada fuera de Snake', () => {
    expect(reduceSection(shelf, { type: 'tick', random: 0 }, true)).toEqual(IGNORE);
    expect(reduceSection(initialView('about'), { type: 'pause' })).toEqual(IGNORE);
  });
});

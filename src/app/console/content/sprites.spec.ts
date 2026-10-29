import { describe, expect, it } from 'vitest';
import { PROJECTS, SECRET_CARTRIDGE, SIMPSONSDLE } from './projects';
import { ROOM_OBJECTS } from './room';
import { CYCLONE_WINDOW, MEMORY_SIZE, MEMORY_SPRITES, PIXEL_UNITS, ROOM_SPRITES } from './room-sprites';
import {
  ACHIEVEMENT_SPRITE,
  CARTRIDGE_SPRITES,
  SPRITE_SIZE,
  Sprite,
  badgeSprite,
  spritePixels,
  spriteSize
} from './sprites';

/** Íconos de 12 × 12: cartuchos, insignias y logros. */
const NAMED: [string, Sprite][] = [
  ...Object.entries(CARTRIDGE_SPRITES),
  ['insignia', badgeSprite('#c42b2b')],
  ['logro', ACHIEVEMENT_SPRITE]
];

/** Objetos de la habitación, cada uno de su tamaño. */
const ROOM: [string, Sprite][] = Object.entries(ROOM_SPRITES);

/** Recuerdos de los diálogos (RF-37). */
const MEMORIES: [string, Sprite][] = Object.entries(MEMORY_SPRITES);

const ALL: [string, Sprite][] = [...NAMED, ...ROOM, ...MEMORIES, ['ventana del Modo Ciclón', CYCLONE_WINDOW]];

describe('CARTRIDGE_SPRITES (RF-45)', () => {
  it('tiene un ícono para cada cartucho del estante', () => {
    const icons = [...PROJECTS.map((project) => project.icon), SIMPSONSDLE.icon, SECRET_CARTRIDGE.icon].sort();
    expect(Object.keys(CARTRIDGE_SPRITES).sort()).toEqual(icons);
  });

  it('no repite dibujos', () => {
    const drawings = Object.values(CARTRIDGE_SPRITES).map((sprite) => sprite.rows.join('\n'));
    expect(new Set(drawings).size).toBe(drawings.length);
  });
});

describe.each(NAMED)('el ícono %s', (_name, sprite) => {
  it(`es una grilla de ${SPRITE_SIZE} × ${SPRITE_SIZE}`, () => {
    expect(sprite.rows).toHaveLength(SPRITE_SIZE);
    for (const row of sprite.rows) expect(row).toHaveLength(SPRITE_SIZE);
  });
});

describe('ROOM_SPRITES (RF-29, RF-36)', () => {
  it('dibuja cada objeto de la habitación, salvo la tele, que ya está en la escena', () => {
    const drawn = ROOM_OBJECTS.filter((object) => object.kind !== 'tv').map((object) => object.id);
    expect(ROOM.map(([id]) => id).sort()).toEqual(drawn.sort());
  });

  it.each(ROOM)('%s ocupa exactamente su lugar en la habitación', (id, sprite) => {
    const object = ROOM_OBJECTS.find((candidate) => candidate.id === id);
    if (!object) throw new Error(`falta el objeto ${id}`);
    const { width, height } = spriteSize(sprite);
    expect(width * PIXEL_UNITS).toBe(object.rect.width);
    expect(height * PIXEL_UNITS).toBe(object.rect.height);
  });

  it('cada consola del estante entra en el dibujo, alineada a sus píxeles', () => {
    const shelf = ROOM_OBJECTS.find((object) => object.id === 'consoles');
    if (shelf?.kind !== 'consoles') throw new Error('falta el estante de consolas');
    for (const slot of shelf.slots) {
      for (const value of [slot.x - shelf.rect.x, slot.y - shelf.rect.y, slot.width, slot.height]) {
        expect(value % PIXEL_UNITS).toBe(0);
      }
    }
  });
});

describe('CYCLONE_WINDOW (RF-71)', () => {
  it('mide lo mismo que la ventana, así ocupa su lugar', () => {
    expect(spriteSize(CYCLONE_WINDOW)).toEqual(spriteSize(ROOM_SPRITES.window));
  });

  it('es otro dibujo, con el mismo marco', () => {
    const { rows } = ROOM_SPRITES.window;
    expect(CYCLONE_WINDOW.rows).not.toEqual(rows);
    expect(CYCLONE_WINDOW.rows.slice(0, 3)).toEqual(rows.slice(0, 3));
    expect(CYCLONE_WINDOW.rows.slice(-5)).toEqual(rows.slice(-5));
  });
});

describe('MEMORY_SPRITES (RF-37)', () => {
  it('dibuja un recuerdo por cada historia que lo tiene', () => {
    const memories = ROOM_OBJECTS.flatMap((object) =>
      object.kind === 'story' && object.memory ? [object.memory] : []
    );
    expect(MEMORIES.map(([id]) => id).sort()).toEqual(memories.sort());
  });

  it.each(MEMORIES)('el recuerdo %s tiene el tamaño de la caja de diálogo', (_id, sprite) => {
    expect(spriteSize(sprite)).toEqual(MEMORY_SIZE);
  });
});

describe.each(ALL)('el sprite %s', (_name, sprite) => {
  it('tiene todas las filas del mismo ancho', () => {
    const { width, height } = spriteSize(sprite);
    expect(height).toBeGreaterThan(0);
    for (const row of sprite.rows) expect(row).toHaveLength(width);
  });

  it('solo usa letras de su paleta, y usa todos sus colores', () => {
    const used = new Set(sprite.rows.join('').replaceAll('.', ''));
    expect([...used].sort()).toEqual(Object.keys(sprite.palette).sort());
  });

  it('tiene colores hexadecimales válidos', () => {
    for (const color of Object.values(sprite.palette)) {
      expect(color).toMatch(/^#[0-9a-f]{6}([0-9a-f]{2})?$/);
    }
  });
});

describe('badgeSprite', () => {
  it('pinta la insignia con el color de la categoría', () => {
    expect(Object.values(badgeSprite('#1d3fd1').palette)).toContain('#1d3fd1');
  });
});

describe('spritePixels', () => {
  const sprite: Sprite = {
    palette: { a: '#111111', b: '#222222' },
    rows: ['aab.', '..bb']
  };

  it('junta los píxeles seguidos del mismo color en un solo rectángulo', () => {
    expect(spritePixels(sprite)).toEqual([
      { x: 0, y: 0, width: 2, fill: '#111111' },
      { x: 2, y: 0, width: 1, fill: '#222222' },
      { x: 2, y: 1, width: 2, fill: '#222222' }
    ]);
  });

  it('mide el sprite por sus filas', () => {
    expect(spriteSize(sprite)).toEqual({ width: 4, height: 2 });
  });

  it.each(ALL)('cubre exactamente los píxeles pintados de %s', (_name, drawing) => {
    const painted = drawing.rows.join('').replaceAll('.', '').length;
    const covered = spritePixels(drawing).reduce((total, run) => total + run.width, 0);
    expect(covered).toBe(painted);
  });
});

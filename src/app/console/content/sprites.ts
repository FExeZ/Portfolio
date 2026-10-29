import type { CartridgeIcon } from './projects';

/** Ícono en pixel art: cada letra de `rows` es un píxel con el color de la paleta; '.' es transparente. */
export interface Sprite {
  palette: Readonly<Record<string, string>>;
  rows: readonly string[];
}

export interface PixelRun {
  x: number;
  y: number;
  width: number;
  fill: string;
}

/** Lado de los íconos de cartuchos, insignias y logros. Los objetos de la habitación miden lo suyo. */
export const SPRITE_SIZE = 12;

export function spriteSize(sprite: Sprite): { width: number; height: number } {
  return { width: sprite.rows[0]?.length ?? 0, height: sprite.rows.length };
}

// Colores de la FZ-16 y algunos propios de los íconos.
const YELLOW = '#ffd23f';
const WHITE = '#f4f6ff';
const BLUE = '#1d3fd1';
const LIGHT_BLUE = '#8fb6ff';
const RED = '#c42b2b';
const GRAY = '#7f8bb8';
const GREEN = '#3fb950';
const BROWN = '#8a5a14';
const PINK = '#ff7fb6';
const LIGHT_GREEN = '#8ee36a';

/** Íconos originales de las etiquetas de los cartuchos (RF-45, RNF-2). */
export const CARTRIDGE_SPRITES: Readonly<Record<CartridgeIcon, Sprite>> = {
  // MusicApp
  note: {
    palette: { y: YELLOW },
    rows: [
      '.....yyyyy..',
      '.....y...yy.',
      '.....y....y.',
      '.....y......',
      '.....y......',
      '.....y......',
      '.....y......',
      '..yyyy......',
      '.yyyyy......',
      '.yyyyy......',
      '..yyy.......',
      '............'
    ]
  },
  // GetTaskedApp
  checklist: {
    palette: { w: WHITE, b: BLUE, v: GREEN, g: GRAY },
    rows: [
      '....bbbb....',
      '.wwwbbbbwww.',
      '.wwwwwwwwww.',
      '.wvvwggggww.',
      '.wwwwwwwwww.',
      '.wvvwggggww.',
      '.wwwwwwwwww.',
      '.wvvwggggww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '.wwwwwwwwww.',
      '............'
    ]
  },
  // COPLAC: simulador de comisiones
  percent: {
    palette: { l: LIGHT_BLUE },
    rows: [
      '............',
      '.ll......l..',
      '.ll.....l...',
      '.......l....',
      '......l.....',
      '.....l......',
      '....l.......',
      '...l........',
      '..l.....ll..',
      '.l......ll..',
      '............',
      '............'
    ]
  },
  // APIRest
  plug: {
    palette: { y: YELLOW, g: GRAY, b: BLUE },
    rows: [
      '...y....y...',
      '...y....y...',
      '...y....y...',
      '..gggggggg..',
      '..gggggggg..',
      '..gggggggg..',
      '...gggggg...',
      '....gggg....',
      '.....gg.....',
      '.....gg.....',
      '.....bb.....',
      '....bb......'
    ]
  },
  // CRUD Java MySQL
  database: {
    palette: { l: LIGHT_BLUE, b: BLUE },
    rows: [
      '...llllll...',
      '.llllllllll.',
      '.bllllllllb.',
      '.bbbbbbbbbb.',
      '.bbbbbbbbbb.',
      '.llbbbbbbll.',
      '.bbllllllbb.',
      '.bbbbbbbbbb.',
      '.llbbbbbbll.',
      '.bbllllllbb.',
      '..bbbbbbbb..',
      '............'
    ]
  },
  // Maqueta Web Pizzería
  pizza: {
    palette: { n: BROWN, y: YELLOW, r: RED },
    rows: [
      '.nnnnnnnnnn.',
      '.nyyyyyyyyn.',
      '..yyyryyyy..',
      '..yyyyyyry..',
      '...yryyyy...',
      '...yyyyyy...',
      '....yyry....',
      '....yyyy....',
      '.....yy.....',
      '.....yy.....',
      '............',
      '............'
    ]
  },
  // FaseLunarApp
  moon: {
    palette: { y: YELLOW },
    rows: [
      '....yyyy....',
      '..yyyy......',
      '.yyyy.......',
      '.yyy........',
      'yyyy........',
      'yyyy........',
      'yyyy........',
      'yyyy........',
      '.yyy........',
      '.yyyy.......',
      '..yyyyy.....',
      '....yyyy....'
    ]
  },
  // Conversor de Monedas
  coin: {
    palette: { n: BROWN, y: YELLOW, w: WHITE },
    rows: [
      '....nnnn....',
      '..nnyyyynn..',
      '.nyyyyyyyyn.',
      '.nyywyyyyyn.',
      'nyywyyyyyyyn',
      'nyywyyyyyyyn',
      'nyyyyyyyyyyn',
      'nyyyyyyyyyyn',
      '.nyyyyyyyyn.',
      '.nyyyyyyyyn.',
      '..nnyyyynn..',
      '....nnnn....'
    ]
  },
  // Simpsonsdle: una dona genérica, sin la estética de la serie (RNF-2)
  donut: {
    palette: { n: BROWN, p: PINK, w: WHITE, b: BLUE, y: YELLOW },
    rows: [
      '....nnnn....',
      '..nppppppn..',
      '.nppwppbppn.',
      '.npppppppyn.',
      'nppbp..ppppn',
      'npppp..pwppn',
      'nppppppppppn',
      '.nnppyppppn.',
      '.nnnnnnnnnn.',
      '..nnnnnnnn..',
      '....nnnn....',
      '............'
    ]
  },
  // Cartucho secreto: el Snake de "Mi primer programa" (RF-74), con la comida abajo.
  snake: {
    palette: { g: GREEN, h: LIGHT_GREEN, w: WHITE, r: RED },
    rows: [
      '............',
      '.gggggggghw.',
      '.gggggggghh.',
      '.gg.........',
      '.gg.........',
      '.gggggggggg.',
      '.gggggggggg.',
      '.........gg.',
      '.........gg.',
      '.rr..gggggg.',
      '.rr..gggggg.',
      '............'
    ]
  }
};

/** Trofeo de los logros desbloqueados: las certificaciones (RF-43). */
export const ACHIEVEMENT_SPRITE: Sprite = {
  palette: { y: YELLOW, n: BROWN },
  rows: [
    '..yyyyyyyy..',
    'yyyyyyyyyyyy',
    'y.yyyyyyyy.y',
    'y.yyyyyyyy.y',
    '.yyyyyyyyyy.',
    '...yyyyyy...',
    '....yyyy....',
    '.....yy.....',
    '.....yy.....',
    '....nnnn....',
    '...nnnnnn...',
    '...nnnnnn...'
  ]
};

/**
 * Fondo de la insignia de una tecnología: un azulejo con relieve en el color de su categoría.
 * La abreviatura se escribe encima con la fuente pixel.
 */
export function badgeSprite(color: string): Sprite {
  return {
    palette: { k: '#06081a', w: '#ffffff66', s: '#00000066', c: color },
    rows: [
      '.kkkkkkkkkk.',
      'kwwwwwwwwwsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kwccccccccsk',
      'kssssssssssk',
      '.kkkkkkkkkk.'
    ]
  };
}

/** Píxeles seguidos del mismo color, juntados en tiras horizontales para dibujar menos rectángulos. */
export function spritePixels(sprite: Sprite): PixelRun[] {
  const runs: PixelRun[] = [];
  sprite.rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const key = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === key) end++;
      const fill = sprite.palette[key];
      if (key !== '.' && fill) runs.push({ x, y, width: end - x, fill });
      x = end;
    }
  });
  return runs;
}

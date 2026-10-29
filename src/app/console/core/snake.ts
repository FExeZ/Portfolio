/** Tablero de 4:3, como la pantalla (RF-76). */
export const SNAKE_COLUMNS = 20;
export const SNAKE_ROWS = 15;

/** Cada cuánto avanza la serpiente; el store corre el temporizador. */
export const SNAKE_TICK_MS = 140;

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Cell {
  x: number;
  y: number;
}

export interface SnakeGame {
  /** La cabeza primero. */
  body: Cell[];
  /** Hacia dónde fue el último paso. */
  direction: Direction;
  /** Hacia dónde va el próximo paso. */
  next: Direction;
  food: Cell;
  score: number;
  /** `ready` espera el primer movimiento; `over` es el Game Over (RF-77). */
  status: 'ready' | 'playing' | 'paused' | 'over';
}

const STEP: Readonly<Record<Direction, Cell>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const OPPOSITE: Readonly<Record<Direction, Direction>> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
};

/** Tres celdas en el centro mirando a la derecha, con la comida adelante. */
export function newSnake(): SnakeGame {
  const x = SNAKE_COLUMNS / 2;
  const y = Math.floor(SNAKE_ROWS / 2);
  return {
    body: [
      { x, y },
      { x: x - 1, y },
      { x: x - 2, y }
    ],
    direction: 'right',
    next: 'right',
    food: { x: x + 4, y },
    score: 0,
    status: 'ready'
  };
}

/**
 * Elige la dirección del próximo paso. No deja darse vuelta sobre sí misma, y en `ready` o
 * `paused` arranca el juego.
 */
export function steerSnake(game: SnakeGame, direction: Direction): SnakeGame {
  if (game.status === 'over' || direction === OPPOSITE[game.direction]) return game;
  return { ...game, next: direction, status: 'playing' };
}

/** Un paso del juego. `random`, de 0 a 1, elige dónde aparece la comida nueva. */
export function stepSnake(game: SnakeGame, random: number): SnakeGame {
  if (game.status !== 'playing') return game;
  const direction = game.next;
  const [head] = game.body;
  const target = { x: head.x + STEP[direction].x, y: head.y + STEP[direction].y };
  const eats = sameCell(target, game.food);
  // La cola se corre en este mismo paso, salvo que la serpiente coma y crezca.
  const rest = eats ? game.body : game.body.slice(0, -1);
  if (!inside(target) || rest.some((cell) => sameCell(cell, target))) {
    return { ...game, direction, status: 'over' };
  }
  const body = [target, ...rest];
  if (!eats) return { ...game, body, direction };
  const free = freeCells(body);
  return {
    ...game,
    body,
    direction,
    score: game.score + 1,
    food: free[Math.floor(random * free.length)] ?? game.food,
    status: free.length === 0 ? 'over' : 'playing'
  };
}

function sameCell(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

function inside({ x, y }: Cell): boolean {
  return x >= 0 && x < SNAKE_COLUMNS && y >= 0 && y < SNAKE_ROWS;
}

/** Las celdas sin serpiente, en orden de lectura. */
function freeCells(body: Cell[]): Cell[] {
  const taken = new Set(body.map(({ x, y }) => y * SNAKE_COLUMNS + x));
  const free: Cell[] = [];
  for (let index = 0; index < SNAKE_COLUMNS * SNAKE_ROWS; index++) {
    if (!taken.has(index)) free.push({ x: index % SNAKE_COLUMNS, y: Math.floor(index / SNAKE_COLUMNS) });
  }
  return free;
}

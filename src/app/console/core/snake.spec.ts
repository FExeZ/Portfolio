import { describe, expect, it } from 'vitest';
import { Cell, SNAKE_COLUMNS, SNAKE_ROWS, SnakeGame, newSnake, steerSnake, stepSnake } from './snake';

/** Un juego en marcha con el cuerpo, la dirección y la comida que pide cada test. */
function playing(body: Cell[], direction: SnakeGame['direction'], food: Cell): SnakeGame {
  return { body, direction, next: direction, food, score: 0, status: 'playing' };
}

describe('newSnake (RF-76)', () => {
  const game = newSnake();

  it('arranca con 3 celdas en el centro, mirando a la derecha y esperando el primer movimiento', () => {
    const [head] = game.body;
    expect(game.body).toEqual([head, { x: head.x - 1, y: head.y }, { x: head.x - 2, y: head.y }]);
    expect(head.x).toBe(SNAKE_COLUMNS / 2);
    expect(head.y).toBe(Math.floor(SNAKE_ROWS / 2));
    expect(game.direction).toBe('right');
    expect(game.status).toBe('ready');
    expect(game.score).toBe(0);
  });

  it('pone la comida a la derecha de la cabeza, en su misma fila', () => {
    expect(game.food.y).toBe(game.body[0].y);
    expect(game.food.x).toBeGreaterThan(game.body[0].x);
  });
});

describe('steerSnake', () => {
  it('la primera dirección arranca el juego', () => {
    const game = steerSnake(newSnake(), 'up');
    expect(game.status).toBe('playing');
    expect(game.next).toBe('up');
  });

  it('no deja darse vuelta sobre sí misma, ni siquiera para arrancar', () => {
    const ready = newSnake();
    expect(steerSnake(ready, 'left')).toBe(ready);
    const moving = playing([{ x: 5, y: 5 }, { x: 4, y: 5 }], 'right', { x: 0, y: 0 });
    expect(steerSnake(moving, 'left')).toBe(moving);
  });

  it('compara con la dirección del último paso: girar dos veces antes de avanzar vale', () => {
    const moving = playing([{ x: 5, y: 5 }, { x: 4, y: 5 }], 'right', { x: 0, y: 0 });
    expect(steerSnake(steerSnake(moving, 'up'), 'down').next).toBe('down');
  });

  it('en pausa, una dirección la reanuda; con el juego terminado no hace nada', () => {
    const paused: SnakeGame = { ...newSnake(), status: 'paused' };
    expect(steerSnake(paused, 'down').status).toBe('playing');
    const over: SnakeGame = { ...newSnake(), status: 'over' };
    expect(steerSnake(over, 'down')).toBe(over);
  });
});

describe('stepSnake', () => {
  it('avanza una celda hacia la dirección elegida', () => {
    const game = stepSnake(steerSnake(newSnake(), 'down'), 0);
    const [head] = newSnake().body;
    expect(game.body).toEqual([{ x: head.x, y: head.y + 1 }, head, { x: head.x - 1, y: head.y }]);
    expect(game.direction).toBe('down');
  });

  it.each(['ready', 'paused', 'over'] as const)('en %s no se mueve', (status) => {
    const game: SnakeGame = { ...newSnake(), status };
    expect(stepSnake(game, 0)).toBe(game);
  });

  it.each([
    ['right', { x: SNAKE_COLUMNS - 1, y: 3 }],
    ['left', { x: 0, y: 3 }],
    ['up', { x: 3, y: 0 }],
    ['down', { x: 3, y: SNAKE_ROWS - 1 }]
  ] as const)('termina si choca contra el borde yendo hacia %s (RF-77)', (direction, head) => {
    const game = stepSnake(playing([head], direction, { x: 10, y: 10 }), 0);
    expect(game.status).toBe('over');
    expect(game.body).toEqual([head]);
  });

  it('termina si choca contra sí misma (RF-77)', () => {
    const body = [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 1, y: 0 }
    ];
    const game = stepSnake(steerSnake(playing(body, 'up', { x: 9, y: 9 }), 'left'), 0);
    expect(game.status).toBe('over');
  });

  it('puede entrar a la celda de la cola, porque la cola se corre en ese mismo paso', () => {
    const body = [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 0, y: 0 }
    ];
    const game = stepSnake(steerSnake(playing(body, 'left', { x: 9, y: 9 }), 'up'), 0);
    expect(game.status).toBe('playing');
    expect(game.body).toEqual([{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]);
  });

  it('al comer crece, suma un punto y pone comida nueva en una celda libre', () => {
    const body = [
      { x: 1, y: 0 },
      { x: 0, y: 0 }
    ];
    const game = stepSnake(playing(body, 'right', { x: 2, y: 0 }), 0);
    expect(game.body).toEqual([{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }]);
    expect(game.score).toBe(1);
    expect(game.body).not.toContainEqual(game.food);
  });

  it('elige la celda libre según `random`, en orden de lectura', () => {
    const body = [
      { x: 1, y: 0 },
      { x: 0, y: 0 }
    ];
    // Libres después de comer en (2, 0): de (3, 0) a la última celda del tablero.
    expect(stepSnake(playing(body, 'right', { x: 2, y: 0 }), 0).food).toEqual({ x: 3, y: 0 });
    expect(stepSnake(playing(body, 'right', { x: 2, y: 0 }), 0.9999).food).toEqual({
      x: SNAKE_COLUMNS - 1,
      y: SNAKE_ROWS - 1
    });
  });

  it('termina cuando la serpiente llena el tablero', () => {
    // Recorrido en zigzag por todas las celdas: la serpiente ocupa todas menos la última, que es la comida.
    const path: Cell[] = [];
    for (let y = 0; y < SNAKE_ROWS; y++) {
      for (let i = 0; i < SNAKE_COLUMNS; i++) path.push({ x: y % 2 === 0 ? i : SNAKE_COLUMNS - 1 - i, y });
    }
    const food = path[path.length - 1];
    const body = path.slice(0, -1).reverse();
    const direction = SNAKE_ROWS % 2 === 1 ? 'right' : 'left';
    const game = stepSnake(playing(body, direction, food), 0);
    expect(game.body).toHaveLength(SNAKE_COLUMNS * SNAKE_ROWS);
    expect(game.score).toBe(1);
    expect(game.status).toBe('over');
  });
});

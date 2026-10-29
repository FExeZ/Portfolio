import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioService } from './audio.service';

/** Parámetro de audio que registra lo que se le programa. */
class FakeParam {
  value = 0;
  readonly calls: [string, number, number][] = [];
  setValueAtTime(value: number, time: number): void {
    this.calls.push(['set', value, time]);
  }
  linearRampToValueAtTime(value: number, time: number): void {
    this.calls.push(['linear', value, time]);
  }
  exponentialRampToValueAtTime(value: number, time: number): void {
    this.calls.push(['exponential', value, time]);
  }
}

class FakeNode {
  readonly connections: unknown[] = [];
  disconnected = false;
  connect(target: unknown): unknown {
    this.connections.push(target);
    return target;
  }
  disconnect(): void {
    this.disconnected = true;
  }
}

class FakeGain extends FakeNode {
  readonly gain = new FakeParam();
}

class FakeScheduled extends FakeNode {
  startedAt?: number;
  stoppedAt?: number;
  start(time: number): void {
    this.startedAt = time;
  }
  stop(time: number): void {
    this.stoppedAt = time;
  }
}

class FakeOscillator extends FakeScheduled {
  type = 'sine';
  readonly frequency = new FakeParam();
}

class FakeBufferSource extends FakeScheduled {
  buffer: unknown = null;
  loop = false;
}

/** AudioContext mínimo: arranca suspendido, como en un navegador real. */
class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state = 'suspended';
  currentTime = 10;
  sampleRate = 8000;
  readonly destination = new FakeNode();
  readonly gains: FakeGain[] = [];
  readonly oscillators: FakeOscillator[] = [];
  readonly sources: FakeBufferSource[] = [];
  buffersCreated = 0;

  constructor() {
    FakeAudioContext.instances.push(this);
  }
  resume(): Promise<void> {
    this.state = 'running';
    return Promise.resolve();
  }
  createGain(): FakeGain {
    const node = new FakeGain();
    this.gains.push(node);
    return node;
  }
  createOscillator(): FakeOscillator {
    const node = new FakeOscillator();
    this.oscillators.push(node);
    return node;
  }
  createBufferSource(): FakeBufferSource {
    const node = new FakeBufferSource();
    this.sources.push(node);
    return node;
  }
  createBuffer(_channels: number, length: number): { getChannelData: () => Float32Array } {
    this.buffersCreated++;
    const data = new Float32Array(length);
    return { getChannelData: () => data };
  }
}

function lastContext(): FakeAudioContext {
  const ctx = FakeAudioContext.instances.at(-1);
  if (!ctx) throw new Error('No se creó ningún AudioContext');
  return ctx;
}

describe('AudioService', () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('no crea el contexto antes de la primera interacción (RF-62)', () => {
    const audio = new AudioService();
    expect(() => audio.play('cursor')).not.toThrow();
    expect(FakeAudioContext.instances).toHaveLength(0);
  });

  it('crea un solo contexto al desbloquear y lo reanuda', () => {
    const audio = new AudioService();
    audio.unlock();
    audio.unlock();
    expect(FakeAudioContext.instances).toHaveLength(1);
    expect(lastContext().state).toBe('running');
  });

  it('no lanza errores si el navegador no deja crear el contexto', () => {
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('NotAllowedError');
        }
      }
    );
    const audio = new AudioService();
    expect(() => audio.unlock()).not.toThrow();
    expect(() => audio.play('select')).not.toThrow();
  });

  it('no lanza errores en un navegador sin Web Audio', () => {
    vi.stubGlobal('AudioContext', undefined);
    const audio = new AudioService();
    expect(() => audio.unlock()).not.toThrow();
    expect(() => audio.play('select')).not.toThrow();
  });

  it('todo pasa por el volumen general, conectado a la salida', () => {
    new AudioService().unlock();
    const ctx = lastContext();
    const master = ctx.gains[0];
    expect(master.gain.value).toBe(0.25);
    expect(master.connections).toContain(ctx.destination);
  });

  it('programa cada nota con su oscilador, su frecuencia y su envolvente', () => {
    const audio = new AudioService();
    audio.unlock();
    const ctx = lastContext();
    audio.play('cursor');

    expect(ctx.oscillators).toHaveLength(1);
    const osc = ctx.oscillators[0];
    expect(osc.type).toBe('square');
    expect(osc.frequency.calls[0]).toEqual(['set', 1046.5, 10]);
    expect(osc.startedAt).toBe(10);
    expect(osc.stoppedAt).toBeGreaterThanOrEqual(10.04);

    const envelope = ctx.gains[1];
    expect(osc.connections).toContain(envelope);
    expect(envelope.connections).toContain(ctx.gains[0]);
    expect(envelope.gain.calls.map(([kind]) => kind)).toEqual(['set', 'linear', 'exponential']);
    expect(envelope.gain.calls[2][2]).toBeCloseTo(10.04);
  });

  it('respeta el momento de cada nota dentro del sonido', () => {
    const audio = new AudioService();
    audio.unlock();
    audio.play('select');
    const carriers = lastContext().oscillators.filter((osc) => osc.type === 'square');
    expect(carriers.map((osc) => osc.startedAt)).toEqual([10, 10.06]);
  });

  it('el timbre FM agrega un modulador conectado a la frecuencia', () => {
    const audio = new AudioService();
    audio.unlock();
    audio.play('select');
    const ctx = lastContext();
    const carrier = ctx.oscillators.find((osc) => osc.type === 'square');
    const modulator = ctx.oscillators.find((osc) => osc.type === 'sine');
    expect(carrier).toBeDefined();
    expect(modulator).toBeDefined();
    const depth = ctx.gains.find((gain) => modulator?.connections.includes(gain));
    expect(depth?.connections).toContain(carrier?.frequency);
  });

  it('el deslizamiento de tono programa una rampa hasta la frecuencia final', () => {
    const audio = new AudioService();
    audio.unlock();
    audio.play('power');
    const osc = lastContext().oscillators[0];
    expect(osc.frequency.calls.some(([kind, value]) => kind === 'exponential' && value === 220)).toBe(
      true
    );
  });

  it('el ruido usa un búfer creado una sola vez, en lugar de un oscilador', () => {
    const audio = new AudioService();
    audio.unlock();
    audio.play('static');
    audio.play('static');
    const ctx = lastContext();
    expect(ctx.oscillators).toHaveLength(0);
    expect(ctx.sources).toHaveLength(2);
    expect(ctx.buffersCreated).toBe(1);
    expect(ctx.sources[0].buffer).toBe(ctx.sources[1].buffer);
  });

  it('stop corta lo que está sonando: desconecta el volumen general y crea otro (RF-61)', () => {
    const audio = new AudioService();
    audio.unlock();
    const ctx = lastContext();
    audio.play('cyclone');
    const [old] = ctx.gains;
    audio.stop();
    expect(old.disconnected).toBe(true);
    audio.play('cursor');
    const fresh = ctx.gains.find((gain) => gain !== old && gain.connections.includes(ctx.destination));
    expect(fresh?.gain.value).toBe(0.25);
    expect(ctx.gains.at(-1)?.connections).toContain(fresh);
  });

  it('stop no hace nada antes de la primera interacción', () => {
    expect(() => new AudioService().stop()).not.toThrow();
  });
});

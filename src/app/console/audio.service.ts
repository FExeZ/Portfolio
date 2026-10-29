import { Injectable } from '@angular/core';
import { Note, SOUNDS, SoundId, Wave } from './core/sound';

const MASTER_VOLUME = 0.25;
const ATTACK_S = 0.005;
/** Margen para que el oscilador se apague después de que la envolvente llegó al silencio. */
const RELEASE_S = 0.02;
/** Las rampas exponenciales no pueden llegar a 0. */
const SILENCE = 0.0001;

function createMaster(ctx: AudioContext): GainNode {
  const master = ctx.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(ctx.destination);
  return master;
}

/**
 * Sintetiza los sonidos del banco con Web Audio, sin archivos (RF-59). Es el único lugar
 * que usa Web Audio.
 */
@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  /**
   * Hay que llamarlo dentro de un gesto del visitante: el navegador solo deja arrancar el
   * audio así. Antes de eso no hay contexto y nada suena (RF-62).
   */
  unlock(): void {
    try {
      if (!this.ctx) {
        const ctx = new AudioContext();
        this.ctx = ctx;
        this.master = createMaster(ctx);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => undefined);
    } catch {
      // Navegador sin Web Audio o que no deja crear el contexto: el sitio sigue en silencio.
      this.ctx = null;
      this.master = null;
    }
  }

  play(id: SoundId): void {
    const { ctx, master } = this;
    // Un contexto recién creado arranca 'suspended' y pasa a 'running' enseguida:
    // lo que se programa en ese instante suena igual.
    if (!ctx || !master || ctx.state === 'closed') return;
    const start = ctx.currentTime;
    for (const note of SOUNDS[id]) this.schedule(ctx, master, note, start + note.at / 1000);
  }

  /**
   * Corta lo que está sonando: el canto del Modo Ciclón dura varios segundos (RF-61, RF-72).
   * Las notas ya programadas siguen conectadas al volumen general viejo, que queda sin salida.
   */
  stop(): void {
    const { ctx, master } = this;
    if (!ctx || !master) return;
    master.disconnect();
    this.master = createMaster(ctx);
  }

  private schedule(ctx: AudioContext, master: GainNode, note: Note, t0: number): void {
    const t1 = t0 + note.dur / 1000;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t0);
    envelope.gain.linearRampToValueAtTime(note.gain, t0 + ATTACK_S);
    envelope.gain.exponentialRampToValueAtTime(SILENCE, t1);
    envelope.connect(master);

    const source =
      note.wave === 'noise'
        ? this.noiseSource(ctx)
        : this.oscillator(ctx, note, note.wave, t0, t1);
    source.connect(envelope);
    source.start(t0);
    source.stop(t1 + RELEASE_S);
  }

  private oscillator(
    ctx: AudioContext,
    note: Note,
    wave: Exclude<Wave, 'noise'>,
    t0: number,
    t1: number
  ): OscillatorNode {
    const freq = note.freq ?? 440;
    const osc = ctx.createOscillator();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, t0);
    if (note.freqEnd) osc.frequency.exponentialRampToValueAtTime(note.freqEnd, t1);
    if (note.fm) {
      // FM simple: un modulador senoidal que hace vibrar la frecuencia del oscilador principal.
      const modulator = ctx.createOscillator();
      modulator.frequency.value = freq * note.fm.ratio;
      const depth = ctx.createGain();
      depth.gain.value = freq * note.fm.depth;
      modulator.connect(depth);
      depth.connect(osc.frequency);
      modulator.start(t0);
      modulator.stop(t1 + RELEASE_S);
    }
    return osc;
  }

  /** Ruido blanco de 1 s, creado una sola vez y repetido en bucle. */
  private noiseSource(ctx: AudioContext): AudioBufferSourceNode {
    if (!this.noise) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buffer;
    }
    const source = ctx.createBufferSource();
    source.buffer = this.noise;
    source.loop = true;
    return source;
  }
}

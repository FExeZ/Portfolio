import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { AudioService } from './audio.service';
import { ROOM_OBJECTS, pagesOf } from './content/room';
import { BootStepId, bootStepAt, bootSteps } from './core/boot-timeline';
import { transitionMs } from './core/camera';
import {
  Action,
  ConsoleState,
  Effect,
  initialState,
  reduce,
  shotOf
} from './core/console-state';
import { CodeInput, NOTICE_MS, NoticeId, noticeFor, pushCode } from './core/easter-eggs';
import type { InputAction } from './core/input';
import { KeyValueStore, PreferenceKey, loadPreferences, savePreference, saveRecord } from './core/preferences';
import { SectionId, fromHash, popStateAction, toHash, urlUpdate } from './core/route';
import {
  Dialog,
  SectionView,
  exitsSection,
  initialView,
  insertMs,
  isInserting,
  snakeOf
} from './core/section-state';
import { SoundId, soundFor } from './core/sound';
import { SNAKE_TICK_MS } from './core/snake';
import { CHAR_MS, blipAt, visibleChars } from './core/typewriter';

type Timer = ReturnType<typeof setTimeout>;

/** Marca de las entradas del historial que crea la consola al entrar a una sección. */
const HISTORY_MARK = { fz16: true };

function sectionOf(state: ConsoleState): SectionId | null {
  return state.screen.kind === 'section' ? state.screen.id : null;
}

/** El diálogo de la habitación cuya página se está escribiendo, con la cámara ya quieta. */
function typingDialog(state: ConsoleState): Dialog | null {
  const dialog = state.view?.id === 'about' ? state.view.dialog : null;
  return dialog?.typing && !state.transitioning ? dialog : null;
}

function isOwnHistoryEntry(): boolean {
  const entry: unknown = history.state;
  return typeof entry === 'object' && entry !== null && 'fz16' in entry && entry.fz16 === true;
}

/** localStorage puede lanzar error solo con leer la propiedad (navegación privada estricta). */
function browserStorage(): KeyValueStore | null {
  try {
    return localStorage;
  } catch {
    return null;
  }
}

/**
 * Estado de la consola. Es el único lugar que toca APIs del navegador: la lógica vive
 * en core/ y acá solo se ejecutan los temporizadores, el guardado y los efectos.
 */
@Injectable({ providedIn: 'root' })
export class ConsoleStore {
  private readonly language = inject(LanguageService);
  private readonly audio = inject(AudioService);
  private readonly storage = browserStorage();
  private readonly motionQuery =
    typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

  private readonly _state = signal<ConsoleState>(
    initialState(loadPreferences(this.storage), fromHash(location.hash))
  );
  private readonly _reducedMotion = signal(this.motionQuery?.matches ?? false);
  private readonly _bootStep = signal<BootStepId | 'done'>('done');
  private readonly _typed = signal(0);
  private readonly _textMode = signal(fromHash(location.hash) === 'text');
  private readonly _notice = signal<NoticeId | null>(null);

  readonly state = this._state.asReadonly();
  readonly reducedMotion = this._reducedMotion.asReadonly();
  readonly bootStep = this._bootStep.asReadonly();
  readonly shot = computed(() => shotOf(this._state()));
  /** Letras visibles de la página del diálogo mientras se escribe (RF-32). */
  readonly typed = this._typed.asReadonly();
  /** El modo texto está abierto (`#/text`); la consola sigue detrás, como estaba (RF-68). */
  readonly textMode = this._textMode.asReadonly();
  /** A dónde vuelve "Volver a FZ-16": la sección abierta, o la raíz (`#/`, para no recargar). */
  readonly consoleHash = computed(() => toHash(sectionOf(this._state())) || '#/');
  /** El cartel que anuncia un secreto; se va solo a los NOTICE_MS (RF-71). */
  readonly notice = this._notice.asReadonly();

  private transitionTimer?: Timer;
  private noticeTimer?: Timer;
  private insertTimer?: Timer;
  private bootTimers: Timer[] = [];
  private typeTimer?: ReturnType<typeof setInterval>;
  private snakeTimer?: ReturnType<typeof setInterval>;
  /** Página que se está escribiendo ("objeto:página"), para no reiniciarla en cada acción. */
  private typingPage: string | null = null;
  /** Últimas entradas del código del Modo Ciclón. */
  private recentCode: CodeInput[] = [];

  constructor() {
    const onMotionChange = (event: MediaQueryListEvent) => this._reducedMotion.set(event.matches);
    const onPopState = () => this.onPopState();
    // RF-80: con la pestaña oculta, Snake se pausa.
    const onVisibility = () => {
      if (document.hidden) this.dispatch({ type: 'pause' });
    };
    this.motionQuery?.addEventListener('change', onMotionChange);
    addEventListener('popstate', onPopState);
    document.addEventListener('visibilitychange', onVisibility);
    inject(DestroyRef).onDestroy(() => {
      this.motionQuery?.removeEventListener('change', onMotionChange);
      removeEventListener('popstate', onPopState);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(this.transitionTimer);
      clearTimeout(this.insertTimer);
      clearTimeout(this.noticeTimer);
      clearInterval(this.typeTimer);
      clearInterval(this.snakeTimer);
      this.stopBoot();
    });
    // RF-54: si cambia el idioma con una página a medio escribir, se muestra completa en el otro.
    effect(() => {
      this.language.lang();
      untracked(() => {
        if (typingDialog(this._state())) this.dispatch({ type: 'typeDone' });
      });
    });
    // Un hash desconocido abre la title screen y se borra de la dirección (RF-24).
    this.syncUrl();
    // Un link directo a Simpsonsdle arranca insertando el cartucho.
    this.syncInsertTimer(null, this._state().view);
  }

  /**
   * Una tecla o un botón de la Pocket. Primero cuenta para el código del Modo Ciclón (RF-71):
   * la entrada que lo completa no llega a la consola, así la A final no confirma nada.
   * Devuelve si se usó, igual que dispatch.
   */
  press(action: InputAction | null, code: CodeInput | null): boolean {
    if (code) {
      const { recent, matched } = pushCode(this.recentCode, code);
      this.recentCode = recent;
      if (matched && this.dispatch({ type: 'toggleCyclone' })) return true;
    }
    return action ? this.dispatch(action) : false;
  }

  /** Devuelve si la consola usó la acción, para saber si hay que frenar al navegador. */
  dispatch(action: Action): boolean {
    if (this.leaveSectionThroughHistory(action)) return true;
    const prev = this._state();
    const result = reduce(prev, action);
    const { state: next, effects } = result;
    this._state.set(next);
    effects.forEach((effect) => this.run(effect));
    // El canto del Modo Ciclón dura varios segundos: silenciar o apagar el modo lo corta.
    if ((prev.prefs.sound && !next.prefs.sound) || (prev.cyclone && !next.cyclone)) this.audio.stop();
    this.playSound(soundFor(prev, result, action));
    this.showNotice(noticeFor(prev, next));

    if (next.transitioning !== prev.transitioning) this.onTransitionChange(next.transitioning);
    if (next.screen.kind === 'boot' && prev.screen.kind !== 'boot') this.startBoot();
    if (prev.screen.kind === 'boot' && next.screen.kind !== 'boot') this.stopBoot();
    this.syncInsertTimer(prev.view, next.view);
    this.syncTypewriter(next);
    this.syncSnake(next);
    this.persist(prev, next);
    this.syncUrl();
    return next !== prev || effects.length > 0;
  }

  /**
   * Salir de una sección a la que se entró desde el menú (con B o eligiendo la tele de la
   * habitación) vuelve por el historial: así B, la tele y el botón "atrás" del navegador
   * recorren el mismo camino (RF-25, RF-38).
   */
  private leaveSectionThroughHistory(action: Action): boolean {
    const state = this._state();
    const id = sectionOf(state);
    if (!id || state.transitioning || !isOwnHistoryEntry()) return false;
    // En un manual o un diálogo, B vuelve un nivel; durante una inserción, se ignora.
    if (!exitsSection(state.view ?? initialView(id), action)) return false;
    history.back();
    return true;
  }

  private onPopState(): void {
    const textMode = fromHash(location.hash) === 'text';
    this._textMode.set(textMode);
    // La consola queda detrás del modo texto: una partida de Snake no sigue sola.
    if (textMode) {
      this.dispatch({ type: 'pause' });
      return;
    }
    const action = popStateAction(sectionOf(this._state()), location.hash);
    if (action) this.dispatch(action);
    // Si la consola ignoró el cambio (por ejemplo, durante un zoom), la dirección vuelve a su estado.
    else this.syncUrl();
  }

  /** La dirección refleja la sección abierta (RF-22), salvo con el modo texto abierto. */
  private syncUrl(): void {
    if (this._textMode()) return;
    const next = toHash(sectionOf(this._state()));
    switch (urlUpdate(location.hash, next)) {
      case 'push':
        history.pushState(HISTORY_MARK, '', next);
        break;
      case 'replace':
        history.replaceState(null, '', next || location.pathname + location.search);
        break;
    }
  }

  private run(effect: Effect): void {
    switch (effect.type) {
      case 'toggleLang':
        this.language.toggle();
        break;
      case 'openUrl':
        // El email abre el cliente de correo sin salir del sitio; el resto, en una pestaña nueva.
        if (effect.url.startsWith('mailto:')) window.open(effect.url, '_self');
        else window.open(effect.url, '_blank', 'noopener');
        break;
    }
  }

  private showNotice(notice: NoticeId | null): void {
    if (!notice) return;
    clearTimeout(this.noticeTimer);
    this._notice.set(notice);
    this.noticeTimer = setTimeout(() => this._notice.set(null), NOTICE_MS);
  }

  /** La transición dura lo mismo que la animación CSS de la cámara. */
  private onTransitionChange(transitioning: boolean): void {
    clearTimeout(this.transitionTimer);
    if (transitioning) {
      this.transitionTimer = setTimeout(
        () => this.dispatch({ type: 'transitionEnd' }),
        transitionMs(this._reducedMotion())
      );
    }
  }

  /** Programa el final de la animación de inserción cuando empieza una (RF-46, RF-47). */
  private syncInsertTimer(prev: SectionView | null, next: SectionView | null): void {
    const wasInserting = prev !== null && isInserting(prev);
    const inserting = next !== null && isInserting(next);
    if (inserting && !wasInserting) {
      clearTimeout(this.insertTimer);
      this.insertTimer = setTimeout(
        () => this.dispatch({ type: 'insertDone' }),
        insertMs(this._reducedMotion())
      );
    } else if (!inserting) {
      clearTimeout(this.insertTimer);
    }
  }

  /**
   * Máquina de escribir de los diálogos (RF-32): cuando la cámara llega al objeto, la página
   * aparece letra por letra con su tecla, y al terminar se despacha `typeDone`.
   */
  private syncTypewriter(state: ConsoleState): void {
    const dialog = typingDialog(state);
    const page = dialog ? `${dialog.object}:${dialog.page}` : null;
    if (page === this.typingPage) return;
    clearInterval(this.typeTimer);
    this.typingPage = page;
    if (!dialog) return;
    this._typed.set(0);
    let elapsed = 0;
    this.typeTimer = setInterval(() => {
      // El texto se lee en cada letra por si cambia el idioma (RF-54).
      const text = this.pageText(dialog);
      elapsed += CHAR_MS;
      const before = this._typed();
      const after = visibleChars(text.length, elapsed);
      this._typed.set(after);
      if (blipAt(text, before, after)) this.playSound('type');
      if (after >= text.length) this.dispatch({ type: 'typeDone' });
    }, CHAR_MS);
  }

  /** Snake avanza un paso cada SNAKE_TICK_MS mientras se juega; la comida cae al azar (RF-76). */
  private syncSnake(state: ConsoleState): void {
    const playing = snakeOf(state.view)?.status === 'playing' && !this._textMode();
    if (playing && this.snakeTimer === undefined) {
      this.snakeTimer = setInterval(
        () => this.dispatch({ type: 'tick', random: Math.random() }),
        SNAKE_TICK_MS
      );
    } else if (!playing && this.snakeTimer !== undefined) {
      clearInterval(this.snakeTimer);
      this.snakeTimer = undefined;
    }
  }

  private pageText(dialog: Dialog): string {
    return pagesOf(ROOM_OBJECTS[dialog.object])[dialog.page]?.[this.language.lang()] ?? '';
  }

  private startBoot(): void {
    this.stopBoot();
    const steps = bootSteps(this._reducedMotion());
    this.enterBootStep(bootStepAt(steps, 0));
    let elapsed = 0;
    for (const step of steps) {
      elapsed += step.ms;
      const at = elapsed;
      this.bootTimers.push(
        setTimeout(() => {
          this.enterBootStep(bootStepAt(steps, at));
        }, at)
      );
    }
  }

  /** La estática y el logo suenan con su paso del arranque, no con una acción. */
  private enterBootStep(step: BootStepId | 'done'): void {
    this._bootStep.set(step);
    if (step === 'static' || step === 'logo') this.playSound(step);
    if (step === 'done') this.dispatch({ type: 'bootDone' });
  }

  private playSound(id: SoundId | null): void {
    if (id && this._state().prefs.sound) this.audio.play(id);
  }

  private stopBoot(): void {
    this.bootTimers.forEach(clearTimeout);
    this.bootTimers = [];
  }

  private persist(prev: ConsoleState, next: ConsoleState): void {
    const before: Record<PreferenceKey, boolean> = {
      ...prev.prefs,
      returning: prev.returning,
      secret: prev.secretFound
    };
    const after: Record<PreferenceKey, boolean> = {
      ...next.prefs,
      returning: next.returning,
      secret: next.secretFound
    };
    for (const key of ['sound', 'crt', 'returning', 'secret'] as const) {
      if (before[key] !== after[key]) savePreference(this.storage, key, after[key]);
    }
    if (next.snakeRecord !== prev.snakeRecord) saveRecord(this.storage, next.snakeRecord);
  }
}

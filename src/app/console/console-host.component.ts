import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { LanguageService } from '../services/language.service';
import { AudioService } from './audio.service';
import { ConsoleStore } from './console.store';
import { FocusContext, keyToAction, keyToCode } from './core/input';
import { ShellChoice, ViewportInfo, pickShell } from './core/shell';
import { DesktopShellComponent } from './desktop-shell/desktop-shell.component';
import { PocketShellComponent } from './pocket-shell/pocket-shell.component';
import { TextModeComponent } from './text-mode/text-mode.component';

function readViewport(): ViewportInfo {
  return {
    width: innerWidth,
    height: innerHeight,
    touch: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches,
    landscape: innerWidth > innerHeight
  };
}

/**
 * Dónde está el foco cuando se presiona una tecla (ver keyToAction). Los ítems de la
 * consola no se activan solos: Enter confirma donde está el cursor, aunque el foco
 * todavía no lo haya alcanzado por teclas rápidas.
 */
function focusContext(target: EventTarget | null): FocusContext {
  if (!(target instanceof HTMLElement)) return { editable: false, nativeActivation: false };
  const editable = target.isContentEditable || target.matches('input, textarea, select');
  const control = target.closest('button, a[href]');
  return {
    editable,
    nativeActivation: !editable && control !== null && !control.hasAttribute('data-console-item')
  };
}

/** Elige la carcasa según la ventana y pasa el teclado a la consola. */
@Component({
  selector: 'app-console-host',
  standalone: true,
  imports: [DesktopShellComponent, PocketShellComponent, TextModeComponent],
  templateUrl: './console-host.component.html',
  styleUrls: ['./console-host.component.css']
})
export class ConsoleHostComponent {
  readonly store = inject(ConsoleStore);
  private readonly audio = inject(AudioService);
  readonly t = inject(LanguageService).t;

  readonly viewport = signal(readViewport());
  private readonly wanted = computed(() => pickShell(this.viewport()));
  /** Carcasa visible: si la ventana cambia durante una transición, se espera a que termine. */
  readonly shell = signal<ShellChoice>(this.wanted());
  /** RF-66: el link se ve en el plano 1 (tele apagada o habitación) y en la Pocket apagada. */
  readonly textLinkVisible = computed(() => {
    const { screen } = this.store.state();
    const room = screen.kind === 'section' && screen.id === 'about';
    return screen.kind === 'off' || (room && this.shell().shell === 'desktop');
  });

  constructor() {
    effect(() => {
      const wanted = this.wanted();
      if (!this.store.state().transitioning) this.shell.set(wanted);
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.viewport.set(readViewport());
  }

  /** El navegador solo deja arrancar el audio dentro de un gesto del visitante (RF-62). */
  @HostListener('document:pointerdown')
  @HostListener('document:touchend')
  unlockAudio(): void {
    this.audio.unlock();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // En el modo texto las teclas son de la página: scroll, links y el botón de idioma.
    if (this.store.textMode()) return;
    this.unlockAudio();
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const focus = focusContext(event.target);
    // Solo se frena al navegador si la consola usó la tecla: así las flechas siguen
    // haciendo scroll dentro de una sección, y Enter no dispara además el clic del ítem.
    if (this.store.press(keyToAction(event.key, focus), keyToCode(event.key, focus))) {
      event.preventDefault();
    }
  }
}

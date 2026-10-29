import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, effect, inject, input, output, viewChildren } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { Sprite } from '../content/sprites';
import { PixelSpriteComponent } from './pixel-sprite.component';

export interface MenuEntry {
  label: string;
  /** Valor actual de una opción (por ejemplo "Sí" o "English"). */
  value?: string;
  /** Ícono pixelado delante del texto, con una abreviatura opcional encima (insignias de Skills). */
  icon?: Sprite;
  iconText?: string;
  /** El ítem es un link (Contacto); con newTab se abre en una pestaña nueva. */
  href?: string;
  newTab?: boolean;
}

/**
 * Un clic normal en un link de la consola no navega solo: lo abre el store, así nunca se abre
 * dos veces. Con Ctrl, Cmd, Shift, Alt o la rueda, el navegador hace lo de siempre.
 */
export function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
}

/** Lista con cursor de la consola. Presentacional: el estado vive en el store. */
@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [NgTemplateOutlet, PixelSpriteComponent],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent {
  readonly items = input.required<readonly MenuEntry[]>();
  readonly cursor = input.required<number>();
  readonly label = input.required<string>();
  readonly point = output<number>();
  readonly pick = output<number>();

  readonly t = inject(LanguageService).t;
  private readonly entries = viewChildren<ElementRef<HTMLElement>>('entry');

  constructor() {
    // Roving tabindex: el foco sigue al cursor, así Enter activa el ítem marcado.
    effect(() => {
      this.entries()[this.cursor()]?.nativeElement.focus({ preventScroll: true });
    });
  }

  /**
   * Solo cuando el mouse se mueve: si el menú aparece (o la cámara lo mueve) debajo de un
   * puntero quieto, el cursor no tiene que saltar al ítem que quedó abajo.
   */
  onPointerMove(index: number): void {
    if (index !== this.cursor()) this.point.emit(index);
  }

  onLinkClick(event: MouseEvent, index: number): void {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    this.pick.emit(index);
  }
}

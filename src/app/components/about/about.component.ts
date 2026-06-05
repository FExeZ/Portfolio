import { Component, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { SimpsonsdleComponent } from '../simpsonsdle/simpsonsdle.component';
import { LanguageService } from '../../services/language.service';
import { Localized } from '../../i18n/translations';

interface PersonalItem {
  titulo: Localized;
  descripcion: Localized;
  imagen: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective, SimpsonsdleComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit, OnDestroy {
  private ls = inject(LanguageService);
  t = this.ls.t;
  lang = this.ls.lang;

  datos: PersonalItem[] = [
    {
      titulo: {
        es: 'Bicampeón JJBB y Subcampeón Nacional BA Gaming',
        en: 'Two-time JJBB Champion & National Runner-up at BA Gaming'
      },
      descripcion: {
        es: 'Competi en League of Legends y logré junto a mi equipo ser campeones en las ediciones 2021 y 2023 de los JJBB, y en 2024 llegamos juntos a las finales de la BA Gaming.',
        en: 'I competed in League of Legends and, together with my team, became champions in the 2021 and 2023 editions of the JJBB, and in 2024 we reached the BA Gaming finals together.'
      },
      imagen: 'assets/jbcampeones.webp'
    },
    {
      titulo: { es: 'Mi animal favorito', en: 'My favorite animal' },
      descripcion: {
        es: 'Me encantan los osos, me parecen animales increíbles los cuales admiro, y porque también de niño mi película favorita fue Tierra de Osos. Face reveal: yes, I\'m a bear.',
        en: 'I love bears, I find them incredible animals that I admire, and also because as a kid my favorite movie was Brother Bear. Face reveal: yes, I\'m a bear.'
      },
      imagen: 'assets/oso3.jpeg'
    },
    {
      titulo: { es: 'Fútbol', en: 'Football' },
      descripcion: {
        es: 'Desde que mi abuela me puso la casaca del ciclón, los colores traspasaron mi piel y tiñeron mi corazón. Mi canción favorita: Pasaron 100 Años.',
        en: 'Ever since my grandmother put the "ciclón" jersey on me, the colors went through my skin and dyed my heart. My favorite song: Pasaron 100 Años.'
      },
      imagen: 'assets/san-lorenzojpg.webp'
    },
    {
      titulo: { es: 'Idiomas', en: 'Languages' },
      descripcion: {
        es: 'Hablo español, inglés y portugues, gracias a los videojuegos los cuales en su mayoria no venian traducidos y me perdia de las historias. Mas tarde acudí a un instituto y obtuve el First Certificate.',
        en: 'I speak Spanish, English and Portuguese, thanks to video games which mostly came untranslated and made me miss the stories. Later I attended an institute and earned the First Certificate.'
      },
      imagen: 'assets/idiomas.webp'
    }
  ];

  currentIndex = signal(0);
  animating = signal(false);
  progress = signal(0);

  current = computed(() => this.datos[this.currentIndex()]);

  private paused = false;
  private timerId?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private readonly intervalMs = 5000;
  private readonly tickMs = 50;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.progress.set(0);
    this.timerId = setInterval(() => {
      if (this.paused || this.animating()) return;
      const next = this.progress() + (this.tickMs / this.intervalMs) * 100;
      if (next >= 100) {
        this.progress.set(0);
        this.change(1);
      } else {
        this.progress.set(next);
      }
    }, this.tickMs);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  /** Cambia de tarjeta con la animación de fade. */
  private change(direction: number): void {
    if (this.animating()) return;
    this.animating.set(true);
    setTimeout(() => {
      this.currentIndex.update(i => (i + direction + this.datos.length) % this.datos.length);
      this.animating.set(false);
    }, 350);
  }

  /** Navegación manual (botones / swipe): reinicia el contador del autoplay. */
  navigate(direction: number): void {
    this.progress.set(0);
    this.change(direction);
  }

  /** Salto directo a una tarjeta desde los dots. */
  goTo(index: number): void {
    if (this.animating() || index === this.currentIndex()) return;
    this.progress.set(0);
    this.animating.set(true);
    setTimeout(() => {
      this.currentIndex.set(index);
      this.animating.set(false);
    }, 350);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    if (Math.abs(deltaX) > 50) {
      this.navigate(deltaX < 0 ? 1 : -1);
    }
  }
}

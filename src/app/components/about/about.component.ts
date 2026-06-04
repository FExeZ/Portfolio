import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

interface PersonalItem {
  titulo: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {

  datos: PersonalItem[] = [
    {
      titulo: 'Bicampeón JJBB y Subcampeón Nacional BA Gaming',
      descripcion:
        'Competi en League of Legends y logré junto a mi equipo ser campeones en las ediciones 2021 y 2023 de los JJBB, y en 2024 llegamos juntos a las finales de la BA Gaming.',
      imagen: 'assets/jbcampeones.webp'
    },
    {
      titulo: 'Mi animal favorito',
      descripcion:
        'Me encantan los osos, me parecen animales increíbles los cuales admiro, y porque también de niño mi película favorita fue Tierra de Osos. Face reveal: yes, I\'m a bear.',
      imagen: 'assets/oso3.jpeg'
    },
    {
      titulo: 'Fútbol',
      descripcion:
        'Desde que mi abuela me puso la casaca del ciclón, los colores traspasaron mi piel y tiñeron mi corazón. Mi canción favorita: Pasaron 100 Años.',
      imagen: 'assets/san-lorenzojpg.webp'
    },
    {
      titulo: 'Idiomas',
      descripcion:
        'Hablo español, inglés y portugues, gracias a los videojuegos los cuales en su mayoria no venian traducidos y me perdia de las historias. Mas tarde acudí a un instituto y obtuve el First Certificate.',
      imagen: 'assets/idiomas.webp'
    }
  ];

  currentIndex = signal(0);
  animating = signal(false);

  current = computed(() => this.datos[this.currentIndex()]);

  navigate(direction: number): void {
    if (this.animating()) return;

    this.animating.set(true);

    setTimeout(() => {
      this.currentIndex.update(i => (i + direction + this.datos.length) % this.datos.length);
      this.animating.set(false);
    }, 350);
  }
}

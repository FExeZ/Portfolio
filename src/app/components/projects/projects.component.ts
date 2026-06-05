import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { LanguageService } from '../../services/language.service';
import { Localized } from '../../i18n/translations';

type ProjectType = 'FullStack' | 'Frontend' | 'Backend' | 'Java';
type Filter = 'Todos' | ProjectType;

interface Project {
  title: Localized;
  description: Localized;
  role: Localized;
  technologies: string[];
  repoUrl: string;
  type: ProjectType;
}

const ROLE: Record<ProjectType, Localized> = {
  FullStack: { es: 'Desarrollador FullStack', en: 'FullStack Developer' },
  Frontend: { es: 'Desarrollador Frontend', en: 'Frontend Developer' },
  Backend: { es: 'Desarrollador Backend', en: 'Backend Developer' },
  Java: { es: 'Desarrollador Java', en: 'Java Developer' }
};

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  private ls = inject(LanguageService);
  t = this.ls.t;
  lang = this.ls.lang;

  projects: Project[] = [
    {
      title: { es: 'MusicApp', en: 'MusicApp' },
      description: {
        es: 'Aplicación creada junto a colegas de la universidad como proyecto final de POO. Permite registrar usuarios con perfil de artista o entusiasta, subir música y descubrir artistas independientes.',
        en: 'App built with university colleagues as the final project for OOP. It lets users register with an artist or enthusiast profile, upload music and discover independent artists.'
      },
      role: ROLE.FullStack,
      technologies: ['Java 17', 'Spring', 'Hibernate', 'PostgreSQL', 'HTML', 'CSS', 'JavaScript', 'Bootstrap'],
      repoUrl: 'https://github.com/FExeZ/-poo2024-junin-grupo10',
      type: 'FullStack'
    },
    {
      title: { es: 'GetTaskedApp', en: 'GetTaskedApp' },
      description: {
        es: 'Aplicación de gestión de tareas enfocada en organización y asignación colectiva. Proyecto personal para poner en práctica React junto a un backend Spring.',
        en: 'Task management app focused on organization and collective assignment. A personal project to put React into practice alongside a Spring backend.'
      },
      role: ROLE.FullStack,
      technologies: ['Java 21', 'Spring', 'Hibernate', 'PostgreSQL', 'React', 'HTML', 'CSS', 'JavaScript'],
      repoUrl: 'https://github.com/FExeZ/GetTaskedApp',
      type: 'FullStack'
    },
    {
      title: { es: 'COPLAC', en: 'COPLAC' },
      description: {
        es: 'Aplicación Frontend creada para un desafío técnico. Simulador de comisiones escalable, con foco en creatividad y adaptación en tiempo limitado.',
        en: 'Frontend app built for a technical challenge. A scalable commission simulator, focused on creativity and adaptability within a limited timeframe.'
      },
      role: ROLE.Frontend,
      technologies: ['React', 'JavaScript', 'HTML', 'CSS'],
      repoUrl: 'https://github.com/FExeZ/simulador-comisiones',
      type: 'Frontend'
    },
    {
      title: { es: 'APIRest', en: 'APIRest' },
      description: {
        es: 'Proyecto demostrativo de backend con inyección de dependencias, construcción de endpoints REST y testing con Postman.',
        en: 'A backend demo project featuring dependency injection, building REST endpoints and testing with Postman.'
      },
      role: ROLE.Backend,
      technologies: ['Java 17', 'Spring', 'Hibernate', 'PostgreSQL'],
      repoUrl: 'https://github.com/FExeZ/APIRest',
      type: 'Backend'
    },
    {
      title: { es: 'CRUD Java MySQL', en: 'CRUD Java MySQL' },
      description: {
        es: 'Uno de mis primeros proyectos backend: un CRUD con interfaz Swing conectado a MySQL, aplicando los métodos GET, POST, PUT y DELETE.',
        en: 'One of my first backend projects: a CRUD with a Swing interface connected to MySQL, applying the GET, POST, PUT and DELETE methods.'
      },
      role: ROLE.Backend,
      technologies: ['Java 8', 'Swing', 'MySQL'],
      repoUrl: 'https://github.com/FExeZ/CRUD_java_mySql',
      type: 'Backend'
    },
    {
      title: { es: 'Maqueta Web Pizzería', en: 'Pizzeria Web Mockup' },
      description: {
        es: 'Proyecto final del curso de HTML, CSS y JavaScript en TodoCode. Sitio web de una pizzería ficticia con 4 páginas y sin lógica backend.',
        en: 'Final project of the HTML, CSS and JavaScript course at TodoCode. A website for a fictional pizzeria with 4 pages and no backend logic.'
      },
      role: ROLE.Frontend,
      technologies: ['HTML', 'CSS', 'JavaScript'],
      repoUrl: 'https://github.com/FExeZ/Plantilla-HTML-CSS-JS',
      type: 'Frontend'
    },
    {
      title: { es: 'FaseLunarApp', en: 'FaseLunarApp' },
      description: {
        es: 'Aplicación Java Swing que determina la fase lunar según la fecha de nacimiento del usuario. Ejecutable en cualquier entorno.',
        en: 'Java Swing application that determines the moon phase based on the user\'s date of birth. Runnable in any environment.'
      },
      role: ROLE.Java,
      technologies: ['Java 11', 'Swing'],
      repoUrl: 'https://github.com/FExeZ/FaseLunarApp',
      type: 'Java'
    },
    {
      title: { es: 'Conversor de Monedas', en: 'Currency Converter' },
      description: {
        es: 'Aplicación Java Swing para conversión de divisas. Enfocada en la aplicación de conceptos de POO.',
        en: 'Java Swing application for currency conversion. Focused on applying OOP concepts.'
      },
      role: ROLE.Java,
      technologies: ['Java 11', 'Swing'],
      repoUrl: 'https://github.com/FExeZ/ConvertidorDeMonedas',
      type: 'Java'
    }
  ];

  filters: Filter[] = ['Todos', 'FullStack', 'Frontend', 'Backend', 'Java'];
  activeFilter = signal<Filter>('Todos');

  filteredProjects = computed(() => {
    const filter = this.activeFilter();
    return filter === 'Todos'
      ? this.projects
      : this.projects.filter(p => p.type === filter);
  });

  setFilter(filter: Filter): void {
    this.activeFilter.set(filter);
  }

  /** Etiqueta visible del filtro ('Todos' se traduce; el resto es igual en ambos idiomas). */
  filterLabel(filter: Filter): string {
    return filter === 'Todos' ? this.t().projects.filterAll : filter;
  }

  /** Incluye el filtro activo para forzar el re-render (y reanimar) al cambiar de categoría. */
  trackByFilter = (index: number): string => `${this.activeFilter()}-${index}`;

  badgeClass(type: string): string {
    return type.toLowerCase();
  }
}
